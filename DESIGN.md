---
name: Kami Tactile Agency System
colors:
  surface: '#fff9ec'
  surface-dim: '#dfdacd'
  surface-bright: '#fff9ec'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f9f3e6'
  surface-container: '#f3ede0'
  surface-container-high: '#eee8db'
  surface-container-highest: '#e8e2d5'
  on-surface: '#1d1c14'
  on-surface-variant: '#4b463f'
  inverse-surface: '#333028'
  inverse-on-surface: '#f6f0e3'
  outline: '#7c766e'
  outline-variant: '#cdc5bc'
  surface-tint: '#615e5a'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1d1b18'
  on-primary-container: '#87837f'
  inverse-primary: '#cbc5c0'
  secondary: '#a43c20'
  on-secondary: '#ffffff'
  secondary-container: '#fe7e5c'
  on-secondary-container: '#711700'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#101f16'
  on-tertiary-container: '#77887c'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e7e1dc'
  primary-fixed-dim: '#cbc5c0'
  on-primary-fixed: '#1d1b18'
  on-primary-fixed-variant: '#494643'
  secondary-fixed: '#ffdbd2'
  secondary-fixed-dim: '#ffb4a1'
  on-secondary-fixed: '#3c0800'
  on-secondary-fixed-variant: '#84250a'
  tertiary-fixed: '#d5e7d9'
  tertiary-fixed-dim: '#b9cbbd'
  on-tertiary-fixed: '#101f16'
  on-tertiary-fixed-variant: '#3b4a40'
  background: '#fff9ec'
  on-background: '#1d1c14'
  surface-variant: '#e8e2d5'
typography:
  display-hanko:
    fontFamily: Domine
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Domine
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-lg-mobile:
    fontFamily: Domine
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.2'
  body-md:
    fontFamily: Source Sans 3
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-mono:
    fontFamily: Space Mono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: '1.4'
    letterSpacing: 0.05em
  label-caps:
    fontFamily: Source Sans 3
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1'
    letterSpacing: 0.1em
spacing:
  margin-page: 2rem
  gutter-crease: 1px
  stack-sm: 0.5rem
  stack-md: 1.5rem
  stack-lg: 3rem
---

## Brand & Style

The design system is built on the philosophy of "Washi-SaaS"—merging the precision of high-end Go-To-Market strategy with the tactile, organic feel of handcrafted paper. The brand personality is artisanal, deliberate, and authoritative, moving away from digital coldness toward the physical permanence of ink on fiber.

The visual style is **Tactile / Papercraft**. It treats the screen as a physical workspace where information is folded, stamped, and creased. Every UI element must feel like it has weight, texture, and a physical origin. The target audience—executive leaders and founders—should feel they are receiving a bespoke, physical dossier rather than a generic digital dashboard.

## Colors

The palette is derived from natural pigments and raw materials. 
- **Paper (#EDE7DA):** The primary background. It represents a blank, raw state of potential.
- **Ink (#1C1A17):** Used for all primary text and structural lines. It should mimic the slight bleeding of carbon ink into paper fibers.
- **Hanko Red (#B4472A):** An accent color used sparingly (one per screen) as a "seal of approval" or primary call-to-action.
- **Moss (#7A8B7F):** Used for secondary states, success indicators, or organic growth metrics.
- **Kraft (#C9BFA8):** Used for "containers" or cards, providing a subtle layer of depth against the lighter paper background.

## Typography

Typography follows the logic of a printed manuscript.
- **Headlines:** Use **Domine** to replicate a sturdy, ink-stamped slab serif. Headlines should feel authoritative and slightly heavy.
- **Body:** Use **Source Sans 3** for clear communication. It provides a clean, neutral contrast to the expressive headlines.
- **Agent Logs:** Use **Space Mono** for all technical trace data, mimicking the output of a typewriter or a terminal printing on physical paper.
- **The Hanko Seal:** Large display titles may occasionally use the Red accent color to signify the start of a new chapter or a verified output.

## Layout & Spacing

The layout is a **vertical unfolding flow**. It mimics a long scroll of paper or an unfolding letter. 
- **Verticality:** Content moves strictly downward. Horizontal split-screens are avoided unless they represent a physical fold.
- **Crease Lines:** Instead of traditional borders, use 1px lines in Ink (#1C1A17) with 20% opacity to represent folds in the paper.
- **Margins:** Generous page margins (32px+) create the "breath" found in editorial design.
- **Breakpoints:** On mobile, "unfolded" sections stack vertically, and horizontal margins reduce to 16px.

## Elevation & Depth

Depth is achieved through physical manipulation of the paper surface rather than digital light sources.
- **Folded Corners:** Cards and containers use a "dog-ear" or folded-corner shadow. This is a small, sharp triangular shadow at the bottom right to imply the paper is lifting off the surface.
- **Tonal Layering:** The background is Paper (#EDE7DA). Elements "on top" are Kraft (#C9BFA8). This provides depth without using blurs.
- **No Shadows:** Avoid ambient drop shadows. Use only "contact shadows"—thin, dark, and sharp—where two physical surfaces meet or where a fold occurs.

## Shapes

The design system utilizes **Sharp (0)** edges. 
Paper is cut, not molded. All buttons, cards, and input fields must have 0px border-radius to maintain the papercraft aesthetic. Occasional diagonal cuts (chamfered corners) can be used for "Hanko" style buttons to mimic the shape of a traditional stone seal.

## Components

- **The Hanko Seal (Primary Button):** A sharp, rectangular block using Stamped Red (#B4472A) background and Paper (#EDE7DA) text. It is used only for the most important action on the page.
- **Kraft Cards:** Rectangular containers with Kraft (#C9BFA8) backgrounds. Use 1px Ink outlines. The bottom-right corner should have a "lifted" CSS shadow effect.
- **Crease Dividers:** 1px horizontal lines that span the container width. Use Ink at 15% opacity to look like a physical paper fold.
- **Input Fields:** Bottom-border only, mimicking a line on a form. The label sits above in Mono typography.
- **Selection Chips:** Small rectangular boxes with a "checked" mark that looks like a hand-drawn "X" in Ink.
- **Agent Trace:** A block of Kraft-colored paper with a slight "rough" edge texture, containing Space Mono text for AI processing logs.