import React, { useState } from "react";
import "./index.css";
import heroImage from "./assets/hero.jpg";

const API_URL = "http://127.0.0.1:8000/predict";
const WEATHER_URL = "http://127.0.0.1:8000/weather";

// About page video (place file at /public/videos/trichofy-about.mp4)
const ABOUT_VIDEO = "/videos/trichofy-about.mp4";

// Treatments background video (place file at /public/videos/treatments-bg.mp4)
const TREATMENTS_VIDEO = "/videos/treatments-bg.mp4";

// User page background video (place file at /public/videos/user-bg.mp4)
const USER_VIDEO = "/videos/user-bg.mp4";

// Product Provider background video (place file at /public/videos/product-bg.mp4)
const PROVIDER_VIDEO = "/videos/product-bg.mp4";

/**
 * Map real product names → filenames you placed in /public/products
 */
const productImageMap = {
  "AfriPure Shea Butter + Marula Moisturising Hair Oil": "shea-butter.jpg",
  "Native Child Castor Oil – Hairgrowth Oil": "castor-oil.jpg",
  "AfriPure Vegetable Glycerine (100% Pure)": "glycerin.jpg",
  "Pure Hydrolyzed Collagen (Peptide Powder)": "hydrolyzed-protein.jpg",
  "AfriPure Marula Oil": "marula-oil.jpg",
  "AfriPure Argan Oil": "argan-oil.jpg",
  "AfriPure Jojoba Oil": "jojoba-oil.jpg",
};

/** All AI treatment tools shown as clickable cards */
const TREATMENT_TOOLS = [
  {
    id: "moisture",
    title: "Deep moisture analysis",
    body: [
      "Understands dryness levels from your photo.",
      "Trichofy detects moisture imbalance across coils, curls and strands — helping you choose the right hydration method.",
    ],
  },
  {
    id: "damage",
    title: "Breakage & damage detection",
    body: [
      "Highlights fragile areas and split-end patterns.",
      "AI looks at strand frizz, ends, and hair silhouette to identify damage intensity.",
    ],
  },
  {
    id: "density",
    title: "Density estimation",
    body: [
      "Reads how dense or full your hair is.",
      "Useful for choosing the right product thickness and styling approach.",
    ],
  },
  {
    id: "porosity",
    title: "Porosity guidance",
    body: [
      "Personalized porosity-based recommendations.",
      "Whether you’re low, normal or high porosity — product ingredients adjust accordingly.",
    ],
  },
  {
    id: "protective",
    title: "Protective style support",
    body: [
      "Tells you the best products for braids, locs and twists.",
      "Trichofy adjusts recommendations for protective styling, tension points, and scalp health.",
    ],
  },
  {
    id: "scalp",
    title: "Scalp health insights",
    body: [
      "Detects flakes, buildup or irritation indicators.",
      "Helps guide you to clarifying washes, gentle cleansers or soothing treatments.",
    ],
  },
  {
    id: "ingredients",
    title: "Ingredient-smart matching",
    body: [
      "Recommends products based on what your hair “likes”.",
      "AI evaluates matching ingredients like glycerine, castor oil, marula and proteins to fit your current hair needs.",
    ],
  },
  {
    id: "growth",
    title: "Growth-boost mode",
    body: [
      "Suggests products that support hairline & length retention.",
      "Perfect for users trying to grow thicker, healthier hair.",
    ],
  },
  {
    id: "routine",
    title: "Routine planning",
    body: [
      "Your full weekly hair-care routine in one screen:",
      "Wash day · Deep condition · Moisturize · Seal · Night routine.",
    ],
  },
  {
    id: "seasonal",
    title: "Seasonal hair adjustments",
    body: [
      "Tailored tips based on hot, cold, or dry seasons in South Africa.",
      "Humidity & heat influence hair behaviour — Trichofy adapts.",
    ],
  },
];

/**
 * Product provider categories – step 1 of the flow
 */
const PROVIDER_CATEGORIES = [
  {
    id: "oils",
    label: "Oils & Serums",
    badge: "Seal & Shine",
    description:
      "Castor, argan, marula, jojoba and blended oils for sealing and nourishing.",
    questions: [
      {
        key: "texture",
        label: "Texture weight",
        placeholder: "e.g. Lightweight, Medium, Heavy",
      },
      {
        key: "usage",
        label: "Best used for",
        placeholder: "e.g. Sealing, Scalp massage, Hot oil treatment",
      },
    ],
  },
  {
    id: "shampoos",
    label: "Shampoos",
    badge: "Cleanse",
    description: "Clarifying, moisturising and co-wash cleansers.",
    questions: [
      {
        key: "sulfates",
        label: "Sulfate-free?",
        placeholder: "e.g. Yes, No, Low-sulfate",
      },
      {
        key: "finish",
        label: "Finish type",
        placeholder: "e.g. Clarifying, Moisturising, Co-wash",
      },
    ],
  },
  {
    id: "conditioners",
    label: "Conditioners",
    badge: "Soften & Detangle",
    description: "Rinse-out, leave-in and deep conditioners.",
    questions: [
      {
        key: "conditionerType",
        label: "Conditioner type",
        placeholder: "e.g. Rinse-out, Leave-in, Deep treatment",
      },
      {
        key: "proteinLevel",
        label: "Protein level",
        placeholder: "e.g. Protein-free, Balanced, Protein-heavy",
      },
    ],
  },
  {
    id: "treatments",
    label: "Treatments & Masks",
    badge: "Repair & Boost",
    description: "Intensive treatments for damage, growth and scalp care.",
    questions: [
      {
        key: "focus",
        label: "Treatment focus",
        placeholder: "e.g. Repair, Moisture, Scalp, Growth",
      },
      {
        key: "frequency",
        label: "Recommended frequency",
        placeholder: "e.g. Weekly, Bi-weekly, Monthly",
      },
    ],
  },
  {
    id: "styling",
    label: "Styling & Leave-Ins",
    badge: "Define & Hold",
    description: "Butters, gels, creams and foams for daily styling.",
    questions: [
      {
        key: "holdLevel",
        label: "Hold level",
        placeholder: "e.g. Soft, Medium, Strong",
      },
      {
        key: "finishLook",
        label: "Finish look",
        placeholder: "e.g. Defined curls, Sleek, Volume",
      },
    ],
  },
  {
    id: "accessories",
    label: "Accessories",
    badge: "Tools & Extras",
    description: "Combs, bonnets, diffusers and other hair tools.",
    questions: [
      {
        key: "accessoryType",
        label: "Accessory type",
        placeholder: "e.g. Satin bonnet, Wide-tooth comb, Diffuser",
      },
      {
        key: "material",
        label: "Key material",
        placeholder: "e.g. Satin, Plastic, Metal, Wood",
      },
    ],
  },
];

/** Turn any image reference into a usable <img src="..."> */
function resolveImageSrc(maybeNameOrUrl) {
  if (!maybeNameOrUrl) return null;
  if (/^https?:\/\//i.test(maybeNameOrUrl) || maybeNameOrUrl.startsWith("/")) {
    return maybeNameOrUrl;
  }
  return `/products/${maybeNameOrUrl}`;
}

// Pick a weather emoji for vibes
function weatherEmoji(condition = "", icon = "") {
  const c = condition.toLowerCase();
  const i = icon.toLowerCase();

  if (c.includes("thunder") || i.startsWith("11")) return "⛈️";
  if (
    c.includes("rain") ||
    c.includes("drizzle") ||
    i.startsWith("09") ||
    i.startsWith("10")
  )
    return "🌧️";
  if (c.includes("snow") || i.startsWith("13")) return "❄️";
  if (c.includes("cloud") || i.startsWith("03") || i.startsWith("04"))
    return "☁️";
  if (c.includes("mist") || c.includes("fog") || c.includes("haze")) return "🌫️";
  if (c.includes("clear") || i.startsWith("01")) return "☀️";
  return "🌍";
}

// Build simple hair + weather advice
function buildSeasonAdvice(hairType, weather) {
  if (!hairType || !weather) return [];

  const tips = [];
  const ht = hairType.toLowerCase();
  const { humidity, temp, condition } = weather;

  const isHighHumid = humidity >= 70;
  const isDryAir = humidity <= 40;
  const isHot = temp >= 28;
  const isCold = temp <= 12;
  const isRainy = (condition || "").toLowerCase().includes("rain");

  // Base per hair type
  if (ht.includes("kinky") || ht.includes("coily")) {
    tips.push(
      "Focus on rich creams and oils to keep coils from drying out.",
      "Layer a leave-in + butter, then seal with an oil on your ends."
    );
  } else if (ht.includes("curly")) {
    tips.push(
      "Use a moisturising leave-in plus a gel or cream that fights frizz.",
      "Avoid heavy product build-up on the roots — focus on mid-lengths and ends."
    );
  } else if (ht.includes("wavy")) {
    tips.push(
      "Stick to lightweight creams or foams so waves don’t fall flat.",
      "Clarify gently if your roots feel coated or greasy."
    );
  } else if (ht.includes("straight")) {
    tips.push(
      "Use lightweight serums rather than heavy butters to avoid weighing hair down.",
      "Focus oils mainly on the very ends of your hair."
    );
  }

  // Overlay weather logic
  if (isHighHumid || isRainy) {
    tips.push(
      "Humidity is high — add an anti-frizz product or gel cast to lock in your curl/coil pattern.",
      "Seal with an oil after your moisturiser to slow down moisture loss/gain from the air."
    );
  }

  if (isDryAir) {
    tips.push(
      "Air looks quite dry — humectants like glycerine work well if you always seal them with an oil.",
      "Consider overnight protective styles or a satin bonnet to reduce moisture loss."
    );
  }

  if (isHot) {
    tips.push(
      "Heat is up — add UV/heat protection if you’re outside a lot.",
      "Scalp can get sweaty; keep styles simple and cleanse regularly with a gentle shampoo."
    );
  }

  if (isCold) {
    tips.push(
      "It’s fairly cold — warm oil treatments and deep conditioning are your best friends.",
      "Try tuck-in styles (buns, twists) to protect your ends from dry air and friction."
    );
  }

  if (tips.length === 0) {
    tips.push(
      "Weather looks balanced today — stick to your normal routine, just don’t skip sealing your ends."
    );
  }

  return tips;
}

// Build a weekly routine based on hair type + intensity
function buildRoutinePlan(hairType, intensity = "balanced") {
  const ht = (hairType || "").toLowerCase();
  const isCoily = ht.includes("kinky") || ht.includes("coily");
  const isCurly = ht.includes("curly") && !isCoily;
  const isWavy = ht.includes("wavy");
  const isStraight = ht.includes("straight");

  const moistureWord = isCoily || isCurly ? "rich cream" : "lightweight lotion";
  const oilWord = isCoily || isCurly ? "butter or thick oil" : "light serum";

  const washFrequency =
    intensity === "light"
      ? "Once every 7–10 days"
      : intensity === "balanced"
      ? "Once per week"
      : "Once per week + one clarifying wash per month";

  const midweekFrequency =
    intensity === "light"
      ? "Optional mid-week top-up"
      : intensity === "balanced"
      ? "Mid-week"
      : "2–3 times mid-week";

  const treatmentNote =
    intensity === "intense"
      ? "Add a protein or bond-repair treatment every 2–4 weeks if hair is breaking."
      : "Use a moisturising mask every 2–4 weeks to keep strands flexible.";

  const plan = [
    {
      title: "Wash day",
      when: washFrequency,
      steps: [
        isCoily || isCurly
          ? "Pre-poo with oil or conditioner to protect your curls/coils before shampoo."
          : "Detangle gently before washing to reduce breakage.",
        "Cleanse with a gentle, sulphate-free shampoo. Clarify only when hair feels coated.",
        "Deep condition under plastic cap or heat for 15–30 minutes.",
        `Rinse, then apply leave-in + ${moistureWord} and seal with ${oilWord}.`,
      ],
    },
    {
      title: "Mid-week moisture",
      when: midweekFrequency,
      steps: [
        "Lightly mist hair with water or a water-based refresher.",
        `Add a small amount of ${moistureWord} focusing on mid-lengths and ends.`,
        `Seal with a thin layer of ${oilWord}, especially on the ends.`,
        isWavy || isStraight
          ? "Avoid overloading products at the roots so hair doesn’t feel greasy."
          : "Refresh curls/coils using finger coils, twists or braids overnight.",
      ],
    },
    {
      title: "Night routine (daily)",
      when: "Every night",
      steps: [
        "Gently detangle with fingers or wide-tooth comb (only when needed).",
        isCoily || isCurly
          ? "Sleep in chunky twists, braids or pineapple to protect your pattern."
          : "Tie hair loosely or wrap in a silk/satin scarf to reduce friction.",
        "Use a satin bonnet or pillowcase to prevent dryness and breakage.",
      ],
    },
    {
      title: "Scalp & treatment slot",
      when: "Once per week",
      steps: [
        "Check scalp for itchiness, flakes or tight styles causing tension.",
        "Massage scalp with fingertips or a scalp brush for 3–5 minutes.",
        treatmentNote,
      ],
    },
  ];

  return plan;
}

export default function App() {
  // -------- Navigation (click-to-section) --------
  const [activeNav, setActiveNav] = useState("home");
  const scrollTo = (id) => {
    setActiveNav(id);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // -------- User flow --------
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  // -------- Ingredient tool flow (within Treatments) --------
  const [ingFile, setIngFile] = useState(null);
  const [ingPreview, setIngPreview] = useState(null);
  const [ingLoading, setIngLoading] = useState(false);
  const [ingError, setIngError] = useState("");
  const [ingResult, setIngResult] = useState(null);

  // -------- Seasonal weather state --------
  const [seasonWeather, setSeasonWeather] = useState(null);
  const [seasonLoading, setSeasonLoading] = useState(false);
  const [seasonError, setSeasonError] = useState("");
  const [seasonCity, setSeasonCity] = useState("Johannesburg");
  const [seasonCountry, setSeasonCountry] = useState("ZA");

  // -------- Routine planning state --------
  const [routineIntensity, setRoutineIntensity] = useState("balanced");

  // -------- Provider flow --------
  const [pName, setPName] = useState("");
  const [pBrand, setPBrand] = useState("");
  const [pHairTypes, setPHairTypes] = useState("");
  const [pImageUrl, setPImageUrl] = useState("");
  const [pDesc, setPDesc] = useState("");
  const [products, setProducts] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [extraFields, setExtraFields] = useState({});

  // -------- Treatments state --------
  const [selectedTreatment, setSelectedTreatment] = useState(null);
  const selectedTool =
    selectedTreatment &&
    TREATMENT_TOOLS.find((t) => t.id === selectedTreatment);

  const activeCategory =
    selectedCategory &&
    PROVIDER_CATEGORIES.find((c) => c.id === selectedCategory);

  // Upload (User section)
  const handleFileChange = (e) => {
    const f = e.target.files[0] || null;
    setFile(f);
    setResult(null);
    setError("");
    setPreview(f ? URL.createObjectURL(f) : null);
  };

  // Analyze Image (User section)
  const handleAnalyze = async () => {
    if (!file) {
      setError("Please upload a clear hair photo first.");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(API_URL, { method: "POST", body: formData });
      if (!res.ok) throw new Error("Backend error");
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const normalized = {
        hair_type: data.hair_type || data.predicted_label || "Unknown",
        probabilities: data.probabilities || data.probs || {},
        products: (data.products || []).map((p) => {
          const fromBackend = resolveImageSrc(p.image_url);
          const fromMap = resolveImageSrc(productImageMap[p.name]);
          return { ...p, _resolved_img: fromBackend || fromMap || null };
        }),
      };

      setResult(normalized);
    } catch (err) {
      console.error(err);
      setError("Could not analyze image. Ensure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  // Upload (Ingredient-smart matching inside Treatments)
  const handleIngredientFileChange = (e) => {
    const f = e.target.files[0] || null;
    setIngFile(f);
    setIngResult(null);
    setIngError("");
    setIngPreview(f ? URL.createObjectURL(f) : null);
  };

  // Analyze Image for Ingredient-smart matching
  const handleIngredientAnalyze = async () => {
    if (!ingFile) {
      setIngError("Please upload a clear hair photo first.");
      return;
    }
    setIngLoading(true);
    setIngError("");
    setIngResult(null);

    try {
      const formData = new FormData();
      formData.append("file", ingFile);
      // Optional extra flag for backend, can be ignored safely
      formData.append("mode", "ingredients");

      const res = await fetch(API_URL, { method: "POST", body: formData });
      if (!res.ok) throw new Error("Backend error");
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const normalized = {
        hair_type: data.hair_type || data.predicted_label || "Unknown",
        probabilities: data.probabilities || data.probs || {},
        products: (data.products || []).map((p) => {
          const fromBackend = resolveImageSrc(p.image_url);
          const fromMap = resolveImageSrc(productImageMap[p.name]);
          return { ...p, _resolved_img: fromBackend || fromMap || null };
        }),
      };

      setIngResult(normalized);
    } catch (err) {
      console.error(err);
      setIngError("Could not analyze image. Ensure backend is running.");
    } finally {
      setIngLoading(false);
    }
  };

  // Fetch weather for Seasonal tool
  const handleFetchWeather = async () => {
    setSeasonLoading(true);
    setSeasonError("");
    setSeasonWeather(null);

    try {
      const url = `${WEATHER_URL}?city=${encodeURIComponent(
        seasonCity
      )}&country=${encodeURIComponent(seasonCountry)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Weather backend error");
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setSeasonWeather(data);
    } catch (err) {
      console.error(err);
      setSeasonError(
        "Could not fetch weather right now. Check API key, internet and backend."
      );
    } finally {
      setSeasonLoading(false);
    }
  };

  // Extra field change (provider flow)
  const handleExtraChange = (key, value) => {
    setExtraFields((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Add provider product (local list only)
  const handleAddProduct = (e) => {
    e.preventDefault();
    setError("");

    if (!activeCategory) {
      setError("Please choose a product category first.");
      return;
    }

    if (!pName.trim() || !pBrand.trim()) {
      setError("Please provide product name and brand.");
      return;
    }

    const entry = {
      name: pName.trim(),
      brand: pBrand.trim(),
      hair_types: pHairTypes
        ? pHairTypes.split(",").map((h) => h.trim()).filter(Boolean)
        : ["All"],
      image_url:
        resolveImageSrc(pImageUrl.trim()) ||
        resolveImageSrc(productImageMap[pName.trim()]),
      description: pDesc.trim() || "No description provided.",
      category: activeCategory.id,
      category_label: activeCategory.label,
      extras: { ...extraFields },
    };

    setProducts((prev) => [entry, ...prev]);
    setPName("");
    setPBrand("");
    setPHairTypes("");
    setPImageUrl("");
    setPDesc("");
    setExtraFields({});
  };

  // Testimonials
  const testimonials = [
    {
      name: "Lethabo M.",
      city: "Johannesburg",
      text:
        "Uploaded one pic, Trichofy said ‘kinky’ and showed products that actually work for my texture.",
    },
    {
      name: "Thando D.",
      city: "Durban",
      text:
        "The match score helped me choose fast. My curls are softer already.",
    },
    {
      name: "Zinhle K.",
      city: "Polokwane",
      text:
        "Loved the clarity. I grabbed the glycerine and marula oil bundle instantly.",
    },
    {
      name: "Sibusiso R.",
      city: "Cape Town",
      text: "The recommendations felt tailored and accurate.",
    },
  ];
  const loopedTestimonials = [...testimonials, ...testimonials];

  const handleBackToTools = () => {
    setSelectedTreatment(null);
    // clear ingredient-flow state when leaving focus view
    setIngFile(null);
    setIngPreview(null);
    setIngResult(null);
    setIngError("");
    setIngLoading(false);

    // keep weather & routine settings so user can come back
  };

  return (
    <div className="tricofy-shell">
      {/* NAVIGATION */}
      <nav className="side-nav">
        <div className="nav-logo">TRICHOFY</div>
        <ul className="nav-links">
          {["home", "about", "treatments", "user", "provider", "contact"].map(
            (id) => (
              <li
                key={id}
                className={activeNav === id ? "active" : ""}
                onClick={() => scrollTo(id)}
              >
                {id === "provider"
                  ? "Product Provider"
                  : id.charAt(0).toUpperCase() + id.slice(1)}
              </li>
            )
          )}
        </ul>
      </nav>

      {/* CONTENT */}
      <main className="content">
        {/* HERO */}
        <section
          id="home"
          className="hero"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="hero-overlay" />
          <div className="hero-content">
            <div className="hero-label">
              AI Hair Analysis · Product Intelligence
            </div>
            <h1 className="hero-title">Trichofy</h1>
            <p className="hero-slogan">
              Your best hair intelligence ritual — scan, understand & match care
              in seconds.
            </p>
            <div className="hero-ctas">
              <button
                className="glass-btn primary"
                onClick={() => scrollTo("user")}
              >
                For Individuals
              </button>
              <button
                className="glass-btn secondary"
                onClick={() => scrollTo("provider")}
              >
                For Product Providers
              </button>
            </div>
          </div>
        </section>

        {/* ABOUT */}
        <section id="about" className="section about-hero">
          <video
            className="bg-video"
            src={ABOUT_VIDEO}
            autoPlay
            muted
            loop
            playsInline
          />
          <div className="about-overlay" />
          <div className="about-content">
            <h2>About Trichofy</h2>
            <p>
              Trichofy blends computer vision and product intelligence to read
              hair patterns, texture and density from a single photo — no
              quizzes, just clarity.
            </p>
            <p className="buy-note">
              You can <strong>buy the matched products right here</strong> from
              trusted South African brands.
            </p>

            <div className="hero-ctas">
              <button
                className="glass-btn primary"
                onClick={() => scrollTo("user")}
              >
                Find my match
              </button>
              <button
                className="glass-btn secondary"
                onClick={() => scrollTo("provider")}
              >
                Browse products
              </button>
            </div>

            {/* Testimonials */}
            <div className="testi-wrap">
              <h3>What people say</h3>
              <div className="testi-mask">
                <div className="testi-track">
                  {loopedTestimonials.map((t, i) => (
                    <article className="testi-card" key={i}>
                      <div className="testi-quote">“{t.text}”</div>
                      <div className="testi-name">
                        <strong>{t.name}</strong> — {t.city}
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TREATMENTS */}
        <section id="treatments" className="section treatments">
          {/* Background video */}
          <div className="treatments-video-wrap">
            <video
              className="treatments-bg-video"
              src={TREATMENTS_VIDEO}
              autoPlay
              muted
              loop
              playsInline
            />
            <div className="treatments-overlay" />
          </div>

          {/* Foreground content */}
          <div className="treatments-inner">
            <h2>How it treats your routine</h2>
            <p>
              Trichofy gives you a full AI hair toolbox. Pick a treatment mode,
              upload a single photo, and let the system map your hair, match
              ingredients and suggest a routine.
            </p>

            {/* When no tool is selected, show the grid */}
            {!selectedTreatment && (
              <div className="treatment-grid treatment-grid-tools">
                {TREATMENT_TOOLS.map((tool) => (
                  <button
                    key={tool.id}
                    type="button"
                    className={
                      "treatment-card clickable" +
                      (selectedTreatment === tool.id ? " active" : "")
                    }
                    onClick={() => setSelectedTreatment(tool.id)}
                  >
                    <span className="treatment-chip">AI tool</span>
                    <h3>{tool.title}</h3>
                    {tool.body.map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                    <span className="treatment-cta">
                      Tap to focus this mode
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* When a tool is selected, show its focused page */}
            {selectedTreatment && selectedTool && (
              <div className="treatment-focus">
                <div className="panel-header" style={{ marginBottom: 18 }}>
                  <button
                    type="button"
                    className="glass-btn secondary"
                    style={{ padding: "8px 14px", fontSize: "11px" }}
                    onClick={handleBackToTools}
                  >
                    ← All AI tools
                  </button>
                  <h3 style={{ marginTop: 16 }}>{selectedTool.title}</h3>
                  {selectedTool.body.map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>

                {selectedTreatment === "ingredients" ? (
                  <div className="panel-body layout-2col">
                    {/* Upload side */}
                    <div className="card upload-card">
                      <h3>Upload an image for ingredient matching</h3>
                      <p className="hint">
                        Trichofy will read your hair pattern and suggest
                        ingredient-focused products (glycerine, castor oil,
                        marula, proteins and more).
                      </p>

                      <label className="upload-label">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleIngredientFileChange}
                        />
                        <span>Choose or drop a hair photo</span>
                      </label>

                      {ingPreview && (
                        <div className="preview-wrap">
                          <img
                            src={ingPreview}
                            alt="ingredient-preview"
                            className="preview-img"
                          />
                        </div>
                      )}

                      <button
                        className="primary-btn"
                        onClick={handleIngredientAnalyze}
                        disabled={ingLoading || !ingFile}
                      >
                        {ingLoading
                          ? "Analyzing ingredients..."
                          : "Match my ingredients"}
                      </button>

                      {ingError && <div className="error">{ingError}</div>}
                    </div>

                    {/* Results side */}
                    <div className="card results-card">
                      <h3>Ingredient-smart results</h3>

                      {!ingResult && !ingError && (
                        <p className="hint">
                          Upload a photo to see your ingredient-based matches.
                        </p>
                      )}

                      {IngResult && (
                        <>
                          <div className="hair-type-pill">
                            Predicted hair type:{" "}
                            <strong>{ingResult.hair_type}</strong>
                          </div>

                          {ingResult.probabilities && (
                            <div className="probs">
                              <h4>Confidence breakdown</h4>
                              {Object.entries(ingResult.probabilities)
                                .sort((a, b) => b[1] - a[1])
                                .map(([label, prob]) => (
                                  <div key={label} className="prob-row">
                                    <span className="prob-label">{label}</span>
                                    <div className="prob-bar">
                                      <div
                                        className="prob-fill"
                                        style={{
                                          width: `${(prob * 100).toFixed(1)}%`,
                                        }}
                                      />
                                    </div>
                                    <span className="prob-val">
                                      {(prob * 100).toFixed(1)}%
                                    </span>
                                  </div>
                                ))}
                            </div>
                          )}

                          <div className="products">
                            <h4>Recommended products</h4>

                            {ingResult.products?.length > 0 ? (
                              <div className="product-grid">
                                {ingResult.products.map((p, idx) => {
                                  const resolved =
                                    p._resolved_img ||
                                    resolveImageSrc(p.image_url) ||
                                    resolveImageSrc(productImageMap[p.name]);

                                  return (
                                    <div key={idx} className="product-card">
                                      <div className="product-header">
                                        <div className="product-name">
                                          {p.name}
                                        </div>
                                        <div className="product-brand">
                                          {p.brand}
                                        </div>
                                      </div>

                                      <div className="product-meta">
                                        {p.hair_types && (
                                          <span className="badge">
                                            For: {p.hair_types.join(", ")}
                                          </span>
                                        )}
                                        {p.match_score && (
                                          <span className="badge score">
                                            Match: {p.match_score}%
                                          </span>
                                        )}
                                      </div>

                                      {resolved && (
                                        <div className="provider-image">
                                          <img src={resolved} alt={p.name} />
                                        </div>
                                      )}

                                      <p className="product-desc">
                                        {p.description}
                                      </p>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <p className="hint">No matches yet.</p>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ) : selectedTreatment === "seasonal" ? (
                  <div className="panel-body layout-2col">
                    {/* WEATHER SIDE */}
                    <div className="card upload-card">
                      <h3>Today’s weather for your routine</h3>
                      <p className="hint">
                        Trichofy pulls live weather data for your city to tweak
                        your routine for heat, cold, humidity and rain.
                      </p>

                      <div className="field" style={{ marginBottom: 10 }}>
                        <span>City</span>
                        <input
                          value={seasonCity}
                          onChange={(e) => setSeasonCity(e.target.value)}
                          placeholder="Johannesburg"
                        />
                      </div>

                      <div className="field" style={{ marginBottom: 16 }}>
                        <span>Country code</span>
                        <input
                          value={seasonCountry}
                          onChange={(e) => setSeasonCountry(e.target.value)}
                          placeholder="ZA"
                        />
                      </div>

                      <button
                        className="primary-btn"
                        onClick={handleFetchWeather}
                        disabled={seasonLoading}
                      >
                        {seasonLoading
                          ? "Fetching forecast..."
                          : "Refresh today’s weather"}
                      </button>

                      {seasonError && (
                        <div className="error" style={{ marginTop: 10 }}>
                          {seasonError}
                        </div>
                      )}

                      {seasonWeather && !seasonError && (
                        <div className="season-weather-card">
                          <div
                            className="hair-type-pill"
                            style={{ marginTop: 16 }}
                          >
                            {seasonWeather.city}
                          </div>
                          <div
                            className="season-emoji"
                            style={{
                              fontSize: "42px",
                              marginTop: 12,
                              marginBottom: 4,
                            }}
                          >
                            {weatherEmoji(
                              seasonWeather.condition,
                              seasonWeather.icon
                            )}
                          </div>
                          <p>
                            <strong>
                              {seasonWeather.temp.toFixed(1)}°C
                            </strong>{" "}
                            · feels like{" "}
                            {seasonWeather.feels_like.toFixed(1)}°C
                          </p>
                          <p>
                            Humidity:{" "}
                            <strong>{seasonWeather.humidity}%</strong>
                          </p>
                          <p>
                            {seasonWeather.condition} —{" "}
                            {seasonWeather.description}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* ADVICE SIDE */}
                    <div className="card results-card">
                      <h3>Weather + hair type advice</h3>

                      {!result && (
                        <p className="hint">
                          First, let Trichofy read your hair. Go to{" "}
                          <strong>For Individuals</strong>, upload a photo and
                          get your hair type — then come back here.
                        </p>
                      )}

                      {result && !seasonWeather && (
                        <p className="hint">
                          We know your hair type (
                          <strong>{result.hair_type}</strong>). Fetch today’s
                          weather on the left to see tailored adjustments.
                        </p>
                      )}

                      {result && seasonWeather && (
                        <>
                          <div className="hair-type-pill">
                            Hair type: <strong>{result.hair_type}</strong>
                          </div>
                          <p style={{ marginTop: 10, marginBottom: 10 }}>
                            Today in <strong>{seasonWeather.city}</strong>:{" "}
                            {weatherEmoji(
                              seasonWeather.condition,
                              seasonWeather.icon
                            )}{" "}
                            {seasonWeather.condition} (
                            {seasonWeather.description}
                            ),{" "}
                            {seasonWeather.temp.toFixed(1)}°C, humidity{" "}
                            {seasonWeather.humidity}%.
                          </p>

                          <h4>Suggested adjustments</h4>
                          <ul className="pp-extra-list">
                            {buildSeasonAdvice(
                              result.hair_type,
                              seasonWeather
                            ).map((tip, idx) => (
                              <li key={idx}>{tip}</li>
                            ))}
                          </ul>
                        </>
                      )}

                      {result && seasonWeather && result.products && (
                        <>
                          <h4 style={{ marginTop: 16 }}>
                            Products that still make sense today
                          </h4>
                          <p className="hint">
                            These are your usual matches — focus on lighter
                            ones if it’s hot/humid, and richer ones if it’s cold
                            or very dry.
                          </p>

                          <div className="product-grid">
                            {result.products.slice(0, 3).map((p, idx) => {
                              const resolved =
                                p._resolved_img ||
                                resolveImageSrc(p.image_url) ||
                                resolveImageSrc(productImageMap[p.name]);

                              return (
                                <div key={idx} className="product-card">
                                  <div className="product-header">
                                    <div className="product-name">
                                      {p.name}
                                    </div>
                                    <div className="product-brand">
                                      {p.brand}
                                    </div>
                                  </div>

                                  <div className="product-meta">
                                    {p.hair_types && (
                                      <span className="badge">
                                        For: {p.hair_types.join(", ")}
                                      </span>
                                    )}
                                    {p.match_score && (
                                      <span className="badge score">
                                        Match: {p.match_score}%
                                      </span>
                                    )}
                                  </div>

                                  {resolved && (
                                    <div className="provider-image">
                                      <img src={resolved} alt={p.name} />
                                    </div>
                                  )}

                                  <p className="product-desc">
                                    {p.description}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ) : selectedTreatment === "routine" ? (
                  <div className="panel-body layout-2col">
                    {/* INTENSITY SETTINGS */}
                    <div className="card upload-card">
                      <h3>Choose your routine intensity</h3>
                      <p className="hint">
                        Trichofy builds a weekly plan around your hair type.
                        Pick how intensive you want your care to be.
                      </p>

                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          margin: "12px 0 16px",
                          flexWrap: "wrap",
                        }}
                      >
                        {["light", "balanced", "intense"].map((level) => (
                          <button
                            key={level}
                            type="button"
                            className="glass-btn secondary"
                            style={{
                              padding: "6px 12px",
                              fontSize: "11px",
                              opacity:
                                routineIntensity === level ? 1 : 0.55,
                              borderColor:
                                routineIntensity === level
                                  ? "#a855f7"
                                  : "rgba(255,255,255,0.18)",
                            }}
                            onClick={() => setRoutineIntensity(level)}
                          >
                            {level === "light"
                              ? "Light"
                              : level === "balanced"
                              ? "Balanced"
                              : "Intense care"}
                          </button>
                        ))}
                      </div>

                      <p className="hint">
                        Tip: start with <strong>Balanced</strong>, then move to{" "}
                        <strong>Intense care</strong> if your hair is very dry,
                        coloured or breaking.
                      </p>

                      <p className="hint" style={{ marginTop: 8 }}>
                        Your routine uses the same products recommended under{" "}
                        <strong>For Individuals</strong>.
                      </p>
                    </div>

                    {/* ROUTINE PLAN */}
                    <div className="card results-card">
                      <h3>Your weekly routine</h3>

                      {!result && (
                        <p className="hint">
                          First, upload a photo in{" "}
                          <strong>For Individuals</strong> so Trichofy can
                          detect your hair type. Then come back here to see your
                          routine.
                        </p>
                      )}

                      {result && (
                        <>
                          <div className="hair-type-pill">
                            Hair type: <strong>{result.hair_type}</strong> ·
                            Plan:{" "}
                            <strong>
                              {routineIntensity === "light"
                                ? "Light"
                                : routineIntensity === "balanced"
                                ? "Balanced"
                                : "Intense care"}
                            </strong>
                          </div>

                          <ul
                            className="pp-extra-list"
                            style={{ marginTop: 16 }}
                          >
                            {buildRoutinePlan(
                              result.hair_type,
                              routineIntensity
                            ).map((block, idx) => (
                              <li key={idx}>
                                <strong>{block.title}</strong>
                                {block.when && (
                                  <span style={{ opacity: 0.7 }}>
                                    {" "}
                                    — {block.when}
                                  </span>
                                )}
                                <ul
                                  className="pp-extra-list"
                                  style={{ marginTop: 6 }}
                                >
                                  {block.steps.map((step, i) => (
                                    <li key={i}>{step}</li>
                                  ))}
                                </ul>
                              </li>
                            ))}
                          </ul>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  // For other tools, simple info card for now
                  <div className="card">
                    <p className="hint">
                      This AI mode influences how Trichofy interprets your hair
                      when you upload a photo. For now, you can still upload
                      from the <strong>For Individuals</strong> section to see
                      full predictions.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* USER PAGE */}
        <section id="user" className="section panel user-panel">
          {/* User background video */}
          <div className="user-video-wrap">
            <video
              className="user-bg-video"
              src={USER_VIDEO}
              autoPlay
              muted
              loop
              playsInline
            />
            <div className="user-overlay" />
          </div>

          {/* Foreground content */}
          <div className="user-inner">
            <div className="panel-header">
              <h2>For Individuals</h2>
              <p>
                Upload a hair photo and let Trichofy decode your pattern &
                recommend products.
              </p>
            </div>

            <div className="panel-body layout-2col">
              {/* Upload */}
              <div className="card upload-card">
                <h3>Upload your hair image</h3>
                <p className="hint">Use natural light; avoid heavy filters.</p>

                <label className="upload-label">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  <span>Choose or drop an image</span>
                </label>

                {preview && (
                  <div className="preview-wrap">
                    <img src={preview} alt="preview" className="preview-img" />
                  </div>
                )}

                <button
                  className="primary-btn"
                  onClick={handleAnalyze}
                  disabled={loading || !file}
                >
                  {loading ? "Analyzing..." : "Analyze & Recommend"}
                </button>

                {error && <div className="error">{error}</div>}
              </div>

              {/* Results */}
              <div className="card results-card">
                <h3>Results</h3>

                {!result && !error && (
                  <p className="hint">
                    Your results will appear here after uploading a photo.
                  </p>
                )}

                {result && (
                  <>
                    <div className="hair-type-pill">
                      Predicted hair type: <strong>{result.hair_type}</strong>
                    </div>

                    {/* Confidence */}
                    {result.probabilities && (
                      <div className="probs">
                        <h4>Confidence breakdown</h4>
                        {Object.entries(result.probabilities)
                          .sort((a, b) => b[1] - a[1])
                          .map(([label, prob]) => (
                            <div key={label} className="prob-row">
                              <span className="prob-label">{label}</span>
                              <div className="prob-bar">
                                <div
                                  className="prob-fill"
                                  style={{
                                    width: `${(prob * 100).toFixed(1)}%`,
                                  }}
                                />
                              </div>
                              <span className="prob-val">
                                {(prob * 100).toFixed(1)}%
                              </span>
                            </div>
                          ))}
                      </div>
                    )}

                    {/* Products */}
                    <div className="products">
                      <h4>Recommended shampoos & treatments</h4>

                      {result.products?.length > 0 ? (
                        <div className="product-grid">
                          {result.products.map((p, idx) => {
                            const resolved =
                              p._resolved_img ||
                              resolveImageSrc(p.image_url) ||
                              resolveImageSrc(productImageMap[p.name]);

                            return (
                              <div key={idx} className="product-card">
                                <div className="product-header">
                                  <div className="product-name">{p.name}</div>
                                  <div className="product-brand">
                                    {p.brand}
                                  </div>
                                </div>

                                <div className="product-meta">
                                  {p.hair_types && (
                                    <span className="badge">
                                      For: {p.hair_types.join(", ")}
                                    </span>
                                  )}
                                  {p.match_score && (
                                    <span className="badge score">
                                      Match: {p.match_score}%
                                    </span>
                                  )}
                                </div>

                                {resolved && (
                                  <div className="provider-image">
                                    <img src={resolved} alt={p.name} />
                                  </div>
                                )}

                                <p className="product-desc">
                                  {p.description}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="hint">No matches yet.</p>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* PROVIDER */}
        <section id="provider" className="section panel provider-panel">
          {/* Background video layer */}
          <div className="provider-video-wrap">
            <video
              className="provider-bg-video"
              src={PROVIDER_VIDEO}
              autoPlay
              muted
              loop
              playsInline
            />
            <div className="provider-overlay" />
          </div>

          {/* Foreground content */}
          <div className="provider-inner">
            <div className="panel-header">
              <h2>For Product Providers</h2>
              <p>
                Submit your products so Trichofy can match them to real hair
                types.
              </p>
            </div>

            {/* STEP 1 – CATEGORY SELECTION */}
            <div className="card pp-card">
              <div className="pp-head">
                <div>
                  <h3 className="pp-title">Choose a product category</h3>
                  <p className="pp-subtitle">
                    Start by telling Trichofy what kind of product you’re
                    registering. This unlocks a tailored form for that
                    category.
                  </p>
                </div>
                {activeCategory && (
                  <div className="pp-selected-pill">
                    <span>Selected:</span>
                    <strong>{activeCategory.label}</strong>
                  </div>
                )}
              </div>

              <div className="pp-grid">
                {PROVIDER_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    className={
                      "pp-cat" + (selectedCategory === cat.id ? " active" : "")
                    }
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setError("");
                    }}
                  >
                    <span className="pp-pill">{cat.badge}</span>
                    <h4>{cat.label}</h4>
                    <p>{cat.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* STEP 2 – DYNAMIC FORM + LIVE LIST */}
            <div className="panel-body layout-2col">
              <form className="card provider-form" onSubmit={handleAddProduct}>
                <h3>
                  {activeCategory
                    ? `Add a ${activeCategory.label}`
                    : "Add a product"}
                </h3>
                <p className="hint">
                  {activeCategory
                    ? "Fill in the details below. These fields help Trichofy match this product to real hair profiles."
                    : "Select a category above to unlock the product form."}
                </p>

                {/* Base fields */}
                <label className="field">
                  <span>Product name</span>
                  <input
                    value={pName}
                    onChange={(e) => setPName(e.target.value)}
                    placeholder="Castor Oil"
                    disabled={!activeCategory}
                  />
                </label>

                <label className="field">
                  <span>Brand</span>
                  <input
                    value={pBrand}
                    onChange={(e) => setPBrand(e.target.value)}
                    placeholder="Native Child"
                    disabled={!activeCategory}
                  />
                </label>

                <label className="field">
                  <span>Target hair types</span>
                  <input
                    value={pHairTypes}
                    onChange={(e) => setPHairTypes(e.target.value)}
                    placeholder="e.g. Curly, Kinky, Wavy"
                    disabled={!activeCategory}
                  />
                </label>

                <label className="field">
                  <span>Image filename or URL</span>
                  <input
                    value={pImageUrl}
                    onChange={(e) => setPImageUrl(e.target.value)}
                    placeholder='e.g. "castor-oil.jpg"'
                    disabled={!activeCategory}
                  />
                </label>

                {/* Category-specific fields */}
                {activeCategory && activeCategory.questions?.length > 0 && (
                  <div className="pp-extra-grid">
                    {activeCategory.questions.map((q) => (
                      <label key={q.key} className="field">
                        <span>{q.label}</span>
                        <input
                          value={extraFields[q.key] || ""}
                          onChange={(e) =>
                            handleExtraChange(q.key, e.target.value)
                          }
                          placeholder={q.placeholder}
                        />
                      </label>
                    ))}
                  </div>
                )}

                <label className="field">
                  <span>Short description</span>
                  <textarea
                    rows={3}
                    value={pDesc}
                    onChange={(e) => setPDesc(e.target.value)}
                    placeholder="Benefits, actives, etc."
                    disabled={!activeCategory}
                  />
                </label>

                <button
                  type="submit"
                  className="primary-btn"
                  disabled={!activeCategory}
                >
                  Add product to Trichofy
                </button>

                {error && <div className="error">{error}</div>}
              </form>

              {/* Live list */}
              <div className="card provider-list">
                <h3>Registered products (local demo)</h3>
                {products.length === 0 && (
                  <p className="hint">Products you add will appear here.</p>
                )}

                <div className="product-grid">
                  {products.map((p, idx) => (
                    <div key={idx} className="product-card">
                      <div className="product-header">
                        <div className="product-name">{p.name}</div>
                        <div className="product-brand">{p.brand}</div>
                      </div>

                      <div className="product-meta">
                        {p.category_label && (
                          <span className="badge category">
                            {p.category_label}
                          </span>
                        )}
                        <span className="badge">
                          For: {p.hair_types.join(", ")}
                        </span>
                      </div>

                      {p.image_url && (
                        <div className="provider-image">
                          <img src={p.image_url} alt={p.name} />
                        </div>
                      )}

                      <p className="product-desc">{p.description}</p>

                      {p.extras && Object.keys(p.extras).length > 0 && (
                        <ul className="pp-extra-list">
                          {Object.entries(p.extras).map(
                            ([key, value]) =>
                              value && (
                                <li key={key}>
                                  <span>{value}</span>
                                </li>
                              )
                          )}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CONTACT */}
        <section id="contact" className="section contact">
          <div className="contact-wrapper">
            {/* LEFT IMAGE */}
            <div className="contact-image">
              {/* Image served from /public/contact.jpg */}
              <img src="/contact.jpg" alt="Natural hair" />
            </div>

            {/* RIGHT CARD */}
            <div className="contact-card">
              <h2>Contact Us</h2>
              <p className="contact-intro">
                Have questions about Trichofy, collaborations or integrations?
                Reach out and we'll get back to you shortly.
              </p>

              <div className="contact-grid">
                {/* FORM */}
                <form
                  className="contact-form"
                  onSubmit={(e) => e.preventDefault()}
                >
                  <label>
                    <span>Full Name</span>
                    <input type="text" placeholder="Your name" />
                  </label>

                  <label>
                    <span>Email</span>
                    <input type="email" placeholder="you@example.com" />
                  </label>

                  <label>
                    <span>Message</span>
                    <textarea rows={4} placeholder="How can we help?" />
                  </label>

                  <button type="submit" className="primary-btn contact-btn">
                    Send Message
                  </button>
                </form>

                {/* OWNER DETAILS */}
                <div className="contact-details">
                  <div className="contact-block">
                    <h3>Contact</h3>
                    <p className="owner-name">Witness Lubisi</p>
                    <p className="owner-line">
                      Phone:{" "}
                      <a href="tel:+27720524638">+27 72 052 4638</a>
                    </p>
                    <p className="owner-line">
                      Email:{" "}
                      <a href="mailto:witness.lubisi1@gmail.com">
                        witness.lubisi1@gmail.com
                      </a>
                    </p>
                  </div>

                  <div className="contact-block">
                    <h3>Based In</h3>
                    <p className="owner-line">South Africa</p>
                  </div>

                  <div className="contact-block">
                    <h3>Social</h3>
                    <div className="contact-social">
                      <span>IG</span>
                      <span>X</span>
                      <span>LinkedIn</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer className="site-footer">
          © {new Date().getFullYear()} Trichofy · Your best hair intelligence
          ritual.
        </footer>
      </main>
    </div>
  );
}
