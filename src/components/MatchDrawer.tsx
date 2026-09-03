import React from 'react';
import { 
  X, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Clock, 
  Layers, 
  HelpCircle,
  Briefcase,
  User,
  Zap
} from 'lucide-react';
import { Application } from '../types';

interface MatchDrawerProps {
  application: Application | null;
  onClose: () => void;
  onScheduleInterview: (app: Application) => void;
}

export const MatchDrawer: React.FC<MatchDrawerProps> = ({
  application,
  onClose,
  onScheduleInterview
}) => {
  if (!application) return null;

  const candidate = application.candidate;
  const job = application.job;
  const breakdown = application.match_breakdown;

  const getScoreColor = (score: number) => {
    if (score >= 88) return 'text-emerald-700 stroke-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 75) return 'text-amber-800 stroke-amber-600 bg-amber-50 border-amber-200';
    return 'text-stone-700 stroke-stone-500 bg-stone-100 border-stone-200';
  };

  const getScoreGradient = (score: number) => {
    if (score >= 88) return 'from-emerald-600 to-teal-700';
    if (score >= 75) return 'from-amber-600 to-amber-700';
    return 'from-stone-500 to-stone-700';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-900/40 backdrop-blur-xs flex justify-end transition-all">
      <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col border-l border-stone-200 animate-in slide-in-from-right duration-200">
        
        {/* Drawer Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-[#faf8f5]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-800 font-serif font-bold text-sm">
              QD
            </div>
            <div>
              <h2 className="font-serif text-sm font-bold text-stone-900">Explainable Match Intelligence</h2>
              <p className="text-xs text-stone-500">Transparent scoring breakdown & human rationale</p>
            </div>
          </div>
          <button
            id="close-match-drawer"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Candidate & Job Summary Header */}
          <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-stone-50 border border-stone-200/90">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-stone-500">
                <User className="w-3.5 h-3.5" />
                <span>Candidate</span>
              </div>
              <p className="font-serif text-sm font-bold text-stone-900">{candidate?.name || 'Candidate'}</p>
              <p className="text-xs text-stone-500">{candidate?.email || 'No email'}</p>
            </div>

            <div className="h-10 w-px bg-stone-200" />

            <div className="space-y-1 text-right">
              <div className="flex items-center justify-end gap-1.5 text-xs text-stone-500">
                <Briefcase className="w-3.5 h-3.5" />
                <span>Opportunity</span>
              </div>
              <p className="font-serif text-sm font-bold text-stone-900">{job?.title || 'Position'}</p>
              <p className="text-xs text-stone-500">{job?.min_experience_years || 0} years exp expected</p>
            </div>
          </div>

          {/* Primary Score & Explanation Card */}
          <div className="p-5 rounded-2xl border border-stone-200/90 bg-white shadow-2xs">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                  Overall Composite Fit
                </span>
                <h3 className="font-serif text-2xl font-black text-stone-900 mt-0.5">
                  {application.match_score}%
                  <span className="text-xs font-medium text-stone-500 ml-2 font-sans">
                    {application.match_score >= 88 ? 'Strong Potential Fit' : application.match_score >= 75 ? 'Qualified Candidate' : 'Moderate Alignment'}
                  </span>
                </h3>
              </div>

              {/* Visual Ring Badge */}
              <div className={`w-14 h-14 rounded-full flex items-center justify-center font-serif font-black text-lg border-2 ${getScoreColor(application.match_score)}`}>
                {application.match_score}%
              </div>
            </div>

            {/* The narrative explanation */}
            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/70">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 mb-1">
                <Zap className="w-3.5 h-3.5 text-amber-700" />
                <span>Human Fit Rationale:</span>
              </div>
              <p className="text-xs text-amber-950 leading-relaxed font-medium">
                {application.match_explanation}
              </p>
            </div>
          </div>

          {/* Subscores Progress Breakdown */}
          {breakdown && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Transparent Weighted Breakdown
              </h4>

              <div className="grid grid-cols-3 gap-3">
                {/* Exact Core Requirements */}
                <div className="p-3 rounded-xl border border-stone-200 bg-stone-50/60">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-stone-600">Core Must-Haves</span>
                    <span className="font-bold text-stone-900">{breakdown.subscores.exact_score}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-700 rounded-full" 
                      style={{ width: `${breakdown.subscores.exact_score}%` }} 
                    />
                  </div>
                  <span className="text-[10px] text-stone-400 mt-1 block">45% total weight</span>
                </div>

                {/* Semantic Overlap */}
                <div className="p-3 rounded-xl border border-stone-200 bg-stone-50/60">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-stone-600">Semantic Bridge</span>
                    <span className="font-bold text-stone-900">{breakdown.subscores.semantic_score}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-600 rounded-full" 
                      style={{ width: `${breakdown.subscores.semantic_score}%` }} 
                    />
                  </div>
                  <span className="text-[10px] text-stone-400 mt-1 block">20% total weight</span>
                </div>

                {/* Experience Match */}
                <div className="p-3 rounded-xl border border-stone-200 bg-stone-50/60">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-stone-600">Tenure Curve</span>
                    <span className="font-bold text-stone-900">{breakdown.subscores.experience_score}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-600 rounded-full" 
                      style={{ width: `${breakdown.subscores.experience_score}%` }} 
                    />
                  </div>
                  <span className="text-[10px] text-stone-400 mt-1 block">15% total weight</span>
                </div>
              </div>
            </div>
          )}

          {/* Core Skills Match Comparison */}
          {breakdown && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Core Requirements Comparison
              </h4>

              {/* Matched Required Skills */}
              <div className="p-4 rounded-xl border border-stone-200 bg-white space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-stone-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Direct Experience Overlap ({breakdown.exact_required_matched.length})</span>
                  </span>
                  <span className="text-[11px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold border border-emerald-100">
                    Validated
                  </span>
                </div>

                {breakdown.exact_required_matched.length === 0 ? (
                  <p className="text-xs text-stone-400">No exact keyword matches found.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {breakdown.exact_required_matched.map((skill, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-900 border border-emerald-200 font-medium"
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Semantic Skill Bridges */}
              {breakdown.semantic_matches.filter(m => m.type === 'semantic').length > 0 && (
                <div className="p-4 rounded-xl border border-amber-200/80 bg-amber-50/40 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-amber-900 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span>Conceptual & Semantic Bridges (Different Phrasing)</span>
                    </span>
                    <span className="text-[11px] text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full font-semibold">
                      Ontology Understood
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-600">
                    The candidate's real-world wording maps smoothly to role requirements:
                  </p>
                  <div className="space-y-1.5 pt-1">
                    {breakdown.semantic_matches
                      .filter(m => m.type === 'semantic')
                      .map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-xs bg-white p-2.5 rounded-lg border border-stone-200"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-stone-800">"{item.candidate_skill}"</span>
                            <ArrowRight className="w-3 h-3 text-amber-600" />
                            <span className="text-amber-800 font-medium">{item.job_skill}</span>
                          </div>
                          <span className="text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded">
                            {Math.round(item.similarity * 100)}% conceptual fit
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Missing Skills */}
              {breakdown.missing_required.length > 0 && (
                <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/40 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-rose-900 flex items-center gap-1.5">
                      <XCircle className="w-4 h-4 text-rose-500" />
                      <span>Areas for Team Mentorship ({breakdown.missing_required.length})</span>
                    </span>
                    <span className="text-[11px] text-rose-700 bg-rose-100/70 px-2 py-0.5 rounded-full font-semibold">
                      Growth Opportunity
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {breakdown.missing_required.map((skill, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-white text-rose-700 border border-rose-200 font-medium"
                      >
                        <XCircle className="w-3 h-3 text-rose-500" />
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Experience Comparison */}
          {breakdown && (
            <div className="p-4 rounded-xl border border-stone-200 bg-white space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-stone-800 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-stone-500" />
                  <span>Years of Career Journey</span>
                </span>
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                  breakdown.experience_gap >= 0 ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                }`}>
                  {breakdown.experience_gap >= 0 ? `+${breakdown.experience_gap} yrs surplus` : `${breakdown.experience_gap} yrs tenure difference`}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-stone-600 pt-1">
                <div>
                  <span className="text-stone-400">Target Role: </span>
                  <span className="font-bold text-stone-800">{breakdown.experience_required} yrs</span>
                </div>
                <div className="h-4 w-px bg-stone-200" />
                <div>
                  <span className="text-stone-400">Candidate Experience: </span>
                  <span className="font-bold text-stone-800">{breakdown.experience_actual} yrs</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Drawer Footer Actions */}
        <div className="p-4 border-t border-stone-200 bg-[#faf8f5] flex items-center justify-between">
          <span className="text-[11px] text-stone-400">Mindful Talent Review</span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-100 transition"
            >
              Close
            </button>
            <button
              id="match-drawer-schedule-btn"
              onClick={() => {
                onClose();
                onScheduleInterview(application);
              }}
              className="px-4 py-2 rounded-xl bg-amber-700 text-white text-xs font-semibold hover:bg-amber-800 transition flex items-center gap-1.5 shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Schedule Conversation</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
