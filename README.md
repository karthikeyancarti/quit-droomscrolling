# Quit Droomscrolling — Human-First ATS & Mindful Hiring Platform

> A mindful, human-first Applicant Tracking System designed to end resume doomscrolling and opaque automated rejections. Delivers transparent, explainable alignment perspectives with warm typography, respectful scheduling, and zero algorithmic discard.

---

## Why Quit Droomscrolling?

Standard recruiting software forces hiring teams into infinite scrolling through endless keyword-stuffed resumes while ghosting candidates and relying on black-box ranking algorithms.

**Quit Droomscrolling** counters this burnout with a **human-centered hiring system**:
- **Anti-Doomscroll Pacing:** Clean, thoughtful views that present candidate journeys as holistic stories rather than cold transaction metrics.
- **Transparent, Auditable Alignment:** Every alignment perspective is calculated through deterministic, explainable criteria across core craftsmanship, semantic equivalents, and experience trajectory.
- **Zero Algorithmic Discard:** Ambiguous documents or non-traditional backgrounds are respectfully marked for human review rather than silently rejected.
- **Respectful Scheduling:** Candidates select preferred interview times via a frictionless, public link without requiring account creation.

---

## Architecture & Tech Stack

```
┌────────────────────────────────────────────────────────┐
│               Frontend: React 18 + Vite                │
│  - Warm Editorial Typography (Fraunces & Plus Jakarta) │
│  - Interactive Pipeline with Thoughtful Drag-and-Drop  │
│  - Transparent Alignment Perspective Inspector Drawer  │
│  - Candidate Story Viewer (JSON & Raw Text)            │
│  - Public Candidate Slot Selection Portal              │
│  - Respectful Pipeline Velocity & Flow Analytics       │
└───────────────────────────▲────────────────────────────┘
                            │ REST / JSON (port 3000)
┌───────────────────────────▼────────────────────────────┐
│              Backend: Node.js / Express (TS)           │
│  - Calm Asynchronous Ingest Queue                      │
│  - Binary Parsing: pdf-parse (PDFs) & mammoth (DOCX)   │
│  - Multi-Entity Extractor (Contact, Craft, Journey)    │
│  - Deterministic Semantic Alignment Engine             │
│  - Perspective Switcher (Admin / Recruiter / Host)     │
│  - Public Candidate Scheduling & Respectful Invites    │
└────────────────────────────────────────────────────────┘
```

### Key Technologies
- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, Fraunces serif font.
- **Backend:** Express, TypeScript (executed directly via `tsx`), Multer for document handling.
- **Document Processing:** `pdf-parse` (binary PDF text extraction), `mammoth` (DOCX extraction), text buffer fallback.
- **Semantic Matching:** Clustered skill ontology mapping and cosine-like thresholding for tech stacks, frameworks, and leadership terminology.

---

## The Alignment Perspective Model

The alignment engine rejects arbitrary LLM hallucination in favor of an **auditable composite equation**:

$$\text{Composite Score} = (S_{\text{exact}} \times 0.45) + (S_{\text{semantic}} \times 0.20) + (S_{\text{nice}} \times 0.20) + (S_{\text{exp}} \times 0.15)$$

### 1. Core Craft Requirements ($S_{\text{exact}}$ — 45% Weight)
- Evaluates direct intersection of candidate skills against foundational job requirements.
- Flags gaps clearly so reviewers can explore adjacent growth areas during conversations.

### 2. Semantic Similarity Bridge ($S_{\text{semantic}}$ — 20% Weight)
- Bridges synonymous competencies and related technologies through a semantic cluster ontology:
  - `"Led a team of 4 engineers"` $\rightarrow$ `Team Leadership` (100% confidence)
  - `"FastAPI"` $\rightarrow$ `Python` (85% similarity)
  - `"Next.js"` $\rightarrow$ `React` (85% similarity)
  - `"Terraform"` $\rightarrow$ `DevOps / IaC` (90% similarity)
- Prevents false negatives caused by phrasing differences.

### 3. Complementary & Bonus Strengths ($S_{\text{nice}}$ — 20% Weight)
- Celebrates bonus proficiencies (e.g. GraphQL, Docker, Kubernetes) without penalizing candidates who took different learning paths.

### 4. Journey & Experience Trajectory ($S_{\text{exp}}$ — 15% Weight)
- Compares total professional tenure against the role's baseline expectations.
- Proportional credit ensures candidates with rich non-linear experience are given fair, balanced consideration.

---

## Local Development & Setup

### Prerequisites
- Node.js 18+
- npm 9+

### Quick Start

```bash
# 1. Clone repository
git clone https://github.com/karthikeyancarti/quit-droomscrolling.git
cd quit-droomscrolling

# 2. Install dependencies
npm install

# 3. Start the app
npm run dev

# 4. Open the app in the browser
http://localhost:3000
```

### Production Build

```bash
npm run build
npm run start
```

### Project Structure

```text
quit-droomscrolling/
├── src/                     # React + TypeScript frontend
│   ├── components/         # ATS UI modules and drawers
│   ├── App.tsx             # Main app composition
│   ├── index.css           # Tailwind + custom styling
│   └── types.ts            # Shared app types
├── server/                 # Express backend + parsing logic
│   ├── routes/             # API endpoints
│   ├── auth.ts             # Auth/session helpers
│   ├── db.ts               # Local data layer
│   ├── matcher.ts          # Matching heuristics
│   └── nlp.ts              # Resume parsing and extraction
├── public/                 # Static assets
├── server.ts               # Express server entry point
├── package.json            # Scripts and dependencies
├── vite.config.ts          # Vite config
├── tsconfig.json           # TypeScript config
├── README.md               # Project documentation
├── metadata.json           # App metadata
├── data_quitdroomscrolling.json
└── .env.example            # Environment example file
```

### Demo Workflow

1. Launch the app and choose a recruiter or interviewer role.
2. Review the pipeline board and candidate cards.
3. Upload a resume or use a demo preset.
4. Inspect the explainable match score and candidate journey details.
5. Schedule interviews via the public candidate slot flow.
6. Evaluate whether the candidate should move forward or be routed to human review.

### Environment Notes

- The app is designed for local development and demo usage.
- The backend includes a lightweight JSON-based data layer and file parsing for PDF/DOCX/TXT resumes.
- Social sign-in is presented as a preview-only UI for demo purposes.
- No external production database or auth provider is required for the default setup.

### Deployment Notes

This project is currently structured for local or small-scale deployment using Node.js and Express. For production deployment, you would typically add:
- a real database layer
- secure authentication and session management
- environment variables for secrets
- an object storage or file processing service for uploaded resumes
- CI/CD and container deployment automation

### Related Links

- GitHub: https://github.com/karthikeyancarti/quit-droomscrolling
- LinkedIn: https://www.linkedin.com/in/karthikeyan-d-804269298
- GitHub Profile: https://github.com/karthikeyancarti

---

## Summary

Quit Droomscrolling is a human-first recruiting workflow that replaces endless resume doomscrolling with context, transparency, and respect. It helps hiring teams review candidates more thoughtfully while making the process explainable to both recruiters and applicants.
