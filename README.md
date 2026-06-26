# Product Requirements Document (PRD)
## Next-Gen AI Platform — Premium SaaS Landing Page

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Technical Stack & Constraints](#2-technical-stack--constraints)
3. [Page Architecture & Layout](#3-page-architecture--layout)
4. [Feature Specifications](#4-feature-specifications)
5. [Motion & Animation System](#5-motion--animation-system)
6. [SEO & Semantic HTML Requirements](#6-seo--semantic-html-requirements)
7. [Performance Requirements](#7-performance-requirements)
8. [Asset Compliance](#8-asset-compliance)
9. [Scoring Rubric](#9-scoring-rubric)
10. [Disqualification Criteria](#10-disqualification-criteria)
11. [Submission Checklist](#11-submission-checklist)

---

## 1. Project Overview

| Field         | Detail                                          |
|---------------|-------------------------------------------------|                          |
| **Objective** | Build a premium, high-converting, responsive landing page for an advanced AI-driven data automation platform |

### Goals
- Demonstrate architectural integrity and engineering discipline under time pressure
- Showcase engineering speed, motion choreography, and SEO hygiene
- Produce a fully deployed, publicly accessible, production-quality SaaS landing page

---

## 2. Technical Stack & Constraints

### Allowed Frameworks (choose one)
- React
- Next.js
- Vue
- Nuxt
- SolidJS
- Angular
- Vanilla JS

### Allowed Styling Tools
- Tailwind CSS
- Bootstrap
- Custom CSS (pure CSS variables)

### Banned Libraries — **Scoped to Feature 2 & Core Components**

> ⚠️ **Scope Clarification (directly from source):** The "You Cannot" section scopes the UI/animation library ban specifically *"for Feature 2"*. The Disqualification Criteria extends this to *"core components"*. The ban does **not** apply globally to every npm dependency in the project.

| Category | Banned Examples | Scope |
|---|---|---|
| Pre-built UI Components | Shadcn, Radix, HeadlessUI | Feature 2 ("You Cannot" section) |
| Runtime Animation Engines | Framer Motion | Feature 2 ("You Cannot" section) |
| Pre-built UI Component Libraries | Radix, Shadcn, Tailwind UI, Framer Motion | Core components (Disqualification Criteria) |

> **Rule (verbatim from source):** *"All structures and transitions must be written from scratch."*

### Permitted
- **3D Frameworks:** Three.js and equivalent are fully permitted to enhance visual components
- **Deployment:** Any cloud platform (Vercel, Netlify, GitHub Pages, etc.)
- **Animation:** Hardware-accelerated native CSS Transitions/Animations or the Web Animations API (WAAPI) only
- **Utility CSS:** Tailwind CSS, Bootstrap, or pure custom CSS variables are completely welcome

---

## 3. Page Architecture & Layout

> **Source:** The brief explicitly requires these four areas to be woven together: **Hero area**, **technical Feature showcase**, **structured Pricing tier matrix**, and **social proof**. Header/Navigation and Footer are `[INFERRED]` as standard SaaS page conventions but are not explicitly mandated in the brief.

The landing page must naturally weave together the following sections with **strict semantic HTML**:

| Section | Semantic Tag | Source Status |
|---|---|---|
| Hero Area | `<section>` | ✅ Explicitly required |
| Feature Showcase | `<section>` | ✅ Explicitly required |
| Pricing Tier Matrix | `<section>` | ✅ Explicitly required |
| Social Proof | `<section>` | ✅ Explicitly required |
| Site Header / Navigation | `<header>` | `[INFERRED]` |
| Footer | `<footer>` | `[INFERRED]` |

### Layout Flow (Creative Discretion Allowed)
- The **exact layout flow, copy, and visual storytelling** are left entirely to the developer's creative discretion
- The interface must maintain a highly cohesive, premium SaaS aesthetic
- All four required areas must be present and naturally integrated

---

## 4. Feature Specifications

---

### Feature 1: Matrix-Driven Pricing & Performance-Isolated Currency Switcher

#### 4.1.1 The Blueprint (verbatim from source)
A pricing tier component that toggles between Monthly and Annual billing cycles across three currencies: INR (₹), USD ($), and EUR (€).

#### 4.1.2 Billing Cycles
- Monthly
- Annual — with a **flat 20% annual discount multiplier** applied

#### 4.1.3 Supported Currencies
| Currency | Symbol |
|---|---|
| INR | ₹ |
| USD | $ |
| EUR | € |

#### 4.1.4 Data Logic (verbatim from source)
Final values must be computed dynamically using a **multi-dimensional configuration object/matrix** that factors in:
1. A **base tier rate**
2. A **flat 20% annual discount multiplier**
3. **Regional tariff variables**

No hardcoded UI values are permitted under any circumstances.

#### 4.1.5 State Isolation Requirement ⚠️ Critical
- Changing the **currency dropdown** must **not** re-render the parent component or surrounding layout blocks
- Changing the **billing toggle** must **not** trigger global state reflows
- All updates must be **strictly isolated to the localized DOM text nodes** containing the price strings
- Evaluation: Chrome DevTools — points docked **instantly** if global components reflow

#### 4.1.6 Pricing Tiers
> `[INFERRED]` The source does not specify a minimum tier count or tier names. A standard three-tier structure (e.g., Starter / Pro / Enterprise) is industry convention for a SaaS pricing matrix.

---

### Feature 2: Bento-to-Accordion Wrapper with State Persistence

#### 4.2.1 The Blueprint (verbatim from source)
Present the core features via a modern **Bento-Grid layout on desktop**. On mobile viewports, this component must refactor into a **fluid, touch-optimized Accordion list**.

#### 4.2.2 Desktop Layout: Bento Grid
- Modern Bento-Grid presenting platform features
- Each feature occupies a "bento-node"
- Hover/interaction state on each node must be tracked (active index)

#### 4.2.3 Mobile Layout: Accordion
- Below the mobile breakpoint, the Bento Grid refactors into an Accordion list
- Must be touch-optimized and fluid
- All transitions written from scratch — zero external libraries

#### 4.2.4 Context Lock Constraint ⚠️ Critical (verbatim from source)

> *"If a user is actively hovering over or interacting with a specific bento-node on desktop and abruptly resizes the browser window past the mobile breakpoint, your application must programmatically transfer that exact active index context over to the mobile Accordion state, ensuring the corresponding panel is open smoothly upon layout transition."*

**Implementation requirements:**
- Track the currently active bento-node index at all times
- Listen for `window resize` events crossing the mobile breakpoint threshold
- On crossing: transfer active index → open corresponding accordion panel smoothly

> ⚠️ **Direction Correction vs. v1.0 PRD:** The original source **only specifies the desktop→mobile direction**. The previous PRD version incorrectly stated *"State must persist in both directions (desktop→mobile and mobile→desktop)"*. The mobile→desktop reverse transfer is `[INFERRED]` and not mandated by the brief.

#### 4.2.5 Zero-Dependency Rule
- Presence of any banned external library (Radix, Shadcn, HeadlessUI, Framer Motion, etc.) in Feature 2 = **automatic 0/10** for this entire section
- All structures and transitions must be written from scratch

---

## 5. Motion & Animation System

All motion must use **hardware-accelerated native CSS Transitions/Animations or WAAPI only**. Runtime CSS-in-JS animation engines are banned.

### 5.1 Timing Specifications — From Source (Two Categories Only)

> ⚠️ **Correction vs. v1.0 PRD:** The original source defines exactly **two** motion timing categories. The previous PRD version incorrectly added two extra rows ("Bento-to-Accordion layout refactor" and "Accordion panel open/close") as separate entries. Those are `[INFERRED]` applications of the "Structural Layout Reflows" category, not distinct source-defined categories.

| Motion Category | Duration | Easing | Source |
|---|---|---|---|
| Micro-interactions (Hovers/Toggles) | 150ms – 200ms | `ease-out` | ✅ Explicitly stated |
| Structural Layout Reflows | 300ms – 400ms | `ease-in-out` | ✅ Explicitly stated |
| *(Bento-to-Accordion refactor)* | *300ms – 400ms* | *`ease-in-out`* | `[INFERRED]` — falls under Structural Reflows |
| *(Accordion panel open/close)* | *300ms – 400ms* | *`ease-in-out`* | `[INFERRED]` — falls under Structural Reflows |

### 5.2 Entry / Loading Sequence (verbatim from source)
- Must **not block semantic HTML indexing**
- Must **not delay Time to Interactive (TTI)**
- Must **not exceed a total orchestration timeline of 500ms**

### 5.3 Reference Asset — ⚠️ File Name Inconsistency in Source

> **Source document inconsistency flagged:** The original PDF uses **two different file names** for the motion reference video:
> - In the **Provided Assets** section: `demo.mp4`
> - In the **"You Can"** section: `reference_showcase.mp4`
> - In the **Scoring** section: `demo.mp4`
>
> These almost certainly refer to the **same file** with an inconsistency in the brief. The asset package drive should be checked for the actual filename. Both names are documented here.

| Reference | Named In |
|---|---|
| `demo.mp4` | Provided Assets list + Scoring section |
| `reference_showcase.mp4` | "You Can" / Replicate Motion section |

Replicate transitions, layout animations, and micro-interactions as closely as architecture permits to score maximum motion accuracy points.

---

## 6. SEO & Semantic HTML Requirements

### 6.1 Semantic Tag Usage (from source)

> The source explicitly calls out `<main>`, `<header>`, `<section>`, and warns against deep `<div>` nesting. Additional tags below are `[INFERRED]` best practices.

| Element | Usage | Source Status |
|---|---|---|
| `<main>` | Primary page content wrapper | ✅ Explicitly mentioned |
| `<header>` | Site header | ✅ Explicitly mentioned |
| `<section>` | Each distinct page section | ✅ Explicitly mentioned |
| `<nav>` | Navigation menus | `[INFERRED]` |
| `<footer>` | Site footer | `[INFERRED]` |
| `<h1>` – `<h6>` | Correct heading hierarchy | `[INFERRED]` |
| `<ul>` / `<ol>` | Feature lists, navigation | `[INFERRED]` |
| `<article>` | Individual content cards | `[INFERRED]` |

Avoid deep, non-semantic `<div>` nesting — this is explicitly penalised in scoring.

### 6.2 Metadata Requirements (from source)
The scoring criteria require: *"Correct use of standard meta headers, Open Graph (OG) tags, accessible image attributes, and crawlable text nodes."*

```html
<!-- Primary Meta — Required -->
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="description" content="[Compelling page description]" />

<!-- Open Graph (OG) Tags — Required -->
<meta property="og:title" content="[Page Title]" />
<meta property="og:description" content="[Page Description]" />
<meta property="og:image" content="[OG Image URL]" />
<meta property="og:url" content="[Canonical URL]" />
<meta property="og:type" content="website" />
```

> `[INFERRED]` Twitter Card tags, canonical link, and robots meta are standard SEO hygiene and strongly recommended, though not explicitly named in the brief.

### 6.3 Image Accessibility (from source)
- All images must have accessible `alt` attributes — this is explicitly required under "SEO Hygiene & Metadata"

### 6.4 Crawlability (from source)
- All pricing text must live in **crawlable text nodes** — explicitly required
- Critical content must not be hidden from crawlers

---

## 7. Performance Requirements

### 7.1 Hard Limits (from source)

| Constraint | Limit | Source |
|---|---|---|
| Total entry animation orchestration timeline | ≤ 500ms | ✅ Explicitly stated |
| TTI delay from animations | Zero | ✅ Explicitly stated |
| Semantic HTML indexing blockage | Zero | ✅ Explicitly stated |
| Global re-renders on currency/billing interaction | Zero | ✅ Explicitly stated |

### 7.2 Responsive Breakpoints

> ⚠️ The source **does not specify pixel values** for breakpoints. It only references "mobile viewports" and "the mobile breakpoint." The values below are `[INFERRED]` industry-standard Tailwind/Bootstrap conventions.

| Breakpoint | Viewport | Source Status |
|---|---|---|
| Mobile | < 768px | `[INFERRED]` |
| Tablet | 768px – 1024px | `[INFERRED]` |
| Desktop | > 1024px | `[INFERRED]` |

**Required behaviour (from source):**
- Clean, flawless layout adaptation across mobile, tablet, and desktop viewports
- No horizontal clipping at any breakpoint
- No overlapping typography
- Bento Grid on desktop; Accordion on mobile

### 7.3 Chrome DevTools Compliance (verbatim evaluation warning from source)
> *"Codebases that trigger excessive layout thrashing, component mount-flashing, or unnecessary global re-renders under Chrome DevTools performance tracking will be heavily penalized."*

---

## 8. Asset Compliance

All provided assets from **`asset_package.zip`** must be meaningfully and completely integrated. Missing or unused assets incur **heavy point deductions**.

### 8.1 Required Asset Categories

| Asset | Usage Requirement | File / Source |
|---|---|---|
| **SVG Pack** | Use provided SVG UI elements while building. No external SVG/icon resources permitted. | From `asset_package.zip` |
| **Font List** | Configure exactly two primary font families via CSS/Head layers | From `asset_package.zip` |
| **Color Palette** | Pre-defined hex codes — exact aesthetic constraints. No off-palette colors. | From `asset_package.zip` |
| **Motion Reference Video** | Replicate demonstrated transitions and micro-interactions | `demo.mp4` / `reference_showcase.mp4` (see §5.3) |

### 8.2 External Resource Policy (from source)
- Cannot use any external resources for SVGs — only the provided SVG pack
- Font families must be from the provided font list only
- Color must strictly follow the provided hex palette

---

## 9. Scoring Rubric

**Total: 100 Points**

### Category 1: Logic, Architecture & State Isolation — 40 Points

| Sub-criterion | Points | Description (from source) |
|---|---|---|
| Feature 1 Completion | 15 pts | Dynamic multi-currency pricing calculation using a multi-dimensional matrix without hardcoded UI values. |
| Re-render & State Isolation Guardrail | 15 pts | Strict evaluation via Chrome DevTools. Full points only if billing/currency changes isolate updates to targeted text nodes. Points docked **instantly** if global components reflow. |
| Feature 2 Completion & Zero-Dependency Rule | 10 pts | Responsive Bento-to-Accordion with automatic index context tracking on window resize. Presence of banned external libraries = **automatic 0/10**. |

### Category 2: SEO Optimization & Semantic HTML Structure — 30 Points

| Sub-criterion | Points | Description (from source) |
|---|---|---|
| Semantic DOM Layout | 15 pts | Clean markup using appropriate semantic tags (`<main>`, `<header>`, `<section>`, etc.) over deep, non-semantic `<div>` nesting. |
| SEO Hygiene & Metadata | 10 pts | Correct use of standard meta headers, Open Graph (OG) tags, accessible image attributes, and crawlable text nodes. |
| Loading Sequence Performance | 5 pts | Complete execution of the initial loader and entry orchestration within the strict 500ms threshold without delaying TTI. |

### Category 3: UI/UX Usability & Motion Matching — 30 Points

| Sub-criterion | Points | Description (from source) |
|---|---|---|
| Asset Compliance & Design Polish | 15 pts | Meaningful, complete integration of all asset categories from `asset_package.zip` (SVG Pack, Fontlist, Color Palette). Missing/unused assets = heavy deductions. |
| Breakpoint Fluidity | 10 pts | Clean, flawless layout adaptation across mobile, tablet, and desktop viewports without horizontal clipping or overlapping typography. |
| Motion Accuracy | 5 pts | Polish of hover states, easing configurations, and structural replication accuracy from the provided `demo.mp4`. |

---

## 10. Disqualification Criteria

Any of the following results in **immediate disqualification**:

| # | Criterion | Detail (from source) |
|---|---|---|
| 1 | **Invalid or Broken Repository Link** | Broken, non-existent, or private GitHub repository link that prevents the evaluation team from auditing your source code |
| 2 | **Deployment Failures (404 / 500 Errors)** | Live hosted link resolves to 404 Not Found, 500 Internal Server Error, or fails to build/load entirely during the evaluation window |
| 3 | **Plagiarism & Code Duplication** | Codebases that match another contestant's repository, identical forks, or lifting complete, unmodified boilerplates |
| 4 | **Empty or Mock Repositories** | Repository that only contains placeholder configuration templates without actual feature source code |
| 5 | **Banned Component Libraries** | Presence of pre-built UI or animation libraries (e.g., Radix, Shadcn, Tailwind UI, Framer Motion) in your dependency configuration for the core components |
| 6 | **Hardcoded Feature Metrics** | Hardcoding the structural values for the currency and billing engine instead of mapping a dynamic multi-dimensional configuration matrix |

---

## 11. Submission Checklist

### Deliverables
- [ ] Public GitHub repository link (non-private, non-broken, source code present)
- [ ] Live deployment link (resolves with no 404/500 errors during evaluation window)
- [ ] Demo video — Drive link, **≤ 100MB**

### Feature 1: Pricing Switcher
- [ ] Monthly / Annual billing toggle implemented
- [ ] INR (₹), USD ($), EUR (€) currency switcher implemented
- [ ] Prices dynamically computed from multi-dimensional config matrix — zero hardcoded UI values
- [ ] 20% annual discount applied as a multiplier via the matrix
- [ ] Regional tariff variables factored into matrix calculation
- [ ] Currency/billing changes verified in Chrome DevTools — **no parent re-renders**
- [ ] All updates isolated strictly to price text nodes in the DOM

### Feature 2: Bento-to-Accordion
- [ ] Desktop: Bento Grid layout implemented
- [ ] Mobile: Accordion layout implemented (touch-optimized, fluid)
- [ ] Active bento-node index tracked at all times
- [ ] `window resize` listener detects mobile breakpoint crossing
- [ ] Active index transferred to Accordion → corresponding panel opens smoothly (desktop→mobile)
- [ ] Zero external UI/animation libraries used in Feature 2 (zero-dependency rule)
- [ ] All accordion and bento transitions written in native CSS or WAAPI from scratch

### Motion & Animation
- [ ] Micro-interactions (hovers/toggles): 150–200ms ease-out
- [ ] Structural layout reflows: 300–400ms ease-in-out
- [ ] Total entry animation orchestration completes within 500ms
- [ ] Entry animations do not block semantic HTML indexing
- [ ] Entry animations do not delay TTI
- [ ] No runtime CSS-in-JS animation engines in any motion sequence
- [ ] No layout thrashing or component mount-flashing

### SEO & Semantic HTML
- [ ] `<main>`, `<header>`, `<section>` used correctly (explicitly required)
- [ ] No unnecessary deep `<div>` nesting
- [ ] Standard meta headers present (`charset`, `viewport`, `description`)
- [ ] Open Graph (OG) tags complete
- [ ] All images have meaningful `alt` attributes
- [ ] All pricing text is in crawlable HTML text nodes (not canvas/image-only)

### Assets
- [ ] SVGs from the provided pack used — no external icon/SVG libraries
- [ ] Both required font families configured via CSS/Head layers
- [ ] Strictly provided palette hex codes used throughout — no off-palette colors
- [ ] Motion from `demo.mp4` / `reference_showcase.mp4` replicated as closely as possible

### Performance
- [ ] Chrome DevTools audit passed — no layout thrashing
- [ ] Chrome DevTools audit passed — no component mount-flashing
- [ ] Chrome DevTools audit passed — no global re-renders on pricing interactions
- [ ] Entry sequence confirmed within 500ms

---

## 12. Implementation Status

Built as a from-scratch **Vanilla JS** page (`public/index.html`, `public/styles.css`, `public/app.js`) served by Express. Branch: `feat/saas-landing-page` (MR !1).

### Done (in code)
- [x] Page architecture: semantic `<header>`/`<nav>`, `<main>`, four `<section>`s (Hero, Features, Pricing, Social proof), `<footer>`
- [x] Feature 1: prices computed from multi-dimensional matrix (base rate x 0.8 annual multiplier x regional tariff); INR/USD/EUR; Monthly/Annual; no hardcoded UI values
- [x] Feature 1: currency/billing changes write only to cached price text nodes via `nodeValue` (no parent re-render)
- [x] Feature 2: Bento grid (desktop) + Accordion (<768px); active index tracked; desktop->mobile resize transfers index and opens matching panel
- [x] Feature 2: zero external UI/animation libraries; accordion height animation written from scratch
- [x] Motion: native CSS only — 175ms ease-out micro, 350ms ease-in-out structural; entry loader dismissed ~250ms (<500ms); `prefers-reduced-motion` honored
- [x] SEO: charset/viewport/description, full Open Graph + Twitter tags, canonical, robots, `alt`/`aria`, crawlable pricing nodes
- [x] Assets: provided palette (`#F1F6F4`, `#D9E8E2`, `#114C5A`, `#172B36`), JetBrains Mono + Inter fonts, provided `SVG/` pack (served at `/SVG`)

### Pending (manual / out of agent scope)
- [ ] Public live deployment link (no 404/500) — §10
- [ ] Chrome DevTools verification: no global re-renders / layout thrashing — §4.1.5 / §7.3
- [ ] Confirm exact SVG/font/palette match vs. asset package; add `demo.mp4` motion reference — §5.3 / §8