# KLN — Kampus Luar Negeri

> **"Satu rencana, banyak kampus dunia."** | **"One plan, campuses around the world."**

Official web application for **KLN (Kampus Luar Negeri)**, a study-abroad planning and placement service for Indonesian students operated by **PT Talenta Nusantara Advisory (TNA Group)** under the **GlobalBridger.ID** brand, in partnership with **PT Aspectama Nusantara**.

---

## Features & Architecture

- **Framework**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS v3.
- **Design System**: Complete KLN visual identity (`#1B3F6B` Deep Academic Navy, `#2E9E91` Horizon Teal, `#F8F7F4` Warm Ivory, `Montserrat` ExtraBold 800 + `Plus Jakarta Sans` 400–700) with Light and Dark mode (`data-theme="light" | "dark"`).
- **Interactive 3D Orthographic Hero Globe**: HTML5 Canvas orthographic globe centered on Indonesia (`115°E, -2°S`) with animated paper planes flying along great-circle arcs to 10 global destinations, arrival rings, country badges, pause/play control, and `prefers-reduced-motion` support.
- **527 Partner Universities Directory (`/destinasi`, `/en/destinations`)**:
  - Instant search, country filter tabs (`US`, `UK`, `AU`, `CA`, `NZ`, `IE`, `MY`), and interactive Shortlist drawer persisted in `localStorage`.
  - Unverified tuition/program details strictly display *"Hubungi konselor"* (ID) / *"Contact an advisor"* (EN).
- **Aura AI Initial Assistant (`/api/aura` + `<AuraChat />`)**:
  - Bilingual (ID/EN) chat widget with quick-question chips and free-text conversation.
  - Enforces KLN's Aura System Prompt guardrails: crisis protocol (`119 ext 8`), PII protection, no unverified fee figures, no acceptance/visa guarantees, and transparent disclosure of Aspectama (visa) and GlobalReadiness.ID / GRID (essay & interview prep).
- **22 Bilingual FAQs (`/faq`, `/en/faq`)**:
  - Category filtering and live search across all 6 official FAQ categories.
- **Consultation Form & WhatsApp Handoff (`/api/consultation` + `<ConsultationForm />`)**:
  - Captures student profile + shortlisted campuses and generates a pre-filled WhatsApp message to KLN's official number (`+1 602 600 5671`).
- **Legal Pages (`/privasi`, `/syarat`, `/en/privacy`, `/en/terms`)**:
  - Bilingual Privacy Policy (aligned with Indonesia's PDP Law No. 27/2022) and Terms of Use.

---

## Getting Started (Local Development & Vercel)

```bash
# Install dependencies
npm install

# Start Next.js 14 development server
npm run dev

# Production build
npm run build
npm start
```

### Zero-Dependency Preview Server
For environments without external npm registry access, a standalone Node.js preview server is also included:

```bash
node preview-server.mjs
```

---

## Directory Structure

```text
├── docs/                        # Official KLN Context, Aura Prompts & Design System specs
├── public/
│   ├── data/
│   │   ├── topo-land.json       # GeoJSON land polygons for the 3D Hero Globe
│   │   └── unis_clean.json      # 527 partner universities dataset
│   └── logos/                   # Official KLN SVG lockups (Navy & White)
├── src/
│   ├── app/
│   │   ├── api/aura/route.ts    # Aura AI Assistant API route with safety guardrails
│   │   ├── api/consultation/    # Consultation form & WhatsApp handoff API route
│   │   ├── destinasi/page.tsx   # Partner Universities directory (ID)
│   │   ├── faq/page.tsx         # 22 Bilingual FAQs (ID)
│   │   ├── privasi/page.tsx     # Privacy Policy (ID)
│   │   ├── syarat/page.tsx      # Terms of Use (ID)
│   │   ├── en/                  # English route aliases (/en, /en/destinations, /en/faq, etc.)
│   │   ├── globals.css          # KLN CSS custom properties & utilities
│   │   ├── layout.tsx           # Root layout with Google Fonts & AppProvider
│   │   └── page.tsx             # Main landing page
│   ├── components/              # Modular React components (Navbar, HeroGlobe, AuraChat, etc.)
│   ├── context/AppContext.tsx   # Language (ID/EN), Theme (Light/Dark), and Shortlist state
│   └── data/                    # Typed datasets (unis.ts, destinations.ts, faq.ts, i18n.ts, legal.ts)
└── tailwind.config.ts           # Tailwind CSS v3 config mapped to KLN design tokens
```
