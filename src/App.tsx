import React, { useState, useEffect, useMemo } from 'react';
import { 
  Job, 
  Application, 
  Candidate, 
  PipelineStage, 
  User 
} from './types';
import { Navbar } from './components/Navbar';
import { KanbanBoard } from './components/KanbanBoard';
import { CandidateListView } from './components/CandidateListView';
import { InterviewsListView } from './components/InterviewsListView';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { MatchDrawer } from './components/MatchDrawer';
import { CandidateDrawer } from './components/CandidateDrawer';
import { ResumeUploadModal } from './components/ResumeUploadModal';
import { JobModal } from './components/JobModal';
import { InterviewModal } from './components/InterviewModal';
import { CandidateSlotPicker } from './components/CandidateSlotPicker';
import { ReadmeModal } from './components/ReadmeModal';

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    document.body.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  // Active demo user & role
  const [currentUser, setCurrentUser] = useState<User>({
    id: 'usr_recruiter',
    email: 'marcus@quitdroomscrolling.org',
    name: 'Marcus Vance',
    role: 'recruiter'
  });

  // Data state
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters and views
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'pipeline' | 'candidates' | 'analytics' | 'interviews'>('pipeline');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyNeedsReview, setOnlyNeedsReview] = useState(false);

  // Modals & Drawers state
  const [inspectingMatchApp, setInspectingMatchApp] = useState<Application | null>(null);
  const [inspectingCandidate, setInspectingCandidate] = useState<{ candidate: Candidate; application?: Application } | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isNewJobOpen, setIsNewJobOpen] = useState(false);
  const [isReadmeOpen, setIsReadmeOpen] = useState(false);
  const [schedulingInterviewApp, setSchedulingInterviewApp] = useState<Application | null>(null);
  const [publicSlotPickerId, setPublicSlotPickerId] = useState<string | null>(null);

  // Initial data load
  const fetchData = async () => {
    try {
      const [jobsRes, appsRes] = await Promise.all([
        fetch('/api/jobs'),
        fetch('/api/applications')
      ]);

      if (jobsRes.ok && appsRes.ok) {
        const jobsData = await jobsRes.json();
        const appsData = await appsRes.json();
        setJobs(jobsData);
        setApplications(appsData);
      }
    } catch (err) {
      console.error('Failed to load ATS data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Role Switcher
  const handleSwitchRole = (role: 'admin' | 'recruiter' | 'interviewer') => {
    if (role === 'admin') {
      setCurrentUser({
        id: 'usr_admin',
        email: 'elena@quitdroomscrolling.org',
        name: 'Elena Rostova',
        role: 'admin'
      });
    } else if (role === 'interviewer') {
      setCurrentUser({
        id: 'usr_interviewer',
        email: 'david@quitdroomscrolling.org',
        name: 'David Chen',
        role: 'interviewer'
      });
    } else {
      setCurrentUser({
        id: 'usr_recruiter',
        email: 'marcus@quitdroomscrolling.org',
        name: 'Marcus Vance',
        role: 'recruiter'
      });
    }
  };

  // Move candidate to different pipeline stage
  const handleMoveStage = async (applicationId: string, targetStage: PipelineStage) => {
    // Optimistic UI update
    setApplications(prev =>
      prev.map(app => (app.id === applicationId ? { ...app, stage: targetStage } : app))
    );

    try {
      const res = await fetch(`/api/applications/${applicationId}/stage`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: targetStage })
      });
      if (!res.ok) {
        throw new Error('Failed to update stage on server');
      }
    } catch (err) {
      console.error(err);
      // Revert if error
      fetchData();
    }
  };

  // Re-run NLP parsing on candidate
  const handleReparse = async (candidateId: string) => {
    try {
      const res = await fetch(`/api/candidates/${candidateId}/reparse`, {
        method: 'POST'
      });
      if (res.ok) {
        const updatedCand = await res.json();
        // Update in applications list
        setApplications(prev =>
          prev.map(app =>
            app.candidate_id === candidateId ? { ...app, candidate: updatedCand } : app
          )
        );
        if (inspectingCandidate && inspectingCandidate.candidate.id === candidateId) {
          setInspectingCandidate({
            ...inspectingCandidate,
            candidate: updatedCand
          });
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Update candidate details (resolve review flag)
  const handleUpdateCandidate = async (candidateId: string, updates: Partial<Candidate>) => {
    try {
      const res = await fetch(`/api/candidates/${candidateId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const updated = await res.json();
        setApplications(prev =>
          prev.map(app =>
            app.candidate_id === candidateId ? { ...app, candidate: updated } : app
          )
        );
        if (inspectingCandidate) {
          setInspectingCandidate({
            ...inspectingCandidate,
            candidate: updated
          });
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Filtered applications list
  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      // Job filter
      if (selectedJobId && app.job_id !== selectedJobId) {
        return false;
      }

      // Needs review toggle
      if (onlyNeedsReview && !app.candidate?.needs_review) {
        return false;
      }

      // Text query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const candName = app.candidate?.name?.toLowerCase() || '';
        const skills = (app.candidate?.parsed_data?.skills || []).map(s => s.toLowerCase());
        const jobTitle = app.job?.title?.toLowerCase() || '';

        const matchesName = candName.includes(q);
        const matchesSkill = skills.some(s => s.includes(q));
        const matchesJob = jobTitle.includes(q);

        if (!matchesName && !matchesSkill && !matchesJob) {
          return false;
        }
      }

      return true;
    });
  }, [applications, selectedJobId, onlyNeedsReview, searchQuery]);

  // Count candidates requiring review
  const needsReviewCount = useMemo(() => {
    const set = new Set<string>();
    applications.forEach(a => {
      if (a.candidate?.needs_review) {
        set.add(a.candidate_id);
      }
    });
    return set.size;
  }, [applications]);

  const selectedJob = useMemo(() => {
    return jobs.find(j => j.id === selectedJobId) || null;
  }, [jobs, selectedJobId]);

  return (
    <div
      className="app-shell min-h-screen flex flex-col font-sans selection:bg-amber-600 selection:text-white"
      data-theme={theme}
    >
      {/* Persistent Navigation Bar */}
      <Navbar
        currentUser={currentUser}
        jobs={jobs}
        selectedJobId={selectedJobId}
        onSelectJob={setSelectedJobId}
        activeView={activeView}
        setActiveView={setActiveView}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onlyNeedsReview={onlyNeedsReview}
        setOnlyNeedsReview={setOnlyNeedsReview}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenNewJob={() => setIsNewJobOpen(true)}
        onOpenReadme={() => setIsReadmeOpen(true)}
        onSwitchRole={handleSwitchRole}
        needsReviewCount={needsReviewCount}
        theme={theme}
        onToggleTheme={(isDark) => setTheme(isDark ? 'dark' : 'light')}
      />

      {/* Main View Area */}
      <main className="flex-1">
        {activeView === 'pipeline' && (
          <KanbanBoard
            applications={filteredApplications}
            selectedJob={selectedJob}
            onMoveStage={handleMoveStage}
            onOpenMatch={(app) => setInspectingMatchApp(app)}
            onOpenCandidate={(app) => {
              if (app.candidate) {
                setInspectingCandidate({ candidate: app.candidate, application: app });
              }
            }}
            onScheduleInterview={(app) => setSchedulingInterviewApp(app)}
            onOpenUpload={() => setIsUploadOpen(true)}
            isLoading={isLoading}
          />
        )}

        {activeView === 'candidates' && (
          <CandidateListView
            applications={filteredApplications}
            onOpenMatch={(app) => setInspectingMatchApp(app)}
            onOpenCandidate={(app) => {
              if (app.candidate) {
                setInspectingCandidate({ candidate: app.candidate, application: app });
              }
            }}
            onScheduleInterview={(app) => setSchedulingInterviewApp(app)}
          />
        )}

        {activeView === 'interviews' && (
          <InterviewsListView
            onOpenCandidateSlotPicker={(id) => setPublicSlotPickerId(id)}
            onOpenUpload={() => setIsUploadOpen(true)}
          />
        )}

        {activeView === 'analytics' && <AnalyticsDashboard />}
      </main>

      <footer className="footer-shell border-t px-4 py-5 sm:px-6 lg:px-8">
        <div className="footer-inner flex flex-col items-center justify-center gap-4 md:flex-row md:justify-between">
          <div className="contact-copy-wrap" aria-label="Copy contact email">
            <button
              type="button"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText('karthikeyan11116@gmail.com');
                } catch {
                  // no-op fallback for unsupported environments
                }
              }}
              className="contact-copy-button"
              aria-label="Copy contact email"
              title="Copy email"
            >
              <span className="contact-copy-frame" />
              <span className="contact-copy-text-box">
                <span className="contact-copy-text">karthi</span>
                <span className="contact-copy-text">nivedita</span>
              </span>
              <span className="contact-copy-point top" />
              <span className="contact-copy-point bottom" />
              <span className="contact-copy-point left" />
              <span className="contact-copy-point right" />
            </button>
          </div>

          <ul className="example-2" aria-label="Social links">
            <li className="icon-content">
              <a href="https://www.linkedin.com/in/karthikeyan-d-804269298" aria-label="LinkedIn" data-social="linkedin" target="_blank" rel="noreferrer">
                <div className="filled" />
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-linkedin" viewBox="0 0 16 16" xmlSpace="preserve">
                  <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854zm4.943 12.248V6.169H2.542v7.225zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248S2.4 3.226 2.4 3.934c0 .694.521 1.248 1.327 1.248zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016l.016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225z" fill="currentColor" />
                </svg>
              </a>
              <div className="tooltip">LinkedIn</div>
            </li>
            <li className="icon-content">
              <a href="https://github.com/karthikeyancarti" aria-label="GitHub" data-social="github" target="_blank" rel="noreferrer">
                <div className="filled" />
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-github" viewBox="0 0 16 16" xmlSpace="preserve">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8" fill="currentColor" />
                </svg>
              </a>
              <div className="tooltip">GitHub</div>
            </li>
            <li className="icon-content">
              <a href="https://www.instagram.com/" aria-label="Instagram" data-social="instagram" target="_blank" rel="noreferrer">
                <div className="filled" />
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-instagram" viewBox="0 0 16 16" xmlSpace="preserve">
                  <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.9 3.9 0 0 0-1.417.923A3.9 3.9 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.9 3.9 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.9 3.9 0 0 0-.923-1.417A3.9 3.9 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599s.453.546.598.92c.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.5 2.5 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.5 2.5 0 0 1-.92-.598 2.5 2.5 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233s.008-2.388.046-3.231c.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92s.546-.453.92-.598c.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92m-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217m0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334" fill="currentColor" />
                </svg>
              </a>
              <div className="tooltip">Instagram</div>
            </li>
            <li className="icon-content">
              <a href="https://youtube.com/" aria-label="Youtube" data-social="youtube" target="_blank" rel="noreferrer">
                <div className="filled" />
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-youtube" viewBox="0 0 16 16" xmlSpace="preserve">
                  <path d="M8.051 1.999h.089c.822.003 4.987.033 6.11.335a2.01 2.01 0 0 1 1.415 1.42c.101.38.172.883.22 1.402l.01.104.022.26.008.104c.065.914.073 1.77.074 1.957v.075c-.001.194-.01 1.108-.082 2.06l-.008.105-.009.104c-.05.572-.124 1.14-.235 1.558a2.01 2.01 0 0 1-1.415 1.42c-1.16.312-5.569.334-6.18.335h-.142c-.309 0-1.587-.006-2.927-.052l-.17-.006-.087-.004-.171-.007-.171-.007c-1.11-.049-2.167-.128-2.654-.26a2.01 2.01 0 0 1-1.415-1.419c-.111-.417-.185-.986-.235-1.558L.09 9.82l-.008-.104A31 31 0 0 1 0 7.68v-.123c.002-.215.01-.958.064-1.778l.007-.103.003-.052.008-.104.022-.26.01-.104c.048-.519.119-1.023.22-1.402a2.01 2.01 0 0 1 1.415-1.42c.487-.13 1.544-.21 2.654-.26l.17-.007.172-.006.086-.003.171-.007A100 100 0 0 1 7.858 2zM6.4 5.209v4.818l4.157-2.408z" fill="currentColor" />
                </svg>
              </a>
              <div className="tooltip">Youtube</div>
            </li>
          </ul>
        </div>
      </footer>

      {/* MODALS & DRAWERS */}

      {/* Explainable Match Intelligence Drawer */}
      {inspectingMatchApp && (
        <MatchDrawer
          application={inspectingMatchApp}
          onClose={() => setInspectingMatchApp(null)}
          onScheduleInterview={(app) => {
            setInspectingMatchApp(null);
            setSchedulingInterviewApp(app);
          }}
        />
      )}

      {/* Full Candidate Profile & Raw Resume Drawer */}
      {inspectingCandidate && (
        <CandidateDrawer
          candidate={inspectingCandidate.candidate}
          application={inspectingCandidate.application}
          onClose={() => setInspectingCandidate(null)}
          onReparse={handleReparse}
          onUpdateCandidate={handleUpdateCandidate}
          onScheduleInterview={(app) => {
            setInspectingCandidate(null);
            setSchedulingInterviewApp(app);
          }}
        />
      )}

      {/* Resume Upload Modal (PDF / DOCX / TXT + Async steps) */}
      {isUploadOpen && (
        <ResumeUploadModal
          jobs={jobs}
          selectedJobId={selectedJobId}
          onClose={() => setIsUploadOpen(false)}
          onUploadSuccess={() => {
            fetchData();
          }}
        />
      )}

      {/* New Job Posting Modal (with auto skill extraction from JD) */}
      {isNewJobOpen && (
        <JobModal
          onClose={() => setIsNewJobOpen(false)}
          onJobCreated={(newJob) => {
            setJobs(prev => [newJob, ...prev]);
            setSelectedJobId(newJob.id);
            fetchData();
          }}
        />
      )}

      {/* Schedule Interview Modal */}
      {schedulingInterviewApp && (
        <InterviewModal
          application={schedulingInterviewApp}
          onClose={() => setSchedulingInterviewApp(null)}
          onInterviewScheduled={() => {
            fetchData();
          }}
          onOpenPublicSlotPicker={(id) => setPublicSlotPickerId(id)}
        />
      )}

      {/* Public Candidate Interview Slot Picker */}
      {publicSlotPickerId && (
        <CandidateSlotPicker
          interviewId={publicSlotPickerId}
          onClose={() => setPublicSlotPickerId(null)}
          onSlotConfirmed={() => {
            fetchData();
          }}
        />
      )}

      {/* Architecture & Algorithmic Rationale Documentation Modal */}
      {isReadmeOpen && (
        <ReadmeModal onClose={() => setIsReadmeOpen(false)} />
      )}

    </div>
  );
}
