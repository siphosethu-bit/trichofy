export function Button({ children, variant = "primary", className = "", ...props }) {
  return <button className={`btn btn-${variant} ${className}`.trim()} {...props}>{children}</button>;
}

export function PageIntro({ eyebrow, title, text, align = "left" }) {
  return <header className={`page-intro ${align === "center" ? "center" : ""}`}>
    {eyebrow && <p className="kicker">{eyebrow}</p>}
    <h1>{title}</h1>
    {text && <p className="intro-copy">{text}</p>}
  </header>;
}

export function SectionHeader({ eyebrow, title, text, align = "left" }) {
  return <div className={`section-header ${align === "center" ? "center" : ""}`}>
    {eyebrow && <p className="kicker">{eyebrow}</p>}
    <h2>{title}</h2>
    {text && <p>{text}</p>}
  </div>;
}

export function ProductCard({ product }) {
  return <article className="product-card">
    <div className="product-image">
      {product.image_url ? <img src={product.image_url} alt={product.name} /> : <span>{product.brand?.slice(0, 1) || "T"}</span>}
      {product.match_score && <div className="match-badge">{Math.round(product.match_score)}% match</div>}
      <button className="product-save" type="button" aria-label={`Save ${product.name}`}>♡</button>
    </div>
    <div className="product-card-body">
      <div className="product-kicker">{product.category || "Trichofy edit"}</div>
      <h3>{product.name}</h3>
      <p className="product-brand">{product.brand}</p>
      <p className="product-description">{product.description}</p>
      <div className="tag-row">{product.hair_types?.slice(0, 3).map((type) => <span className="tag" key={type}>{type}</span>)}</div>
      <button className="text-link" type="button">View details <span>→</span></button>
    </div>
  </article>;
}

export function TreatmentCard({ treatment }) {
  return <article className="treatment-card">
    <div className="treatment-image"><img src={treatment.image} alt={treatment.title}/><span>Explore</span></div>
    <div className="treatment-body"><p className="kicker">Focused care</p><h3>{treatment.title}</h3><p>{treatment.description}</p><div className="tag-row">{treatment.benefits.map((benefit) => <span className="tag" key={benefit}>{benefit}</span>)}</div></div>
  </article>;
}

export function StoryCard({ story }) {
  return <article className="story-card"><p>{story.text}</p><div><strong>{story.name}</strong><span>{story.city}</span></div></article>;
}
