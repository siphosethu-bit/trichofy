export function Button({ children, variant = "primary", className = "", ...props }) {
  return (
    <button className={`btn btn-${variant} ${className}`.trim()} {...props}>
      {children}
    </button>
  );
}

export function PageIntro({ eyebrow, title, text, align = "left" }) {
  return (
    <header className={`page-intro ${align === "center" ? "center" : ""}`}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h1>{title}</h1>
      {text && <p className="intro-copy">{text}</p>}
    </header>
  );
}

export function SectionHeader({ eyebrow, title, text }) {
  return (
    <div className="section-header">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2>{title}</h2>
      {text && <p>{text}</p>}
    </div>
  );
}

export function ProductCard({ product }) {
  return (
    <article className="product-card">
      {product.image_url && (
        <div className="product-image">
          <img src={product.image_url} alt={product.name} />
        </div>
      )}
      <div className="product-card-body">
        <div className="product-kicker">{product.category || product.brand}</div>
        <h3>{product.name}</h3>
        <p className="product-brand">{product.brand}</p>
        <p>{product.description}</p>
        <div className="tag-row">
          {product.hair_types?.map((type) => (
            <span className="tag" key={type}>
              {type}
            </span>
          ))}
          {product.match_score && <span className="tag strong">{product.match_score}% match</span>}
        </div>
      </div>
    </article>
  );
}

export function TreatmentCard({ treatment }) {
  return (
    <article className="treatment-card">
      <div className="treatment-image">
        <img src={treatment.image} alt={treatment.title} />
      </div>
      <div className="treatment-body">
        <h3>{treatment.title}</h3>
        <p>{treatment.description}</p>
        <div className="tag-row">
          {treatment.benefits.map((benefit) => (
            <span className="tag" key={benefit}>
              {benefit}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}

export function StoryCard({ story }) {
  return (
    <article className="story-card">
      <p>{story.text}</p>
      <div>
        <strong>{story.name}</strong>
        <span>{story.city}</span>
      </div>
    </article>
  );
}
