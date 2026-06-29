export const navItems = [
  { path: "/", label: "Home" },
  { path: "/about", label: "About" },
  { path: "/analysis", label: "Hair Analysis" },
  { path: "/health", label: "Health" },
  { path: "/treatments", label: "Treatments" },
  { path: "/products", label: "Products" },
  { path: "/providers", label: "Providers" },
  { path: "/contact", label: "Contact" },
  { path: "/terms", label: "Terms" },
];

export const benefits = [
  {
    title: "Personal hair intelligence",
    text: "Understand pattern, texture and care needs from a single clear image.",
  },
  {
    title: "Product matching with purpose",
    text: "Move beyond trial and error with recommendations shaped around your hair profile.",
  },
  {
    title: "Routine guidance",
    text: "Turn analysis into simple weekly care decisions that feel realistic and refined.",
  },
];

export const stories = [
  {
    name: "Lethabo M.",
    city: "Johannesburg",
    text: "Trichofy helped me understand why some products worked beautifully and others never did.",
  },
  {
    name: "Thando D.",
    city: "Durban",
    text: "The experience felt personal, calm and easy. I knew what to buy without guessing.",
  },
  {
    name: "Zinhle K.",
    city: "Polokwane",
    text: "It gave me a care direction that made sense for my curls and my routine.",
  },
];

export const treatmentTools = [
  {
    id: "hydration",
    title: "Hydration Analysis",
    image: "/contact.jpg",
    description:
      "Evaluates visible dryness and moisture balance to guide richer or lighter care.",
    benefits: ["Hydration needs", "Moisture layering", "Leave-in guidance"],
  },
  {
    id: "damage",
    title: "Damage Detection",
    image: "/products/hydrolyzed-protein.jpg.png",
    description:
      "Reads signs of breakage, frizz and fragile ends so repair choices feel clear.",
    benefits: ["Breakage cues", "Repair support", "Protein balance"],
  },
  {
    id: "density",
    title: "Density Assessment",
    image: "/products/marula-oil.jpg.png",
    description:
      "Helps understand fullness and strand visibility for product weight decisions.",
    benefits: ["Fullness view", "Styling direction", "Product weight"],
  },
  {
    id: "scalp",
    title: "Scalp Health Insights",
    image: "/products/jojoba-oil.jpg.png",
    description:
      "Supports care decisions around buildup, irritation indicators and gentle cleansing.",
    benefits: ["Scalp comfort", "Cleanse rhythm", "Soothing care"],
  },
  {
    id: "curl",
    title: "Curl Pattern Recognition",
    image: "/products/castor-oil.jpg.png",
    description:
      "Identifies visible pattern behavior across curls, coils, waves and straight hair.",
    benefits: ["Pattern clarity", "Styling support", "Routine fit"],
  },
  {
    id: "routine",
    title: "Routine Planning",
    image: "/products/shea-butter.jpg.png",
    description:
      "Turns your analysis into a weekly rhythm for wash day, moisture and protection.",
    benefits: ["Weekly plan", "Care intensity", "Product timing"],
  },
];

export const productCatalog = [
  {
    name: "AfriPure Shea Butter + Marula Moisturising Hair Oil",
    brand: "AfriPure",
    category: "Moisture",
    image_url: "/products/shea-butter.jpg.png",
    hair_types: ["Coily", "Curly", "Dry"],
    match_score: 94,
    description: "A rich sealant for dry strands, ends and protective styling routines.",
  },
  {
    name: "Native Child Castor Oil",
    brand: "Native Child",
    category: "Growth",
    image_url: "/products/castor-oil.jpg.png",
    hair_types: ["Coily", "Kinky", "Protective styles"],
    match_score: 91,
    description: "A nourishing oil suited to scalp massage and length-retention rituals.",
  },
  {
    name: "AfriPure Vegetable Glycerine",
    brand: "AfriPure",
    category: "Hydration",
    image_url: "/products/glycerin.jpg.png",
    hair_types: ["Curly", "Coily", "High moisture need"],
    match_score: 88,
    description: "A humectant for moisture-focused routines when paired with a sealant.",
  },
  {
    name: "Pure Hydrolyzed Collagen",
    brand: "Pure",
    category: "Repair",
    image_url: "/products/hydrolyzed-protein.jpg.png",
    hair_types: ["Damaged", "Fragile", "Color treated"],
    match_score: 86,
    description: "A protein-support option for hair that needs structure and resilience.",
  },
  {
    name: "AfriPure Argan Oil",
    brand: "AfriPure",
    category: "Shine",
    image_url: "/products/argan-oil.jpg.png",
    hair_types: ["Straight", "Wavy", "Curly"],
    match_score: 84,
    description: "A polished finishing oil for softness, shine and lightweight sealing.",
  },
  {
    name: "AfriPure Jojoba Oil",
    brand: "AfriPure",
    category: "Scalp",
    image_url: "/products/jojoba-oil.jpg.png",
    hair_types: ["All", "Sensitive scalp"],
    match_score: 82,
    description: "A light oil for scalp comfort and balanced everyday care.",
  },
];

export const providerCategories = [
  {
    id: "oils",
    label: "Oils and Serums",
    description: "Sealing oils, scalp oils, finishing serums and oil blends.",
    questions: [
      { key: "texture", label: "Texture weight", placeholder: "Lightweight, medium or rich" },
      { key: "usage", label: "Best used for", placeholder: "Scalp, sealing, shine or treatment" },
    ],
  },
  {
    id: "cleansers",
    label: "Cleansers",
    description: "Moisturising shampoos, clarifying shampoos and co-washes.",
    questions: [
      { key: "sulfates", label: "Sulfate profile", placeholder: "Sulfate-free or low-sulfate" },
      { key: "finish", label: "Cleanse finish", placeholder: "Clarifying, gentle or moisture rich" },
    ],
  },
  {
    id: "conditioners",
    label: "Conditioners",
    description: "Rinse-out, leave-in and deep-conditioning formulas.",
    questions: [
      { key: "conditionerType", label: "Conditioner type", placeholder: "Leave-in, rinse-out or mask" },
      { key: "proteinLevel", label: "Protein level", placeholder: "Protein-free, balanced or protein rich" },
    ],
  },
  {
    id: "styling",
    label: "Styling",
    description: "Butters, creams, gels, foams and styling finishers.",
    questions: [
      { key: "holdLevel", label: "Hold level", placeholder: "Soft, medium or firm" },
      { key: "finishLook", label: "Finish look", placeholder: "Defined, sleek, voluminous or soft" },
    ],
  },
];
