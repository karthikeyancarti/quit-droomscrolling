import React from 'react';
import { 
  Building2, 
  Upload, 
  Plus, 
  BookOpen, 
  BarChart3, 
  Search, 
  Layers,
  Calendar,
  AlertTriangle,
  UserCheck,
  HeartHandshake,
  Sparkles
} from 'lucide-react';
import { User, Job } from '../types';

interface NavbarProps {
  currentUser: User;
  jobs: Job[];
  selectedJobId: string | null;
  onSelectJob: (id: string | null) => void;
  activeView: 'pipeline' | 'candidates' | 'analytics' | 'interviews';
  setActiveView: (view: 'pipeline' | 'candidates' | 'analytics' | 'interviews') => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onlyNeedsReview: boolean;
  setOnlyNeedsReview: (val: boolean) => void;
  onOpenUpload: () => void;
  onOpenNewJob: () => void;
  onOpenReadme: () => void;
  onSwitchRole: (role: 'admin' | 'recruiter' | 'interviewer') => void;
  needsReviewCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  jobs,
  selectedJobId,
  onSelectJob,
  activeView,
  setActiveView,
  searchQuery,
  setSearchQuery,
  onlyNeedsReview,
  setOnlyNeedsReview,
  onOpenUpload,
  onOpenNewJob,
  onOpenReadme,
  onSwitchRole,
  needsReviewCount
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#fefdfb] border-b border-stone-200/90 shadow-2xs">
      {/* Top Banner: Warm greeting & Anti-Doomscroll pacing info */}
      <div className="bg-stone-900 text-stone-300 text-xs px-4 lg:px-8 py-2 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center flex-wrap gap-2.5">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Anti-Doomscroll Mode Active
          </span>
          <span className="text-stone-100 font-medium">
            Welcome, {currentUser.name.split(' ')[0]}!
          </span>
          <span className="text-stone-400 hidden sm:inline text-[11px]">
            Take your time — evaluating real people, not just algorithms.
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-[11px]">
            <span className="text-stone-400 hidden md:inline">Perspective:</span>
            {(['recruiter', 'interviewer', 'admin'] as const).map(role => (
              <button
                key={role}
                id={`role-btn-${role}`}
                onClick={() => onSwitchRole(role)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition capitalize ${
                  currentUser.role === role
                    ? 'bg-amber-600/90 text-white shadow-xs'
                    : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                }`}
              >
                {role}
              </button>
            ))}
          </div>

          <div className="h-3 w-px bg-stone-700 hidden sm:block" />

          <button
            id="readme-nav-button"
            onClick={onOpenReadme}
            className="flex items-center gap-1.5 text-stone-300 hover:text-white transition text-xs"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>Human Manifesto & Scoring</span>
          </button>
        </div>
      </div>

      {/* Main Nav */}
      <div className="px-4 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Job Picker */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center text-white shadow-xs font-serif font-bold text-lg tracking-tight">
              QD
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-stone-900 tracking-tight text-lg">
                  Quit Droomscrolling
                </span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/80">
                  Human-First ATS
                </span>
              </div>
              <p className="text-[11px] text-stone-500 font-medium">
                Mindful candidate discovery • Transparent, humane recruitment
              </p>
            </div>
          </div>

          <div className="h-8 w-px bg-stone-200 hidden sm:block" />

          {/* Job Filter Dropdown */}
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-stone-400 hidden sm:block" />
            <select
              id="job-filter-select"
              value={selectedJobId || ''}
              onChange={(e) => onSelectJob(e.target.value ? e.target.value : null)}
              aria-label="Filter candidates by job posting"
              className="text-xs font-semibold text-stone-700 bg-stone-50 border border-stone-200 rounded-lg px-3 py-1.5 hover:bg-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500 transition max-w-[220px] truncate"
            >
              <option value="">All Open Positions ({jobs.length})</option>
              {jobs.map(job => (
                <option key={job.id} value={job.id}>
                  {job.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center bg-stone-100/90 p-1 rounded-xl border border-stone-200 text-xs font-medium text-stone-600">
          <button
            id="view-pipeline-tab"
            onClick={() => setActiveView('pipeline')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
              activeView === 'pipeline'
                ? 'bg-white text-stone-900 shadow-xs font-semibold'
                : 'hover:text-stone-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-amber-700" />
            <span>Pipeline Board</span>
          </button>
          <button
            id="view-candidates-tab"
            onClick={() => setActiveView('candidates')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
              activeView === 'candidates'
                ? 'bg-white text-stone-900 shadow-xs font-semibold'
                : 'hover:text-stone-900'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-amber-700" />
            <span>People & Stories</span>
          </button>
          <button
            id="view-interviews-tab"
            onClick={() => setActiveView('interviews')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
              activeView === 'interviews'
                ? 'bg-white text-stone-900 shadow-xs font-semibold'
                : 'hover:text-stone-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-amber-700" />
            <span>Conversations</span>
          </button>
          <button
            id="view-analytics-tab"
            onClick={() => setActiveView('analytics')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
              activeView === 'analytics'
                ? 'bg-white text-stone-900 shadow-xs font-semibold'
                : 'hover:text-stone-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-amber-700" />
            <span>Care & Analytics</span>
          </button>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-2">
          {/* Search Box */}
          <div className="relative w-48 sm:w-56">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              id="global-search-input"
              type="text"
              placeholder="Search people, craft, skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
            />
          </div>

          {/* Needs Review Filter Toggle */}
          <button
            id="toggle-needs-review"
            onClick={() => setOnlyNeedsReview(!onlyNeedsReview)}
            title="Filter candidates requiring recruiter human review"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition ${
              onlyNeedsReview
                ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                : needsReviewCount > 0
                ? 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100'
                : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
            }`}
          >
            <AlertTriangle className={`w-3.5 h-3.5 ${onlyNeedsReview ? 'text-white' : 'text-amber-600'}`} />
            <span className="hidden md:inline">Needs Human Eye</span>
            {needsReviewCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${onlyNeedsReview ? 'bg-amber-700 text-white' : 'bg-amber-200 text-amber-900'}`}>
                {needsReviewCount}
              </span>
            )}
          </button>

          {/* New Job Button */}
          {currentUser.role !== 'interviewer' && (
            <button
              id="new-job-btn"
              onClick={onOpenNewJob}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-stone-700 bg-white border border-stone-200 hover:bg-stone-50 transition"
            >
              <Plus className="w-3.5 h-3.5 text-stone-500" />
              <span>Post Opportunity</span>
            </button>
          )}

          {/* Upload Resume Button */}
          {currentUser.role !== 'interviewer' && (
            <button
              id="upload-resume-btn"
              onClick={onOpenUpload}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-amber-700 hover:bg-amber-800 shadow-xs transition"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Add Candidate</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
