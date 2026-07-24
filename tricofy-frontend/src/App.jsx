import React, { useEffect, useMemo, useState } from "react";
import "./index.css";
import { navItems, productCatalog, providerCategories, treatmentTools } from "./data/content";
import { evaluateTreatment, getTreatmentAssessment } from "./data/treatmentAssessments";
import { Button, PageIntro, ProductCard, SectionHeader, TreatmentCard } from "./components/ui";
import { useAuth } from "./auth/useAuth";
import { TermsPage } from "./TermsPage";
import { AccountPage } from "./auth/AccountPage";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://trichofy-backend.onrender.com";
const API_ROOT = API_BASE_URL.replace(/\/$/, "");
const API_URL = `${API_ROOT}/predict`;
const WEATHER_URL = `${API_ROOT}/weather`;

const trustFeatures = [
  { number: "01", title: "Hair type analysis", text: "Computer vision reads visible pattern and texture from one clear photograph." },
  { number: "02", title: "Product intelligence", text: "Recommendations connect your profile to ingredients and formulas that make sense." },
  { number: "03", title: "Personal routines", text: "A practical weekly rhythm shaped around your hair, time, and level of care." },
  { number: "04", title: "Weather-aware care", text: "Live local conditions help you adapt moisture, protection, and styling decisions." },
];

const processSteps = [
  ["01", "Share your hair", "Upload a clear image in natural light. Your photo becomes the beginning of a more personal consultation."],
  ["02", "Meet the intelligence", "Trichofy studies visible pattern signals and compares them across five hair profiles."],
  ["03", "Discover your profile", "See your dominant hair type and a clear, considered confidence breakdown."],
  ["04", "Care with intention", "Turn your result into product matches, a weekly routine, and weather-aware guidance."],
];

const hairTypes = [
  { name: "Straight", code: "Type 1", note: "Smooth, reflective and naturally fluid", image: "/straight-hair-profile.png", position: "50% 50%" },
  { name: "Wavy", code: "Type 2", note: "Soft movement with an effortless S-pattern", image: "/wavy-hair-profile.png", position: "50% 50%" },
  { name: "Curly", code: "Type 3", note: "Defined spirals with expressive volume", image: "/curly-hair-profile.png", position: "50% 50%" },
  { name: "Kinky", code: "Type 4", note: "Tight coils, beautiful density and versatility", image: "/trichofyBG.jpg", position: "28% 62%" },
  { name: "Dreadlocks", code: "Protective style", note: "A storied style shaped with patience and care", image: "/trichofyBG.jpg", position: "76% 52%" },
];

const roadmap = [
  { phase: "Now", title: "Scalp insights", text: "A careful view of visible dryness, flaking, irritation, and scalp comfort." },
  { phase: "Next", title: "Hair health tracking", text: "A private visual timeline for noticing meaningful changes in density and condition." },
  { phase: "Future", title: "Professional pathways", text: "Responsible guidance that helps connect concerns with qualified hair and health professionals." },
  { phase: "Future", title: "Analysis history", text: "A lasting record of profiles, routines, products, and progress, owned by you." },
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

function resolveImageSrc(value) {
  if (!value) return null;
  if (/^https?:\/\//i.test(value) || value.startsWith("/")) return value;
  return `/products/${value}`;
}

function weatherLabel(condition = "", icon = "") {
  const value = condition.toLowerCase();
  if (value.includes("thunder") || icon.startsWith("11")) return "Stormy";
  if (value.includes("rain") || value.includes("drizzle") || /^(09|10)/.test(icon)) return "Rainy";
  if (value.includes("snow") || icon.startsWith("13")) return "Cold & snowy";
  if (value.includes("cloud") || /^(03|04)/.test(icon)) return "Softly cloudy";
  if (value.includes("mist") || value.includes("fog") || value.includes("haze")) return "Misty";
  if (value.includes("clear") || icon.startsWith("01")) return "Clear skies";
  return "Current weather";
}

function buildSeasonAdvice(hairType, weather) {
  if (!hairType || !weather) return [];
  const tips = [];
  const ht = hairType.toLowerCase();
  const { humidity, temp, condition } = weather;
  if (ht.includes("kinky") || ht.includes("coily")) tips.push("Use a rich cream and sealing oil to protect your coils from moisture loss.");
  else if (ht.includes("curly")) tips.push("Pair a moisturising leave-in with a light defining cream or gel.");
  else if (ht.includes("wavy")) tips.push("Choose a light cream or foam so your waves keep their natural movement.");
  else if (ht.includes("straight")) tips.push("Keep oils lightweight and concentrate them gently through your ends.");
  if (humidity >= 70 || (condition || "").toLowerCase().includes("rain")) tips.push("Humidity is high today. Add frizz control and seal your ends with care.");
  if (humidity <= 40) tips.push("The air is dry. Layer water-based moisture, then finish with a light sealant.");
  if (temp >= 28) tips.push("Warm conditions call for comfortable styles and regular, gentle scalp cleansing.");
  if (temp <= 12) tips.push("Cool air can be drying. Deep condition and keep your ends protected.");
  return tips.length ? tips : ["Conditions are balanced today. Your regular routine should serve you beautifully."];
}

function buildGeneralWeatherAdvice(weather) {
  if (!weather) return [];
  const tips = [];
  if (weather.humidity >= 70) tips.push("High humidity can increase swelling and frizz. Use hold in light layers and avoid repeatedly touching hair while it dries.");
  else if (weather.humidity <= 35) tips.push("Dry air can speed up moisture loss. Apply leave-in to damp ends and protect hair from friction.");
  else tips.push("Humidity is moderate. Keep your usual routine and adjust only if your hair feels different.");
  if (weather.temp >= 28) tips.push("Warm conditions may mean more scalp sweat. Cleanse when the scalp feels coated or uncomfortable.");
  if (weather.temp <= 12) tips.push("Cool conditions can feel drying. Cover hair with a satin-lined layer where possible.");
  return tips;
}

function buildRoutinePlan(hairType, intensity = "balanced") {
  const ht = (hairType || "").toLowerCase();
  const textured = ht.includes("kinky") || ht.includes("coily") || ht.includes("curly");
  const moisture = textured ? "rich cream" : "lightweight lotion";
  const sealant = textured ? "butter or oil" : "light serum";
  return [
    { title: "The wash ritual", when: intensity === "light" ? "Every 7–10 days" : "Once a week", steps: ["Cleanse gently without stripping the scalp.", "Deep condition for 15–30 minutes.", `Layer leave-in, ${moisture}, then finish with ${sealant}.`] },
    { title: "The moisture moment", when: intensity === "intense" ? "2–3 times weekly" : "Mid-week", steps: ["Mist lightly with water or a water-based refresher.", `Smooth a small amount of ${moisture} through the ends.`, "Protect your hair overnight with satin."] },
    { title: "The weekly check-in", when: "Every week", steps: ["Notice buildup, flaking, dryness, or tension.", "Massage the scalp gently with your fingertips.", "Use how your hair feels to guide next week’s care."] },
  ];
}

function hairInsights(type) {
  const value = (type || "").toLowerCase();
  if (value.includes("kinky") || value.includes("coily")) return ["Your texture thrives with layered moisture and protected ends.", "Rich creams can support softness; use oils to seal rather than hydrate.", "Low-tension styles and gentle detangling help preserve length."];
  if (value.includes("curly")) return ["Your curls benefit from moisture balanced with lightweight definition.", "Apply stylers to wet hair to encourage curl grouping and reduce frizz.", "Refresh selectively between wash days to avoid unnecessary buildup."];
  if (value.includes("wavy")) return ["Your pattern benefits from hydration without excess weight.", "Light foams, lotions, and occasional clarifying help preserve movement.", "Scrunching and air-drying can encourage your natural wave pattern."];
  if (value.includes("straight")) return ["Your hair reflects light beautifully when moisture and buildup are balanced.", "Keep conditioning products through the mid-lengths and ends.", "Lightweight serums can add polish without compromising movement."];
  if (value.includes("dread")) return ["Consistent scalp care and complete drying are central to a healthy loc routine.", "Use lightweight hydration to avoid residue within the hair.", "Gentle maintenance helps protect the roots from unnecessary tension."];
  return ["Your result is the start of a more intentional relationship with your hair."];
}

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Trichofy",
  url: "https://www.trichofy.co.za/",
  description: "AI-powered hair and scalp analysis platform offering personalized haircare recommendations for individuals and salons in South Africa.",
  sameAs: [],
};

const pageMeta = {
  "/": {
    title: "Trichofy | AI Hair & Scalp Analysis for South Africa",
    description: "Get personalized hair care recommendations from AI-powered hair and scalp analysis. Built for South African hair types, climate, and salons.",
    schema: {
      ...organizationSchema,
      "@type": "WebSite",
      name: "Trichofy",
      publisher: organizationSchema,
    },
  },
  "/about": {
    title: "About Trichofy | AI Hair Intelligence",
    description: "Learn how Trichofy uses AI to help people understand their hair and scalp, and make smarter, more sustainable haircare decisions.",
    schema: organizationSchema,
  },
  "/analysis": {
    title: "Hair & Scalp Analysis | Trichofy",
    description: "Upload a photo and get an instant AI-powered analysis of your hair type, condition, and personalized care recommendations.",
    schema: {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "Trichofy Hair & Scalp Analysis",
      applicationCategory: "LifestyleApplication",
      description: "AI-powered tool that analyzes hair and scalp photos to identify hair type and condition, and recommend personalized haircare products and routines.",
      operatingSystem: "Web",
      offers: { "@type": "Offer", price: "0", priceCurrency: "ZAR" },
    },
  },
  "/health": {
    title: "Hair & Scalp Health | Trichofy",
    description: "Understand what your hair and scalp are telling you, with AI-guided insights on health, condition, and care.",
    schema: organizationSchema,
  },
  "/treatments": {
    title: "Hair Treatments & Routines | Trichofy",
    description: "Personalized treatment and routine recommendations based on your unique hair type, condition, and goals.",
    schema: organizationSchema,
  },
  "/products": {
    title: "Recommended Hair Products | Trichofy",
    description: "Discover eco-friendly, high-quality hair products matched to your specific hair type and needs by Trichofy AI.",
    schema: organizationSchema,
  },
  "/providers": {
    title: "Salons & Providers | Trichofy",
    description: "Trichofy equips salons and hair professionals with AI-driven insights and product guidance for every client's hair type.",
    schema: organizationSchema,
  },
  "/contact": {
    title: "Contact Trichofy",
    description: "Get in touch with the Trichofy team for questions, partnerships, or support.",
    schema: {
      "@context": "https://schema.org",
      "@type": "ContactPage",
      name: "Contact Trichofy",
      url: "https://www.trichofy.co.za/contact",
    },
  },
};

function usePageMeta(path) {
  useEffect(() => {
    const meta = pageMeta[path] || pageMeta["/"];
    document.title = meta.title;

    let descTag = document.querySelector('meta[name="description"]');
    if (!descTag) {
      descTag = document.createElement("meta");
      descTag.setAttribute("name", "description");
      document.head.appendChild(descTag);
    }
    descTag.setAttribute("content", meta.description);

    let schemaTag = document.getElementById("page-schema");
    if (!schemaTag) {
      schemaTag = document.createElement("script");
      schemaTag.type = "application/ld+json";
      schemaTag.id = "page-schema";
      document.head.appendChild(schemaTag);
    }
    schemaTag.textContent = JSON.stringify(meta.schema || organizationSchema);
  }, [path]);
}

function usePath() {
  const [path, setPath] = useState(window.location.pathname);
  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
  const navigate = (next) => {
    if (next !== window.location.pathname) window.history.pushState({}, "", next);
    setPath(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  return [path, navigate];
}

function Icon({ name, size = 20 }) {
  const paths = {
    arrow: <><path d="M5 12h14"/><path d="m14 7 5 5-5 5"/></>,
    upload: <><path d="M12 16V4"/><path d="m7 9 5-5 5 5"/><path d="M5 20h14"/></>,
    spark: <><path d="m12 3 1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3Z"/><path d="m19 15 .7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7L19 15Z"/></>,
    close: <><path d="m6 6 12 12"/><path d="M18 6 6 18"/></>,
    menu: <><path d="M4 8h16"/><path d="M4 16h16"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    location: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
  };
  return <svg className="icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

export default function App() {
  const [path, navigate] = usePath();
  usePageMeta(path);
  const [menuOpen, setMenuOpen] = useState(false);
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
  const [providerForm, setProviderForm] = useState({ name: "", brand: "", hairTypes: "", imageUrl: "", description: "" });
  const [providerProducts, setProviderProducts] = useState([]);
  const treatmentSlug = path.startsWith("/treatments/") ? path.slice("/treatments/".length).split("/")[0] : "";
  const activeTreatmentAssessment = getTreatmentAssessment(treatmentSlug);

  useEffect(() => {
    document.body.classList.toggle("menu-is-open", menuOpen);
    return () => document.body.classList.remove("menu-is-open");
  }, [menuOpen]);

  const activeCategory = providerCategories.find((item) => item.id === selectedCategory);
  const recommendedProducts = result?.products?.length ? result.products : [];
  const productCategories = useMemo(() => ["All", ...new Set(productCatalog.map((item) => item.category))], []);
  const visibleProducts = productFilter === "All" ? productCatalog : productCatalog.filter((item) => item.category === productFilter);
  const go = (next) => { setMenuOpen(false); navigate(next); };

  const selectFile = (nextFile) => {
    setFile(nextFile || null);
    setResult(null);
    setError("");
    setPreview(nextFile ? URL.createObjectURL(nextFile) : null);
  };
  const handleFileChange = (event) => selectFile(event.target.files?.[0]);

  const handleAnalyze = async () => {
    if (!file) { setError("Choose a clear hair photograph to begin your consultation."); return; }
    setLoading(true); setError(""); setResult(null);
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
          const image = resolveImageSrc(productImageMap[product.name]) || resolveImageSrc(product.image_url);
          return { ...product, category: product.category || "Selected for you", image_url: image };
        }),
      });
    } catch (requestError) {
      console.error(requestError);
      setError("We couldn’t complete your consultation just now. Please try again shortly.");
    } finally { setLoading(false); }
  };

  const handleFetchWeather = async () => {
    setSeasonLoading(true); setSeasonError(""); setSeasonWeather(null);
    try {
      const url = `${WEATHER_URL}?city=${encodeURIComponent(seasonCity)}&country=${encodeURIComponent(seasonCountry)}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Weather backend error");
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setSeasonWeather(data);
    } catch (requestError) {
      console.error(requestError);
      setSeasonError("We couldn’t read the weather right now. Please try again in a moment.");
    } finally { setSeasonLoading(false); }
  };

  const handleAddProviderProduct = (event) => {
    event.preventDefault();
    if (!providerForm.name.trim() || !providerForm.brand.trim()) { setError("Please add both a product name and brand."); return; }
    const entry = {
      name: providerForm.name.trim(), brand: providerForm.brand.trim(), category: activeCategory.label,
      hair_types: providerForm.hairTypes ? providerForm.hairTypes.split(",").map((type) => type.trim()).filter(Boolean) : ["All hair"],
      image_url: resolveImageSrc(providerForm.imageUrl.trim()) || resolveImageSrc(productImageMap[providerForm.name]),
      description: providerForm.description.trim() || "Submitted for consideration by the Trichofy curation team.", extras: { ...extraFields },
    };
    setProviderProducts((current) => [entry, ...current]);
    setProviderForm({ name: "", brand: "", hairTypes: "", imageUrl: "", description: "" }); setExtraFields({}); setError("");
  };

  const pageProps = {
    go, file, preview, loading, error, result, selectFile, handleFileChange, handleAnalyze,
    productFilter, setProductFilter, productCategories, visibleProducts, recommendedProducts,
    routineIntensity, setRoutineIntensity, seasonCity, setSeasonCity, seasonCountry, setSeasonCountry,
    seasonWeather, seasonLoading, seasonError, handleFetchWeather, activeCategory, selectedCategory,
    setSelectedCategory, providerForm, setProviderForm, extraFields, setExtraFields, providerProducts, handleAddProviderProduct,
  };

  return <div className="site-shell">
    <Header path={path} go={go} menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
    <main>
      {path === "/" && <HomePage go={go} />}
      {path === "/about" && <AboutPage go={go} />}
      {path === "/analysis" && <AnalysisPage {...pageProps} />}
      {path === "/health" && <HealthPage go={go} />}
      {path === "/treatments" && <TreatmentsPage {...pageProps} />}
      {activeTreatmentAssessment && <TreatmentAssessmentPage assessment={activeTreatmentAssessment} go={go} />}
      {path === "/products" && <ProductsPage {...pageProps} />}
      {path === "/providers" && <ProvidersPage {...pageProps} />}
      {path === "/contact" && <ContactPage />}
      {path === "/terms" && <TermsPage />}
      {path === "/account" && <AccountPage go={go} />}
      {!navItems.some((item) => item.path === path) && !activeTreatmentAssessment && path !== "/account" && <HomePage go={go} />}
    </main>
    <Footer go={go} />
  </div>;
}

function Header({ path, go, menuOpen, setMenuOpen }) {
  const { user, authLoading } = useAuth();
  return <>
    <header className="site-header">
      <button className="brand" onClick={() => go("/")} aria-label="Trichofy home"><span>Trichofy</span></button>
      <nav className="desktop-nav" aria-label="Primary navigation">
        {navItems.filter((item) => !["/providers", "/contact"].includes(item.path)).map((item) => <button key={item.path} className={path === item.path || (item.path === "/treatments" && path.startsWith("/treatments/")) ? "active" : ""} onClick={() => go(item.path)}>{item.label}</button>)}
      </nav>
      <div className="header-actions">
        {!authLoading && (
          <button className="account-pill" onClick={() => go("/account")}>
            {user ? user.name.split(" ")[0] : "Sign in"}
          </button>
        )}
        <Button className="header-cta" onClick={() => go("/analysis")}>Begin analysis <Icon name="arrow" size={17} /></Button>
      </div>
      <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-label={menuOpen ? "Close menu" : "Open menu"}><Icon name={menuOpen ? "close" : "menu"} size={25} /></button>
    </header>
    <div className={`mobile-menu ${menuOpen ? "open" : ""}`} aria-hidden={!menuOpen}>
      <div className="mobile-menu-inner">
        <p className="kicker">Explore Trichofy</p>
        <nav>
          {navItems.map((item, index) => <button key={item.path} onClick={() => go(item.path)} className={path === item.path || (item.path === "/treatments" && path.startsWith("/treatments/")) ? "active" : ""}><span>0{index + 1}</span>{item.label}<Icon name="arrow" /></button>)}
          <button onClick={() => go("/account")} className={path === "/account" ? "active" : ""}><span>0{navItems.length + 1}</span>{user ? user.name.split(" ")[0] : "Sign in"}<Icon name="arrow" /></button>
        </nav>
        <div className="mobile-menu-foot"><p>Hair care, made personal.</p><a href="mailto:witness.lubisi1@gmail.com">witness.lubisi1@gmail.com</a></div>
      </div>
    </div>
  </>;
}

function HomePage({ go }) {
  return <div className="home-page">
    <section className="home-hero">
      <div className="hero-content reveal"><p className="kicker light">The future of personal hair care</p><h1>Intelligence for the hair you live in.</h1><p className="hero-copy">A thoughtful AI consultation that helps you understand your texture, choose with confidence, and care for your hair more intentionally.</p><div className="button-row"><Button onClick={() => go("/analysis")}>Analyze my hair <Icon name="arrow" /></Button><Button variant="glass" onClick={() => go("/treatments")}>Explore treatments</Button></div></div>
      <div className="hero-signature"><span>01</span><p>One image.<br/>A more personal ritual.</p></div>
      <div className="scroll-cue"><span /> Discover</div>
    </section>

    <section className="trust-section section-pad">
      <SectionHeader eyebrow="Beauty meets intelligence" title="Care that begins with understanding." text="Trichofy turns visual hair signals into calm, useful direction, so your routine feels less like trial and error and more like knowing." />
      <div className="trust-list">{trustFeatures.map((feature) => <article className="trust-item" key={feature.title}><span>{feature.number}</span><div><h3>{feature.title}</h3><p>{feature.text}</p></div><Icon name="arrow" /></article>)}</div>
    </section>

    <section className="process-section section-pad">
      <div className="process-intro"><p className="kicker light">Your consultation</p><h2>From one photograph to a ritual that feels like yours.</h2><Button variant="light" onClick={() => go("/analysis")}>Start your profile <Icon name="arrow" /></Button></div>
      <div className="process-steps">{processSteps.map(([number, title, text]) => <article key={number}><span>{number}</span><div><h3>{title}</h3><p>{text}</p></div></article>)}</div>
    </section>

    <section className="hair-showcase section-pad">
      <SectionHeader eyebrow="Every pattern has a language" title="Five profiles. Infinite expressions." text="Hair is personal, textured, storied. Our intelligence begins by recognizing the visible pattern, and never ends by reducing you to it." align="center" />
      <div className="hair-type-track">{hairTypes.map((type) => <article className="hair-type-card" key={type.name} style={{ "--hair-image": `url(${type.image})`, "--hair-position": type.position }}><div className="hair-type-overlay"/><div><span>{type.code}</span><h3>{type.name}</h3><p>{type.note}</p></div></article>)}</div>
    </section>

    <section className="vision-section section-pad">
      <div className="vision-image"><img src="/trichofyBG.jpg" alt="A protective hairstyle being carefully created"/><span>Hair intelligence<br/>with a human heart.</span></div>
      <div className="vision-copy"><p className="kicker">Beyond the mirror</p><h2>The future of hair care is deeply personal.</h2><p className="lead">We imagine a world where understanding your hair is as natural as caring for it.</p><p>Trichofy is growing into a living hair intelligence platform, connecting pattern, environment, products, routines, and eventually scalp wellness into one considered experience.</p><div className="vision-points"><span>Hair understanding</span><span>Weather intelligence</span><span>Product intelligence</span><span>Future scalp health</span></div><Button variant="outline" onClick={() => go("/about")}>Our point of view <Icon name="arrow" /></Button></div>
    </section>

    <section className="home-closing"><p className="kicker light">Begin with understanding</p><h2>Your hair has always been telling you what it needs.</h2><p>Now there is a more thoughtful way to listen.</p><Button variant="light" onClick={() => go("/analysis")}>Discover my hair profile <Icon name="arrow" /></Button></section>
  </div>;
}

function AboutPage({ go }) {
  return <div className="page about-page">
    <section className="editorial-hero"><div><p className="kicker">Our philosophy</p><h1>Hair care should feel personal, never prescriptive.</h1><p>We are building a more intelligent, beautiful relationship between women and the hair they live in.</p></div><figure><img src="/contact.jpg" alt="A woman celebrating her natural hair"/><figcaption>Beauty, understood.</figcaption></figure></section>
    <section className="manifesto section-pad"><span className="drop-number">01</span><div><p className="kicker">Why Trichofy</p><h2>Less guessing.<br/>More knowing.</h2></div><div className="prose"><p>Too much of hair care is built around broad labels, crowded shelves, and expensive trial and error. Trichofy begins somewhere quieter: with your own hair.</p><p>Computer vision helps us read visible pattern and texture. Thoughtful product and weather intelligence then turns that understanding into decisions you can actually use.</p><Button onClick={() => go("/analysis")}>Meet your hair profile <Icon name="arrow" /></Button></div></section>
    <section className="values-band"><p>Our work lives where</p><div><span>Beauty</span><i>meets</i><span>Intelligence</span><i>meets</i><span>Care</span></div></section>
  </div>;
}

function AnalysisPage({ file, preview, loading, error, result, selectFile, handleFileChange, handleAnalyze, go }) {
  const [dragging, setDragging] = useState(false);
  const drop = (event) => { event.preventDefault(); setDragging(false); const next = event.dataTransfer.files?.[0]; if (next?.type.startsWith("image/")) selectFile(next); };
  const probabilities = result ? Object.entries(result.probabilities || {}).sort((a, b) => b[1] - a[1]) : [];
  const confidence = probabilities[0]?.[1] || 0;
  return <div className="page analysis-page">
    <section className="analysis-intro"><PageIntro eyebrow="The Trichofy consultation" title="Let’s get to know your hair." text="One clear photograph becomes a considered profile with your visible pattern, confidence reading, care insights, and product direction." align="center"/><div className="consultation-progress"><span className={file ? "complete" : "active"}>01 <b>Photograph</b></span><i/><span className={loading ? "active" : result ? "complete" : ""}>02 <b>Analysis</b></span><i/><span className={result ? "active" : ""}>03 <b>Your profile</b></span></div></section>
    <section className={`consultation-shell section-pad ${result ? "has-result" : ""}`}>
      <div className="upload-consultation">
        <div className="consultation-heading"><span>01</span><div><p className="kicker">Your photograph</p><h2>Show us your hair as it naturally is.</h2><p>For the most useful reading, use soft natural light and keep your hair clearly visible in the frame.</p></div></div>
        <label className={`premium-upload ${dragging ? "dragging" : ""} ${preview ? "with-preview" : ""}`} onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={drop}>
          <input type="file" accept="image/*" onChange={handleFileChange}/>
          {preview ? <><img src={preview} alt="Your selected hair"/><div className="preview-actions"><span>Change photograph</span><small>{fileLabel(preview)}</small></div></> : <div className="upload-empty"><span className="upload-icon"><Icon name="upload" size={28}/></span><h3>Drop your photograph here</h3><p>or choose one from your device</p><small>JPG, PNG or a phone camera image</small></div>}
        </label>
        <div className="photo-guidance"><span><Icon name="check"/> Natural light</span><span><Icon name="check"/> Hair in focus</span><span><Icon name="check"/> Minimal obstruction</span></div>
        <Button className="analyze-button" onClick={handleAnalyze} disabled={loading}>{loading ? <><span className="button-loader"/> Reading your hair…</> : <>Reveal my hair profile <Icon name="spark"/></>}</Button>
        {error && <p className="form-error">{error}</p>}
      </div>

      <div className={`profile-panel ${result ? "visible" : ""}`}>
        {!result && <div className="profile-placeholder"><span className="profile-orbit"><Icon name="spark" size={30}/></span><p className="kicker">Your profile awaits</p><h2>A consultation, not a collection of numbers.</h2><p>Your hair type, confidence, care insights, and selected products will appear here.</p></div>}
        {result && <>
          <div className="profile-top"><p className="kicker">Your hair profile</p><span>Analysis complete</span></div>
          <div className="profile-identity"><div><span>Primary pattern</span><h2>{result.hair_type}</h2><p>{Math.round(confidence * 100)}% confidence</p></div><div className="confidence-ring" style={{ "--confidence": `${confidence * 360}deg` }}><strong>{Math.round(confidence * 100)}</strong><span>%</span></div></div>
          <div className="confidence-breakdown"><p>Pattern confidence</p>{probabilities.map(([label, probability]) => <div key={label}><span>{label}</span><i><b style={{ width: `${probability * 100}%` }}/></i><strong>{(probability * 100).toFixed(0)}%</strong></div>)}</div>
          <div className="profile-insights"><p className="kicker">What this means for your care</p>{hairInsights(result.hair_type).map((insight) => <p key={insight}><Icon name="spark" size={16}/>{insight}</p>)}</div>
          <div className="profile-actions"><Button onClick={() => go("/products")}>See my product edit <Icon name="arrow"/></Button><Button variant="outline" onClick={() => go("/treatments")}>Build my ritual</Button></div>
        </>}
      </div>
    </section>
    {result?.products?.length > 0 && <section className="profile-products section-pad"><SectionHeader eyebrow="Selected for your profile" title="A considered edit for your hair." text="These products were matched to the dominant pattern in your analysis."/><div className="product-grid featured">{result.products.slice(0, 3).map((product, index) => <ProductCard product={product} key={`${product.name}-${index}`}/>)}</div></section>}
  </div>;
}

function fileLabel() { return "Ready for analysis"; }

function HealthPage({ go }) {
  return <div className="page health-page">
    <section className="health-hero"><div><p className="kicker light">The next chapter</p><h1>Hair wellness, seen more clearly.</h1><p>We are carefully building the next expression of Trichofy: responsible tools for understanding visible scalp and hair-health changes over time.</p><Button variant="light" onClick={() => go("/contact")}>Follow the journey <Icon name="arrow"/></Button></div><span className="health-hero-word">Health</span></section>
    <section className="roadmap-section section-pad"><SectionHeader eyebrow="The innovation roadmap" title="Built slowly. Built responsibly." text="Hair and scalp wellness deserve more than a rushed feature. These capabilities are being shaped around privacy, careful language, and the role of qualified professionals."/><div className="roadmap-list">{roadmap.map((item, index) => <article key={item.title}><span>0{index + 1}</span><div><p>{item.phase}</p><h3>{item.title}</h3></div><p>{item.text}</p></article>)}</div></section>
    <section className="health-principles section-pad"><div><p className="kicker">Our promise</p><h2>Awareness without alarm. Guidance without overclaiming.</h2></div><div><p>Trichofy Health will never position a visual signal as a medical diagnosis. It is being designed to support awareness, careful tracking, and better-informed conversations with professionals.</p><ul><li>Privacy-led image handling</li><li>Responsible wellness language</li><li>Clear professional referral pathways</li></ul></div></section>
  </div>;
}

function TreatmentsPage({ result, routineIntensity, setRoutineIntensity, seasonCity, setSeasonCity, seasonCountry, setSeasonCountry, seasonWeather, seasonLoading, seasonError, handleFetchWeather, go }) {
  return <div className="page treatments-page">
    <section className="treatment-hero"><PageIntro eyebrow="Your care consultation" title="Rituals that move with your hair and your life." text="Explore focused treatment intelligence, then turn your profile into a weekly rhythm that responds to the world around you."/><div className="treatment-hero-art"><span>Care is not a correction.</span><strong>It is a ritual.</strong></div></section>
    <section className="treatment-library section-pad"><SectionHeader eyebrow="Treatment library" title="Begin with what your hair is asking for." text="Each guided assessment uses your own observations to offer a practical starting point."/><div className="treatment-grid">{treatmentTools.map((treatment) => <TreatmentCard treatment={treatment} onExplore={() => go(`/treatments/${treatment.id === "curl" ? "curl-pattern" : treatment.id}`)} key={treatment.id}/>)}</div></section>
    <section className="ritual-builder" id="care-planner">
      <div className="planner-intro">
        <p className="kicker light">Care that responds</p>
        <h2>A routine shaped around your life.</h2>
        <p>Build a weekly rhythm around your hair profile, available time and local conditions.</p>
      </div>
      <div className="planner-grid">
        <div className="ritual-panel">
          <div className="panel-heading"><div><p className="kicker">Your weekly ritual</p><h2>A rhythm you can return to.</h2></div><span className="panel-number">01</span></div>
          <p>Choose the level of care that fits your week. We’ll shape the details around your latest hair profile.</p>
          <div className="segmented-control" aria-label="Routine intensity">{["light", "balanced", "intense"].map((level) => <button type="button" className={routineIntensity === level ? "active" : ""} aria-pressed={routineIntensity === level} onClick={() => setRoutineIntensity(level)} key={level}>{level}</button>)}</div>
          {!result ? <EmptyConsultation go={go}/> : <div className="routine-timeline">{buildRoutinePlan(result.hair_type, routineIntensity).map((block, index) => <article key={block.title}><span>0{index + 1}</span><div><p>{block.when}</p><h3>{block.title}</h3><ul>{block.steps.map((step) => <li key={step}>{step}</li>)}</ul></div></article>)}</div>}
        </div>
        <div className="weather-panel">
          <div className="panel-heading"><div><p className="kicker">Your local conditions</p><h2>Care for the weather you’re in.</h2></div><span className="panel-number">02</span></div>
          <p>Temperature and humidity can change what your hair needs. Enter your location for a thoughtful adjustment.</p>
          <form className="weather-form" onSubmit={(event) => { event.preventDefault(); handleFetchWeather(); }}>
            <div className="location-fields">
              <label><span>City</span><input value={seasonCity} onChange={(event) => setSeasonCity(event.target.value)} placeholder="Johannesburg" autoComplete="address-level2"/></label>
              <label><span>Country code</span><input value={seasonCountry} onChange={(event) => setSeasonCountry(event.target.value.toUpperCase())} placeholder="ZA" maxLength="2" autoComplete="country"/></label>
            </div>
            <Button type="submit" disabled={seasonLoading || !seasonCity.trim() || !seasonCountry.trim()}>{seasonLoading ? "Reading the weather…" : <><Icon name="location"/> Read my conditions</>}</Button>
          </form>
          {seasonError && <p className="form-error" role="alert">{seasonError}</p>}
          {seasonWeather && <div className="weather-result"><div><span>{weatherLabel(seasonWeather.condition, seasonWeather.icon)}</span><strong>{seasonWeather.temp.toFixed(0)}°</strong><p>{seasonWeather.city} · {seasonWeather.humidity}% humidity</p></div><ul>{(result ? buildSeasonAdvice(result.hair_type, seasonWeather) : buildGeneralWeatherAdvice(seasonWeather)).map((tip) => <li key={tip}>{tip}</li>)}</ul>{!result && <small>General weather guidance. Complete your hair analysis for advice shaped around your profile.</small>}</div>}
        </div>
      </div>
    </section>
  </div>;
}

function TreatmentAssessmentPage({ assessment, go }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const question = assessment.questions[step];
  const selectedOption = question ? answers[question.id] : undefined;

  useEffect(() => {
    setStep(0);
    setAnswers({});
    setResult(null);
  }, [assessment.id]);

  const chooseOption = (optionIndex) => {
    setAnswers((current) => ({ ...current, [question.id]: optionIndex }));
  };

  const continueAssessment = () => {
    if (selectedOption === undefined) return;
    if (step < assessment.questions.length - 1) {
      setStep((current) => current + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setResult(evaluateTreatment(assessment, answers));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goBack = () => {
    if (step > 0) setStep((current) => current - 1);
    else go("/treatments");
  };

  const retake = () => {
    setAnswers({});
    setResult(null);
    setStep(0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const suggestedProducts = result
    ? productCatalog.filter((product) => result.categories?.includes(product.category)).slice(0, 3)
    : [];

  return <div className="page treatment-experience-page">
    <section className="assessment-header">
      <button className="assessment-back" type="button" onClick={() => go("/treatments")}><span>←</span> All treatments</button>
      <p className="kicker">{assessment.eyebrow}</p>
      <h1>{assessment.title}</h1>
      <p>{assessment.intro}</p>
    </section>

    {!result ? <section className="assessment-shell" aria-live="polite">
      <aside className="assessment-context">
        <p className="kicker">How this works</p>
        <h2>Your observations lead the guidance.</h2>
        <p>{assessment.notice}</p>
        <div className="assessment-steps">
          {assessment.questions.map((item, index) => <span className={index < step ? "complete" : index === step ? "active" : ""} key={item.id}>
            <b>{index < step ? "✓" : `0${index + 1}`}</b>{item.prompt}
          </span>)}
        </div>
      </aside>

      <div className="assessment-question">
        <div className="assessment-progress" aria-label={`Question ${step + 1} of ${assessment.questions.length}`}>
          <span style={{ width: `${((step + 1) / assessment.questions.length) * 100}%` }}/>
        </div>
        <p className="question-count">Question {step + 1} of {assessment.questions.length}</p>
        <h2>{question.prompt}</h2>
        {question.help && <p className="question-help">{question.help}</p>}
        <div className="assessment-options" role="radiogroup" aria-label={question.prompt}>
          {question.options.map((option, index) => <button
            type="button"
            role="radio"
            aria-checked={selectedOption === index}
            className={selectedOption === index ? "selected" : ""}
            onClick={() => chooseOption(index)}
            key={option.label}
          ><span>{String.fromCharCode(65 + index)}</span>{option.label}<i>✓</i></button>)}
        </div>
        <div className="assessment-actions">
          <Button variant="outline" onClick={goBack}>{step === 0 ? "Exit" : "Back"}</Button>
          <Button onClick={continueAssessment} disabled={selectedOption === undefined}>
            {step === assessment.questions.length - 1 ? "See my guidance" : "Continue"} <Icon name="arrow"/>
          </Button>
        </div>
      </div>
    </section> : <TreatmentResult assessment={assessment} result={result} products={suggestedProducts} retake={retake} go={go}/>}
  </div>;
}

function TreatmentResult({ assessment, result, products, retake, go }) {
  const needsProfessionalCare = result.flags?.some((flag) => ["scalp-red-flag", "scalp-persistent", "density-change"].includes(flag));
  return <div className="assessment-result">
    <section className="result-summary">
      <p className="kicker">Your guided result</p>
      <h2>{result.title}</h2>
      <p>{result.summary}</p>
      <div className="result-basis"><Icon name="spark"/><span><strong>Based on your responses</strong>This is rule-based guidance from the observations you selected, not a camera or AI diagnosis.</span></div>
    </section>

    {needsProfessionalCare && <div className="care-alert" role="note">
      <strong>A professional check would be sensible.</strong>
      <p>Your responses include a recent or persistent change. Cosmetic guidance cannot establish the cause. Consider speaking with a pharmacist, GP or dermatologist.</p>
    </div>}

    <section className="result-grid">
      <div className="next-steps">
        <p className="kicker">A practical starting point</p>
        <h2>What to do next</h2>
        <ol>{result.actions.map((action, index) => <li key={action}><span>0{index + 1}</span><p>{action}</p></li>)}</ol>
      </div>
      <div className="resource-panel">
        <p className="kicker">Useful context</p>
        <h2>Keep in mind</h2>
        {assessment.resources.map((resource) => <article key={resource.title}><Icon name="spark"/><div><h3>{resource.title}</h3><p>{resource.text}</p></div></article>)}
      </div>
    </section>

    {products.length > 0 && <section className="assessment-products">
      <SectionHeader eyebrow="Relevant categories" title="Products to consider carefully." text="These catalogue suggestions follow the result category. They are not prescriptions or guaranteed matches."/>
      <div className="product-grid">{products.map((product) => <ProductCard product={{ ...product, match_score: null }} key={product.name}/>)}</div>
    </section>}

    <section className="result-controls">
      <Button variant="outline" onClick={retake}>Retake assessment</Button>
      <Button onClick={() => go("/products")}>Explore all products <Icon name="arrow"/></Button>
    </section>
  </div>;
}

function EmptyConsultation({ go }) {
  return <div className="empty-consultation">
    <div className="empty-consultation-copy"><Icon name="spark"/><div><strong>Make this ritual personal.</strong><p>Use your latest hair analysis, or build a routine directly from a few guided questions.</p></div></div>
    <div className="empty-consultation-actions"><Button onClick={() => go("/analysis")}>Analyze my hair</Button><Button variant="outline" onClick={() => go("/treatments/routine")}>Build from my answers</Button></div>
  </div>;
}

function ProductsPage({ productFilter, setProductFilter, productCategories, visibleProducts, recommendedProducts, go }) {
  return <div className="page products-page">
    <section className="shop-hero"><div><p className="kicker">The Trichofy edit</p><h1>Less product noise.<br/>More beautiful choices.</h1><p>A considered collection of oils, hydrators, repair treatments, and scalp care, curated around what different hair profiles truly need.</p></div><div className="shop-hero-products"><img src="/products/marula-oil.jpg.png" alt="Marula hair oil"/><img src="/products/shea-butter.jpg.png" alt="Shea butter hair care"/></div></section>
    {recommendedProducts.length > 0 && <section className="recommendation-edit section-pad"><SectionHeader eyebrow="Your personal edit" title="Chosen with your profile in mind." text="Recommendations from your latest Trichofy consultation."/><div className="product-grid featured">{recommendedProducts.map((product, index) => <ProductCard product={product} key={`${product.name}-${index}`}/>)}</div></section>}
    <section className="shop-section section-pad"><div className="shop-heading"><SectionHeader eyebrow="Explore the collection" title="Care, beautifully considered."/><div className="filter-pills">{productCategories.map((category) => <button key={category} className={productFilter === category ? "active" : ""} onClick={() => setProductFilter(category)}>{category}</button>)}</div></div>{recommendedProducts.length === 0 && <div className="personal-edit-prompt"><div><Icon name="spark"/><p><strong>Unlock your personal edit.</strong><br/>Analyze your hair to see products selected for your profile.</p></div><Button variant="outline" onClick={() => go("/analysis")}>Analyze my hair</Button></div>}<div className="product-grid">{visibleProducts.map((product) => <ProductCard product={product} key={product.name}/>)}</div></section>
  </div>;
}

function ProvidersPage({ activeCategory, selectedCategory, setSelectedCategory, providerForm, setProviderForm, extraFields, setExtraFields, providerProducts, handleAddProviderProduct, error, go }) {
  const update = (key, value) => setProviderForm((current) => ({ ...current, [key]: value }));
  const { user, authLoading } = useAuth();

  if (!authLoading && (!user || user.role !== "provider")) {
    return <div className="page providers-page">
      <section className="partner-hero"><PageIntro eyebrow="For beauty partners" title="Bring thoughtful products into a more intelligent care experience." text="Share the formula, texture, purpose, and hair profiles behind your product. Trichofy uses meaningful detail to make better matches."/></section>
      <section className="section-pad">
        <div className="provider-gate">
          <p>{user ? "This area is only for provider accounts. Your account is registered as a user." : "Sign in with a provider account to submit products."}</p>
          <Button onClick={() => go("/account")}>{user ? "Manage account" : "Sign in as a provider"}</Button>
        </div>
      </section>
    </div>;
  }

  return <div className="page providers-page"><section className="partner-hero"><PageIntro eyebrow="For beauty partners" title="Bring thoughtful products into a more intelligent care experience." text="Share the formula, texture, purpose, and hair profiles behind your product. Trichofy uses meaningful detail to make better matches."/></section><section className="partner-form-section section-pad"><aside><p className="kicker">Choose a category</p>{providerCategories.map((category, index) => <button key={category.id} className={selectedCategory === category.id ? "active" : ""} onClick={() => setSelectedCategory(category.id)}><span>0{index + 1}</span><div><strong>{category.label}</strong><small>{category.description}</small></div></button>)}</aside><form onSubmit={handleAddProviderProduct}><div className="form-intro"><p className="kicker">Product profile</p><h2>{activeCategory.label}</h2><p>{activeCategory.description}</p></div><div className="form-grid"><Field label="Product name"><input value={providerForm.name} onChange={(e) => update("name", e.target.value)} placeholder="e.g. Nourishing Castor Oil"/></Field><Field label="Brand"><input value={providerForm.brand} onChange={(e) => update("brand", e.target.value)} placeholder="Your brand name"/></Field><Field label="Best for"><input value={providerForm.hairTypes} onChange={(e) => update("hairTypes", e.target.value)} placeholder="Curly, coily, straight"/></Field><Field label="Image filename or URL"><input value={providerForm.imageUrl} onChange={(e) => update("imageUrl", e.target.value)} placeholder="product-image.jpg"/></Field>{activeCategory.questions.map((question) => <Field label={question.label} key={question.key}><input value={extraFields[question.key] || ""} onChange={(e) => setExtraFields((current) => ({ ...current, [question.key]: e.target.value }))} placeholder={question.placeholder}/></Field>)}<Field label="The product story" wide><textarea rows="5" value={providerForm.description} onChange={(e) => update("description", e.target.value)} placeholder="Tell us about the ingredients, benefits, and ideal ritual."/></Field></div><Button type="submit">Submit for consideration <Icon name="arrow"/></Button>{error && <p className="form-error">{error}</p>}</form></section>{providerProducts.length > 0 && <section className="section-pad"><SectionHeader eyebrow="Submission preview" title="Recently added."/><div className="product-grid">{providerProducts.map((product, index) => <ProductCard product={product} key={`${product.name}-${index}`}/>)}</div></section>}</div>;
}

function Field({ label, wide, children }) { return <label className={wide ? "wide" : ""}><span>{label}</span>{children}</label>; }

function ContactPage() {
  return <div className="page contact-page"><section className="contact-hero"><div><p className="kicker light">A conversation begins here</p><h1>How can we care for your next idea?</h1><p>For platform support, brand partnerships, salon collaborations, or a thoughtful conversation about the future of hair intelligence.</p></div></section><section className="contact-section section-pad"><div className="contact-copy"><p className="kicker">Contact Trichofy</p><h2>We would love to hear from you.</h2><p>Leave a note and tell us what brought you here. Every message is read with care.</p><div className="contact-person"><span>WL</span><div><strong>Witness Lubisi</strong><p>Founder · South Africa</p></div></div><div className="direct-contact"><a href="mailto:witness.lubisi1@gmail.com">witness.lubisi1@gmail.com</a><a href="tel:+27720524638">+27 72 052 4638</a></div></div><form className="contact-form" onSubmit={(event) => event.preventDefault()}><Field label="Your name"><input placeholder="How should we address you?"/></Field><Field label="Email address"><input type="email" placeholder="you@example.com"/></Field><Field label="I’m reaching out about"><select defaultValue=""><option value="" disabled>Choose a subject</option><option>Platform support</option><option>Brand partnership</option><option>Salon collaboration</option><option>Something else</option></select></Field><Field label="Your message"><textarea rows="6" placeholder="Tell us a little more…"/></Field><Button type="submit">Send your note <Icon name="arrow"/></Button></form></section></div>;
}

function Footer({ go }) {
  return <footer className="site-footer"><div className="footer-top"><div><button className="brand footer-brand" onClick={() => go("/")}><span className="brand-mark">T</span><span>Trichofy</span></button><p>Intelligence for the hair you live in.</p></div><div className="footer-links"><div><p>Discover</p><button onClick={() => go("/analysis")}>Hair analysis</button><button onClick={() => go("/treatments")}>Treatments</button><button onClick={() => go("/products")}>Products</button></div><div><p>Company</p><button onClick={() => go("/about")}>Our story</button><button onClick={() => go("/health")}>Health vision</button><button onClick={() => go("/contact")}>Contact</button><button onClick={() => go("/terms")}>Terms & Conditions</button></div><div><p>Partners</p><button onClick={() => go("/providers")}>Submit a product</button><a href="mailto:witness.lubisi1@gmail.com">Collaborate</a></div></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} Trichofy</span><span>Made with care in South Africa</span><span>Hair wellness guidance, not medical diagnosis.</span></div></footer>;
}
