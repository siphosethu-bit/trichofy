import os
import pathlib
import inspect
import random
from typing import Dict, Any, List

import numpy as np
import gradio as gr
from fastai.vision.all import *
import albumentations as A

# ============================================================
# 0) Cross-platform + legacy compatibility patches
# ============================================================

# --- Fix for loading Linux/macOS pickled Learner on Windows ---
# The model was saved with PosixPath; on Windows unpickling that breaks.
if os.name == "nt":
    pathlib.PosixPath = pathlib.WindowsPath  # type: ignore[attr-defined]
    print("[Patch] Mapped pathlib.PosixPath -> WindowsPath for pickle loading on Windows.")


# --- Albumentations compatibility for old saved pipelines ----
def _ensure_fastai_albu_compat(cls):
    """
    Ensure attributes / methods expected by the pickled fastai+albumentations
    pipeline exist, implemented as safe fallbacks.
    """
    # Some old pickles expect apply_to_images
    if not hasattr(cls, "apply_to_images"):
        def _apply_to_images(self, *args, **kwargs):
            return self(*args, **kwargs)
        setattr(cls, "apply_to_images", _apply_to_images)

    # Some internal flags touched by older code paths
    if not hasattr(cls, "replay_mode"):
        setattr(cls, "replay_mode", False)
    if not hasattr(cls, "deterministic"):
        setattr(cls, "deterministic", False)


try:
    from albumentations.core.transforms_interface import BasicTransform
    from albumentations.core.composition import Compose
except Exception:
    BasicTransform, Compose = None, None

# Ensure Compose has an additional_targets attribute
if Compose is not None and not hasattr(Compose, "additional_targets"):
    setattr(Compose, "additional_targets", {})
    print("[Patch] Added default additional_targets = {} to Albumentations Compose.")

# Patch all Albumentations transforms that look like fastai might touch them
if BasicTransform is not None:
    for _name in dir(A):
        obj = getattr(A, _name)
        if inspect.isclass(obj) and issubclass(obj, BasicTransform):
            _ensure_fastai_albu_compat(obj)


# --- AlbumentationsTransform stub for unpickling ---
class AlbumentationsTransform(RandTransform):
    """
    Compatibility wrapper expected by the saved Learner.

    The original training code used an Albumentations pipeline wrapped
    in this class. For inference we just need a compatible interface so
    unpickling works. Implementation is safe and minimal.
    """
    split_idx, order = None, 2

    def __init__(self, train_aug=None, valid_aug=None):
        # Saved pickle will restore these attrs
        self.train_aug = train_aug
        self.valid_aug = valid_aug
        self.idx = 0

    def before_call(self, b, split_idx):
        self.idx = split_idx

    def encodes(self, img: PILImage):
        # If transforms weren’t restored, just return img
        if self.train_aug is None and self.valid_aug is None:
            return img

        aug = self.train_aug if self.idx in (0, None) else self.valid_aug
        if aug is None:
            aug = self.train_aug or self.valid_aug
        if aug is None:
            return img

        arr = np.array(img)
        out = aug(image=arr)
        arr2 = out.get("image", arr)
        return PILImage.create(arr2)


# --- Gradio / gradio_client schema safety patch ---
try:
    import gradio_client.utils as gc_utils

    _orig_schema_fn = getattr(gc_utils, "_json_schema_to_python_type", None)
    if _orig_schema_fn is not None:
        def _safe_json_schema_to_python_type(schema, defs=None):
            # Prevent "argument of type 'bool' is not iterable" and similar
            if not isinstance(schema, dict):
                return "Any"
            try:
                return _orig_schema_fn(schema, defs)
            except TypeError:
                return "Any"

        gc_utils.json_schema_to_python_type = _safe_json_schema_to_python_type
        print("[Patch] Forced safe json_schema_to_python_type for gradio_client.")
except Exception as e:
    print(f"[Patch] Could not patch gradio_client schema utils (non-fatal): {e}")


# ============================================================
# 1) Load model
# ============================================================

MODEL_PATH = os.path.join("models", "hair-resnet18-model.pkl")

if not os.path.isfile(MODEL_PATH):
    raise FileNotFoundError(
        f"Model file not found at {MODEL_PATH}.\n"
        f"Make sure 'hair-resnet18-model.pkl' is inside the 'models' folder."
    )

print(f"[Info] Loading model from: {MODEL_PATH}")
learn = load_learner(MODEL_PATH)
print("[Info] Model loaded successfully.")

HAIR_LABELS = list(learn.dls.vocab)


# ============================================================
# 2) In-memory Product Store & Recommender
# ============================================================

DEFAULT_PRODUCTS: List[Dict[str, Any]] = [
    {
        "name": "HydraCurl Cleanser",
        "brand": "Tricofy Lab",
        "hair_types": ["Curly", "Coily", "Kinky"],
        "score_boost": 0.22,
        "image": "",
        "description": "Sulfate-free cleanser that keeps curls defined and hydrated."
    },
    {
        "name": "Velvet Wave Shampoo",
        "brand": "Tricofy Lab",
        "hair_types": ["Wavy", "Curly"],
        "score_boost": 0.18,
        "image": "",
        "description": "Lightweight cleanse to enhance soft, beachy waves."
    },
    {
        "name": "SilkShield Smooth Shampoo",
        "brand": "Tricofy Lab",
        "hair_types": ["Straight"],
        "score_boost": 0.20,
        "image": "",
        "description": "Anti-frizz formula for sleek, glassy straight hair."
    },
    {
        "name": "Scalp Reset Micellar Wash",
        "brand": "Tricofy Lab",
        "hair_types": ["Straight", "Wavy", "Curly", "Coily", "Kinky"],
        "score_boost": 0.14,
        "image": "",
        "description": "Gentle detoxifying wash for sensitive, flaky or product-laden scalps."
    },
]


def _normalize_hair_label(label: str) -> str:
    """Map model vocab labels to friendly hair types (tune to your vocab)."""
    l = label.lower()
    if "curl" in l or "3" in l:
        return "Curly"
    if "wave" in l or "2" in l:
        return "Wavy"
    if "kink" in l or "coil" in l or "4" in l:
        return "Kinky"
    if "straight" in l or "1" in l:
        return "Straight"
    return label


def recommend_products(
    top_label: str,
    probs: List[float],
    products: List[Dict[str, Any]],
    user_goal: str = ""
) -> List[Dict[str, Any]]:
    """
    Build a ranked list of product recommendations with probabilities
    biased by the top predicted hair type and (optionally) the user's goal.
    """
    if not products or top_label is None:
        return []

    friendly = _normalize_hair_label(top_label)

    relevant = [
        p for p in products
        if friendly in p.get("hair_types", [])
        or top_label in p.get("hair_types", [])
        or "All" in p.get("hair_types", [])
    ]
    if not relevant:
        relevant = products[:]

    random.shuffle(relevant)
    relevant.sort(key=lambda p: p.get("score_boost", 0.0), reverse=True)

    max_prob = max(float(x) for x in probs) if probs else 0.7
    base = max(0.6, min(max_prob + 0.15, 0.95))

    recs = []
    for rank, p in enumerate(relevant[:8]):
        prob = base - rank * 0.06
        prob = max(0.12, min(prob, 0.98))

        if user_goal and user_goal.lower() in (
            (p.get("description", "") + p.get("name", "")).lower()
        ):
            prob = min(prob + 0.05, 0.99)

        recs.append({
            "name": p["name"],
            "brand": p.get("brand", ""),
            "hair_types": p.get("hair_types", []),
            "image": p.get("image", ""),
            "description": p.get("description", ""),
            "probability": round(prob, 2),
        })
    return recs


def render_recommendations_html(recs: List[Dict[str, Any]]) -> str:
    if not recs:
        return "<div class='cards-empty'>No product recommendations yet.</div>"

    cards = []
    for r in recs:
        ht = ", ".join(r.get("hair_types", [])) or "All hair types"
        prob_pct = int(r["probability"] * 100)

        img_html = (
            f"<div class='product-img' "
            f"style=\"background-image:url('{r['image']}')\"></div>"
            if r.get("image")
            else "<div class='product-img placeholder'></div>"
        )

        card = f"""
        <div class="product-card">
            {img_html}
            <div class="product-body">
                <div class="product-title">{r['name']}</div>
                <div class="product-brand">{r.get('brand','')}</div>
                <div class="product-hair-types">For: {ht}</div>
                <div class="product-prob">
                    Match score: <span class="prob-badge">{prob_pct}%</span>
                </div>
                <div class="product-desc">{r.get('description','')}</div>
            </div>
        </div>
        """
        cards.append(card)

    return "<div class='product-grid'>" + "\n".join(cards) + "</div>"


# ============================================================
# 3) Prediction wrapper
# ============================================================

def analyze_and_recommend(
    img,
    user_goal: str,
    auth: Dict[str, Any],
    products: List[Dict[str, Any]]
):
    if not auth.get("logged_in") or auth.get("role") != "User":
        return (
            "Please sign in as a **User** to run the hair analysis.",
            {},
            "<div class='cards-empty'>Not authenticated as User.</div>",
        )

    if img is None:
        return (
            "Upload or capture a clear hair photo to start your analysis.",
            {},
            "<div class='cards-empty'>No image provided.</div>",
        )

    try:
        pred, pred_idx, probs = learn.predict(img)
        probs = probs.tolist()
        label_probs = {HAIR_LABELS[i]: float(probs[i]) for i in range(len(HAIR_LABELS))}
        sorted_items = sorted(label_probs.items(), key=lambda x: x[1], reverse=True)
        top_label, _ = sorted_items[0]

        md_lines = [
            f"### Predicted hair type: **{_normalize_hair_label(top_label)}**",
            "",
            "Confidence breakdown:",
        ]
        for lbl, p in sorted_items:
            md_lines.append(f"- **{lbl}**: {p:.2%}")
        if user_goal:
            md_lines.append(f"\nGoal noted: _{user_goal}_")

        recs = recommend_products(top_label, probs, products, user_goal)
        recs_html = render_recommendations_html(recs)

        return "\n".join(md_lines), label_probs, recs_html

    except Exception as e:
        print(f"[Error] Prediction failed: {e}")
        return (
            f"Error during prediction: `{e}`",
            {},
            "<div class='cards-empty'>Prediction error. Check logs.</div>",
        )


# ============================================================
# 4) Auth & Provider helpers
# ============================================================

def handle_login(name: str, role: str):
    name = (name or "").strip()
    role = (role or "").strip()

    if not name:
        return (
            "Please enter your name to continue.",
            gr.update(visible=False),
            gr.update(visible=False),
            {"logged_in": False, "role": None, "name": ""},
        )

    if role not in ("User", "Product Provider"):
        return (
            "Select an account type: **User** or **Product Provider**.",
            gr.update(visible=False),
            gr.update(visible=False),
            {"logged_in": False, "role": None, "name": ""},
        )

    msg = f"Welcome to **Tricofy**, **{name}** — signed in as **{role}**."
    show_user = role == "User"
    show_provider = role == "Product Provider"

    return (
        msg,
        gr.update(visible=show_user),
        gr.update(visible=show_provider),
        {"logged_in": True, "role": role, "name": name},
    )


def add_product(
    name: str,
    brand: str,
    hair_types: str,
    image_url: str,
    description: str,
    auth: Dict[str, Any],
    products: List[Dict[str, Any]],
):
    if not auth.get("logged_in") or auth.get("role") != "Product Provider":
        return "Please sign in as a **Product Provider** to add products.", products

    name = (name or "").strip()
    if not name:
        return "Product name is required.", products

    brand = (brand or "").strip()
    description = (description or "").strip()
    image_url = (image_url or "").strip()

    hair_types_list = [
        h.strip()
        for h in (hair_types or "").replace(";", ",").split(",")
        if h.strip()
    ]
    if not hair_types_list:
        hair_types_list = ["All"]

    new_product = {
        "name": name,
        "brand": brand or "Partner Brand",
        "hair_types": hair_types_list,
        "image": image_url,
        "description": description or "Recommended for your ideal clients.",
        "score_boost": 0.15,
    }

    updated = products + [new_product]
    msg = f"✅ Added **{name}** for {', '.join(hair_types_list)}. Total products: {len(updated)}"

    return msg, updated


# ============================================================
# 5) UI Layout (modern, clean)
# ============================================================

CUSTOM_CSS = """
body {
    background: radial-gradient(circle at top, #101729 0, #020308 45%, #020308 100%);
    color: #e5e7eb;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
}
.gradio-container {
    max-width: 1180px !important;
    margin: 0 auto !important;
    padding-top: 24px;
}
.tricofy-hero {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-bottom: 16px;
}
.tricofy-title {
    font-size: 32px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #38bdf8;
}
.tricofy-subtitle {
    font-size: 15px;
    color: #9ca3af;
}
.tricofy-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border-radius: 999px;
    background: rgba(56,189,248,0.06);
    color: #38bdf8;
    font-size: 11px;
    margin-bottom: 4px;
}
.card-soft {
    background: rgba(15,23,42,0.98);
    border-radius: 18px;
    padding: 16px 16px 14px;
    border: 1px solid rgba(148,163,253,0.07);
    box-shadow: 0 18px 50px rgba(15,23,42,0.6);
}
.card-soft h3 {
    margin-top: 0;
}
.product-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 14px;
    margin-top: 8px;
}
.product-card {
    background: radial-gradient(circle at top left, rgba(56,189,248,0.10), rgba(15,23,42,1));
    border-radius: 16px;
    padding: 10px;
    border: 1px solid rgba(148,163,253,0.14);
    display: flex;
    gap: 8px;
    align-items: flex-start;
}
.product-img {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    background-size: cover;
    background-position: center;
    flex-shrink: 0;
}
.product-img.placeholder {
    background: rgba(31,41,55,0.9);
}
.product-body {
    display: flex;
    flex-direction: column;
    gap: 2px;
}
.product-title {
    font-size: 13px;
    font-weight: 600;
    color: #e5e7eb;
}
.product-brand {
    font-size: 10px;
    color: #9ca3af;
}
.product-hair-types {
    font-size: 10px;
    color: #a5b4fc;
}
.product-prob {
    font-size: 10px;
    margin-top: 2px;
}
.prob-badge {
    padding: 1px 6px;
    border-radius: 999px;
    background: rgba(56,189,248,0.15);
    color: #38bdf8;
    font-size: 10px;
}
.product-desc {
    margin-top: 2px;
    font-size: 9px;
    color: #9ca3af;
}
.cards-empty {
    padding: 10px;
    border-radius: 12px;
    background: rgba(15,23,42,0.98);
    border: 1px dashed rgba(75,85,99,0.8);
    font-size: 11px;
    color: #9ca3af;
    text-align: center;
}
"""

with gr.Blocks(css=CUSTOM_CSS, title="Tricofy · AI Hair Type & Match") as demo:
    auth_state = gr.State({"logged_in": False, "role": None, "name": ""})
    products_state = gr.State(DEFAULT_PRODUCTS)

    # Hero
    with gr.Column():
        gr.HTML(
            """
            <div class="tricofy-hero">
                <div class="tricofy-pill">AI-powered hair analysis · Product intelligence</div>
                <div class="tricofy-title">TRICOFY</div>
                <div class="tricofy-subtitle">
                    Scan hair in seconds, understand its pattern, and surface the right shampoos for every profile.
                </div>
            </div>
            """
        )

    # Auth
    with gr.Row():
        with gr.Column(scale=2, elem_classes="card-soft"):
            gr.Markdown("#### Sign in / Sign up")
            login_name = gr.Textbox(label="Name", placeholder="Enter your name", autofocus=True)
            login_role = gr.Radio(
                ["User", "Product Provider"],
                label="Account type",
                info="Users get personalized recommendations. Providers register products."
            )
            login_btn = gr.Button("Enter Tricofy", variant="primary")
            login_msg = gr.Markdown("", elem_id="login_msg")

    # User tab
    with gr.Tab("Hair AI Studio", visible=False) as user_tab:
        with gr.Row():
            with gr.Column(scale=2, elem_classes="card-soft"):
                gr.Markdown("### Hair Scan & Prediction")
                user_goal = gr.Textbox(
                    label="What is your current hair goal?",
                    placeholder="e.g. reduce frizz, define curls, scalp health, volume..."
                )
                img_input = gr.Image(
                    label="Upload or capture your hair",
                    sources=["upload", "webcam"],
                    type="pil"
                )
                analyze_btn = gr.Button("Analyze & Recommend", variant="primary")

            with gr.Column(scale=2, elem_classes="card-soft"):
                hair_summary = gr.Markdown(label="AI Prediction")
                hair_probs = gr.Label(label="Prediction confidence", num_top_classes=4)

        with gr.Row():
            with gr.Column(elem_classes="card-soft"):
                gr.Markdown("### Recommended Shampoos & Care")
                product_html = gr.HTML()

    # Provider tab
    with gr.Tab("Provider Console", visible=False) as provider_tab:
        with gr.Column(elem_classes="card-soft"):
            gr.Markdown("### Product Provider Console")
            gr.Markdown(
                "Add shampoos and treatments that Tricofy can match to the right hair types."
            )
            p_name = gr.Textbox(label="Product name")
            p_brand = gr.Textbox(label="Brand", placeholder="Your brand name")
            p_hair_types = gr.Textbox(
                label="Target hair types",
                placeholder="e.g. Curly, Coily, Kinky (comma separated) or leave empty for All",
            )
            p_image = gr.Textbox(
                label="Image URL (optional)",
                placeholder="Direct link to product image"
            )
            p_desc = gr.Textbox(
                label="Short description",
                placeholder="Key benefits, active ingredients, claims..."
            )
            add_btn = gr.Button("Add product to Tricofy", variant="primary")
            provider_msg = gr.Markdown()

    # Wire up
    login_btn.click(
        fn=handle_login,
        inputs=[login_name, login_role],
        outputs=[login_msg, user_tab, provider_tab, auth_state],
    )

    analyze_btn.click(
        fn=analyze_and_recommend,
        inputs=[img_input, user_goal, auth_state, products_state],
        outputs=[hair_summary, hair_probs, product_html],
    )

    add_btn.click(
        fn=add_product,
        inputs=[p_name, p_brand, p_hair_types, p_image, p_desc, auth_state, products_state],
        outputs=[provider_msg, products_state],
    )

# ============================================================
# 6) Launch
# ============================================================

if __name__ == "__main__":
    demo.launch(share=False, show_api=False, server_name="127.0.0.1", server_port=7860)
