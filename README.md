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
git clone https://github.com/your-org/quit-droomscrolling.git
cd quit-droomscrolling

# 2. Install dependencies
npm install

# 3. Start unified dev server (Express backend + Vite frontend on port 3000)
npm run dev

# 4. Open in browser
open http://localhost:3000
```

### Testing the Ingest Flow
- Click **"Upload Resume"** in the top navigation.
- Use the one-click demo presets (*"Senior Full Stack Lead (95% Fit)"*, *"Cloud Architect (92% Fit)"*, or *"Low Confidence Sample"*) or drag and drop any local `.pdf`, `.docx`, or `.txt` file.
- View the multi-step async progress and inspect the parsed profile immediately in the Kanban board.
