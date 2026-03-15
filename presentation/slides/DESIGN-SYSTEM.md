# NeoTherm Presentation Design System

Use this to replicate the look and feel across slides, documents, and demos.

## The Aesthetic

**"Clinical Whitepaper"** — The authority of a NEJM publication crossed with a technical architecture schematic. Clean, white, restrained. Every element earns its place. Trust is communicated through precision, not decoration.

**Why this works for NeoTherm:** You're pitching to clinicians and hospital administrators who read medical journals and Epic screens all day. They trust clean white backgrounds, structured layouts, and precise typography. Dark "tech startup" slides signal outsider. White clinical precision signals "we belong in your workflow."

## Colors

| Name | Hex | CSS Variable | Usage |
|------|-----|-------------|-------|
| Ink | `#1a2332` | `--ink` | Primary text, headings |
| Ink Light | `#3d4f63` | `--ink-light` | Secondary text, descriptions |
| Ink Muted | `#64748b` | `--ink-muted` | Tertiary text, labels, metadata |
| Surface | `#f8f9fb` | `--surface` | Page background, card backgrounds |
| White | `#ffffff` | `--white` | Card surfaces, primary background |
| Border | `#dde2e8` | `--border` | Card borders, dividers |
| Border Light | `#eceef2` | `--border-light` | Subtle dividers within cards |
| **Teal Deep** | `#0c6e6e` | `--teal-deep` | NeoTherm brand primary (dark) |
| **Teal** | `#0d8a8a` | `--teal` | NeoTherm brand primary — accents, links, highlights |
| Teal Light | `#e6f5f5` | `--teal-light` | Teal tinted backgrounds |
| Blue Deep | `#1a3a5c` | `--blue-deep` | Phase 1 color, deep emphasis |
| Blue | `#2563a0` | `--blue` | Phase 1 badges, secondary accent |
| Blue Light | `#e8f0f8` | `--blue-light` | Blue tinted backgrounds |
| Amber | `#b8860b` | `--amber` | Warning states, edge compute icon |
| Amber Light | `#fef8e8` | `--amber-light` | Amber tinted backgrounds |
| Clinical Red | `#c0392b` | `--red-clinical` | Critical alerts, camera icon |
| Red Light | `#fdf0ee` | `--red-light` | Red tinted backgrounds |
| Clinical Green | `#1a7a4c` | `--green-clinical` | Existing infrastructure, healthy state |
| Green Light | `#edf7f1` | `--green-light` | Green tinted backgrounds |
| Phase 1 | `#2563a0` | `--phase1` | Blue — pilot/MDDS |
| Phase 2 | `#0d8a8a` | `--phase2` | Teal — trending |
| Phase 3 | `#6b4c9a` | `--phase3` | Purple — AI/cleared product |

### Color Rules

- **Backgrounds are always white or near-white.** Never dark backgrounds.
- **Teal is the NeoTherm brand color.** Use it for accents, links, active states, and the top gradient bar. Never as a background fill.
- **Phase colors** (blue → teal → purple) show progression. Use consistently across all materials.
- **Colored icon backgrounds** use the Light variant (e.g., `--red-light` background with `--red-clinical` icon). Never saturated backgrounds.
- **Text is always dark on light.** Ink on white/surface. Never reverse (light on dark).

## Typography

| Role | Font | Weight | Size (slides) | Size (docs) |
|------|------|--------|---------------|-------------|
| Display / Slide Heading | Instrument Serif | 400 (regular) | 48–72px | 2.4rem |
| Section Title | Instrument Serif | 400 | 32–40px | 1.6rem |
| Body | DM Sans | 400 | 20–24px | 0.92rem |
| Body Emphasis | DM Sans | 600 | 20–24px | 0.88rem |
| Label / Metadata | JetBrains Mono | 500 | 12–14px | 0.7rem |
| Code / Protocol | JetBrains Mono | 400 | 14–16px | 0.72rem |

### Google Fonts Import

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

### Typography Rules

- **Instrument Serif** is ONLY for headings and display text. It has character and warmth — it says "we're rigorous but human." Never use it for body text.
- **DM Sans** is the workhorse. Clean, modern, medical-appropriate. Use for all body copy, descriptions, card content.
- **JetBrains Mono** is for technical content: labels, section numbers, protocol names (HL7v2, FHIR R4), code samples, badges. The monospace says "this is precise, technical, trustworthy."
- **Labels are always uppercase, letter-spaced.** JetBrains Mono, 500 weight, `letter-spacing: 0.1–0.12em`, `text-transform: uppercase`. This is the "section number" pattern (e.g., "SECTION 01", "PHASE 1", "NICU BEDSIDE").
- **Never bold Instrument Serif.** It only comes in 400 weight. Its elegance IS the weight.

## Layout Patterns

### Slide Layout (for pitch deck screenshots)

- **Canvas:** 1920 x 1080px (16:9)
- **Margins:** 120px left/right, 80px top/bottom
- **One idea per slide.** If you need bullet points, you have too much content.
- **Dominant visual element:** Each slide has ONE thing your eye goes to first — a diagram, a number, a body outline, a flow. Text supports the visual, not the other way around.

### Document Layout (for the architecture page style)

- **Max content width:** 1200px, centered
- **Section spacing:** 3.5rem between sections
- **Card pattern:** White card on `--surface` background, 1px `--border`, `border-radius: 6–10px`
- **Top accent bar:** 3px gradient (`--teal` → `--blue` → `--phase3`) at top of primary card

### Spatial Rules

- **Generous whitespace.** When in doubt, add more space. Clinical documents breathe.
- **Left-aligned hierarchy.** Labels above titles above descriptions. Never center-align body text.
- **Dashed borders** for separating architectural layers (1px dashed `--border`)
- **Solid borders** for card edges (1px solid `--border`)

## Component Patterns

### Section Header
```
[JetBrains Mono, uppercase, teal, 0.7rem, letter-spaced] SECTION 01
[Instrument Serif, ink, 1.6rem] Section Title Here
[DM Sans, ink-muted, 0.92rem, max-width 640px] Brief description text.
```

### Phase Badge
```
[JetBrains Mono, 0.68rem, colored background + text matching phase]
Background: phase color at 10% opacity
Text: phase color at full
Border-radius: 3px
Padding: 0.15rem 0.4rem
```

### Architecture Node (clickable card)
```
Surface background (#f8f9fb)
1px border (--border)
6px border-radius
On hover: teal border, subtle teal glow (0 0 0 3px rgba(13,138,138,0.08)), translateY(-1px)
On active: teal border, teal-light background
Contains: colored icon (28x28, rounded), title (DM Sans 600), subtitle (DM Sans 400, ink-muted), phase badge
```

### Icon Color System
Each architectural layer gets a color:
- Camera/sensor = red-clinical on red-light
- Edge compute = amber on amber-light
- Device middleware = blue on blue-light
- Integration engine = green-clinical on green-light
- EHR/Epic = teal-deep on teal-light
- FHIR/modern = phase3 (#6b4c9a) on light purple (#f0e8f7)

### Protocol Label
```
[JetBrains Mono, 0.6rem, teal, centered]
"HL7v2 ORU  |  FHIR R4"
```

### Code Block (HL7v2 / FHIR)
```
Background: --ink (#1a2332)
Font: JetBrains Mono, 0.72rem
Line-height: 1.7
Padding: 1.25rem
Border-radius: 6px
Syntax colors:
  Segments/keys: #7ec8e3 (light blue)
  Field names: #f0c674 (gold)
  Values: #a3d9a5 (green)
  Comments: #636e7b (gray)
```

## Animation

- **Page load:** `fadeUp` animation (opacity 0→1, translateY 12px→0) with staggered delays (0.1s, 0.2s, 0.3s per section)
- **Hover states:** 0.2s ease transitions on border-color, box-shadow, transform
- **No gratuitous animation.** Clinical precision means things appear cleanly, not flashily.

## What NOT To Do

- No dark backgrounds or dark mode
- No purple-on-white gradient (the #1 AI slop cliche)
- No rounded-everything pill shapes
- No emoji in professional slides
- No stock photo backgrounds
- No drop shadows heavier than `0 4px 16px rgba(26,35,50,0.08)`
- No more than 2 accent colors on any single slide
- No center-aligned paragraph text
- No font sizes below 0.68rem (10.9px) in documents or 14px in slides
