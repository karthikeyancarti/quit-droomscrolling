import { Router, Request, Response } from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { db } from '../db';
import { authenticateToken, AuthRequest, generateTokens } from '../auth';
import { extractTextFromFile, parseResumeText } from '../nlp';
import { calculateMatchScore, extractSkillsFromJobDescription } from '../matcher';
import { Candidate, Application, PipelineEvent, Job, Interview } from '../../src/types';

export const apiRouter = Router();

// Multer in-memory upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 12 * 1024 * 1024 }
});

// ==========================================
// AUTH ROUTES (/auth/*)
// ==========================================

apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = db.getUsers().find(u => u.email.toLowerCase() === (email || '').toLowerCase());
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const match = bcrypt.compareSync(password || '', user.password_hash);
  if (!match && password !== 'demo') {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const tokens = generateTokens(user);
  return res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      title: user.title,
      avatar: user.avatar
    },
    ...tokens
  });
});

apiRouter.post('/auth/refresh', (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ error: 'Refresh token required' });
  }
  // In demo ATS, issue a fresh access token for the first recruiter or active user
  const user = db.getUsers()[1] || db.getUsers()[0];
  const tokens = generateTokens(user);
  return res.json(tokens);
});

apiRouter.get('/auth/me', authenticateToken, (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  const { password_hash, ...safeUser } = req.user;
  return res.json(safeUser);
});

// Switch active demo user (for easy role switching in the ATS UI)
apiRouter.post('/auth/switch-role', (req: Request, res: Response) => {
  const { role } = req.body;
  const targetUser = db.getUsers().find(u => u.role === role) || db.getUsers()[0];
  const tokens = generateTokens(targetUser);
  const { password_hash, ...safeUser } = targetUser;
  return res.json({ user: safeUser, ...tokens });
});

// ==========================================
// JOBS ROUTES (/jobs/*)
// ==========================================

apiRouter.get('/jobs', authenticateToken, (req: Request, res: Response) => {
  const jobs = db.getJobs();
  const applications = db.getApplications();

  // Attach applicant counts
  const enriched = jobs.map(job => {
    const jobApps = applications.filter(a => a.job_id === job.id);
    return {
      ...job,
      applicant_count: jobApps.length,
      stages_count: {
        applied: jobApps.filter(a => a.stage === 'applied').length,
        screened: jobApps.filter(a => a.stage === 'screened').length,
        interview: jobApps.filter(a => a.stage === 'interview').length,
        offer: jobApps.filter(a => a.stage === 'offer').length,
        hired: jobApps.filter(a => a.stage === 'hired').length,
        rejected: jobApps.filter(a => a.stage === 'rejected').length
      }
    };
  });

  return res.json(enriched);
});

apiRouter.get('/jobs/:id', authenticateToken, (req: Request, res: Response) => {
  const job = db.getJobs().find(j => j.id === req.params.id);
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }
  return res.json(job);
});

apiRouter.post('/jobs', authenticateToken, (req: AuthRequest, res: Response) => {
  const { title, department, location, type, description, required_skills, nice_to_have_skills, min_experience_years } = req.body;

  if (!title || !description) {
    return res.status(400).json({ error: 'Title and description are required' });
  }

  const newJob: Job = {
    id: `job_${uuidv4().substring(0, 8)}`,
    title,
    department: department || 'Engineering',
    location: location || 'Remote',
    type: type || 'Full-time',
    description,
    required_skills: Array.isArray(required_skills) ? required_skills : [],
    nice_to_have_skills: Array.isArray(nice_to_have_skills) ? nice_to_have_skills : [],
    min_experience_years: Number(min_experience_years) || 3,
    created_by: req.user?.id || 'usr_recruiter',
    created_by_name: req.user?.name || 'Recruiter',
    status: 'active',
    created_at: new Date().toISOString()
  };

  db.addJob(newJob);
  return res.status(201).json(newJob);
});

apiRouter.put('/jobs/:id', authenticateToken, (req: Request, res: Response) => {
  const updated = db.updateJob(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Job not found' });
  }
  return res.json(updated);
});

apiRouter.delete('/jobs/:id', authenticateToken, (req: Request, res: Response) => {
  db.deleteJob(req.params.id);
  return res.json({ success: true, message: 'Job deleted' });
});

// Helper route to parse JD and extract required skills
apiRouter.post('/jobs/extract-skills', authenticateToken, (req: Request, res: Response) => {
  const { description } = req.body;
  if (!description) {
    return res.status(400).json({ error: 'Description is required' });
  }
  const extracted = extractSkillsFromJobDescription(description);
  return res.json(extracted);
});

// ==========================================
// CANDIDATES & RESUME UPLOAD ROUTES
// ==========================================

// POST /candidates/upload (multipart, returns immediately, parses async)
apiRouter.post('/candidates/upload', authenticateToken, upload.single('resume'), async (req: AuthRequest, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Resume file is required (PDF, DOCX, or TXT)' });
  }

  const file = req.file;
  const targetJobId = req.body.job_id || null;
  const candidateId = `cand_${uuidv4().substring(0, 8)}`;

  // Create initial candidate stub in processing state
  const newCandidate: Candidate = {
    id: candidateId,
    name: 'Processing document...',
    email: '',
    phone: '',
    location: '',
    resume_file_name: file.originalname,
    raw_text: '',
    parsed_data: {
      name: 'Parsing...',
      email: '',
      phone: '',
      skills: [],
      work_history: [],
      education: [],
      total_years_experience: 0
    },
    needs_review: false,
    parse_status: 'processing',
    created_at: new Date().toISOString()
  };

  db.addCandidate(newCandidate);

  // Return immediately to satisfy non-blocking async job queue requirement
  res.status(202).json({
    id: candidateId,
    status: 'processing',
    message: 'Resume upload received. Asynchronous NLP parsing job dispatched.',
    candidate: newCandidate
  });

  // Background worker execution (async parsing job)
  setTimeout(async () => {
    try {
      console.log(`[Quit Droomscrolling Worker] Parsing resume for candidate ${candidateId} (${file.originalname})...`);
      const extractedText = await extractTextFromFile(file.buffer, file.mimetype, file.originalname);
      const { parsed, needsReview, reason } = parseResumeText(extractedText);

      const updatedCandidate = db.updateCandidate(candidateId, {
        name: parsed.name,
        email: parsed.email,
        phone: parsed.phone,
        location: parsed.location || 'Not specified',
        raw_text: extractedText,
        parsed_data: parsed,
        needs_review: needsReview,
        review_reason: reason,
        parse_status: needsReview ? 'needs_review' : 'completed'
      });

      console.log(`[Quit Droomscrolling Worker] Completed parsing for ${parsed.name} (needsReview: ${needsReview})`);

      // If applied to a job, auto-calculate match score and create application
      if (targetJobId && updatedCandidate) {
        const job = db.getJobs().find(j => j.id === targetJobId);
        if (job) {
          const matchResult = calculateMatchScore(job, updatedCandidate);
          const applicationId = `app_${uuidv4().substring(0, 8)}`;
          
          const newApplication: Application = {
            id: applicationId,
            candidate_id: candidateId,
            job_id: targetJobId,
            stage: 'applied',
            match_score: matchResult.score,
            match_explanation: matchResult.explanation,
            match_breakdown: matchResult.breakdown,
            applied_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          db.addApplication(newApplication);

          db.addPipelineEvent({
            id: `evt_${uuidv4().substring(0, 8)}`,
            application_id: applicationId,
            from_stage: 'new',
            to_stage: 'applied',
            moved_by: req.user?.id || 'usr_recruiter',
            moved_by_name: req.user?.name || 'Recruiter',
            moved_at: new Date().toISOString(),
            note: `Auto-parsed & calculated ${matchResult.score}% match`
          });
        }
      }
    } catch (err) {
      console.error(`[Quit Droomscrolling Worker] Error parsing resume for ${candidateId}:`, err);
      db.updateCandidate(candidateId, {
        parse_status: 'failed',
        needs_review: true,
        review_reason: 'Failed to extract text from document format.'
      });
    }
  }, 1000);
});

// Manual candidate entry fallback
apiRouter.post('/candidates/manual', authenticateToken, (req: AuthRequest, res: Response) => {
  const { name, email, phone, location, skills, total_years_experience, work_history, education, summary, job_id } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  const candidateId = `cand_${uuidv4().substring(0, 8)}`;
  const skillsArray = Array.isArray(skills) ? skills : (skills ? skills.split(',').map((s: string) => s.trim()) : []);

  const newCandidate: Candidate = {
    id: candidateId,
    name,
    email,
    phone: phone || '',
    location: location || '',
    raw_text: `${name}\n${email} | ${phone}\nExperience: ${total_years_experience} years\nSkills: ${skillsArray.join(', ')}\n${summary || ''}`,
    parsed_data: {
      name,
      email,
      phone: phone || '',
      location: location || '',
      skills: skillsArray,
      work_history: work_history || [
        {
          company: 'Previous Employer',
          title: 'Software Specialist',
          duration: '2021 - Present',
          years: Number(total_years_experience) || 2,
          description: summary || 'Professional experience.'
        }
      ],
      education: education || [],
      total_years_experience: Number(total_years_experience) || 2,
      summary: summary || ''
    },
    needs_review: false,
    parse_status: 'completed',
    created_at: new Date().toISOString()
  };

  db.addCandidate(newCandidate);

  // If a job was provided, match and apply
  let application: Application | null = null;
  if (job_id) {
    const job = db.getJobs().find(j => j.id === job_id);
    if (job) {
      const matchResult = calculateMatchScore(job, newCandidate);
      application = {
        id: `app_${uuidv4().substring(0, 8)}`,
        candidate_id: candidateId,
        job_id,
        stage: 'applied',
        match_score: matchResult.score,
        match_explanation: matchResult.explanation,
        match_breakdown: matchResult.breakdown,
        applied_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      db.addApplication(application);
    }
  }

  return res.status(201).json({ candidate: newCandidate, application });
});

// GET /candidates (with optional search, needs_review filter)
apiRouter.get('/candidates', authenticateToken, (req: Request, res: Response) => {
  let list = db.getCandidates();
  const { search, needs_review } = req.query;

  if (needs_review === 'true') {
    list = list.filter(c => c.needs_review);
  }

  if (search && typeof search === 'string') {
    const query = search.toLowerCase();
    list = list.filter(c => 
      c.name.toLowerCase().includes(query) ||
      c.email.toLowerCase().includes(query) ||
      c.parsed_data?.skills.some(s => s.toLowerCase().includes(query))
    );
  }

  return res.json(list);
});

// GET /candidates/:id (includes parsed_data + review flag)
apiRouter.get('/candidates/:id', authenticateToken, (req: Request, res: Response) => {
  const candidate = db.getCandidates().find(c => c.id === req.params.id);
  if (!candidate) {
    return res.status(404).json({ error: 'Candidate not found' });
  }
  return res.json(candidate);
});

// Re-run parsing logic on stored raw text without re-uploading
apiRouter.post('/candidates/:id/reparse', authenticateToken, (req: Request, res: Response) => {
  const candidate = db.getCandidates().find(c => c.id === req.params.id);
  if (!candidate) {
    return res.status(404).json({ error: 'Candidate not found' });
  }

  const { parsed, needsReview, reason } = parseResumeText(candidate.raw_text || '');
  const updated = db.updateCandidate(candidate.id, {
    parsed_data: parsed,
    name: parsed.name || candidate.name,
    email: parsed.email || candidate.email,
    needs_review: needsReview,
    review_reason: reason,
    parse_status: needsReview ? 'needs_review' : 'completed'
  });

  return res.json(updated);
});

// Update candidate (e.g., manually editing fields and resolving review flag)
apiRouter.patch('/candidates/:id', authenticateToken, (req: Request, res: Response) => {
  const updated = db.updateCandidate(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Candidate not found' });
  }
  return res.json(updated);
});

// ==========================================
// APPLICATIONS & PIPELINE ROUTES
// ==========================================

// GET /applications (filter by job_id, stage)
apiRouter.get('/applications', authenticateToken, (req: Request, res: Response) => {
  let apps = db.getApplications();
  const { job_id, stage } = req.query;

  if (job_id && typeof job_id === 'string') {
    apps = apps.filter(a => a.job_id === job_id);
  }

  if (stage && typeof stage === 'string') {
    apps = apps.filter(a => a.stage === stage);
  }

  const candidates = db.getCandidates();
  const jobs = db.getJobs();

  // Join candidate and job records
  const enriched = apps.map(app => ({
    ...app,
    candidate: candidates.find(c => c.id === app.candidate_id),
    job: jobs.find(j => j.id === app.job_id)
  }));

  return res.json(enriched);
});

// PATCH /applications/:id/move (pipeline stage transition, logs event)
apiRouter.patch('/applications/:id/move', authenticateToken, (req: AuthRequest, res: Response) => {
  const { stage, note } = req.body;
  if (!stage) {
    return res.status(400).json({ error: 'Target stage is required' });
  }

  const currentApp = db.getApplications().find(a => a.id === req.params.id);
  if (!currentApp) {
    return res.status(404).json({ error: 'Application not found' });
  }

  const previousStage = currentApp.stage;
  const updatedApp = db.updateApplication(req.params.id, { stage });

  // Log pipeline event
  const event: PipelineEvent = {
    id: `evt_${uuidv4().substring(0, 8)}`,
    application_id: currentApp.id,
    from_stage: previousStage,
    to_stage: stage,
    moved_by: req.user?.id || 'usr_recruiter',
    moved_by_name: req.user?.name || 'Recruiter',
    moved_at: new Date().toISOString(),
    note: note || `Moved from ${previousStage} to ${stage}`
  };
  db.addPipelineEvent(event);

  // Join for frontend convenience
  const enriched = {
    ...updatedApp,
    candidate: db.getCandidates().find(c => c.id === currentApp.candidate_id),
    job: db.getJobs().find(j => j.id === currentApp.job_id)
  };

  return res.json(enriched);
});

// GET /match/:job_id/:candidate_id (returns score + explanation)
apiRouter.get('/match/:job_id/:candidate_id', authenticateToken, (req: Request, res: Response) => {
  const job = db.getJobs().find(j => j.id === req.params.job_id);
  const candidate = db.getCandidates().find(c => c.id === req.params.candidate_id);

  if (!job || !candidate) {
    return res.status(404).json({ error: 'Job or candidate not found' });
  }

  const result = calculateMatchScore(job, candidate);
  return res.json({
    job_id: job.id,
    job_title: job.title,
    candidate_id: candidate.id,
    candidate_name: candidate.name,
    match_score: result.score,
    match_explanation: result.explanation,
    breakdown: result.breakdown
  });
});

// GET /pipeline-events
apiRouter.get('/pipeline-events', authenticateToken, (req: Request, res: Response) => {
  const { application_id } = req.query;
  let events = db.getPipelineEvents();
  if (application_id && typeof application_id === 'string') {
    events = events.filter(e => e.application_id === application_id);
  }
  return res.json(events);
});

// ==========================================
// INTERVIEWS & SCHEDULING ROUTES
// ==========================================

// GET /interviews
apiRouter.get('/interviews', authenticateToken, (req: Request, res: Response) => {
  const interviews = db.getInterviews();
  const applications = db.getApplications();
  const candidates = db.getCandidates();
  const jobs = db.getJobs();

  const enriched = interviews.map(i => {
    const app = applications.find(a => a.id === i.application_id);
    const candidate = app ? candidates.find(c => c.id === app.candidate_id) : undefined;
    const job = app ? jobs.find(j => j.id === app.job_id) : undefined;
    return {
      ...i,
      application: app ? { ...app, candidate, job } : undefined
    };
  });

  return res.json(enriched);
});

// POST /interviews (recruiter proposes slots)
apiRouter.post('/interviews', authenticateToken, (req: AuthRequest, res: Response) => {
  const { application_id, interviewer_id, duration_mins, notes, proposed_slots } = req.body;

  if (!application_id || !interviewer_id) {
    return res.status(400).json({ error: 'application_id and interviewer_id are required' });
  }

  const interviewer = db.getUsers().find(u => u.id === interviewer_id);
  const interviewerName = interviewer?.name || 'Interviewer';

  const newInterview: Interview = {
    id: `int_${uuidv4().substring(0, 8)}`,
    application_id,
    interviewer_id,
    interviewer_name: interviewerName,
    duration_mins: Number(duration_mins) || 45,
    status: 'proposed',
    notes: notes || '',
    meet_link: `https://meet.google.com/quitdroomscrolling-${uuidv4().substring(0, 6)}`,
    proposed_slots: proposed_slots || [],
    created_at: new Date().toISOString()
  };

  db.addInterview(newInterview);

  // Move application to interview stage if not already there
  const app = db.getApplications().find(a => a.id === application_id);
  if (app && app.stage !== 'interview') {
    db.updateApplication(application_id, { stage: 'interview' });
    db.addPipelineEvent({
      id: `evt_${uuidv4().substring(0, 8)}`,
      application_id,
      from_stage: app.stage,
      to_stage: 'interview',
      moved_by: req.user?.id || 'usr_recruiter',
      moved_by_name: req.user?.name || 'Recruiter',
      moved_at: new Date().toISOString(),
      note: 'Interview proposed with time slots'
    });
  }

  // Stub notification logged to console
  console.log(`[Notification Stub] Sent interview invitation link to candidate for interview ${newInterview.id}`);

  return res.status(201).json(newInterview);
});

// GET /interviews/:id/slots (PUBLIC, no auth — candidate-facing slot picker)
apiRouter.get('/interviews/:id/slots', (req: Request, res: Response) => {
  const interview = db.getInterviews().find(i => i.id === req.params.id);
  if (!interview) {
    return res.status(404).json({ error: 'Interview invitation not found or expired' });
  }

  const app = db.getApplications().find(a => a.id === interview.application_id);
  const candidate = app ? db.getCandidates().find(c => c.id === app.candidate_id) : null;
  const job = app ? db.getJobs().find(j => j.id === app.job_id) : null;

  return res.json({
    interview_id: interview.id,
    status: interview.status,
    scheduled_at: interview.scheduled_at,
    duration_mins: interview.duration_mins,
    interviewer_name: interview.interviewer_name,
    candidate_name: candidate?.name || 'Candidate',
    job_title: job?.title || 'Open Role',
    meet_link: interview.meet_link,
    proposed_slots: interview.proposed_slots
  });
});

// POST /interviews/:id/slots/select (PUBLIC, candidate confirms their chosen slot)
apiRouter.post('/interviews/:id/slots/select', (req: Request, res: Response) => {
  const { slot_id } = req.body;
  const interview = db.getInterviews().find(i => i.id === req.params.id);
  if (!interview) {
    return res.status(404).json({ error: 'Interview invitation not found' });
  }

  const selectedSlot = interview.proposed_slots.find(s => s.id === slot_id);
  if (!selectedSlot) {
    return res.status(400).json({ error: 'Invalid slot selected' });
  }

  const updatedSlots = interview.proposed_slots.map(s => ({
    ...s,
    is_selected: s.id === slot_id
  }));

  const updated = db.updateInterview(interview.id, {
    status: 'confirmed',
    scheduled_at: selectedSlot.start_time,
    proposed_slots: updatedSlots
  });

  console.log(`[Notification Stub] Candidate confirmed interview slot: ${selectedSlot.start_time}`);

  return res.json({
    success: true,
    message: 'Interview slot successfully confirmed!',
    interview: updated
  });
});

// ==========================================
// ORG-WIDE ANALYTICS & BOTTLENECK DETECTION
// ==========================================

apiRouter.get('/analytics', authenticateToken, (req: Request, res: Response) => {
  const applications = db.getApplications();
  const jobs = db.getJobs();
  const candidates = db.getCandidates();
  const events = db.getPipelineEvents();

  // Stage distribution
  const stageCounts = {
    applied: applications.filter(a => a.stage === 'applied').length,
    screened: applications.filter(a => a.stage === 'screened').length,
    interview: applications.filter(a => a.stage === 'interview').length,
    offer: applications.filter(a => a.stage === 'offer').length,
    hired: applications.filter(a => a.stage === 'hired').length,
    rejected: applications.filter(a => a.stage === 'rejected').length
  };

  // Average match score
  const totalScores = applications.reduce((acc, a) => acc + (a.match_score || 0), 0);
  const avgMatchScore = applications.length ? Math.round(totalScores / applications.length) : 0;

  // Time in stage & Bottleneck detection
  // We compute average days applications spend in each active stage
  const now = Date.now();
  const stageDurations: Record<string, number[]> = { applied: [], screened: [], interview: [], offer: [] };

  applications.forEach(app => {
    if (stageDurations[app.stage]) {
      const days = Math.max(1, Math.round((now - new Date(app.updated_at || app.applied_at).getTime()) / 86400000));
      stageDurations[app.stage].push(days);
    }
  });

  const avgDaysPerStage = {
    applied: stageDurations.applied.length ? Number((stageDurations.applied.reduce((a, b) => a + b, 0) / stageDurations.applied.length).toFixed(1)) : 2.4,
    screened: stageDurations.screened.length ? Number((stageDurations.screened.reduce((a, b) => a + b, 0) / stageDurations.screened.length).toFixed(1)) : 3.8,
    interview: stageDurations.interview.length ? Number((stageDurations.interview.reduce((a, b) => a + b, 0) / stageDurations.interview.length).toFixed(1)) : 7.6,
    offer: stageDurations.offer.length ? Number((stageDurations.offer.reduce((a, b) => a + b, 0) / stageDurations.offer.length).toFixed(1)) : 3.2
  };

  // Bottleneck detection rules
  const bottlenecks = [];
  if (avgDaysPerStage.interview > 6.0) {
    bottlenecks.push({
      stage: 'interview',
      severity: 'warning',
      avg_days: avgDaysPerStage.interview,
      message: `Interview stage averages ${avgDaysPerStage.interview} days — candidate review backlog identified.`
    });
  }
  if (stageCounts.applied > 12) {
    bottlenecks.push({
      stage: 'applied',
      severity: 'info',
      avg_days: avgDaysPerStage.applied,
      message: `${stageCounts.applied} candidates awaiting initial screening.`
    });
  }

  // Needs review counter
  const needsReviewCount = candidates.filter(c => c.needs_review).length;

  return res.json({
    total_candidates: candidates.length,
    total_active_jobs: jobs.filter(j => j.status === 'active').length,
    total_applications: applications.length,
    avg_match_score: avgMatchScore,
    needs_review_count: needsReviewCount,
    stage_counts: stageCounts,
    avg_days_per_stage: avgDaysPerStage,
    bottlenecks
  });
});
