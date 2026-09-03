import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Briefcase, 
  UserPlus, 
  ArrowRight,
  Clock,
  Loader2
} from 'lucide-react';
import { Job } from '../types';

interface ResumeUploadModalProps {
  jobs: Job[];
  selectedJobId: string | null;
  onClose: () => void;
  onUploadSuccess: () => void;
}

export const ResumeUploadModal: React.FC<ResumeUploadModalProps> = ({
  jobs,
  selectedJobId,
  onClose,
  onUploadSuccess
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'manual'>('upload');
  const [targetJobId, setTargetJobId] = useState<string>(selectedJobId || (jobs[0]?.id || ''));
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parsing step progress simulation
  const [isProcessing, setIsProcessing] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Manual fallback form state
  const [manualName, setManualName] = useState('');
  const [manualEmail, setManualEmail] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [manualExperience, setManualExperience] = useState('4');
  const [manualSkills, setManualSkills] = useState('React, TypeScript, Node.js, PostgreSQL');
  const [manualSummary, setManualSummary] = useState('');

  const STEPS = [
    'Placing document into calm ingest queue...',
    'Carefully extracting journey, roles, and craft history...',
    'Understanding background, aspirations & mutual alignment...',
    'Generating transparent, human-readable match perspective...',
    'Person successfully welcomed to review pipeline!'
  ];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      setFile(droppedFile);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmitUpload = async () => {
    if (!file) return;

    setIsProcessing(true);
    setErrorMessage(null);
    setStepIndex(0);

    try {
      const formData = new FormData();
      formData.append('resume', file);
      if (targetJobId) {
        formData.append('job_id', targetJobId);
      }

      // Step 0 -> 1
      setStepIndex(1);
      const res = await fetch('/api/candidates/upload', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        throw new Error('Upload failed');
      }

      // Step 1 -> 2
      setTimeout(() => setStepIndex(2), 400);
      // Step 2 -> 3
      setTimeout(() => setStepIndex(3), 800);
      // Step 3 -> 4
      setTimeout(() => {
        setStepIndex(4);
        setTimeout(() => {
          onUploadSuccess();
          onClose();
        }, 800);
      }, 1400);
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred during resume processing');
      setIsProcessing(false);
    }
  };

  // Quick preset sample text upload for demo convenience
  const handleUsePresetResume = (presetType: 'senior_eng' | 'devops' | 'needs_review') => {
    let sampleContent = '';
    let fileName = 'resume.txt';

    if (presetType === 'senior_eng') {
      fileName = 'Marcus_Cole_FullStack.txt';
      sampleContent = `MARCUS COLE
marcus.cole@devmail.com | (555) 234-8890 | San Francisco, CA
Senior Full Stack Engineer with 6 years experience.

WORK EXPERIENCE
Lead Engineer | Nexus Labs | 2021 - Present
- Engineered high-concurrency APIs in Node.js, TypeScript, and React.
- Tuned PostgreSQL queries and managed AWS RDS and S3.
- Mentored 4 engineers and led sprint planning as team lead.

Software Engineer | BitForge | 2019 - 2021
- Built REST APIs in Express and frontends in React.
- Automated CI/CD pipelines with Docker.

EDUCATION
B.S. in Computer Science | UC Davis | 2019

SKILLS
TypeScript, React, Node.js, PostgreSQL, AWS, Team Leadership, Docker, CI/CD, Git`;
    } else if (presetType === 'devops') {
      fileName = 'Hannah_Kwon_Cloud.txt';
      sampleContent = `HANNAH KWON
hannah.kwon@cloudops.org | (415) 991-4432
Senior DevOps & Cloud Architect
7 years automating AWS infrastructure with Kubernetes, Terraform, Docker, and CI/CD pipelines.
Extensive scripting in Python and Linux system tuning.

EDUCATION
B.S. in Computer Engineering | Cal Poly | 2018

SKILLS
AWS, Kubernetes, Terraform, Docker, CI/CD, Python, Linux, Microservices`;
    } else {
      fileName = 'Corrupt_Scan_Doc.txt';
      sampleContent = `DOCUMENT SCAN
Tech developer looking for work.
Experience: worked at company for 1 year.
Skills: basic programming.`;
    }

    const blob = new Blob([sampleContent], { type: 'text/plain' });
    const sampleFile = new File([blob], fileName, { type: 'text/plain' });
    setFile(sampleFile);
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName || !manualEmail) {
      setErrorMessage('Name and Email are required.');
      return;
    }

    setIsProcessing(true);
    try {
      const res = await fetch('/api/candidates/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: manualName,
          email: manualEmail,
          phone: manualPhone,
          total_years_experience: manualExperience,
          skills: manualSkills,
          summary: manualSummary,
          job_id: targetJobId
        })
      });

      if (!res.ok) throw new Error('Failed to create candidate profile');

      onUploadSuccess();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save profile');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-[#faf8f5]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-stone-900">Welcome a Candidate Story</h3>
              <p className="text-xs text-stone-500">Holistic background reading with zero automated rejections</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-3 flex items-center gap-4 border-b border-stone-200 text-xs font-semibold bg-[#faf8f5]/50">
          <button
            onClick={() => setActiveTab('upload')}
            className={`pb-3 border-b-2 transition ${
              activeTab === 'upload' ? 'border-amber-800 text-amber-900' : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Read Story File (PDF / DOCX / TXT)
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`pb-3 border-b-2 transition ${
              activeTab === 'manual' ? 'border-amber-800 text-amber-900' : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Write Story Manually
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          
          {/* Target Job Selector */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Connect to Open Opportunity
            </label>
            <select
              value={targetJobId}
              onChange={(e) => setTargetJobId(e.target.value)}
              disabled={isProcessing}
              className="w-full text-xs font-semibold text-stone-800 bg-[#faf8f5] border border-stone-200 rounded-xl p-2.5 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
            >
              {jobs.map(job => (
                <option key={job.id} value={job.id}>
                  {job.title} ({job.department})
                </option>
              ))}
            </select>
          </div>

          {activeTab === 'upload' ? (
            <>
              {/* Drag and Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center min-h-[160px] ${
                  isDragging
                    ? 'border-amber-600 bg-amber-50/50'
                    : file
                    ? 'border-emerald-400 bg-emerald-50/40'
                    : 'border-stone-300 hover:border-stone-400 bg-[#faf8f5]/60'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {file ? (
                  <div className="space-y-1">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-2">
                      <FileText className="w-5 h-5" />
                    </div>
                    <p className="font-serif text-xs font-bold text-stone-900">{file.name}</p>
                    <p className="text-[11px] text-stone-500">{(file.size / 1024).toFixed(1)} KB • Ready for mindful review</p>
                    <span className="inline-block text-[11px] font-semibold text-amber-800 underline mt-1">
                      Choose another file
                    </span>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="w-10 h-10 rounded-full bg-stone-100 text-stone-500 flex items-center justify-center mx-auto mb-2">
                      <Upload className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-stone-800">
                      Drop candidate resume or narrative here, or <span className="text-amber-800 underline">browse</span>
                    </p>
                    <p className="text-[11px] text-stone-400">
                      Supports PDF, DOCX, and TXT (Max 12MB)
                    </p>
                  </div>
                )}
              </div>

              {/* Demo Sample Presets */}
              <div className="bg-[#faf8f5] p-3.5 rounded-xl border border-stone-200">
                <p className="text-[11px] font-bold text-stone-700 mb-1.5 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  <span>Curated Sample Stories (for instant evaluation):</span>
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleUsePresetResume('senior_eng')}
                    className="px-2.5 py-1 rounded-lg bg-white text-stone-700 border border-stone-200 text-[11px] font-medium hover:bg-stone-50 transition"
                  >
                    Senior Full Stack Lead (High Alignment)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUsePresetResume('devops')}
                    className="px-2.5 py-1 rounded-lg bg-white text-stone-700 border border-stone-200 text-[11px] font-medium hover:bg-stone-50 transition"
                  >
                    Cloud Architect (Deep Systems Focus)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUsePresetResume('needs_review')}
                    className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 text-[11px] font-medium hover:bg-amber-100 transition"
                  >
                    Unique Career Pivot (Needs Careful Review)
                  </button>
                </div>
              </div>

              {/* Multi-step Parsing Animation */}
              {isProcessing && (
                <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-950">
                    <Loader2 className="w-4 h-4 text-amber-700 animate-spin" />
                    <span>Mindful Evaluation in Progress</span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    {STEPS.map((step, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center gap-2 transition-all ${
                          idx < stepIndex
                            ? 'text-emerald-800 font-semibold'
                            : idx === stepIndex
                            ? 'text-amber-950 font-bold'
                            : 'text-stone-400'
                        }`}
                      >
                        {idx < stepIndex ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                        ) : idx === stepIndex ? (
                          <div className="w-3.5 h-3.5 rounded-full border-2 border-amber-700 border-t-transparent animate-spin shrink-0" />
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full border border-stone-300 shrink-0" />
                        )}
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </>
          ) : (
            /* TAB 2: Manual Fallback Form */
            <form onSubmit={handleManualSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-stone-700">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Maya Lin"
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                    className="w-full text-xs p-2 rounded-xl border border-stone-200 bg-[#faf8f5] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-stone-700">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="maya@example.com"
                    value={manualEmail}
                    onChange={(e) => setManualEmail(e.target.value)}
                    className="w-full text-xs p-2 rounded-xl border border-stone-200 bg-[#faf8f5] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-stone-700">Phone</label>
                  <input
                    type="text"
                    placeholder="(555) 123-4567"
                    value={manualPhone}
                    onChange={(e) => setManualPhone(e.target.value)}
                    className="w-full text-xs p-2 rounded-xl border border-stone-200 bg-[#faf8f5] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-stone-700">Total Years Experience</label>
                  <input
                    type="number"
                    min="0"
                    value={manualExperience}
                    onChange={(e) => setManualExperience(e.target.value)}
                    className="w-full text-xs p-2 rounded-xl border border-stone-200 bg-[#faf8f5] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-700">Skills & Crafts (Comma separated)</label>
                <input
                  type="text"
                  placeholder="React, TypeScript, Node.js, AWS, System Architecture"
                  value={manualSkills}
                  onChange={(e) => setManualSkills(e.target.value)}
                  className="w-full text-xs p-2 rounded-xl border border-stone-200 bg-[#faf8f5] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-700">Narrative Summary / Perspective</label>
                <textarea
                  rows={2}
                  placeholder="Highlights, achievements, and human philosophy..."
                  value={manualSummary}
                  onChange={(e) => setManualSummary(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-[#faf8f5] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              {errorMessage && (
                <div className="p-2.5 rounded-xl bg-red-50 text-red-700 text-xs">{errorMessage}</div>
              )}
            </form>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-stone-200 bg-[#faf8f5] flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 rounded-xl border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-100 transition"
          >
            Cancel
          </button>

          {activeTab === 'upload' ? (
            <button
              type="button"
              id="start-upload-btn"
              onClick={handleSubmitUpload}
              disabled={!file || isProcessing}
              className="px-5 py-2 rounded-xl bg-amber-700 text-white text-xs font-semibold hover:bg-amber-800 transition flex items-center gap-1.5 shadow-xs disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isProcessing ? 'Reading Story...' : 'Read Story & Evaluate Alignment'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleManualSubmit}
              disabled={isProcessing}
              className="px-5 py-2 rounded-xl bg-amber-700 text-white text-xs font-semibold hover:bg-amber-800 transition shadow-xs"
            >
              Add Story Manually
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
