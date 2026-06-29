import React, { useEffect, useMemo, useState } from "react";
import "./index.css";
import { navItems, productCatalog, providerCategories, treatmentTools } from "./data/content";
import { Button, PageIntro, ProductCard, SectionHeader, TreatmentCard } from "./components/ui";

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
  { name: "Straight", code: "Type 1", note: "Smooth, reflective and naturally fluid", image: "/contact.jpg", position: "50% 30%" },
  { name: "Wavy", code: "Type 2", note: "Soft movement with an effortless S-pattern", image: "/trichofyBG.jpg", position: "10% 55%" },
  { name: "Curly", code: "Type 3", note: "Defined spirals with expressive volume", image: "/contact.jpg", position: "50% 58%" },
  { name: "Kinky", code: "Type 4", note: "Tight coils, beautiful density and versatility", image: "/trichofyBG.jpg", position: "28% 62%" },
  { name: "Dreadlocks", code: "Protective style", note: "A storied style shaped with patience and care", image: "/trichofyBG.jpg", position: "76% 52%" },
];

const roadmap = [
  { phase: "Now", title: "Scalp insights", text: "A careful view of visible dryness, flaking, irritation, and scalp comfort." },
  { phase: "Next", title: "Hair health tracking", text: "A private visual timeline for noticing meaningful changes in density and condition." },
  { phase: "Future", title: "Professional pathways", text: "Responsible guidance that helps connect concerns with qualified hair and health professionals." },
  { phase: "Future", title: "Analysis history", text: "A lasting record of profiles, routines, products, and progress—owned by you." },
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
  if (humidity >= 70 || (condition || "").toLowerCase().includes("rain")) tips.push("Humidity is high today—add frizz control and seal your ends with care.");
  if (humidity <= 40) tips.push("The air is dry. Layer water-based moisture, then finish with a light sealant.");
  if (temp >= 28) tips.push("Warm conditions call for comfortable styles and regular, gentle scalp cleansing.");
  if (temp <= 12) tips.push("Cool air can be drying. Deep condition and keep your ends protected.");
  return tips.length ? tips : ["Conditions are balanced today. Your regular routine should serve you beautifully."];
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

function BrandMark() {
  return <svg viewBox="0 0 40 48" fill="none" aria-hidden="true">
    <path d="M11 6 C14.5 9 14.5 15 11 18 C7.5 21 7.5 27 11 30 C14.5 33 14.5 39 11 42" stroke="#EFD7A4" strokeWidth="3.2" strokeLinecap="round"/>
    <path d="M20 6 C16.5 9 16.5 15 20 18 C23.5 21 23.5 27 20 30 C16.5 33 16.5 39 20 42" stroke="#CFA45C" strokeWidth="3.2" strokeLinecap="round"/>
    <path d="M29 6 C32.5 9 32.5 15 29 18 C25.5 21 25.5 27 29 30 C32.5 33 32.5 39 29 42" stroke="#AA7830" strokeWidth="3.2" strokeLinecap="round"/>
  </svg>;
}

function WaveLines({ className = "" }) {
  return <svg className={`wave-lines ${className}`.trim()} viewBox="0 0 600 200" fill="none" aria-hidden="true" preserveAspectRatio="none">
    <path d="M0 50 C120 14 200 96 320 56 C440 16 520 92 600 54" stroke="currentColor" strokeWidth="1.4" opacity=".6"/>
    <path d="M0 96 C120 60 200 142 320 102 C440 62 520 138 600 100" stroke="currentColor" strokeWidth="1.4" opacity=".42"/>
    <path d="M0 142 C120 106 200 188 320 148 C440 108 520 184 600 146" stroke="currentColor" strokeWidth="1.4" opacity=".28"/>
  </svg>;
}

function useScrollSpy(ids, offset = 130) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const onScroll = () => {
      let current = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top - offset <= 0) current = id;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [ids, offset]);
  return active;
}

export default function App() {
  const [path, navigate] = usePath();
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
      {path === "/products" && <ProductsPage {...pageProps} />}
      {path === "/providers" && <ProvidersPage {...pageProps} />}
      {path === "/contact" && <ContactPage />}
      {path === "/terms" && <TermsPage />}
      {!["/", "/about", "/analysis", "/health", "/treatments", "/products", "/providers", "/contact", "/terms"].includes(path) && <HomePage go={go} />}
    </main>
    <Footer go={go} />
  </div>;
}

function Header({ path, go, menuOpen, setMenuOpen }) {
  return <>
    <header className="site-header">
      <button className="brand" onClick={() => go("/")} aria-label="Trichofy home"><span className="brand-mark"><BrandMark /></span><span>Trichofy</span></button>
      <nav className="desktop-nav" aria-label="Primary navigation">
        {navItems.filter((item) => !["/providers", "/contact"].includes(item.path)).map((item) => <button key={item.path} className={path === item.path ? "active" : ""} onClick={() => go(item.path)}>{item.label}</button>)}
      </nav>
      <Button className="header-cta" onClick={() => go("/analysis")}>Begin analysis <Icon name="arrow" size={17} /></Button>
      <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-label={menuOpen ? "Close menu" : "Open menu"}><Icon name={menuOpen ? "close" : "menu"} size={25} /></button>
    </header>
    <div className={`mobile-menu ${menuOpen ? "open" : ""}`} aria-hidden={!menuOpen}>
      <div className="mobile-menu-inner">
        <p className="kicker">Explore Trichofy</p>
        <nav>{navItems.map((item, index) => <button key={item.path} onClick={() => go(item.path)} className={path === item.path ? "active" : ""}><span>0{index + 1}</span>{item.label}<Icon name="arrow" /></button>)}</nav>
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
      <WaveLines />
    </section>

    <section className="trust-section section-pad">
      <SectionHeader eyebrow="Beauty meets intelligence" title="Care that begins with understanding." text="Trichofy turns visual hair signals into calm, useful direction—so your routine feels less like trial and error, and more like knowing." />
      <div className="trust-list">{trustFeatures.map((feature) => <article className="trust-item" key={feature.title}><span>{feature.number}</span><div><h3>{feature.title}</h3><p>{feature.text}</p></div><Icon name="arrow" /></article>)}</div>
    </section>

    <section className="process-section section-pad">
      <div className="process-intro"><p className="kicker light">Your consultation</p><h2>From one photograph to a ritual that feels like yours.</h2><Button variant="light" onClick={() => go("/analysis")}>Start your profile <Icon name="arrow" /></Button></div>
      <div className="process-steps">{processSteps.map(([number, title, text]) => <article key={number}><span>{number}</span><div><h3>{title}</h3><p>{text}</p></div></article>)}</div>
    </section>

    <section className="hair-showcase section-pad">
      <SectionHeader eyebrow="Every pattern has a language" title="Five profiles. Infinite expressions." text="Hair is personal, textured, storied. Our intelligence begins by recognizing the visible pattern—and never ends by reducing you to it." align="center" />
      <div className="hair-type-track">{hairTypes.map((type) => <article className="hair-type-card" key={type.name} style={{ "--hair-image": `url(${type.image})`, "--hair-position": type.position }}><div className="hair-type-overlay"/><div><span>{type.code}</span><h3>{type.name}</h3><p>{type.note}</p></div></article>)}</div>
    </section>

    <section className="vision-section section-pad">
      <div className="vision-image"><img src="/trichofyBG.jpg" alt="A protective hairstyle being carefully created"/><span>Hair intelligence<br/>with a human heart.</span></div>
      <div className="vision-copy"><p className="kicker">Beyond the mirror</p><h2>The future of hair care is deeply personal.</h2><p className="lead">We imagine a world where understanding your hair is as natural as caring for it.</p><p>Trichofy is growing into a living hair intelligence platform—connecting pattern, environment, products, routines, and eventually scalp wellness into one considered experience.</p><div className="vision-points"><span>Hair understanding</span><span>Weather intelligence</span><span>Product intelligence</span><span>Future scalp health</span></div><Button variant="outline" onClick={() => go("/about")}>Our point of view <Icon name="arrow" /></Button></div>
    </section>

    <section className="home-closing"><WaveLines /><p className="kicker light">Begin with understanding</p><h2>Your hair has always been telling you what it needs.</h2><p>Now there is a more thoughtful way to listen.</p><Button variant="light" onClick={() => go("/analysis")}>Discover my hair profile <Icon name="arrow" /></Button></section>
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
    <section className="analysis-intro"><PageIntro eyebrow="The Trichofy consultation" title="Let’s get to know your hair." text="One clear photograph becomes a considered profile—your visible pattern, confidence reading, care insights, and product direction." align="center"/><div className="consultation-progress"><span className={file ? "complete" : "active"}>01 <b>Photograph</b></span><i/><span className={loading ? "active" : result ? "complete" : ""}>02 <b>Analysis</b></span><i/><span className={result ? "active" : ""}>03 <b>Your profile</b></span></div></section>
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

function TreatmentsPage({ result, routineIntensity, setRoutineIntensity, seasonCity, setSeasonCity, seasonCountry, setSeasonCountry, seasonWeather, seasonLoading, seasonError, handleFetchWeather }) {
  return <div className="page treatments-page">
    <section className="treatment-hero"><PageIntro eyebrow="Your care consultation" title="Rituals that move with your hair—and your life." text="Explore focused treatment intelligence, then turn your profile into a weekly rhythm that responds to the world around you."/><div className="treatment-hero-art"><span>Care is not a correction.</span><strong>It is a ritual.</strong></div></section>
    <section className="treatment-library section-pad"><SectionHeader eyebrow="Treatment library" title="Begin with what your hair is asking for."/><div className="treatment-grid">{treatmentTools.map((treatment) => <TreatmentCard treatment={treatment} key={treatment.id}/>)}</div></section>
    <section className="ritual-builder section-pad">
      <div className="ritual-panel"><div className="panel-number">01</div><p className="kicker">Your weekly ritual</p><h2>A rhythm you can return to.</h2><p>Choose the level of care that fits your week. We’ll shape the details around your latest hair profile.</p><div className="segmented-control">{["light", "balanced", "intense"].map((level) => <button className={routineIntensity === level ? "active" : ""} onClick={() => setRoutineIntensity(level)} key={level}>{level}</button>)}</div>{!result ? <EmptyConsultation/> : <div className="routine-timeline">{buildRoutinePlan(result.hair_type, routineIntensity).map((block, index) => <article key={block.title}><span>0{index + 1}</span><div><p>{block.when}</p><h3>{block.title}</h3><ul>{block.steps.map((step) => <li key={step}>{step}</li>)}</ul></div></article>)}</div>}</div>
      <div className="weather-panel"><div className="panel-number">02</div><p className="kicker">Your local conditions</p><h2>Care for the weather you’re in.</h2><p>Temperature and humidity can change what your hair needs. Enter your location for a thoughtful adjustment.</p><div className="location-fields"><label><span>City</span><input value={seasonCity} onChange={(event) => setSeasonCity(event.target.value)}/></label><label><span>Country</span><input value={seasonCountry} onChange={(event) => setSeasonCountry(event.target.value)}/></label></div><Button onClick={handleFetchWeather} disabled={seasonLoading}>{seasonLoading ? "Reading the weather…" : <><Icon name="location"/> Read my conditions</>}</Button>{seasonError && <p className="form-error">{seasonError}</p>}{seasonWeather && <div className="weather-result"><div><span>{weatherLabel(seasonWeather.condition, seasonWeather.icon)}</span><strong>{seasonWeather.temp.toFixed(0)}°</strong><p>{seasonWeather.city} · {seasonWeather.humidity}% humidity</p></div>{result ? <ul>{buildSeasonAdvice(result.hair_type, seasonWeather).map((tip) => <li key={tip}>{tip}</li>)}</ul> : <p>Complete your hair analysis to turn today’s conditions into personal guidance.</p>}</div>}</div>
    </section>
  </div>;
}

function EmptyConsultation() { return <div className="empty-consultation"><Icon name="spark"/><p>Complete your hair analysis first, and your personal ritual will meet you here.</p><a href="/analysis">Begin analysis</a></div>; }

function ProductsPage({ productFilter, setProductFilter, productCategories, visibleProducts, recommendedProducts, go }) {
  return <div className="page products-page">
    <section className="shop-hero"><div><p className="kicker">The Trichofy edit</p><h1>Less product noise.<br/>More beautiful choices.</h1><p>A considered collection of oils, hydrators, repair treatments, and scalp care—curated around what different hair profiles truly need.</p></div><div className="shop-hero-products"><img src="/products/marula-oil.jpg.png" alt="Marula hair oil"/><img src="/products/shea-butter.jpg.png" alt="Shea butter hair care"/></div></section>
    {recommendedProducts.length > 0 && <section className="recommendation-edit section-pad"><SectionHeader eyebrow="Your personal edit" title="Chosen with your profile in mind." text="Recommendations from your latest Trichofy consultation."/><div className="product-grid featured">{recommendedProducts.map((product, index) => <ProductCard product={product} key={`${product.name}-${index}`}/>)}</div></section>}
    <section className="shop-section section-pad"><div className="shop-heading"><SectionHeader eyebrow="Explore the collection" title="Care, beautifully considered."/><div className="filter-pills">{productCategories.map((category) => <button key={category} className={productFilter === category ? "active" : ""} onClick={() => setProductFilter(category)}>{category}</button>)}</div></div>{recommendedProducts.length === 0 && <div className="personal-edit-prompt"><div><Icon name="spark"/><p><strong>Unlock your personal edit.</strong><br/>Analyze your hair to see products selected for your profile.</p></div><Button variant="outline" onClick={() => go("/analysis")}>Analyze my hair</Button></div>}<div className="product-grid">{visibleProducts.map((product) => <ProductCard product={product} key={product.name}/>)}</div></section>
  </div>;
}

function ProvidersPage({ activeCategory, selectedCategory, setSelectedCategory, providerForm, setProviderForm, extraFields, setExtraFields, providerProducts, handleAddProviderProduct, error }) {
  const update = (key, value) => setProviderForm((current) => ({ ...current, [key]: value }));
  return <div className="page providers-page"><section className="partner-hero"><PageIntro eyebrow="For beauty partners" title="Bring thoughtful products into a more intelligent care experience." text="Share the formula, texture, purpose, and hair profiles behind your product. Trichofy uses meaningful detail to make better matches."/></section><section className="partner-form-section section-pad"><aside><p className="kicker">Choose a category</p>{providerCategories.map((category, index) => <button key={category.id} className={selectedCategory === category.id ? "active" : ""} onClick={() => setSelectedCategory(category.id)}><span>0{index + 1}</span><div><strong>{category.label}</strong><small>{category.description}</small></div></button>)}</aside><form onSubmit={handleAddProviderProduct}><div className="form-intro"><p className="kicker">Product profile</p><h2>{activeCategory.label}</h2><p>{activeCategory.description}</p></div><div className="form-grid"><Field label="Product name"><input value={providerForm.name} onChange={(e) => update("name", e.target.value)} placeholder="e.g. Nourishing Castor Oil"/></Field><Field label="Brand"><input value={providerForm.brand} onChange={(e) => update("brand", e.target.value)} placeholder="Your brand name"/></Field><Field label="Best for"><input value={providerForm.hairTypes} onChange={(e) => update("hairTypes", e.target.value)} placeholder="Curly, coily, straight"/></Field><Field label="Image filename or URL"><input value={providerForm.imageUrl} onChange={(e) => update("imageUrl", e.target.value)} placeholder="product-image.jpg"/></Field>{activeCategory.questions.map((question) => <Field label={question.label} key={question.key}><input value={extraFields[question.key] || ""} onChange={(e) => setExtraFields((current) => ({ ...current, [question.key]: e.target.value }))} placeholder={question.placeholder}/></Field>)}<Field label="The product story" wide><textarea rows="5" value={providerForm.description} onChange={(e) => update("description", e.target.value)} placeholder="Tell us about the ingredients, benefits, and ideal ritual."/></Field></div><Button type="submit">Submit for consideration <Icon name="arrow"/></Button>{error && <p className="form-error">{error}</p>}</form></section>{providerProducts.length > 0 && <section className="section-pad"><SectionHeader eyebrow="Submission preview" title="Recently added."/><div className="product-grid">{providerProducts.map((product, index) => <ProductCard product={product} key={`${product.name}-${index}`}/>)}</div></section>}</div>;
}

function Field({ label, wide, children }) { return <label className={wide ? "wide" : ""}><span>{label}</span>{children}</label>; }

function ContactPage() {
  return <div className="page contact-page"><section className="contact-hero"><div><p className="kicker light">A conversation begins here</p><h1>How can we care for your next idea?</h1><p>For platform support, brand partnerships, salon collaborations, or a thoughtful conversation about the future of hair intelligence.</p></div></section><section className="contact-section section-pad"><div className="contact-copy"><p className="kicker">Contact Trichofy</p><h2>We would love to hear from you.</h2><p>Leave a note and tell us what brought you here. Every message is read with care.</p><div className="contact-person"><span>WL</span><div><strong>Witness Lubisi</strong><p>Founder · South Africa</p></div></div><div className="direct-contact"><a href="mailto:witness.lubisi1@gmail.com">witness.lubisi1@gmail.com</a><a href="tel:+27720524638">+27 72 052 4638</a></div></div><form className="contact-form" onSubmit={(event) => event.preventDefault()}><Field label="Your name"><input placeholder="How should we address you?"/></Field><Field label="Email address"><input type="email" placeholder="you@example.com"/></Field><Field label="I’m reaching out about"><select defaultValue=""><option value="" disabled>Choose a subject</option><option>Platform support</option><option>Brand partnership</option><option>Salon collaboration</option><option>Something else</option></select></Field><Field label="Your message"><textarea rows="6" placeholder="Tell us a little more…"/></Field><Button type="submit">Send your note <Icon name="arrow"/></Button></form></section></div>;
}

const termsSections = [
  { id: "about", n: "01", title: "About Trichofy", body: <>
    <p>Trichofy is a South African BeautyTech company providing AI-powered hair and scalp analysis. By accessing or using the Trichofy website, app, or services (the “Services”), you agree to these Terms &amp; Conditions. If you do not agree, please do not use the Services.</p>
    <p>These Terms apply to all visitors, registered users, salon partners, and anyone who uploads an image for analysis. We may update these Terms from time to time, and continued use of the Services means you accept the current version.</p>
  </> },
  { id: "wellness", n: "02", title: "Wellness Disclaimer", body: <>
    <p>Trichofy provides cosmetic, grooming, and general wellness guidance only. Our analysis and recommendations are informational and are <strong className="em">not a medical diagnosis, treatment, or professional medical advice.</strong></p>
    <p>Trichofy does not diagnose, treat, cure, or prevent any disease or medical condition (including hair loss, infections, or dermatological conditions). If you have a scalp or health concern, consult a qualified medical practitioner or dermatologist. Never disregard professional medical advice because of something provided by Trichofy.</p>
  </> },
  { id: "ai", n: "03", title: "AI Analysis", body: <>
    <p>Our hair and scalp insights are generated by machine-learning models that estimate characteristics such as hair type, density, texture, and scalp condition from the images and information you provide.</p>
    <p>AI results are probabilistic estimates and may be inaccurate or incomplete. Accuracy can vary with image quality, lighting, and angle. You should treat all outputs as guidance, not as definitive fact, and use your own judgement.</p>
  </> },
  { id: "images", n: "04", title: "Image Uploads", body: <>
    <p>To use certain features you may upload photographs of your hair and scalp. By uploading, you confirm that:</p>
    <ul>
      <li>You are the person in the image, or have their permission to upload it.</li>
      <li>You are 18 or older, or have guardian consent.</li>
      <li>You will not upload unlawful, offensive, or infringing content.</li>
    </ul>
    <p>You retain ownership of your images. You grant Trichofy a limited licence to process them solely to deliver the Services described in these Terms.</p>
  </> },
  { id: "popia", n: "05", title: "POPIA & Privacy", body: <>
    <p>Trichofy processes personal information in line with the Protection of Personal Information Act, 2013 (POPIA). Photographs and related data are treated as sensitive and handled with appropriate safeguards.</p>
    <p>We collect only what we need to provide analysis, store data securely, and we do not sell your personal information. You have the right to access, correct, or request deletion of your data, and to object to processing.</p>
    <p>For full details, see our Privacy Policy. To exercise your rights, contact our Information Officer (see Contact).</p>
  </> },
  { id: "model", n: "06", title: "AI Model Improvement", body: <>
    <p>With your consent, Trichofy may use de-identified images and analysis data to train and improve our AI models and Services. Where used for model improvement, data is stripped of direct identifiers wherever practicable.</p>
    <p>You may opt out of model-improvement use at any time in your settings or by contacting us, without losing access to core analysis features.</p>
  </> },
  { id: "salons", n: "07", title: "Salons & Partners", body: <>
    <p>Trichofy may connect you with independent salons, stylists, trichologists, and brand partners. These partners are independent third parties and are not employed or controlled by Trichofy.</p>
    <p>Any booking, consultation, treatment, or transaction you enter into with a partner is solely between you and that partner. Trichofy is not responsible for the services, conduct, pricing, or outcomes provided by third-party partners.</p>
  </> },
  { id: "products", n: "08", title: "Product Recommendations", body: <>
    <p>Trichofy may suggest hair-care products and routines based on your analysis. Recommendations are suggestions only and may include partner or affiliate products from which we may earn a commission.</p>
    <p>Always read product labels and patch-test new products. Discontinue use and seek advice if you experience irritation or an adverse reaction. Trichofy is not liable for reactions to third-party products.</p>
  </> },
  { id: "rules", n: "09", title: "User Rules", body: <>
    <p>When using Trichofy you agree not to:</p>
    <ul>
      <li>Misuse, disrupt, or attempt to gain unauthorised access to the Services.</li>
      <li>Upload unlawful, harmful, or infringing content.</li>
      <li>Reverse engineer, scrape, or copy our models or content.</li>
      <li>Impersonate others or use the Services for any unlawful purpose.</li>
    </ul>
    <p>We may suspend or terminate access for any breach of these Terms.</p>
  </> },
  { id: "liability", n: "10", title: "Liability", body: <>
    <p>To the maximum extent permitted by law, Trichofy provides the Services “as is” and “as available” without warranties of any kind. We are not liable for any indirect, incidental, or consequential loss, or for decisions made in reliance on AI outputs, third-party partners, or product recommendations.</p>
    <p>Nothing in these Terms excludes liability that cannot be excluded under South African law, including under the Consumer Protection Act where it applies.</p>
  </> },
  { id: "law", n: "11", title: "Governing Law", body: <>
    <p>These Terms are governed by the laws of the Republic of South Africa, and any dispute is subject to the exclusive jurisdiction of the South African courts. If any provision is found unenforceable, the remaining provisions continue in full force.</p>
  </> },
  { id: "contact", n: "12", title: "Contact", body: <>
    <p>Questions about these Terms or your data? We’re here to help.</p>
    <div className="terms-contact-grid">
      <div><p>General</p><p>witness.lubisi1@gmail.com</p></div>
      <div><p>Information Officer</p><p>privacy@trichofy.co.za</p></div>
      <div><p>Web</p><p>trichofy.co.za</p></div>
    </div>
  </> },
];

function TermsPage() {
  const ids = useMemo(() => termsSections.map((s) => s.id), []);
  const active = useScrollSpy(ids, 130);
  const jump = (event, id) => {
    event.preventDefault();
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 100, behavior: "smooth" });
  };
  return <div className="page terms-page">
    <section className="terms-hero">
      <WaveLines />
      <div className="terms-badge"><span /><b>TRICHOFY · LEGAL</b></div>
      <h1>Terms &amp; Conditions</h1>
      <p className="terms-subtitle">Clear, privacy-first terms for AI-powered hair and scalp insights.</p>
      <p className="terms-updated">Last updated · 28 June 2026</p>
      <div className="disclaimer-card">
        <span className="disc-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 5V13.5" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"/><circle cx="12" cy="18" r="1.55" fill="currentColor"/></svg></span>
        <div><strong>Important wellness disclaimer</strong><p>Trichofy provides cosmetic and wellness guidance only. It does not diagnose disease or replace medical advice.</p></div>
      </div>
    </section>
    <section className="terms-body">
      <aside className="terms-toc">
        <p className="kicker">On this page</p>
        <nav>{termsSections.map((s) => <a key={s.id} href={`#${s.id}`} className={active === s.id ? "active" : ""} onClick={(event) => jump(event, s.id)}><span>{s.n}</span>{s.title}</a>)}</nav>
      </aside>
      <div className="terms-sections">
        {termsSections.map((s) => <article id={s.id} className="terms-card" key={s.id}>
          <div className="terms-card-head"><span>{s.n}</span><i /><h2>{s.title}</h2></div>
          {s.body}
        </article>)}
      </div>
    </section>
  </div>;
}

function Footer({ go }) {
  return <footer className="site-footer"><div className="footer-top"><div><button className="brand footer-brand" onClick={() => go("/")}><span className="brand-mark"><BrandMark /></span><span>Trichofy</span></button><p>Intelligence for the hair you live in.</p></div><div className="footer-links"><div><p>Discover</p><button onClick={() => go("/analysis")}>Hair analysis</button><button onClick={() => go("/treatments")}>Treatments</button><button onClick={() => go("/products")}>Products</button></div><div><p>Company</p><button onClick={() => go("/about")}>Our story</button><button onClick={() => go("/health")}>Health vision</button><button onClick={() => go("/contact")}>Contact</button></div><div><p>Legal</p><button onClick={() => go("/terms")}>Terms &amp; Conditions</button><button onClick={() => go("/providers")}>Submit a product</button><a href="mailto:witness.lubisi1@gmail.com">Collaborate</a></div></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} Trichofy</span><span>Made with care in South Africa</span><span>Hair wellness guidance, not medical diagnosis.</span></div></footer>;
}
