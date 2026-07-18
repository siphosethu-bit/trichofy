import pathlib

path = pathlib.Path("src/App.jsx")
text = path.read_text()

def apply(old, new, label):
    global text
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"FAILED on '{label}': expected 1 match, found {count}. Aborting, file NOT changed.")
    text = text.replace(old, new, 1)
    print(f"OK: {label}")

# 1. imports
apply(
'''import { navItems, productCatalog, providerCategories, treatmentTools } from "./data/content";
import { Button, PageIntro, ProductCard, SectionHeader, TreatmentCard } from "./components/ui";''',
'''import { navItems, productCatalog, providerCategories, treatmentTools } from "./data/content";
import { Button, PageIntro, ProductCard, SectionHeader, TreatmentCard } from "./components/ui";
import { useAuth } from "./auth/useAuth";
import { AccountPage } from "./auth/AccountPage";''',
"add auth imports"
)

# 2. router + header
apply(
'''      {path === "/providers" && <ProvidersPage {...pageProps} />}
      {path === "/contact" && <ContactPage />}
      {!navItems.some((item) => item.path === path) && <HomePage go={go} />}
    </main>
    <Footer go={go} />
  </div>;
}

function Header({ path, go, menuOpen, setMenuOpen }) {
  return <>
    <header className="site-header">
      <button className="brand" onClick={() => go("/")} aria-label="Trichofy home"><span className="brand-mark">T</span><span>Trichofy</span></button>
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
}''',
'''      {path === "/providers" && <ProvidersPage {...pageProps} />}
      {path === "/contact" && <ContactPage />}
      {path === "/account" && <AccountPage go={go} />}
      {!navItems.some((item) => item.path === path) && path !== "/account" && <HomePage go={go} />}
    </main>
    <Footer go={go} />
  </div>;
}

function Header({ path, go, menuOpen, setMenuOpen }) {
  const { user, authLoading } = useAuth();
  return <>
    <header className="site-header">
      <button className="brand" onClick={() => go("/")} aria-label="Trichofy home"><span className="brand-mark">T</span><span>Trichofy</span></button>
      <nav className="desktop-nav" aria-label="Primary navigation">
        {navItems.filter((item) => !["/providers", "/contact"].includes(item.path)).map((item) => <button key={item.path} className={path === item.path ? "active" : ""} onClick={() => go(item.path)}>{item.label}</button>)}
      </nav>
      {!authLoading && (
        <button className="account-pill" onClick={() => go("/account")}>
          {user ? user.name.split(" ")[0] : "Sign in"}
        </button>
      )}
      <Button className="header-cta" onClick={() => go("/analysis")}>Begin analysis <Icon name="arrow" size={17} /></Button>
      <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-label={menuOpen ? "Close menu" : "Open menu"}><Icon name={menuOpen ? "close" : "menu"} size={25} /></button>
    </header>
    <div className={`mobile-menu ${menuOpen ? "open" : ""}`} aria-hidden={!menuOpen}>
      <div className="mobile-menu-inner">
        <p className="kicker">Explore Trichofy</p>
        <nav>
          {navItems.map((item, index) => <button key={item.path} onClick={() => go(item.path)} className={path === item.path ? "active" : ""}><span>0{index + 1}</span>{item.label}<Icon name="arrow" /></button>)}
          <button onClick={() => go("/account")} className={path === "/account" ? "active" : ""}><span>0{navItems.length + 1}</span>{user ? user.name.split(" ")[0] : "Sign in"}<Icon name="arrow" /></button>
        </nav>
        <div className="mobile-menu-foot"><p>Hair care, made personal.</p><a href="mailto:witness.lubisi1@gmail.com">witness.lubisi1@gmail.com</a></div>
      </div>
    </div>
  </>;
}''',
"add /account route and header sign-in button"
)

# 3. gate the providers page
apply(
'''function ProvidersPage({ activeCategory, selectedCategory, setSelectedCategory, providerForm, setProviderForm, extraFields, setExtraFields, providerProducts, handleAddProviderProduct, error }) {
  const update = (key, value) => setProviderForm((current) => ({ ...current, [key]: value }));
  return <div className="page providers-page"><section className="partner-hero"><PageIntro eyebrow="For beauty partners" title="Bring thoughtful products into a more intelligent care experience." text="Share the formula, texture, purpose, and hair profiles behind your product. Trichofy uses meaningful detail to make better matches."/></section><section className="partner-form-section section-pad"><aside>''',
'''function ProvidersPage({ activeCategory, selectedCategory, setSelectedCategory, providerForm, setProviderForm, extraFields, setExtraFields, providerProducts, handleAddProviderProduct, error, go }) {
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

  return <div className="page providers-page"><section className="partner-hero"><PageIntro eyebrow="For beauty partners" title="Bring thoughtful products into a more intelligent care experience." text="Share the formula, texture, purpose, and hair profiles behind your product. Trichofy uses meaningful detail to make better matches."/></section><section className="partner-form-section section-pad"><aside>''',
"gate providers page behind provider role"
)

path.write_text(text)
print("\\nAll patches applied successfully to src/App.jsx")