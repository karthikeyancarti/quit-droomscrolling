import React from 'react';
import { 
  Sparkles, 
  FileText, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Mail, 
  Briefcase,
  ChevronRight
} from 'lucide-react';
import { Application, Candidate } from '../types';

interface CandidateListViewProps {
  applications: Application[];
  onOpenMatch: (application: Application) => void;
  onOpenCandidate: (application: Application) => void;
  onScheduleInterview: (application: Application) => void;
}

export const CandidateListView: React.FC<CandidateListViewProps> = ({
  applications,
  onOpenMatch,
  onOpenCandidate,
  onScheduleInterview
}) => {
  const getScoreBadge = (score: number) => {
    if (score >= 88) return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    if (score >= 75) return 'bg-amber-50 text-amber-900 border-amber-300';
    return 'bg-stone-100 text-stone-700 border-stone-300';
  };

  const getStageBadge = (stage: string) => {
    switch (stage) {
      case 'applied': return 'bg-stone-100 text-stone-700';
      case 'screened': return 'bg-amber-100 text-amber-900';
      case 'interview': return 'bg-orange-100 text-orange-900';
      case 'offer': return 'bg-amber-100 text-amber-900';
      case 'hired': return 'bg-emerald-100 text-emerald-900';
      case 'rejected': return 'bg-stone-100 text-stone-600';
      default: return 'bg-stone-100 text-stone-700';
    }
  };

  return (
    <div className="px-4 lg:px-8 py-6">
      <div className="bg-white rounded-2xl border border-stone-200/90 shadow-2xs overflow-hidden">
        {/* Table Header */}
        <div className="p-5 border-b border-stone-200 bg-[#faf8f5] flex items-center justify-between">
          <div>
            <h3 className="font-serif text-base font-bold text-stone-900">People & Stories in Review</h3>
            <p className="text-xs text-stone-500">Every application reviewed with dignity, transparent reasoning, and care</p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-stone-100 text-stone-800 border border-stone-200">
            {applications.length} Candidates Under Review
          </span>
        </div>

        {/* Candidate List Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#faf8f5] border-b border-stone-200 text-stone-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4 font-bold">Candidate</th>
                <th className="py-3.5 px-4 font-bold">Role Applied</th>
                <th className="py-3.5 px-4 text-center font-bold">Explainable Fit</th>
                <th className="py-3.5 px-4 font-bold">Skills & Craft</th>
                <th className="py-3.5 px-4 font-bold">Career Tenure</th>
                <th className="py-3.5 px-4 font-bold">Current Stage</th>
                <th className="py-3.5 px-4 text-right font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {applications.map((app) => {
                const candidate = app.candidate;

                return (
                  <tr key={app.id} className="hover:bg-amber-50/30 transition">
                    {/* Candidate Name & Contact */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-900 font-serif font-bold flex items-center justify-center border border-amber-200/60">
                          {candidate?.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span 
                              onClick={() => onOpenCandidate(app)}
                              className="font-serif font-bold text-stone-900 hover:text-amber-800 cursor-pointer"
                            >
                              {candidate?.name}
                            </span>
                            {candidate?.needs_review && (
                              <span title={candidate.review_reason} className="p-0.5 rounded bg-amber-100 text-amber-800">
                                <AlertTriangle className="w-3 h-3" />
                              </span>
                            )}
                          </div>
                          <span className="text-stone-400 text-[11px] block">{candidate?.email}</span>
                        </div>
                      </div>
                    </td>

                    {/* Role Applied */}
                    <td className="py-3.5 px-4 font-medium text-stone-800">
                      {app.job?.title || 'General Discovery'}
                    </td>

                    {/* Fit Score */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => onOpenMatch(app)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border transition hover:opacity-90 ${getScoreBadge(
                          app.match_score
                        )}`}
                      >
                        <Sparkles className="w-3 h-3 text-amber-600" />
                        <span>{app.match_score}%</span>
                      </button>
                    </td>

                    {/* Extracted Skills */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="flex flex-wrap gap-1">
                        {(candidate?.parsed_data?.skills || []).slice(0, 4).map((skill, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                        {(candidate?.parsed_data?.skills || []).length > 4 && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 text-stone-500 font-semibold">
                            +{(candidate?.parsed_data?.skills || []).length - 4}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Experience */}
                    <td className="py-3.5 px-4 font-semibold text-stone-700">
                      {candidate?.parsed_data?.total_years_experience || 0} yrs
                    </td>

                    {/* Pipeline Stage */}
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium capitalize ${getStageBadge(app.stage)}`}>
                        {app.stage}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onOpenMatch(app)}
                          title="View explainable match reasoning"
                          className="p-1.5 rounded-lg hover:bg-stone-100 text-amber-800 transition"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onOpenCandidate(app)}
                          title="View parsed profile & original text"
                          className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-600 transition"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onScheduleInterview(app)}
                          title="Schedule conversation"
                          className="p-1.5 rounded-lg hover:bg-stone-100 text-amber-800 transition"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
