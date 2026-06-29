# Trichofy Gold & Brown Redesign — What Changed

Branch: **`trichofy-gold-brown-redesign`** · App: **`tricofy-frontend`** (React + Vite)

The redesign was applied to your real React/Vite source — not a separate static page.
Everything is token-driven, so the new palette and fonts cascade across **all** pages
(Home, About, Hair Analysis, Health, Treatments, Products, Providers, Contact) automatically.

---

## Files changed (4)

1. **`tricofy-frontend/src/index.css`**
   - Fonts: now loads **Sora** (headings) + **Inter** (body) instead of Cormorant/Manrope.
   - Color tokens rebuilt → deep brown `#24130A` / near-black `#1B0F08`, gold `#B87918` `#C99132` `#D7A84A`, cream `#F8F1E7`, sand card `#FFFDF8`. No teal, no purple.
   - Headings retuned for Sora (weight 600, tighter tracking, safer line-height).
   - `.brand-mark` is now a rounded-square gold-on-dark icon tile.
   - Added a `.wave-lines` decoration helper + full styles for the new Terms page.

2. **`tricofy-frontend/src/App.jsx`**
   - New `BrandMark` logo component (rounded square + three wavy hair strands) — used in the header **and** footer in place of the old “T”.
   - New `WaveLines` decorative component (subtle hair-strand waves) on the home hero and closing band.
   - New `useScrollSpy` hook + **`TermsPage`** component (hero, wellness disclaimer card, sticky sidebar nav that highlights the active section, and all 12 legal sections).
   - Added the **`/terms`** route and fixed the fallback so `/terms` renders correctly.
   - Footer now has a **Legal** column with a **Terms & Conditions** link.

3. **`tricofy-frontend/index.html`**
   - `theme-color` updated to the new deep brown `#1B0F08`.

4. *(No other files touched — backend / Python / venv untouched.)*

---

## The new logo

It’s drawn in code (crisp at any size), so there’s nothing to upload. If you also want a
standalone PNG/SVG (favicon, social), say the word and I’ll export one.

---

## Terms & Conditions content

The page uses the prepared Trichofy legal copy: About, Wellness Disclaimer, AI Analysis,
Image Uploads, POPIA & Privacy, AI Model Improvement, Salons & Partners, Product
Recommendations, User Rules, Liability, Governing Law, Contact. It states clearly that
Trichofy provides **cosmetic and wellness guidance only** and **does not diagnose disease
or replace medical advice**.

> ⚠️ Have a South African lawyer review the legal text before publishing — especially the
> POPIA, Liability, and Consumer Protection sections. Update the `privacy@trichofy.co.za`
> contact if it differs.

---

## Run & build

```bash
cd tricofy-frontend
npm install        # if you haven't already
npm run dev        # check it locally → http://localhost:5173  (visit /terms too)
npm run build      # production build
```

Then commit on the redesign branch and open a PR into `main` when you’re happy:

```bash
git add tricofy-frontend/src/index.css tricofy-frontend/src/App.jsx tricofy-frontend/index.html
git commit -m "Apply gold/brown redesign: Sora+Inter, new logo, Terms & Conditions page"
git push origin trichofy-gold-brown-redesign
```

---

### Quick QA checklist after `npm run dev`
- Home hero shows the new logo tile + subtle gold waves; headings are Sora.
- Footer shows **Terms & Conditions** under a **Legal** column.
- `/terms` loads with the sticky left nav highlighting the section you’re reading.
- Buttons/cards/sections everywhere use the cream + gold + deep-brown palette.
