import React, { useState } from 'react';
import { 
  X, 
  RefreshCw, 
  FileText, 
  Code, 
  Briefcase, 
  GraduationCap, 
  Mail, 
  Phone, 
  MapPin, 
  AlertTriangle, 
  Check, 
  Sparkles,
  Calendar,
  Layers,
  Edit3
} from 'lucide-react';
import { Candidate, Application } from '../types';

interface CandidateDrawerProps {
  candidate: Candidate | null;
  application?: Application | null;
  onClose: () => void;
  onReparse: (candidateId: string) => Promise<void>;
  onUpdateCandidate: (candidateId: string, updates: Partial<Candidate>) => Promise<void>;
  onScheduleInterview?: (application: Application) => void;
}

export const CandidateDrawer: React.FC<CandidateDrawerProps> = ({
  candidate,
  application,
  onClose,
  onReparse,
  onUpdateCandidate,
  onScheduleInterview
}) => {
  if (!candidate) return null;

  const [activeTab, setActiveTab] = useState<'profile' | 'raw' | 'json'>('profile');
  const [isReparsing, setIsReparsing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Edit states
  const [editName, setEditName] = useState(candidate.name);
  const [editEmail, setEditEmail] = useState(candidate.email);
  const [editPhone, setEditPhone] = useState(candidate.phone);
  const [editExperience, setEditExperience] = useState(candidate.parsed_data?.total_years_experience || 0);

  const handleReparse = async () => {
    setIsReparsing(true);
    try {
      await onReparse(candidate.id);
    } finally {
      setIsReparsing(false);
    }
  };

  const handleSaveEdit = async () => {
    await onUpdateCandidate(candidate.id, {
      name: editName,
      email: editEmail,
      phone: editPhone,
      needs_review: false,
      review_reason: undefined,
      parsed_data: {
        ...candidate.parsed_data,
        name: editName,
        email: editEmail,
        phone: editPhone,
        total_years_experience: Number(editExperience)
      }
    });
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-900/40 backdrop-blur-xs flex justify-end transition-all">
      <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col border-l border-stone-200 animate-in slide-in-from-right duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-[#faf8f5]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-700 text-white font-serif font-bold text-sm flex items-center justify-center shadow-xs">
              {candidate.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'CD'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-base font-bold text-stone-900">{candidate.name}</h2>
                {candidate.needs_review && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-amber-700" />
                    Human Review Helpful
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-500">{candidate.email || 'No email specified'} • {candidate.location || 'Location not specified'}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="reparse-candidate-btn"
              onClick={handleReparse}
              disabled={isReparsing}
              title="Re-run parsing on stored raw text without asking the applicant to re-upload"
              className="px-2.5 py-1.5 rounded-xl border border-stone-200 text-stone-600 text-xs font-semibold hover:bg-stone-100 transition flex items-center gap-1.5 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isReparsing ? 'animate-spin text-amber-700' : 'text-stone-400'}`} />
              <span>{isReparsing ? 'Refreshing...' : 'Re-parse Text'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Review Flag Notice Banner */}
        {candidate.needs_review && (
          <div className="bg-amber-50/80 border-b border-amber-200/90 px-6 py-3 flex items-start justify-between gap-4">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-amber-950">Attentive Human Review Flagged</p>
                <p className="text-xs text-amber-900 mt-0.5 leading-relaxed">
                  {candidate.review_reason || 'We detected ambiguous formatting. Please take a mindful look to ensure the candidate is accurately represented.'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="px-3 py-1.5 rounded-xl bg-amber-700 text-white text-xs font-semibold hover:bg-amber-800 transition shrink-0 shadow-xs"
            >
              Tune Details
            </button>
          </div>
        )}

        {/* View Tabs */}
        <div className="px-6 border-b border-stone-200 bg-white flex items-center gap-5 text-xs font-semibold text-stone-500">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-3 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'profile'
                ? 'border-amber-700 text-amber-800 font-bold'
                : 'border-transparent hover:text-stone-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Candidate Story & Profile</span>
          </button>
          <button
            onClick={() => setActiveTab('raw')}
            className={`py-3 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'raw'
                ? 'border-amber-700 text-amber-800 font-bold'
                : 'border-transparent hover:text-stone-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Original Resume Words</span>
          </button>
          <button
            onClick={() => setActiveTab('json')}
            className={`py-3 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'json'
                ? 'border-amber-700 text-amber-800 font-bold'
                : 'border-transparent hover:text-stone-900'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Structured Data Model</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* TAB 1: Structured Profile */}
          {activeTab === 'profile' && (
            <>
              {/* Quick Contact Bar */}
              <div className="grid grid-cols-3 gap-3 p-3.5 rounded-xl bg-stone-50 border border-stone-200/90 text-xs">
                <div className="flex items-center gap-2 text-stone-700">
                  <Mail className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <span className="truncate">{candidate.email || 'None'}</span>
                </div>
                <div className="flex items-center gap-2 text-stone-700">
                  <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <span className="truncate">{candidate.phone || 'None'}</span>
                </div>
                <div className="flex items-center gap-2 text-stone-700">
                  <Briefcase className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <span className="font-semibold">{candidate.parsed_data?.total_years_experience || 0} years experience</span>
                </div>
              </div>

              {/* Edit Modal / Inline View */}
              {isEditing && (
                <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 space-y-3">
                  <h4 className="font-serif text-xs font-bold text-stone-900">Fine-tune Candidate Details</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-stone-700">Full Name</label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full text-xs p-2 rounded-lg border border-stone-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-stone-700">Email Address</label>
                      <input
                        type="email"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        className="w-full text-xs p-2 rounded-lg border border-stone-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-stone-700">Phone</label>
                      <input
                        type="text"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        className="w-full text-xs p-2 rounded-lg border border-stone-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-stone-700">Total Years Exp</label>
                      <input
                        type="number"
                        value={editExperience}
                        onChange={(e) => setEditExperience(Number(e.target.value))}
                        className="w-full text-xs p-2 rounded-lg border border-stone-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-stone-600 bg-white border border-stone-200 hover:bg-stone-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveEdit}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-amber-700 hover:bg-amber-800 shadow-xs"
                    >
                      Save & Mark Reviewed
                    </button>
                  </div>
                </div>
              )}

              {/* Extracted Skills Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                    Recognized Talents & Skills ({(candidate.parsed_data?.skills || []).length})
                  </h4>
                  <span className="text-[11px] text-stone-400">Contextual Verification</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(candidate.parsed_data?.skills || []).map((skill, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2.5 py-1 rounded-lg bg-stone-100 text-stone-800 font-medium border border-stone-200/80"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Work Experience Timeline */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Career Journey & Work Experience
                </h4>
                {(candidate.parsed_data?.work_history || []).length === 0 ? (
                  <p className="text-xs text-stone-400 italic">No structured employment history parsed.</p>
                ) : (
                  <div className="space-y-3 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-stone-200">
                    {candidate.parsed_data.work_history.map((work, idx) => (
                      <div key={idx} className="relative pl-7 space-y-1">
                        <div className="absolute left-2 top-1.5 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-amber-700 ring-4 ring-white" />
                        <div className="flex items-center justify-between">
                          <h5 className="font-serif text-xs font-bold text-stone-900">{work.title}</h5>
                          <span className="text-[11px] font-semibold text-stone-600 bg-stone-100 px-2 py-0.5 rounded-full">
                            {work.duration}
                          </span>
                        </div>
                        <p className="text-xs text-amber-800 font-medium">{work.company}</p>
                        <p className="text-xs text-stone-600 leading-relaxed pt-0.5">
                          {work.description}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Education */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Education & Personal Growth
                </h4>
                {(candidate.parsed_data?.education || []).map((edu, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl border border-stone-200 bg-[#faf8f5] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <GraduationCap className="w-4 h-4 text-amber-700" />
                      <div>
                        <p className="font-serif font-bold text-stone-900">{edu.degree}</p>
                        <p className="text-stone-500">{edu.institution}</p>
                      </div>
                    </div>
                    {edu.year && <span className="font-medium text-stone-500 bg-white px-2 py-0.5 rounded border border-stone-200">{edu.year}</span>}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* TAB 2: Raw Resume Text */}
          {activeTab === 'raw' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-stone-500">
                <span>Original extracted document text buffer</span>
                <span>{candidate.raw_text?.length || 0} characters</span>
              </div>
              <pre className="p-4 rounded-xl bg-stone-900 text-stone-100 text-xs font-mono whitespace-pre-wrap leading-relaxed max-h-[500px] overflow-y-auto border border-stone-800">
                {candidate.raw_text || 'No raw text stored.'}
              </pre>
            </div>
          )}

          {/* TAB 3: JSON Payload */}
          {activeTab === 'json' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-stone-500">
                <span>Underlying structured data attributes</span>
              </div>
              <pre className="p-4 rounded-xl bg-stone-900 text-amber-300 text-xs font-mono whitespace-pre-wrap leading-relaxed max-h-[500px] overflow-y-auto border border-stone-800">
                {JSON.stringify(candidate.parsed_data, null, 2)}
              </pre>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 bg-[#faf8f5] flex items-center justify-between">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-3 py-1.5 rounded-xl border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-100 transition flex items-center gap-1.5"
          >
            <Edit3 className="w-3.5 h-3.5 text-stone-500" />
            <span>{isEditing ? 'Close Editor' : 'Edit Profile'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-100 transition"
            >
              Close
            </button>
            {application && onScheduleInterview && (
              <button
                onClick={() => {
                  onClose();
                  onScheduleInterview(application);
                }}
                className="px-4 py-2 rounded-xl bg-amber-700 text-white text-xs font-semibold hover:bg-amber-800 transition flex items-center gap-1.5 shadow-xs"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Schedule Conversation</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
