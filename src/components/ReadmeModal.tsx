import React from 'react';
import { X, BookOpen, Sparkles, Cpu, Heart, CheckCircle2, Server, EyeOff, Compass } from 'lucide-react';

interface ReadmeModalProps {
  onClose: () => void;
}

export const ReadmeModal: React.FC<ReadmeModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-600 flex items-center justify-center text-white font-serif font-bold text-sm">
              QD
            </div>
            <div>
              <h2 className="font-serif text-sm font-bold tracking-tight">Quit Droomscrolling — Architecture & Humanist Manifesto</h2>
              <p className="text-xs text-stone-400">Mindful Talent Discovery • Human-First Engineering Specification</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 space-y-6 max-h-[calc(100vh-160px)] overflow-y-auto text-xs text-stone-700 leading-relaxed font-sans">
          
          {/* Section 1: The Humanist Core & Why Quit Droomscrolling */}
          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-amber-700" />
              <span>The Anti-Doomscrolling Philosophy</span>
            </h3>
            <p className="text-xs text-amber-950 leading-relaxed font-medium">
              Traditional Applicant Tracking Systems (ATS) encourage recruiters to treat candidates like an endless, disposable social media feed—mindlessly flicking through 200 PDFs in 15 minutes looking for exact keyword tokens. This burns out recruiters and reduces real people with diverse journeys down to cold algorithmic statistics.
            </p>
            <p className="text-xs text-amber-950 leading-relaxed font-medium">
              <strong>Quit Droomscrolling</strong> is engineered to restore mindfulness, clarity, and human connection to hiring. We replace opaque black-box AI rejections with transparent semantic ontologies, clear explainable reasoning, and deliberate human review flags whenever confidence is nuanced.
            </p>
          </div>

          {/* Section 2: Mathematical Scoring Formula */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-amber-700" />
              <span>The Transparent, Explainable Matching Algorithm</span>
            </h3>
            
            <div className="p-3 bg-stone-900 text-amber-300 font-mono text-[11px] rounded-xl border border-stone-800">
              Composite_Score = (Exact_Core_Overlap × 0.45) + (Semantic_Bridge × 0.20) + (Nice_To_Have × 0.20) + (Experience_Fit × 0.15)
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-xl border border-stone-200 bg-[#faf8f5] space-y-1">
                <h4 className="font-bold text-stone-900">1. Exact Core Overlap (45%)</h4>
                <p className="text-[11px] text-stone-600">
                  Direct overlap of essential crafts, tools, and practices extracted cleanly from the candidate's actual work experience.
                </p>
              </div>

              <div className="p-3 rounded-xl border border-stone-200 bg-[#faf8f5] space-y-1">
                <h4 className="font-bold text-stone-900">2. Semantic Similarity Bridge (20%)</h4>
                <p className="text-[11px] text-stone-600">
                  Understands equivalent domain experience (e.g. recognizing that building with "FastAPI" directly validates "Python backend").
                </p>
              </div>

              <div className="p-3 rounded-xl border border-stone-200 bg-[#faf8f5] space-y-1">
                <h4 className="font-bold text-stone-900">3. Growth & Complementary Skills (20%)</h4>
                <p className="text-[11px] text-stone-600">
                  Celebrates curiosity and secondary tools without disqualifying candidates who bring fresh, alternative backgrounds.
                </p>
              </div>

              <div className="p-3 rounded-xl border border-stone-200 bg-[#faf8f5] space-y-1">
                <h4 className="font-bold text-stone-900">4. Experience & Journey Fit (15%)</h4>
                <p className="text-[11px] text-stone-600">
                  Balanced evaluation of career tenure with graduated curve calculations so promising developers aren't arbitrarily dropped.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Architecture & Tech Stack */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-amber-700" />
              <span>Full-Stack Architecture & Resilience</span>
            </h3>

            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-stone-900">Backend Processing Engine:</strong> Unified Express server on port 3000 running TypeScript via <code>tsx</code>. Supports binary document parsing for PDF buffers via <code>pdf-parse</code> and Word documents via <code>mammoth</code>.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-stone-900">Non-blocking Asynchronous Ingest:</strong> Document uploads receive an instant 202 Accepted with a correlation task ID, running parsing in the background without freezing the UI.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-stone-900">Human-in-the-Loop Safeguards:</strong> When ambiguous titles or contact formats are detected, candidates are flagged for "Human Review" so automated systems never silently discard an applicant.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-stone-900">Frictionless Public Candidate Scheduling:</strong> Candidates select conversation slots without forced account creations, password walls, or invasive tracking cookies.
                </div>
              </li>
            </ul>
          </div>

          {/* Section 4: Known Limitations */}
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/90 space-y-2">
            <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
              Continuous Improvement Roadmap
            </h3>
            <p className="text-[11px] text-stone-600 leading-relaxed">
              • For image-only scans or flattening PDFs lacking standard text layers, OCR pipelines via Tesseract or Vision API are bridged.
              <br />
              • High-volume team deployments support database syncing across Firestore or PostgreSQL without altering the mindful user experience.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between">
          <span className="text-[11px] text-stone-500">Quit Droomscrolling • Human-First ATS</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition shadow-xs"
          >
            Close Manifesto
          </button>
        </div>

      </div>
    </div>
  );
};
