import React, { useEffect, useMemo, useState } from "react";
import "./index.css";
import heroImage from "./assets/hero.jpg";
import {
  navItems,
  productCatalog,
  providerCategories,
  treatmentTools,
} from "./data/content";
import {
  Button,
  PageIntro,
  ProductCard,
  SectionHeader,
  TreatmentCard,
} from "./components/ui";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://trichofy-backend.onrender.com";
const API_ROOT = API_BASE_URL.replace(/\/$/, "");
const API_URL = `${API_ROOT}/predict`;
const WEATHER_URL = `${API_ROOT}/weather`;

const healthFeatures = [
  {
    title: "Scalp Concern Screening",
    label: "Responsible screening",
    description:
      "Review visible signs such as dryness, flaking, irritation, redness, thinning, or unusual scalp texture.",
  },
  {
    title: "Hair Loss Pattern Review",
    label: "Health focused",
    description: "Track visible changes in hair density and pattern over time.",
  },
  {
    title: "Scalp Image History",
    label: "Private by design",
    description:
      "Keep a private timeline of scalp images to compare progress across weeks or months.",
  },
  {
    title: "Professional Guidance Pathway",
    label: "Professional guidance",
    description:
      "Receive careful next-step guidance when a visible concern may require review by a dermatologist, trichologist, or pharmacist.",
  },
  {
    title: "Care Recommendations",
    label: "Coming soon",
    description:
      "Get general wellness guidance for maintaining scalp and hair health without making medical claims.",
  },
];

const healthSteps = [
  "Upload a clear scalp or hair image",
  "Review visible hair and scalp indicators",
  "Receive responsible guidance",
  "Track changes privately over time",
];

const healthTrustPoints = [
  "Trichofy Health is not a medical diagnosis.",
  "It is designed for awareness, health focused screening, and early guidance.",
  "Users should consult a qualified professional for medical concerns.",
  "User images and health related information should be handled with privacy and care.",
];

const productImageMap = {
  "AfriPure Shea Butter + Marula Moisturising Hair Oil": "shea-butter.jpg.png",
  "Native Child Castor Oil - Hairgrowth Oil": "castor-oil.jpg.png",
  "Native Child Castor Oil": "castor-oil.jpg.png",
  "AfriPure Vegetable Glycerine (100% Pure)": "glycerin.jpg.png",
  "Pure Hydrolyzed Collagen (Peptide Powder)": "hydrolyzed-protein.jpg.png",
  "AfriPure Marula Oil": "marula-oil.jpg.png",
  "AfriPure Argan Oil": "argan-oil.jpg.png",
  "AfriPure Jojoba Oil": "jojoba-oil.jpg.png",
};

function resolveImageSrc(maybeNameOrUrl) {
  if (!maybeNameOrUrl) return null;
  if (/^https?:\/\//i.test(maybeNameOrUrl) || maybeNameOrUrl.startsWith("/")) {
    return maybeNameOrUrl;
  }
  return `/products/${maybeNameOrUrl}`;
}

function weatherLabel(condition = "", icon = "") {
  const c = condition.toLowerCase();
  const i = icon.toLowerCase();
  if (c.includes("thunder") || i.startsWith("11")) return "Storm";
  if (c.includes("rain") || c.includes("drizzle") || i.startsWith("09") || i.startsWith("10")) {
    return "Rain";
  }
  if (c.includes("snow") || i.startsWith("13")) return "Snow";
  if (c.includes("cloud") || i.startsWith("03") || i.startsWith("04")) return "Cloudy";
  if (c.includes("mist") || c.includes("fog") || c.includes("haze")) return "Misty";
  if (c.includes("clear") || i.startsWith("01")) return "Clear";
  return "Current weather";
}

function buildSeasonAdvice(hairType, weather) {
  if (!hairType || !weather) return [];
  const tips = [];
  const ht = hairType.toLowerCase();
  const { humidity, temp, condition } = weather;

  if (ht.includes("kinky") || ht.includes("coily")) {
    tips.push("Use rich creams and sealing oils to protect coils from dryness.");
  } else if (ht.includes("curly")) {
    tips.push("Pair a moisturising leave-in with a light defining cream or gel.");
  } else if (ht.includes("wavy")) {
    tips.push("Choose lighter creams or foams so waves keep movement.");
  } else if (ht.includes("straight")) {
    tips.push("Use lightweight serums and focus oils on the ends.");
  }

  if (humidity >= 70 || (condition || "").toLowerCase().includes("rain")) {
    tips.push("Humidity is high. Add frizz control and seal your ends carefully.");
  }
  if (humidity <= 40) {
    tips.push("Air is dry. Layer water-based moisture, then seal with oil.");
  }
  if (temp >= 28) {
    tips.push("Heat is high. Keep styles simple and cleanse the scalp regularly.");
  }
  if (temp <= 12) {
    tips.push("Cold weather calls for deeper conditioning and protected ends.");
  }

  return tips.length ? tips : ["Weather looks balanced. Keep your routine steady."];
}

function buildRoutinePlan(hairType, intensity = "balanced") {
  const ht = (hairType || "").toLowerCase();
  const textured = ht.includes("kinky") || ht.includes("coily") || ht.includes("curly");
  const moistureWord = textured ? "rich cream" : "lightweight lotion";
  const oilWord = textured ? "butter or oil" : "light serum";

  return [
    {
      title: "Wash day",
      when: intensity === "light" ? "Every 7 to 10 days" : "Once per week",
      steps: [
        "Cleanse with a gentle shampoo.",
        "Deep condition for 15 to 30 minutes.",
        `Apply leave-in, then ${moistureWord} and seal with ${oilWord}.`,
      ],
    },
    {
      title: "Mid-week moisture",
      when: intensity === "intense" ? "Two to three times weekly" : "Mid-week",
      steps: [
        "Mist lightly with water or a water-based refresher.",
        `Add a small amount of ${moistureWord} to mid-lengths and ends.`,
        "Protect hair overnight with a satin bonnet or pillowcase.",
      ],
    },
    {
      title: "Scalp and care check",
      when: "Weekly",
      steps: [
        "Check for buildup, flaking or tension.",
        "Massage the scalp gently.",
        "Adjust products if hair feels coated, dry or fragile.",
      ],
    },
  ];
}

function usePath() {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePop = () => setPath(window.location.pathname);
    window.addEventListener("popstate", handlePop);
    return () => window.removeEventListener("popstate", handlePop);
  }, []);

  const navigate = (nextPath) => {
    if (nextPath !== window.location.pathname) {
      window.history.pushState({}, "", nextPath);
    }
    setPath(nextPath);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return [path, navigate];
}

export default function App() {
  const [path, navigate] = usePath();
  const [menuOpen, setMenuOpen] = useState(false);
  const [healthModalOpen, setHealthModalOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [productFilter, setProductFilter] = useState("All");
  const [routineIntensity, setRoutineIntensity] = useState("balanced");
  const [seasonCity, setSeasonCity] = useState("Johannesburg");
  const [seasonCountry, setSeasonCountry] = useState("ZA");
  const [seasonWeather, setSeasonWeather] = useState(null);
  const [seasonLoading, setSeasonLoading] = useState(false);
  const [seasonError, setSeasonError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(providerCategories[0].id);
  const [extraFields, setExtraFields] = useState({});
  const [providerForm, setProviderForm] = useState({
    name: "",
    brand: "",
    hairTypes: "",
    imageUrl: "",
    description: "",
  });
  const [providerProducts, setProviderProducts] = useState([]);

  const activeCategory = providerCategories.find((category) => category.id === selectedCategory);
  const recommendedProducts = result?.products?.length ? result.products : [];
  const productCategories = useMemo(
    () => ["All", ...Array.from(new Set(productCatalog.map((product) => product.category)))],
    []
  );
  const visibleProducts =
    productFilter === "All"
      ? productCatalog
      : productCatalog.filter((product) => product.category === productFilter);

  const go = (nextPath) => {
    setMenuOpen(false);
    navigate(nextPath);
  };

  const handleFileChange = (event) => {
    const nextFile = event.target.files[0] || null;
    setFile(nextFile);
    setResult(null);
    setError("");
    setPreview(nextFile ? URL.createObjectURL(nextFile) : null);
  };

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
      const response = await fetch(API_URL, { method: "POST", body: formData });
      if (!response.ok) throw new Error("Backend error");
      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setResult({
        hair_type: data.hair_type || data.predicted_label || "Unknown",
        probabilities: data.probabilities || data.probs || {},
        products: (data.products || []).map((product) => {
          const fromBackend = resolveImageSrc(product.image_url);
          const fromMap = resolveImageSrc(productImageMap[product.name]);
          return {
            ...product,
            category: product.category || "Recommended",
            _resolved_img: fromBackend || fromMap || null,
            image_url: fromBackend || fromMap || null,
          };
        }),
      });
    } catch (err) {
      console.error(err);
      setError("Could not analyze image. Please try again shortly.");
    } finally {
      setLoading(false);
    }
  };

  const handleFetchWeather = async () => {
    setSeasonLoading(true);
    setSeasonError("");
    setSeasonWeather(null);

    try {
      const url = `${WEATHER_URL}?city=${encodeURIComponent(seasonCity)}&country=${encodeURIComponent(
        seasonCountry
      )}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Weather backend error");
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setSeasonWeather(data);
    } catch (err) {
      console.error(err);
      setSeasonError("Could not fetch weather right now.");
    } finally {
      setSeasonLoading(false);
    }
  };

  const handleProviderChange = (key, value) => {
    setProviderForm((current) => ({ ...current, [key]: value }));
  };

  const handleExtraChange = (key, value) => {
    setExtraFields((current) => ({ ...current, [key]: value }));
  };

  const handleAddProviderProduct = (event) => {
    event.preventDefault();
    if (!providerForm.name.trim() || !providerForm.brand.trim()) {
      setError("Please provide product name and brand.");
      return;
    }

    const entry = {
      name: providerForm.name.trim(),
      brand: providerForm.brand.trim(),
      category: activeCategory.label,
      hair_types: providerForm.hairTypes
        ? providerForm.hairTypes.split(",").map((type) => type.trim()).filter(Boolean)
        : ["All"],
      image_url: resolveImageSrc(providerForm.imageUrl.trim()) || resolveImageSrc(productImageMap[providerForm.name]),
      description: providerForm.description.trim() || "Submitted for Trichofy review.",
      extras: { ...extraFields },
    };

    setProviderProducts((current) => [entry, ...current]);
    setProviderForm({ name: "", brand: "", hairTypes: "", imageUrl: "", description: "" });
    setExtraFields({});
    setError("");
  };

  const pageProps = {
    go,
    openHealthModal: () => setHealthModalOpen(true),
    file,
    preview,
    loading,
    error,
    result,
    handleFileChange,
    handleAnalyze,
    productFilter,
    setProductFilter,
    productCategories,
    visibleProducts,
    recommendedProducts,
    routineIntensity,
    setRoutineIntensity,
    seasonCity,
    setSeasonCity,
    seasonCountry,
    setSeasonCountry,
    seasonWeather,
    seasonLoading,
    seasonError,
    handleFetchWeather,
    activeCategory,
    selectedCategory,
    setSelectedCategory,
    providerForm,
    handleProviderChange,
    extraFields,
    handleExtraChange,
    providerProducts,
    handleAddProviderProduct,
  };

  return (
    <div className="site-shell">
      <Header path={path} go={go} menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <main>
        {path === "/" && <HomePage {...pageProps} />}
        {path === "/about" && <AboutPage go={go} />}
        {path === "/analysis" && <AnalysisPage {...pageProps} />}
        {path === "/health" && <HealthPage openHealthModal={pageProps.openHealthModal} />}
        {path === "/treatments" && <TreatmentsPage {...pageProps} />}
        {path === "/products" && <ProductsPage {...pageProps} />}
        {path === "/providers" && <ProvidersPage {...pageProps} />}
        {path === "/contact" && <ContactPage />}
        {!navItems.some((item) => item.path === path) && <HomePage {...pageProps} />}
      </main>
      {path !== "/" && (
        <footer className="site-footer">
          <span>Trichofy</span>
          <span>Premium hair intelligence for modern care.</span>
        </footer>
      )}
      <HealthComingSoonModal
        open={healthModalOpen}
        onClose={() => setHealthModalOpen(false)}
      />
    </div>
  );
}

function Header({ path, go, menuOpen, setMenuOpen }) {
  return (
    <>
      <header className="site-header">
        <button className="brand-mark" type="button" onClick={() => go("/")}>
          Trichofy
        </button>
        <nav className="desktop-nav" aria-label="Primary navigation">
          {navItems.map((item) => (
            <button
              key={item.path}
              type="button"
              className={path === item.path ? "active" : ""}
              onClick={() => go(item.path)}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <button
          type="button"
          className="menu-button"
          aria-label="Open menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
        </button>
      </header>
      <div className={`mobile-menu ${menuOpen ? "open" : ""}`}>
        <nav aria-label="Mobile navigation">
          {navItems.map((item) => (
            <button
              key={item.path}
              type="button"
              className={path === item.path ? "active" : ""}
              onClick={() => go(item.path)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </>
  );
}

function HomePage({ go }) {
  return (
    <div className="page home-page">
      <section className="home-hero" style={{ backgroundImage: `url(${heroImage})` }}>
        <div className="hero-shade" />
        <div className="hero-inner">
          <p className="eyebrow">AI hair intelligence</p>
          <h1>Understand Your Hair Like Never Before</h1>
          <p>
            AI-powered hair analysis that helps you discover the products, routines and treatments
            that truly match your hair.
          </p>
          <div className="hero-actions">
            <Button onClick={() => go("/analysis")}>Analyze My Hair</Button>
            <Button variant="outline" onClick={() => go("/products")}>
              Explore Products
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function AboutPage({ go }) {
  return (
    <div className="page">
      <section className="page-hero split-hero">
        <PageIntro
          eyebrow="About Trichofy"
          title="A more intelligent way to understand hair."
          text="Trichofy was created for women who want hair care to feel clearer, more personal and more beautiful."
        />
        <div className="portrait-frame">
          <img src="/contact.jpg" alt="Natural hair portrait" />
        </div>
      </section>
      <section className="section editorial-grid">
        <article>
          <p className="eyebrow">Hair intelligence</p>
          <h2>From visual signals to useful care decisions.</h2>
        </article>
        <div className="copy-stack">
          <p>
            Trichofy uses computer vision to read visible hair characteristics from a clear image.
            The experience is designed to support natural hair, curls, coils, waves, straight hair
            and protective styles with the same level of care.
          </p>
          <p>
            The platform then connects analysis to product matching, ingredient guidance and routine
            planning. The result is a beauty experience that feels considered instead of clinical.
          </p>
          <Button onClick={() => go("/analysis")}>Start Analysis</Button>
        </div>
      </section>
      <section className="section value-grid">
        {["Computer vision", "Product matching", "Routine clarity"].map((title) => (
          <article key={title}>
            <h3>{title}</h3>
            <p>
              A focused layer of intelligence that makes hair care more understandable, more
              personal and easier to act on.
            </p>
          </article>
        ))}
      </section>
    </div>
  );
}

function AnalysisPage({
  preview,
  loading,
  error,
  result,
  handleFileChange,
  handleAnalyze,
  go,
}) {
  return (
    <div className="page">
      <section className="page-hero analysis-hero">
        <PageIntro
          eyebrow="Hair Analysis"
          title="Your flagship hair intelligence experience."
          text="Upload a clear hair image and let Trichofy translate what it sees into hair type confidence, routine direction and product matches."
          align="center"
        />
      </section>

      <section className="section analysis-flow">
        <div className="step-rail">
          {["Upload image", "AI analysis", "Results", "Recommended products"].map((step, index) => (
            <div className="step-item" key={step}>
              <span>{index + 1}</span>
              <p>{step}</p>
            </div>
          ))}
        </div>

        <div className="analysis-grid">
          <div className="analysis-card upload-card">
            <p className="eyebrow">Step 1</p>
            <h2>Upload your hair image</h2>
            <p>Use natural light and keep the hair clearly visible for the strongest analysis.</p>
            <label className="upload-zone">
              <input type="file" accept="image/*" onChange={handleFileChange} />
              <span>Choose a hair image</span>
              <small>PNG, JPG or phone camera image</small>
            </label>
            {preview && (
              <div className="preview-frame">
                <img src={preview} alt="Hair upload preview" />
              </div>
            )}
            <Button onClick={handleAnalyze} disabled={loading}>
              {loading ? "Analyzing" : "Analyze My Hair"}
            </Button>
            {error && <p className="error">{error}</p>}
          </div>

          <div className="analysis-card result-card">
            <p className="eyebrow">Step 3</p>
            <h2>Your results</h2>
            {!result && <p>Your hair profile and recommendations will appear here after analysis.</p>}
            {result && (
              <>
                <div className="result-summary">
                  <span>Predicted hair type</span>
                  <strong>{result.hair_type}</strong>
                </div>
                {result.probabilities && (
                  <div className="confidence-list">
                    {Object.entries(result.probabilities)
                      .sort((a, b) => b[1] - a[1])
                      .map(([label, prob]) => (
                        <div className="confidence-row" key={label}>
                          <span>{label}</span>
                          <div>
                            <i style={{ width: `${(prob * 100).toFixed(1)}%` }} />
                          </div>
                          <b>{(prob * 100).toFixed(1)}%</b>
                        </div>
                      ))}
                  </div>
                )}
                <Button variant="outline" onClick={() => go("/products")}>
                  View Product Matches
                </Button>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function HealthPage({ openHealthModal }) {
  return (
    <div className="page health-page">
      <section className="page-hero health-hero">
        <div className="health-hero-copy">
          <div className="health-label-row">
            <span>Private by design</span>
            <span>Coming soon</span>
            <span>Health focused</span>
          </div>
          <PageIntro
            eyebrow="Trichofy Health"
            title="Trichofy Health"
            text="A careful hair and scalp wellness experience designed to help users understand visible scalp concerns, track changes, and know when to seek professional guidance."
          />
          <div className="hero-actions">
            <Button onClick={openHealthModal}>Explore Health Features</Button>
            <Button variant="outline" onClick={openHealthModal}>
              Join Early Access
            </Button>
          </div>
        </div>
        <div className="clinical-panel" aria-label="Health focused screening preview">
          <div className="clinical-panel-top">
            <span>Screening Preview</span>
            <strong>Visible indicators only</strong>
          </div>
          <div className="scan-card">
            <span />
            <div>
              <strong>Scalp comfort review</strong>
              <p>Possible scalp concern noted for professional review if symptoms continue.</p>
            </div>
          </div>
          <div className="clinical-metrics">
            <div>
              <span>Privacy</span>
              <strong>Local controls</strong>
            </div>
            <div>
              <span>Guidance</span>
              <strong>Careful next steps</strong>
            </div>
          </div>
          <p>
            Designed for responsible guidance and awareness. Not a medical diagnosis.
          </p>
        </div>
      </section>

      <section className="section health-feature-section">
        <SectionHeader
          eyebrow="Premium wellness tools"
          title="Clinical clarity for hair and scalp care."
          text="Each feature is being shaped around visible scalp indicators, user privacy, and careful guidance that respects the role of qualified professionals."
        />
        <div className="health-feature-grid">
          {healthFeatures.map((feature) => (
            <button
              type="button"
              className="health-feature-card"
              key={feature.title}
              onClick={openHealthModal}
            >
              <span>{feature.label}</span>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="section health-steps-section">
        <SectionHeader
          eyebrow="How it works"
          title="A measured flow from image to awareness."
        />
        <div className="health-step-grid">
          {healthSteps.map((step, index) => (
            <article key={step}>
              <span>Step {index + 1}</span>
              <h3>{step}</h3>
            </article>
          ))}
        </div>
      </section>

      <section className="section health-trust-section">
        <div>
          <p className="eyebrow">Trust and safety</p>
          <h2>Built for careful wellness guidance, not medical claims.</h2>
        </div>
        <div className="health-trust-list">
          {healthTrustPoints.map((point) => (
            <article key={point}>
              <span />
              <p>{point}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function HealthComingSoonModal({ open, onClose }) {
  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="health-modal-layer" role="presentation" onMouseDown={onClose}>
      <section
        className="health-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="health-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <p className="eyebrow">Coming soon</p>
        <h2 id="health-modal-title">Clinical Screening Coming Soon</h2>
        <p>
          Trichofy Health is being designed to help users understand visible hair and scalp
          concerns with care, privacy, and responsible guidance. This feature is still under
          development and will not replace professional medical advice.
        </p>
        <div className="health-modal-actions">
          <Button onClick={onClose}>Join Early Access</Button>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </section>
    </div>
  );
}

function TreatmentsPage({
  result,
  routineIntensity,
  setRoutineIntensity,
  seasonCity,
  setSeasonCity,
  seasonCountry,
  setSeasonCountry,
  seasonWeather,
  seasonLoading,
  seasonError,
  handleFetchWeather,
}) {
  return (
    <div className="page">
      <section className="page-hero">
        <PageIntro
          eyebrow="Treatments"
          title="Targeted care guidance for every hair moment."
          text="Explore treatment intelligence for hydration, damage, density, scalp health, curl pattern and routine planning."
          align="center"
        />
      </section>
      <section className="section">
        <div className="treatment-grid">
          {treatmentTools.map((treatment) => (
            <TreatmentCard treatment={treatment} key={treatment.id} />
          ))}
        </div>
      </section>
      <section className="section treatment-tools">
        <div className="analysis-card">
          <p className="eyebrow">Routine builder</p>
          <h2>Build a weekly rhythm</h2>
          <div className="filter-row">
            {["light", "balanced", "intense"].map((level) => (
              <button
                type="button"
                className={routineIntensity === level ? "active" : ""}
                key={level}
                onClick={() => setRoutineIntensity(level)}
              >
                {level === "intense" ? "Intense care" : level}
              </button>
            ))}
          </div>
          {!result && <p>Run Hair Analysis first to personalize this routine.</p>}
          {result && (
            <div className="routine-list">
              {buildRoutinePlan(result.hair_type, routineIntensity).map((block) => (
                <article key={block.title}>
                  <h3>{block.title}</h3>
                  <span>{block.when}</span>
                  <ul>
                    {block.steps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          )}
        </div>
        <div className="analysis-card">
          <p className="eyebrow">Seasonal care</p>
          <h2>Weather-aware adjustments</h2>
          <div className="two-fields">
            <label>
              <span>City</span>
              <input value={seasonCity} onChange={(event) => setSeasonCity(event.target.value)} />
            </label>
            <label>
              <span>Country</span>
              <input value={seasonCountry} onChange={(event) => setSeasonCountry(event.target.value)} />
            </label>
          </div>
          <Button onClick={handleFetchWeather} disabled={seasonLoading}>
            {seasonLoading ? "Fetching" : "Refresh Weather"}
          </Button>
          {seasonError && <p className="error">{seasonError}</p>}
          {seasonWeather && (
            <div className="weather-card">
              <strong>{weatherLabel(seasonWeather.condition, seasonWeather.icon)}</strong>
              <span>
                {seasonWeather.temp.toFixed(1)}C in {seasonWeather.city}
              </span>
              {result && (
                <ul>
                  {buildSeasonAdvice(result.hair_type, seasonWeather).map((tip) => (
                    <li key={tip}>{tip}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function ProductsPage({
  productFilter,
  setProductFilter,
  productCategories,
  visibleProducts,
  recommendedProducts,
  go,
}) {
  return (
    <div className="page">
      <section className="page-hero">
        <PageIntro
          eyebrow="Product Recommendations"
          title="A beauty catalog shaped by intelligence."
          text="Browse curated product categories or review recommendations from your latest hair analysis."
          align="center"
        />
      </section>
      <section className="section">
        {recommendedProducts.length > 0 && (
          <div className="recommendation-panel">
            <SectionHeader eyebrow="Your matches" title="Recommended from your analysis." />
            <div className="product-grid">
              {recommendedProducts.map((product, index) => (
                <ProductCard product={product} key={`${product.name}-${index}`} />
              ))}
            </div>
          </div>
        )}
        {recommendedProducts.length === 0 && (
          <div className="soft-note action-note">
            Analyze your hair to unlock personalized product matches.
            <Button onClick={() => go("/analysis")}>Analyze My Hair</Button>
          </div>
        )}
        <div className="catalog-head">
          <SectionHeader eyebrow="Catalog" title="Explore by care goal." />
          <div className="filter-row">
            {productCategories.map((category) => (
              <button
                key={category}
                type="button"
                className={productFilter === category ? "active" : ""}
                onClick={() => setProductFilter(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
        <div className="product-grid">
          {visibleProducts.map((product) => (
            <ProductCard product={product} key={product.name} />
          ))}
        </div>
      </section>
    </div>
  );
}

function ProvidersPage({
  activeCategory,
  selectedCategory,
  setSelectedCategory,
  providerForm,
  handleProviderChange,
  extraFields,
  handleExtraChange,
  providerProducts,
  handleAddProviderProduct,
  error,
}) {
  return (
    <div className="page">
      <section className="page-hero">
        <PageIntro
          eyebrow="Product Providers"
          title="A professional submission experience for beauty brands."
          text="Submit products with the level of detail Trichofy needs to match formulas to real hair profiles."
          align="center"
        />
      </section>
      <section className="section provider-layout">
        <aside className="provider-categories">
          <p className="eyebrow">Product category</p>
          {providerCategories.map((category) => (
            <button
              key={category.id}
              type="button"
              className={selectedCategory === category.id ? "active" : ""}
              onClick={() => setSelectedCategory(category.id)}
            >
              <strong>{category.label}</strong>
              <span>{category.description}</span>
            </button>
          ))}
        </aside>

        <form className="provider-form-panel" onSubmit={handleAddProviderProduct}>
          <div>
            <p className="eyebrow">Submission profile</p>
            <h2>{activeCategory.label}</h2>
            <p>{activeCategory.description}</p>
          </div>
          <div className="form-grid">
            <label>
              <span>Product name</span>
              <input
                value={providerForm.name}
                onChange={(event) => handleProviderChange("name", event.target.value)}
                placeholder="Castor Oil"
              />
            </label>
            <label>
              <span>Brand</span>
              <input
                value={providerForm.brand}
                onChange={(event) => handleProviderChange("brand", event.target.value)}
                placeholder="Native Child"
              />
            </label>
            <label>
              <span>Target hair types</span>
              <input
                value={providerForm.hairTypes}
                onChange={(event) => handleProviderChange("hairTypes", event.target.value)}
                placeholder="Curly, coily, straight"
              />
            </label>
            <label>
              <span>Image filename or URL</span>
              <input
                value={providerForm.imageUrl}
                onChange={(event) => handleProviderChange("imageUrl", event.target.value)}
                placeholder="castor-oil.jpg.png"
              />
            </label>
            {activeCategory.questions.map((question) => (
              <label key={question.key}>
                <span>{question.label}</span>
                <input
                  value={extraFields[question.key] || ""}
                  onChange={(event) => handleExtraChange(question.key, event.target.value)}
                  placeholder={question.placeholder}
                />
              </label>
            ))}
            <label className="full">
              <span>Short description</span>
              <textarea
                rows={4}
                value={providerForm.description}
                onChange={(event) => handleProviderChange("description", event.target.value)}
                placeholder="Benefits, ingredients and ideal use."
              />
            </label>
          </div>
          <Button type="submit">Submit Product</Button>
          {error && <p className="error">{error}</p>}
        </form>
      </section>
      <section className="section">
        <SectionHeader eyebrow="Submission preview" title="Recently added products." />
        {providerProducts.length === 0 && <p className="muted-block">Submitted products will appear here.</p>}
        <div className="product-grid">
          {providerProducts.map((product, index) => (
            <ProductCard product={product} key={`${product.name}-${index}`} />
          ))}
        </div>
      </section>
    </div>
  );
}

function ContactPage() {
  return (
    <div className="page">
      <section className="page-hero split-hero">
        <PageIntro
          eyebrow="Contact"
          title="Support for customers, salons and beauty partners."
          text="Reach out for collaborations, platform questions, product onboarding or support."
        />
        <div className="portrait-frame">
          <img src="/contact.jpg" alt="Hair care support" />
        </div>
      </section>
      <section className="section contact-layout">
        <form className="contact-form" onSubmit={(event) => event.preventDefault()}>
          <label>
            <span>Full name</span>
            <input placeholder="Your name" />
          </label>
          <label>
            <span>Email</span>
            <input type="email" placeholder="you@example.com" />
          </label>
          <label>
            <span>Message</span>
            <textarea rows={5} placeholder="How can we help?" />
          </label>
          <Button type="submit">Send Message</Button>
        </form>
        <aside className="contact-details">
          <div>
            <p className="eyebrow">Direct contact</p>
            <h2>Witness Lubisi</h2>
            <p>
              <a href="tel:+27720524638">+27 72 052 4638</a>
            </p>
            <p>
              <a href="mailto:witness.lubisi1@gmail.com">witness.lubisi1@gmail.com</a>
            </p>
          </div>
          <div>
            <p className="eyebrow">Based in</p>
            <p>South Africa</p>
          </div>
        </aside>
      </section>
    </div>
  );
}
