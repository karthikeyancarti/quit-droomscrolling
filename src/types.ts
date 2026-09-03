export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: 'admin' | 'recruiter' | 'interviewer';
  title?: string;
  avatar?: string;
}

export interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  type: 'Full-time' | 'Contract' | 'Remote' | 'Hybrid';
  description: string;
  required_skills: string[];
  nice_to_have_skills: string[];
  min_experience_years: number;
  created_by: string;
  created_by_name: string;
  status: 'active' | 'draft' | 'closed';
  created_at: string;
}

export interface WorkExperience {
  company: string;
  title: string;
  duration: string;
  years: number;
  description: string;
}

export interface Education {
  degree: string;
  institution: string;
  year?: string;
}

export interface ParsedResumeData {
  name: string;
  email: string;
  phone: string;
  location?: string;
  skills: string[];
  work_history: WorkExperience[];
  education: Education[];
  total_years_experience: number;
  summary?: string;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  resume_file_url?: string;
  resume_file_name?: string;
  raw_text: string;
  parsed_data: ParsedResumeData;
  needs_review: boolean;
  review_reason?: string;
  parse_status: 'completed' | 'processing' | 'failed' | 'needs_review';
  created_at: string;
}

export type PipelineStage = 'applied' | 'screened' | 'interview' | 'offer' | 'hired' | 'rejected';

export interface SemanticMatchDetail {
  job_skill: string;
  candidate_skill: string;
  similarity: number;
  type: 'exact' | 'semantic' | 'missing';
}

export interface MatchBreakdown {
  exact_required_matched: string[];
  missing_required: string[];
  exact_nice_matched: string[];
  missing_nice: string[];
  semantic_matches: SemanticMatchDetail[];
  experience_required: number;
  experience_actual: number;
  experience_gap: number;
  subscores: {
    exact_score: number;       // 0 - 100
    semantic_score: number;    // 0 - 100
    experience_score: number;  // 0 - 100
  };
}

export interface Application {
  id: string;
  candidate_id: string;
  job_id: string;
  stage: PipelineStage;
  match_score: number;
  match_explanation: string;
  match_breakdown?: MatchBreakdown;
  applied_at: string;
  updated_at: string;
  notes?: string;
  // joined fields
  candidate?: Candidate;
  job?: Job;
}

export interface PipelineEvent {
  id: string;
  application_id: string;
  from_stage: PipelineStage | 'new';
  to_stage: PipelineStage;
  moved_by: string;
  moved_by_name: string;
  moved_at: string;
  note?: string;
}

export interface InterviewSlot {
  id: string;
  start_time: string; // ISO string
  end_time: string;   // ISO string
  is_selected?: boolean;
}

export interface Interview {
  id: string;
  application_id: string;
  interviewer_id: string;
  interviewer_name: string;
  scheduled_at?: string; // final confirmed slot
  duration_mins: number;
  status: 'proposed' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  meet_link?: string;
  proposed_slots: InterviewSlot[];
  created_at: string;
  // joined fields
  application?: Application;
  candidate_name?: string;
  job_title?: string;
}

export type InterviewEvent = Interview;

export interface PublicInterviewDetails {
  interview_id: string;
  status: 'proposed' | 'confirmed' | 'completed' | 'cancelled';
  scheduled_at?: string;
  duration_mins: number;
  interviewer_name: string;
  candidate_name: string;
  job_title: string;
  meet_link?: string;
  proposed_slots: InterviewSlot[];
}

export interface AnalyticsOverview {
  total_candidates: number;
  total_active_jobs: number;
  total_applications: number;
  avg_match_score: number;
  needs_review_count: number;
  stage_counts: Record<string, number>;
  avg_days_per_stage: Record<string, number>;
  bottlenecks: Array<{
    stage: string;
    avg_days: number;
    threshold_days: number;
    message: string;
  }>;
}

