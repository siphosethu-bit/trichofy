const sharedNotice =
  "This guided check uses your answers and self-observations. It does not analyse a photograph, diagnose a condition, or replace advice from a qualified professional.";

export const treatmentAssessments = {
  hydration: {
    id: "hydration",
    route: "hydration",
    title: "Hydration Analysis",
    eyebrow: "Moisture check",
    intro: "Notice how your hair feels, behaves and responds between wash days to choose a more suitable moisture approach.",
    notice: sharedNotice,
    questions: [
      {
        id: "feel",
        prompt: "How does your hair usually feel one or two days after wash day?",
        help: "Think about the mid-lengths and ends, not only the scalp.",
        options: [
          { label: "Soft and flexible", scores: { balanced: 3 } },
          { label: "A little dry by the ends", scores: { thirsty: 2, balanced: 1 } },
          { label: "Rough, brittle or straw-like", scores: { depleted: 3 } },
        ],
      },
      {
        id: "water",
        prompt: "When you wet clean hair, what do you notice?",
        options: [
          { label: "Water absorbs at a steady pace", scores: { balanced: 3 } },
          { label: "Water sits on the surface for a while", scores: { thirsty: 2, balanced: 1 } },
          { label: "It soaks up water quickly but dries quickly too", scores: { depleted: 3 } },
        ],
      },
      {
        id: "tangles",
        prompt: "How easily do your ends tangle or catch?",
        options: [
          { label: "Rarely", scores: { balanced: 3 } },
          { label: "Sometimes, especially late in the week", scores: { thirsty: 3 } },
          { label: "Often, even after conditioning", scores: { depleted: 3 } },
        ],
      },
      {
        id: "products",
        prompt: "How does your hair respond to creams and oils?",
        options: [
          { label: "A small amount keeps it comfortable", scores: { balanced: 3 } },
          { label: "It needs regular light reapplication", scores: { thirsty: 3 } },
          { label: "Products sit on top while hair still feels dry", scores: { depleted: 3 } },
        ],
      },
    ],
    profiles: {
      balanced: {
        title: "Moisture appears reasonably balanced",
        summary: "Your observations suggest your current routine is keeping the hair flexible without obvious persistent dryness.",
        actions: ["Keep wash day consistent rather than adding more product.", "Use a lightweight leave-in mainly on the ends.", "Protect hair from friction at night with satin or silk."],
        categories: ["Hydration", "Shine"],
      },
      thirsty: {
        title: "Your hair may benefit from steadier hydration",
        summary: "Your answers point to moisture fading between wash days. A lighter but more regular layering approach may work better than one heavy application.",
        actions: ["Apply leave-in to damp hair in sections.", "Add a small amount of oil or cream to the ends after hydration.", "Refresh only the areas that feel dry to limit buildup."],
        categories: ["Hydration", "Moisture"],
      },
      depleted: {
        title: "Persistent dryness cues need a gentler reset",
        summary: "Roughness, rapid moisture loss or frequent tangling can have several causes, including buildup, weather, chemical processing or damage.",
        actions: ["Use a gentle cleanse before adding richer layers.", "Deep condition with water and slip as the priority.", "Reduce heat and manipulation while monitoring breakage."],
        categories: ["Moisture", "Hydration", "Repair"],
      },
    },
    resources: [
      { title: "A simple moisture layer", text: "Water or leave-in first, then a cream or small amount of oil where needed." },
      { title: "Avoid product overload", text: "Hair that feels coated and dry may need cleansing, not another heavy layer." },
    ],
  },
  damage: {
    id: "damage",
    route: "damage",
    title: "Damage Detection",
    eyebrow: "Breakage check",
    intro: "Review breakage, elasticity, ends and recent chemical or heat history to choose a cautious repair direction.",
    notice: sharedNotice,
    questions: [
      {
        id: "breakage",
        prompt: "What do you see during detangling or styling?",
        options: [
          { label: "Mostly full-length shed hairs", scores: { stable: 3 } },
          { label: "Some short broken pieces", scores: { stressed: 3 } },
          { label: "Many short pieces or snapping", scores: { fragile: 3 } },
        ],
      },
      {
        id: "elasticity",
        prompt: "How does a wet shed strand behave when gently stretched?",
        help: "Do not pull hair that is still attached to your scalp.",
        options: [
          { label: "Stretches slightly and returns", scores: { stable: 3 } },
          { label: "Feels very stiff and breaks quickly", scores: { stressed: 3 } },
          { label: "Stretches excessively and does not return", scores: { fragile: 3 } },
        ],
      },
      {
        id: "ends",
        prompt: "How do your ends look and feel?",
        options: [
          { label: "Mostly smooth and even", scores: { stable: 3 } },
          { label: "Some splits, knots or rough areas", scores: { stressed: 3 } },
          { label: "Thin, frayed or splitting far up the strand", scores: { fragile: 3 } },
        ],
      },
      {
        id: "history",
        prompt: "Which best describes the last three months?",
        options: [
          { label: "Little heat and no chemical processing", scores: { stable: 3 } },
          { label: "Regular heat, tight styling or colour", scores: { stressed: 3 } },
          { label: "Relaxer, bleach or overlapping chemical services", scores: { fragile: 3 } },
        ],
      },
    ],
    profiles: {
      stable: {
        title: "No strong damage pattern in your answers",
        summary: "Your self-observations suggest normal shedding and manageable wear. Prevention is more useful than an intensive repair routine.",
        actions: ["Detangle from ends upward with adequate slip.", "Keep heat protection and moderate temperatures.", "Trim individual split ends before they travel."],
        categories: ["Shine", "Moisture"],
      },
      stressed: {
        title: "Your hair shows signs of accumulated stress",
        summary: "Some breakage, rough ends or repeated heat and tension suggest the strand needs lower manipulation and balanced conditioning.",
        actions: ["Pause high heat and tight styles for several weeks.", "Alternate moisture-focused care with occasional protein support.", "Do not use protein at every wash if hair becomes stiff."],
        categories: ["Repair", "Moisture"],
      },
      fragile: {
        title: "Your answers suggest significant fragility",
        summary: "Frequent snapping, poor elasticity or extensive chemical history needs a conservative routine. Products cannot permanently repair split strands.",
        actions: ["Stop overlapping chemical services and reduce heat.", "Consider a professional trim and gradual removal of compromised ends.", "Seek a qualified stylist or dermatologist if breakage is sudden or near the scalp."],
        categories: ["Repair", "Moisture"],
      },
    },
    resources: [
      { title: "Shedding versus breakage", text: "A shed hair is usually full length and may have a tiny bulb. Broken hair is shorter and lacks the root bulb." },
      { title: "Protein is not a universal fix", text: "Protein can support some weakened hair, but excessive use may leave other hair stiff and brittle." },
    ],
  },
  density: {
    id: "density",
    route: "density",
    title: "Density Assessment",
    eyebrow: "Fullness check",
    intro: "Use consistent parting and ponytail observations to estimate overall fullness and select an appropriate product weight.",
    notice: sharedNotice,
    questions: [
      {
        id: "scalp",
        prompt: "With dry, loose hair and no deliberate part, how visible is your scalp?",
        options: [
          { label: "Easily visible across several areas", scores: { lower: 3 } },
          { label: "Visible in a few areas", scores: { medium: 3 } },
          { label: "Difficult to see without parting", scores: { higher: 3 } },
        ],
      },
      {
        id: "ponytail",
        prompt: "How would you describe the circumference of a low ponytail?",
        options: [
          { label: "Small", scores: { lower: 3 } },
          { label: "Moderate", scores: { medium: 3 } },
          { label: "Large or difficult to hold in one tie", scores: { higher: 3 } },
        ],
      },
      {
        id: "sections",
        prompt: "How many sections do you usually need for comfortable styling?",
        options: [
          { label: "One or two", scores: { lower: 3 } },
          { label: "Three or four", scores: { medium: 3 } },
          { label: "Five or more", scores: { higher: 3 } },
        ],
      },
      {
        id: "change",
        prompt: "Has your overall fullness changed recently?",
        options: [
          { label: "No noticeable change", scores: { medium: 1 } },
          { label: "It has always felt naturally lighter", scores: { lower: 2 } },
          { label: "It has recently become thinner or patchy", scores: { lower: 3 }, flag: "density-change" },
        ],
      },
    ],
    profiles: {
      lower: {
        title: "Your observations align with lower density",
        summary: "Lower density means fewer strands in an area, not necessarily fine individual strands or unhealthy hair.",
        actions: ["Choose lightweight leave-ins, foams and serums.", "Apply richer products mainly to the ends.", "Use flexible styles that avoid exposing or stressing one part repeatedly."],
        categories: ["Shine", "Scalp"],
      },
      medium: {
        title: "Your observations align with medium density",
        summary: "Your fullness appears to sit in the middle range, allowing flexibility between light and rich products depending on strand thickness.",
        actions: ["Start with moderate product amounts and adjust by section.", "Use creams on drier areas rather than automatically coating all hair.", "Track changes with photos in the same lighting and part."],
        categories: ["Hydration", "Moisture"],
      },
      higher: {
        title: "Your observations align with higher density",
        summary: "More strands often require thorough sectioning and distribution, but do not automatically require very heavy formulas.",
        actions: ["Work in enough sections to reach all areas.", "Prioritise slip and even water distribution.", "Avoid piling heavy oils onto the scalp to compensate for hard-to-reach sections."],
        categories: ["Hydration", "Moisture"],
      },
    },
    resources: [
      { title: "Density is not strand thickness", text: "Density describes how many strands grow in an area. Fine or coarse describes the width of each strand." },
      { title: "When to seek help", text: "New thinning, widening parts, smooth patches or excessive shedding should be discussed with a healthcare professional." },
    ],
  },
  scalp: {
    id: "scalp",
    route: "scalp",
    title: "Scalp Health Insights",
    eyebrow: "Comfort check",
    intro: "Reflect on comfort, flakes, buildup and cleansing habits to choose a low-risk scalp-care next step.",
    notice: `${sharedNotice} Persistent pain, sores, bleeding, pus, spreading rash or sudden patchy hair loss needs professional medical assessment.`,
    questions: [
      {
        id: "comfort",
        prompt: "How has your scalp felt over the last two weeks?",
        options: [
          { label: "Generally comfortable", scores: { comfortable: 3 } },
          { label: "Occasionally itchy or tight", scores: { buildup: 2, dry: 1 } },
          { label: "Painful, burning, very itchy or tender", scores: { irritated: 3 }, flag: "scalp-red-flag" },
        ],
      },
      {
        id: "flakes",
        prompt: "What do you notice on the scalp or clothing?",
        options: [
          { label: "Little or no flaking", scores: { comfortable: 3 } },
          { label: "Small dry-looking flakes", scores: { dry: 3 } },
          { label: "Greasy, stuck-on flakes or thick scale", scores: { irritated: 3 }, flag: "scalp-persistent" },
        ],
      },
      {
        id: "buildup",
        prompt: "How soon does the scalp feel coated after washing?",
        options: [
          { label: "Not before the next planned wash", scores: { comfortable: 3 } },
          { label: "Within several days", scores: { buildup: 3 } },
          { label: "Within a day or two", scores: { irritated: 2, buildup: 1 } },
        ],
      },
      {
        id: "routine",
        prompt: "Which best describes your scalp routine?",
        options: [
          { label: "Regular gentle cleansing, few scalp products", scores: { comfortable: 3 } },
          { label: "Frequent oils, gels or dry shampoo on the scalp", scores: { buildup: 3 } },
          { label: "Long gaps between cleansing because washing is difficult", scores: { dry: 1, buildup: 2 } },
        ],
      },
    ],
    profiles: {
      comfortable: {
        title: "Your scalp sounds generally comfortable",
        summary: "Your answers do not point to a strong recurring concern. A simple, consistent routine is usually preferable to adding treatments.",
        actions: ["Cleanse according to oil, sweat and product use.", "Apply styling products mainly to hair rather than scalp.", "Watch for new persistent changes rather than treating preventively."],
        categories: ["Scalp"],
      },
      dry: {
        title: "Your observations lean toward dryness",
        summary: "Tightness and small flakes can relate to dry skin, harsh cleansing, weather or product irritation. Similar symptoms can have different causes.",
        actions: ["Use lukewarm water and a gentle cleanser.", "Avoid scratching and fragranced DIY remedies.", "If flakes persist, worsen or return quickly, seek a pharmacist or clinician's advice."],
        categories: ["Scalp", "Moisture"],
      },
      buildup: {
        title: "Buildup may be affecting scalp comfort",
        summary: "Frequent oils, gels or long cleansing intervals can leave residue, although itch and flakes are not always caused by buildup.",
        actions: ["Cleanse the scalp thoroughly with fingertips, not nails.", "Reduce direct scalp oils and heavy styling residue for two weeks.", "Rinse carefully and dry the scalp fully after washing."],
        categories: ["Scalp"],
      },
      irritated: {
        title: "Your scalp needs cautious attention",
        summary: "Pain, burning, persistent scale or intense itch should not be managed by repeatedly trying cosmetic products.",
        actions: ["Stop any new product that coincided with symptoms.", "Avoid essential oils, scratching and tight styles.", "Arrange advice from a pharmacist, GP or dermatologist, especially with sores or hair loss."],
        categories: ["Scalp"],
      },
    },
    resources: [
      { title: "Keep scalp care simple", text: "Cleansing and avoiding known irritants is safer than layering multiple oils or home remedies." },
      { title: "This is not diagnosis", text: "Dry skin, dandruff, psoriasis, eczema, allergy and infection can overlap in appearance." },
    ],
  },
  "curl-pattern": {
    id: "curl-pattern",
    route: "curl-pattern",
    title: "Curl Pattern Recognition",
    eyebrow: "Pattern guide",
    intro: "Observe freshly washed hair with minimal manipulation. Pattern is descriptive, can vary across the head and does not determine hair health.",
    notice: sharedNotice,
    questions: [
      {
        id: "shape",
        prompt: "When clean hair air-dries without stretching, which shape appears most often?",
        options: [
          { label: "Mostly straight or gently bending", scores: { straightWavy: 3 } },
          { label: "Clear S-waves or ringlets", scores: { wavyCurly: 3 } },
          { label: "Tight coils, zigzags or very small loops", scores: { coily: 3 } },
        ],
      },
      {
        id: "root",
        prompt: "What happens close to the roots?",
        options: [
          { label: "Usually lies straight or softly raised", scores: { straightWavy: 3 } },
          { label: "Forms visible waves or curls", scores: { wavyCurly: 3 } },
          { label: "Forms compact coils with significant shrinkage", scores: { coily: 3 } },
        ],
      },
      {
        id: "shrinkage",
        prompt: "How different is stretched length from dry visible length?",
        options: [
          { label: "Little difference", scores: { straightWavy: 3 } },
          { label: "A moderate difference", scores: { wavyCurly: 3 } },
          { label: "A large difference", scores: { coily: 3 } },
        ],
      },
      {
        id: "variation",
        prompt: "How consistent is the pattern across your head?",
        options: [
          { label: "Mostly one visible family", scores: { straightWavy: 1, wavyCurly: 1, coily: 1 } },
          { label: "Two or more patterns are easy to see", scores: { mixed: 4 } },
          { label: "Hard to tell because of styling or chemical processing", scores: { mixed: 4 } },
        ],
      },
    ],
    profiles: {
      straightWavy: {
        title: "Your dominant pattern appears straight to wavy",
        summary: "Your observations describe gentle bends or S-shapes with relatively limited shrinkage. Individual sections may still behave differently.",
        actions: ["Use lighter products first to preserve movement.", "Apply stylers on wet hair and avoid excessive touching while drying.", "Choose care by porosity, density and condition, not pattern alone."],
        categories: ["Shine", "Hydration"],
      },
      wavyCurly: {
        title: "Your dominant pattern appears wavy to curly",
        summary: "Your answers describe visible S-shapes, spirals or ringlets with moderate shrinkage.",
        actions: ["Distribute conditioner and styler in sections.", "Try scrunching or smoothing without breaking curl groups.", "Adjust hold and moisture separately instead of relying on one heavy product."],
        categories: ["Hydration", "Moisture", "Shine"],
      },
      coily: {
        title: "Your dominant pattern appears coily",
        summary: "Your observations describe compact loops, zigzags or tight coils with substantial shrinkage.",
        actions: ["Detangle in sections with water and slip.", "Use low-tension stretching if desired, not force.", "Protect ends and monitor dryness without assuming coils always need heavy oil."],
        categories: ["Moisture", "Hydration"],
      },
      mixed: {
        title: "You may have a mixed or currently altered pattern",
        summary: "Multiple patterns on one head are normal. Styling, heat and chemical processing can also make the underlying pattern harder to observe.",
        actions: ["Assess several areas after a simple wash day.", "Style sections according to how they behave.", "Do not chase a single type code when condition and routine are more useful."],
        categories: ["Hydration", "Moisture"],
      },
    },
    resources: [
      { title: "Pattern is a description", text: "It does not measure porosity, density, strand thickness, damage or product quality." },
      { title: "Observe without forcing", text: "Use clean hair with minimal product and compare several areas in natural light." },
    ],
  },
  routine: {
    id: "routine",
    route: "routine",
    title: "Routine Planning",
    eyebrow: "Weekly care planner",
    intro: "Build a realistic starting routine around your time, cleansing needs, dryness and styling habits.",
    notice: sharedNotice,
    questions: [
      {
        id: "frequency",
        prompt: "How often does your scalp usually need cleansing?",
        options: [
          { label: "Every 2 to 4 days", scores: { frequent: 3 } },
          { label: "About weekly", scores: { weekly: 3 } },
          { label: "Every 10 to 14 days", scores: { extended: 3 } },
        ],
      },
      {
        id: "time",
        prompt: "How much time can you realistically give a full wash day?",
        options: [
          { label: "Under 30 minutes", scores: { simple: 3 } },
          { label: "30 to 60 minutes", scores: { balanced: 3 } },
          { label: "More than an hour", scores: { detailed: 3 } },
        ],
      },
      {
        id: "dryness",
        prompt: "How often do the lengths feel dry before the next wash?",
        options: [
          { label: "Rarely", scores: { light: 3 } },
          { label: "Once or twice", scores: { moderate: 3 } },
          { label: "Frequently", scores: { rich: 3 } },
        ],
      },
      {
        id: "style",
        prompt: "What best describes your usual styling?",
        options: [
          { label: "Loose, wash-and-go or frequently restyled", scores: { active: 3 } },
          { label: "Low-manipulation styles for several days", scores: { steady: 3 } },
          { label: "Braids, twists, wigs or longer protective styles", scores: { protective: 3 } },
        ],
      },
    ],
    customResult: true,
    resources: [
      { title: "A routine is a starting point", text: "Adjust one element at a time and keep what improves comfort and manageability." },
      { title: "Scalp sets the wash rhythm", text: "Sweat, oil, flakes and product use matter more than a fixed calendar rule." },
    ],
  },
};

export function getTreatmentAssessment(slug) {
  return treatmentAssessments[slug] || null;
}

export function evaluateTreatment(assessment, answers) {
  if (assessment.customResult) return buildRoutineResult(assessment, answers);

  const totals = {};
  const flags = [];
  assessment.questions.forEach((question) => {
    const option = question.options[answers[question.id]];
    if (!option) return;
    Object.entries(option.scores).forEach(([key, score]) => {
      totals[key] = (totals[key] || 0) + score;
    });
    if (option.flag) flags.push(option.flag);
  });

  const key = Object.entries(totals).sort((a, b) => b[1] - a[1])[0]?.[0];
  const profile = assessment.profiles[key];
  return { ...profile, key, flags };
}

function buildRoutineResult(assessment, answers) {
  const selected = Object.fromEntries(
    assessment.questions.map((question) => [question.id, question.options[answers[question.id]]?.scores || {}]),
  );
  const cadence = selected.frequency?.frequent ? "every 2 to 4 days" : selected.frequency?.extended ? "every 10 to 14 days" : "about once a week";
  const depth = selected.time?.simple ? "streamlined" : selected.time?.detailed ? "unhurried" : "balanced";
  const moisture = selected.dryness?.rich ? "richer" : selected.dryness?.light ? "lightweight" : "moderate";
  const protective = Boolean(selected.style?.protective);

  return {
    key: "personal-routine",
    title: `A ${depth} routine, ${cadence}`,
    summary: `This plan reflects the time, scalp-cleansing rhythm, dryness and styling habits you selected. Start with ${moisture} moisture and adjust one step at a time.`,
    actions: [
      `Cleanse the scalp ${cadence}; rinse the lengths without aggressively piling the hair.`,
      "Condition with enough slip to detangle gently from ends upward.",
      `Use a ${moisture} leave-in or cream on damp lengths, concentrating on the ends.`,
      protective
        ? "While wearing a protective style, keep the scalp accessible, avoid excessive tension and cleanse when needed."
        : "Between washes, refresh only dry areas and protect hair from friction overnight.",
    ],
    categories: selected.dryness?.rich ? ["Moisture", "Hydration"] : ["Hydration", "Scalp"],
    flags: [],
  };
}
