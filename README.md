# Nexus AI — Frontend Battle 3.0 Hackathon Submission

> A premium, high-converting SaaS landing page for an AI-driven data automation platform — built from scratch with Vanilla JS, semantic HTML, and native CSS animations.

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)
![HTML](https://img.shields.io/badge/HTML5-semantic-orange)
![CSS](https://img.shields.io/badge/CSS3-native%20animations-blue)
![JS](https://img.shields.io/badge/JavaScript-vanilla-yellow)
![Server](https://img.shields.io/badge/Server-Express.js-lightgrey)

---

## 📽️ Demo

> Watch the recorded walkthrough: [`26.06.2026_17.34.23_REC.mp4`](./26.06.2026_17.34.23_REC.mp4)

---

## 🚀 Features

### Feature 1 — Multi-Currency Pricing Matrix
- Toggle between **Monthly** and **Annual** billing (20% annual discount applied via matrix multiplier)
- Switch between **INR (₹)**, **USD ($)**, and **EUR (€)** currencies
- Prices computed from a **multi-dimensional config matrix** (base rate × discount × regional tariff) — **zero hardcoded UI values**
- Updates isolated strictly to **price text nodes** via `nodeValue` — no parent re-renders, verified with Chrome DevTools

### Feature 2 — Bento-to-Accordion Responsive Layout
- **Desktop:** Modern Bento Grid presenting platform features with hover active-index tracking
- **Mobile (<768px):** Automatically refactors into a fluid, touch-optimized Accordion
- On `window resize` crossing the mobile breakpoint, the **active bento-node index is transferred** to the corresponding open accordion panel — smooth, no flash
- **Zero external UI/animation libraries** — all transitions written from scratch in native CSS

### Motion & Animation
- Micro-interactions (hovers/toggles): `175ms ease-out`
- Structural layout reflows: `350ms ease-in-out`
- Entry loader completes in **~250ms** (well under the 500ms threshold)
- `prefers-reduced-motion` fully respected

### SEO & Accessibility
- Semantic HTML: `<header>`, `<nav>`, `<main>`, `<section>`, `<footer>` — no deep `<div>` nesting
- Full **Open Graph** + **Twitter Card** meta tags
- `canonical`, `robots`, `theme-color` tags present
- All images have meaningful `alt` attributes
- All pricing text in **crawlable HTML text nodes**

---

## 🗂️ Project Structure

```
.
├── public/
│   ├── index.html        # Main landing page (semantic HTML)
│   ├── styles.css        # Core design system & layout
│   ├── effects.css       # Animations & motion
│   └── app.js            # Pricing matrix, bento/accordion logic
├── SVG/                  # Provided SVG icon pack
├── server.js             # Express static file server
├── tests/
│   └── server.test.js    # Server tests (Mocha + Supertest)
├── Dockerfile            # Docker support
├── package.json
└── 26.06.2026_17.34.23_REC.mp4   # Demo recording
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Structure | Vanilla HTML5 (semantic) |
| Styling | Pure CSS3 (custom properties, no frameworks) |
| Logic | Vanilla JavaScript (ES6+) |
| Fonts | Inter + JetBrains Mono (Google Fonts) |
| Server | Node.js + Express |
| Testing | Mocha + Supertest |
| Container | Docker |

---

## ⚙️ Getting Started

### Prerequisites
- Node.js ≥ 18
- npm

### Run locally

```bash
# Install dependencies
npm install

# Start the server
npm start
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

### Run tests

```bash
npm test
```

### Run with Docker

```bash
docker build -t nexus-ai .
docker run -p 3000:3000 nexus-ai
```

---

## 🎨 Design System

| Token | Value |
|---|---|
| Background | `#172B36` |
| Surface | `#114C5A` |
| Muted | `#D9E8E2` |
| Light | `#F1F6F4` |
| Primary Font | Inter |
| Mono Font | JetBrains Mono |

---

## ✅ Hackathon Compliance

| Requirement | Status |
|---|---|
| Multi-dimensional pricing matrix (no hardcoded values) | ✅ |
| State isolation — no global re-renders on pricing changes | ✅ |
| Bento Grid (desktop) + Accordion (mobile) | ✅ |
| Active index transfer on resize | ✅ |
| Zero external UI/animation libraries | ✅ |
| Native CSS animations only | ✅ |
| Entry animation < 500ms | ✅ |
| Semantic HTML structure | ✅ |
| Open Graph + Twitter meta tags | ✅ |
| Provided SVG pack integrated | ✅ |
| Provided color palette applied | ✅ |
| Inter + JetBrains Mono fonts | ✅ |

---

## 📄 License

[MIT](./LICENSE) © Md Hussain