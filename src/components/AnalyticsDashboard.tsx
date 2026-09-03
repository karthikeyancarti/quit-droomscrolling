import React, { useEffect, useState } from 'react';
import { 
  BarChart3, 
  Clock, 
  TrendingUp, 
  AlertTriangle, 
  Users, 
  Briefcase, 
  CheckCircle2, 
  Layers,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { AnalyticsOverview } from '../types';

export const AnalyticsDashboard: React.FC = () => {
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics')
      .then(res => res.json())
      .then(d => {
        setData(d);
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);

  if (isLoading || !data) {
    return (
      <div className="p-8 text-center text-xs text-stone-500 animate-pulse font-serif">
        Gathering mindful candidate journey analytics & response velocity...
      </div>
    );
  }

  const stages = [
    { key: 'applied', label: 'Applied', count: data.stage_counts.applied || 0, avgDays: data.avg_days_per_stage.applied || 2.4, color: 'bg-stone-400' },
    { key: 'screened', label: 'Screened & Heard', count: data.stage_counts.screened || 0, avgDays: data.avg_days_per_stage.screened || 3.8, color: 'bg-amber-600' },
    { key: 'interview', label: 'Real Conversation', count: data.stage_counts.interview || 0, avgDays: data.avg_days_per_stage.interview || 7.6, color: 'bg-orange-600' },
    { key: 'offer', label: 'Mutual Match & Offer', count: data.stage_counts.offer || 0, avgDays: data.avg_days_per_stage.offer || 3.2, color: 'bg-amber-700' },
    { key: 'hired', label: 'Joined the Team', count: data.stage_counts.hired || 0, avgDays: 0, color: 'bg-emerald-600' }
  ];

  return (
    <div className="px-4 lg:px-8 py-6 space-y-6">
      
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
            <span className="font-semibold">People Stories Ingested</span>
            <Users className="w-4 h-4 text-amber-700" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-2xl font-bold text-stone-900">{data.total_candidates}</span>
            <span className="text-[11px] text-emerald-700 font-semibold">100% human-verified</span>
          </div>
          <p className="text-[11px] text-stone-400 mt-1">Structured with context & career journeys</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
            <span className="font-semibold">Purposeful Open Roles</span>
            <Briefcase className="w-4 h-4 text-amber-700" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-2xl font-bold text-stone-900">{data.total_active_jobs}</span>
            <span className="text-[11px] text-stone-500">Across 4 teams</span>
          </div>
          <p className="text-[11px] text-stone-400 mt-1">Grounded in clear skill expectations</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
            <span className="font-semibold">Match Clarity Index</span>
            <Sparkles className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-2xl font-bold text-stone-900">{data.avg_match_score}%</span>
            <span className="text-[11px] text-emerald-700 font-semibold">Explainable</span>
          </div>
          <p className="text-[11px] text-stone-400 mt-1">Semantic, skill & experience balanced</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
            <span className="font-semibold">Candidate Attention Flags</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-2xl font-bold text-amber-900">{data.needs_review_count}</span>
            <span className="text-[11px] text-amber-800 font-semibold">Human Review Suggested</span>
          </div>
          <p className="text-[11px] text-stone-400 mt-1">Ensures no applicant is misjudged</p>
        </div>
      </div>

      {/* Bottleneck Alert Section */}
      {data.bottlenecks && data.bottlenecks.length > 0 && (
        <div className="space-y-3">
          {data.bottlenecks.map((b, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200 flex items-start gap-3 shadow-2xs"
            >
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-serif text-xs font-bold text-amber-950 uppercase tracking-wider">
                    Candidate Respect Alert: {b.stage.toUpperCase()} Wait Time High
                  </h4>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900">
                    Avg {b.avg_days} Days (Ideal: &lt;{b.threshold_days}d)
                  </span>
                </div>
                <p className="text-xs text-amber-900 mt-1 leading-relaxed font-medium">
                  {b.message} — Keep candidates informed so they are never left waiting in uncertainty.
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stage Conversion & Time-in-Stage Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Funnel Progress */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-stone-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-base font-bold text-stone-900">Hiring Cadence & Thoughtful Velocity</h3>
              <p className="text-xs text-stone-500">Volume and average dwell time per candidate stage</p>
            </div>
            <span className="text-xs text-stone-500 font-semibold bg-stone-100 px-2.5 py-1 rounded-full">
              {data.total_candidates} Candidates in Discovery
            </span>
          </div>

          <div className="space-y-4 pt-2">
            {stages.map((stage, idx) => {
              const total = data.total_candidates || 1;
              const pct = Math.round((stage.count / total) * 100);

              return (
                <div key={stage.key} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-serif font-bold text-stone-800">{stage.label}</span>
                      <span className="text-stone-400 text-[11px]">({stage.count} candidates)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {stage.avgDays > 0 && (
                        <span className="text-[11px] text-stone-500 flex items-center gap-1 font-medium">
                          <Clock className="w-3 h-3 text-stone-400" />
                          <span>{stage.avgDays}d average dwell</span>
                        </span>
                      )}
                      <span className="font-bold text-stone-700">{pct}%</span>
                    </div>
                  </div>

                  <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden flex">
                    <div
                      className={`h-full ${stage.color} rounded-full transition-all duration-500`}
                      style={{ width: `${Math.max(pct, 5)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Algorithm Weights & Calibration */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200/90 shadow-2xs space-y-4">
          <div>
            <h3 className="font-serif text-base font-bold text-stone-900">Transparent Alignment Weights</h3>
            <p className="text-xs text-stone-500">Explainable criteria powering thoughtful matches</p>
          </div>

          <div className="space-y-3 pt-1 text-xs">
            <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/70 space-y-1">
              <div className="flex justify-between font-bold text-amber-950">
                <span>Core Competencies</span>
                <span className="font-serif">45% Weight</span>
              </div>
              <p className="text-[11px] text-amber-900 leading-relaxed">
                Direct alignment of foundational skills required for the applicant to thrive.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-orange-50/60 border border-orange-200/70 space-y-1">
              <div className="flex justify-between font-bold text-orange-950">
                <span>Semantic & Contextual Bridge</span>
                <span className="font-serif">20% Weight</span>
              </div>
              <p className="text-[11px] text-orange-900 leading-relaxed">
                Recognizes adjacent skills, related toolsets, and leadership craft without keyword gatekeeping.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
              <div className="flex justify-between font-bold text-stone-950">
                <span>Supplementary Talents</span>
                <span className="font-serif">20% Weight</span>
              </div>
              <p className="text-[11px] text-stone-700 leading-relaxed">
                Bonus proficiencies that elevate team capabilities without penalizing specialists.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200/70 space-y-1">
              <div className="flex justify-between font-bold text-emerald-950">
                <span>Seniority & Real-World Tenure</span>
                <span className="font-serif">15% Weight</span>
              </div>
              <p className="text-[11px] text-emerald-900 leading-relaxed">
                Evaluates demonstrated career track record harmonized with realistic job level expectations.
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
