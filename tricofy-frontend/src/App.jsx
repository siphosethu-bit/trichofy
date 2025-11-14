import React, { useState } from "react";
import "./index.css";
import heroImage from "./assets/hero.jpg";

const API_URL = "http://127.0.0.1:8000/predict";

// About page video (place file at /public/videos/trichofy-about.mp4)
const ABOUT_VIDEO = "/videos/trichofy-about.mp4";

// Treatments background video (place file at /public/videos/treatments-bg.mp4)
const TREATMENTS_VIDEO = "/videos/treatments-bg.mp4";

// User page background video (place file at /public/videos/user-bg.mp4)
const USER_VIDEO = "/videos/user-bg.mp4";

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

/** Turn any image reference into a usable <img src="..."> */
function resolveImageSrc(maybeNameOrUrl) {
  if (!maybeNameOrUrl) return null;
  if (/^https?:\/\//i.test(maybeNameOrUrl) || maybeNameOrUrl.startsWith("/")) {
    return maybeNameOrUrl;
  }
  return `/products/${maybeNameOrUrl}`;
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

  // -------- Provider flow --------
  const [pName, setPName] = useState("");
  const [pBrand, setPBrand] = useState("");
  const [pHairTypes, setPHairTypes] = useState("");
  const [pImageUrl, setPImageUrl] = useState("");
  const [pDesc, setPDesc] = useState("");
  const [products, setProducts] = useState([]);

  // -------- Treatments state --------
  const [selectedTreatment, setSelectedTreatment] = useState(null);

  // Upload
  const handleFileChange = (e) => {
    const f = e.target.files[0] || null;
    setFile(f);
    setResult(null);
    setError("");
    setPreview(f ? URL.createObjectURL(f) : null);
  };

  // Analyze Image
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

      // later: you can append selectedTreatment here as well
      // formData.append("mode", selectedTreatment || "");

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

  // Add provider product (local list only)
  const handleAddProduct = (e) => {
    e.preventDefault();
    setError("");

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
    };

    setProducts((prev) => [entry, ...prev]);
    setPName("");
    setPBrand("");
    setPHairTypes("");
    setPImageUrl("");
    setPDesc("");
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
      text:
        "The recommendations felt tailored and accurate.",
    },
  ];
  const loopedTestimonials = [...testimonials, ...testimonials];

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

            <div className="treatment-grid treatment-grid-tools">
              {TREATMENT_TOOLS.map((tool) => (
                <button
                  key={tool.id}
                  type="button"
                  className={
                    "treatment-card clickable" +
                    (selectedTreatment === tool.id ? " active" : "")
                  }
                  onClick={() =>
                    setSelectedTreatment(
                      selectedTreatment === tool.id ? null : tool.id
                    )
                  }
                >
                  <span className="treatment-chip">AI tool</span>
                  <h3>{tool.title}</h3>
                  {tool.body.map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                  <span className="treatment-cta">Tap to focus this mode</span>
                </button>
              ))}
            </div>

            {selectedTreatment && (
              <div className="treatment-selected-note">
                <span className="pill">Selected tool</span>
                <div>
                  <strong>
                    {
                      TREATMENT_TOOLS.find(
                        (t) => t.id === selectedTreatment
                      ).title
                    }
                  </strong>
                  <p>
                    When you upload a picture in the{" "}
                    <strong>For Individuals</strong> section, Trichofy can
                    prioritise this analysis mode first in the experience.
                  </p>
                </div>
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
          <div className="panel-header">
            <h2>For Product Providers</h2>
            <p>
              Submit your products so Trichofy can match them to real hair
              types.
            </p>
          </div>

          <div className="panel-body layout-2col">
            <form className="card provider-form" onSubmit={handleAddProduct}>
              <h3>Add a product</h3>

              <label className="field">
                <span>Product name</span>
                <input
                  value={pName}
                  onChange={(e) => setPName(e.target.value)}
                  placeholder="Castor Oil"
                />
              </label>

              <label className="field">
                <span>Brand</span>
                <input
                  value={pBrand}
                  onChange={(e) => setPBrand(e.target.value)}
                  placeholder="Native Child"
                />
              </label>

              <label className="field">
                <span>Target hair types</span>
                <input
                  value={pHairTypes}
                  onChange={(e) => setPHairTypes(e.target.value)}
                  placeholder="e.g. Curly, Kinky, Wavy"
                />
              </label>

              <label className="field">
                <span>Image filename or URL</span>
                <input
                  value={pImageUrl}
                  onChange={(e) => setPImageUrl(e.target.value)}
                  placeholder='e.g. "castor-oil.jpg"'
                />
              </label>

              <label className="field">
                <span>Short description</span>
                <textarea
                  rows={3}
                  value={pDesc}
                  onChange={(e) => setPDesc(e.target.value)}
                  placeholder="Benefits, actives, etc."
                />
              </label>

              <button type="submit" className="primary-btn">
                Add product to Trichofy
              </button>
            </form>

            {/* Live list */}
            <div className="card provider-list">
              <h3>Registered products (local demo)</h3>
              {products.length === 0 && (
                <p className="hint">
                  Products you add will appear here.
                </p>
              )}

              <div className="product-grid">
                {products.map((p, idx) => (
                  <div key={idx} className="product-card">
                    <div className="product-header">
                      <div className="product-name">{p.name}</div>
                      <div className="product-brand">{p.brand}</div>
                    </div>

                    <div className="product-meta">
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
                  </div>
                ))}
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

                  <button
                    type="submit"
                    className="primary-btn contact-btn"
                  >
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
