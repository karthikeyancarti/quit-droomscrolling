import React, { useState } from 'react';
import { 
  Sparkles, 
  Calendar, 
  FileText, 
  AlertTriangle, 
  ArrowRight, 
  Clock, 
  Briefcase, 
  CheckCircle2, 
  XCircle,
  GripVertical,
  Plus
} from 'lucide-react';
import { Application, PipelineStage, Job } from '../types';

interface KanbanBoardProps {
  applications: Application[];
  selectedJob: Job | null;
  onMoveStage: (applicationId: string, targetStage: PipelineStage) => void;
  onOpenMatch: (application: Application) => void;
  onOpenCandidate: (application: Application) => void;
  onScheduleInterview: (application: Application) => void;
  onOpenUpload: () => void;
  isLoading?: boolean;
}

const STAGES: { id: PipelineStage; label: string; color: string; bgLight: string; avgDays: string }[] = [
  { id: 'applied', label: 'Applied', color: 'border-stone-300 text-stone-700', bgLight: 'bg-stone-50/60', avgDays: '2.4d' },
  { id: 'screened', label: 'Thoughtful Screen', color: 'border-amber-300 text-amber-800', bgLight: 'bg-amber-50/30', avgDays: '3.8d' },
  { id: 'interview', label: 'In Conversation', color: 'border-stone-300 text-stone-800', bgLight: 'bg-stone-50/60', avgDays: '7.6d' },
  { id: 'offer', label: 'Offer Extended', color: 'border-amber-400 text-amber-900', bgLight: 'bg-amber-50/50', avgDays: '3.2d' },
  { id: 'hired', label: 'Welcomed & Hired', color: 'border-emerald-300 text-emerald-800', bgLight: 'bg-emerald-50/50', avgDays: '-' }
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  applications,
  selectedJob,
  onMoveStage,
  onOpenMatch,
  onOpenCandidate,
  onScheduleInterview,
  onOpenUpload,
  isLoading = false
}) => {
  const [draggedAppId, setDraggedAppId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<PipelineStage | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    setDraggedAppId(id);
  };

  const handleDragOver = (e: React.DragEvent, stage: PipelineStage) => {
    e.preventDefault();
    if (dragOverStage !== stage) {
      setDragOverStage(stage);
    }
  };

  const handleDragLeave = () => {
    setDragOverStage(null);
  };

  const handleDrop = (e: React.DragEvent, targetStage: PipelineStage) => {
    e.preventDefault();
    setDragOverStage(null);
    const appId = e.dataTransfer.getData('text/plain') || draggedAppId;
    if (appId) {
      onMoveStage(appId, targetStage);
    }
    setDraggedAppId(null);
  };

  const getScoreBadge = (score: number) => {
    if (score >= 88) {
      return 'bg-emerald-50 text-emerald-800 border-emerald-200 ring-emerald-500/20';
    }
    if (score >= 75) {
      return 'bg-amber-50 text-amber-900 border-amber-200 ring-amber-500/20';
    }
    return 'bg-stone-100 text-stone-700 border-stone-200 ring-stone-400/20';
  };

  // Loading skeleton state
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 px-4 lg:px-8 py-6">
        {[1, 2, 3, 4, 5].map(col => (
          <div key={col} className="bg-stone-100/70 rounded-2xl p-3 animate-pulse">
            <div className="h-5 bg-stone-200 rounded w-24 mb-4" />
            <div className="space-y-3">
              {[1, 2, 3].map(card => (
                <div key={card} className="h-36 bg-white rounded-xl p-3 shadow-2xs border border-stone-200">
                  <div className="h-4 bg-stone-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-stone-200 rounded w-1/2 mb-4" />
                  <div className="h-6 bg-stone-100 rounded w-full" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Filter out rejected from primary board columns, but keep in status summary
  const rejectedApps = applications.filter(a => a.stage === 'rejected');

  return (
    <div className="px-4 lg:px-8 py-5">
      {/* Selected Job Context & Anti-Doomscroll Reminder Banner */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-stone-200/90 shadow-2xs">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-base font-bold text-stone-900">
                {selectedJob ? selectedJob.title : 'People & Opportunities Pipeline'}
              </h2>
              {selectedJob && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 font-medium">
                  {selectedJob.department} • {selectedJob.location}
                </span>
              )}
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              {selectedJob
                ? `Requirements: ${selectedJob.min_experience_years}+ yrs exp • Core: ${selectedJob.required_skills.slice(0, 4).join(', ')}`
                : `Mindfully reviewing candidates across ${applications.length} applications`}
            </p>
          </div>
        </div>

        {/* Mindful Pacing Cues & Score Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-stone-600">
          <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50/70 border border-amber-200/60 text-amber-900 font-medium text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Anti-Doomscroll Tip: Look for curiosity & problem solving, not keyword stuffing</span>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>88%+ Strong Fit</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>75-87% Moderate Fit</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-stone-400" />
              <span>&lt;75% Growth Fit</span>
            </div>
            {rejectedApps.length > 0 && (
              <div className="flex items-center gap-1 text-stone-400 pl-2 border-l border-stone-200">
                <XCircle className="w-3.5 h-3.5 text-stone-400" />
                <span>{rejectedApps.length} archived</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Kanban Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-start">
        {STAGES.map(stage => {
          const stageApps = applications.filter(a => a.stage === stage.id);
          const isDropTarget = dragOverStage === stage.id;

          return (
            <div
              key={stage.id}
              onDragOver={(e) => handleDragOver(e, stage.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, stage.id)}
              className={`rounded-2xl border transition flex flex-col min-h-[580px] max-h-[calc(100vh-220px)] ${
                isDropTarget
                  ? 'border-amber-400 bg-amber-50/30 ring-2 ring-amber-200 shadow-sm'
                  : 'border-stone-200/80 bg-stone-50/50'
              }`}
            >
              {/* Column Header */}
              <div className="p-3.5 border-b border-stone-200/80 bg-white/90 rounded-t-2xl flex items-center justify-between sticky top-0 z-10 backdrop-blur-xs">
                <div className="flex items-center gap-2">
                  <span className="font-serif text-xs font-bold text-stone-800 tracking-tight">
                    {stage.label}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-stone-100 text-stone-700">
                    {stageApps.length}
                  </span>
                </div>
                {stage.avgDays !== '-' && (
                  <div className="flex items-center gap-1 text-[11px] text-stone-400 font-medium" title="Average time candidates spend in this stage">
                    <Clock className="w-3 h-3" />
                    <span>{stage.avgDays}</span>
                  </div>
                )}
              </div>

              {/* Cards Container with scroll */}
              <div className="p-3 space-y-3 flex-1 overflow-y-auto">
                {stageApps.length === 0 ? (
                  <div className="h-44 border-2 border-dashed border-stone-200 rounded-xl flex flex-col items-center justify-center p-4 text-center">
                    <p className="text-xs font-medium text-stone-400">No candidates in {stage.label}</p>
                    <p className="text-[11px] text-stone-400 mt-1">Move candidates here to progress their journey</p>
                  </div>
                ) : (
                  stageApps.map(app => {
                    const candidate = app.candidate;
                    const isDragging = draggedAppId === app.id;

                    return (
                      <div
                        key={app.id}
                        id={`card-${app.id}`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, app.id)}
                        className={`bg-white rounded-xl border border-stone-200/90 p-3.5 shadow-2xs hover:shadow-md hover:border-amber-300 transition cursor-grab active:cursor-grabbing relative group ${
                          isDragging ? 'opacity-40 scale-98' : ''
                        }`}
                      >
                        {/* Drag Handle & Score Badge */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-1.5 flex-1 min-w-0">
                            <GripVertical className="w-3.5 h-3.5 text-stone-300 group-hover:text-stone-500 transition shrink-0" />
                            <h3 
                              onClick={() => onOpenCandidate(app)}
                              className="font-serif text-sm font-bold text-stone-900 truncate hover:text-amber-800 transition cursor-pointer"
                              title="View full candidate story & profile"
                            >
                              {candidate?.name || 'Unnamed Candidate'}
                            </h3>
                          </div>

                          {/* Match Score Badge */}
                          <button
                            id={`match-btn-${app.id}`}
                            onClick={() => onOpenMatch(app)}
                            title="Inspect transparent match details"
                            className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold border ring-1 transition hover:brightness-95 shrink-0 ${getScoreBadge(
                              app.match_score
                            )}`}
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>{app.match_score}%</span>
                          </button>
                        </div>

                        {/* Job Title & Experience */}
                        <div className="text-[11px] text-stone-500 mb-2 flex items-center justify-between">
                          <span className="truncate max-w-[130px] font-medium text-stone-600">
                            {app.job?.title || 'Open Role'}
                          </span>
                          <span className="font-semibold text-stone-600">
                            {candidate?.parsed_data?.total_years_experience || 0} yrs experience
                          </span>
                        </div>

                        {/* Top Extracted Skills Chips */}
                        <div className="flex flex-wrap gap-1 mb-2.5">
                          {(candidate?.parsed_data?.skills || []).slice(0, 3).map((skill, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 font-medium truncate max-w-[95px]"
                            >
                              {skill}
                            </span>
                          ))}
                          {(candidate?.parsed_data?.skills || []).length > 3 && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-stone-100 text-stone-400 font-medium">
                              +{(candidate?.parsed_data?.skills || []).length - 3}
                            </span>
                          )}
                        </div>

                        {/* Needs Review Flag Banner */}
                        {candidate?.needs_review && (
                          <div 
                            onClick={() => onOpenCandidate(app)}
                            className="mb-2 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[10px] font-medium flex items-center gap-1.5 cursor-pointer hover:bg-amber-100 transition"
                          >
                            <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                            <span className="truncate">Needs human check & validation</span>
                          </div>
                        )}

                        {/* Match Explanation Snippet */}
                        <div 
                          onClick={() => onOpenMatch(app)}
                          className="bg-[#faf8f5] rounded-lg p-2.5 text-[11px] text-stone-600 border border-stone-200/70 leading-snug cursor-pointer hover:bg-stone-100/80 transition line-clamp-2"
                          title="Click to view full match reasoning"
                        >
                          <span className="font-semibold text-stone-800">Human Fit Rationale: </span>
                          {app.match_explanation}
                        </div>

                        {/* Action Toolbar */}
                        <div className="mt-2.5 pt-2 border-t border-stone-100 flex items-center justify-between gap-1 text-[11px]">
                          <button
                            id={`profile-btn-${app.id}`}
                            onClick={() => onOpenCandidate(app)}
                            className="text-stone-500 hover:text-amber-800 transition flex items-center gap-1 font-medium"
                          >
                            <FileText className="w-3 h-3" />
                            <span>Story</span>
                          </button>

                          <div className="flex items-center gap-1">
                            {stage.id !== 'hired' && (
                              <button
                                id={`schedule-btn-${app.id}`}
                                onClick={() => onScheduleInterview(app)}
                                className="text-amber-800 hover:text-amber-900 transition flex items-center gap-1 font-semibold px-2 py-0.5 rounded-md hover:bg-amber-50"
                              >
                                <Calendar className="w-3 h-3" />
                                <span>Converse</span>
                              </button>
                            )}

                            {/* Quick Advance Button */}
                            {stage.id === 'applied' && (
                              <button
                                onClick={() => onMoveStage(app.id, 'screened')}
                                title="Advance to Screened"
                                className="text-stone-400 hover:text-emerald-600 p-0.5 rounded transition"
                              >
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {stage.id === 'screened' && (
                              <button
                                onClick={() => onMoveStage(app.id, 'interview')}
                                title="Advance to Conversation"
                                className="text-stone-400 hover:text-emerald-600 p-0.5 rounded transition"
                              >
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {stage.id === 'interview' && (
                              <button
                                onClick={() => onMoveStage(app.id, 'offer')}
                                title="Advance to Offer"
                                className="text-stone-400 hover:text-emerald-600 p-0.5 rounded transition"
                              >
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {stage.id === 'offer' && (
                              <button
                                onClick={() => onMoveStage(app.id, 'hired')}
                                title="Mark as Welcomed & Hired!"
                                className="text-stone-400 hover:text-emerald-600 p-0.5 rounded transition"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State when no candidates at all */}
      {applications.length === 0 && (
        <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center max-w-md mx-auto my-12 shadow-xs">
          <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-700 mx-auto mb-4 border border-amber-100">
            <FileText className="w-7 h-7" />
          </div>
          <h3 className="font-serif text-base font-bold text-stone-900 mb-1">No candidates in pipeline yet</h3>
          <p className="text-xs text-stone-500 mb-6 leading-relaxed">
            Upload candidate resumes to begin mindful evaluation with transparent skill matching and human-first review pacing.
          </p>
          <button
            id="empty-upload-btn"
            onClick={onOpenUpload}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-700 text-white text-xs font-semibold hover:bg-amber-800 transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Candidate</span>
          </button>
        </div>
      )}
    </div>
  );
};
