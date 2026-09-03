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
    <div className="min-h-screen bg-[#fbfaf7] text-stone-800 flex flex-col font-sans selection:bg-amber-600 selection:text-white">
      
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
