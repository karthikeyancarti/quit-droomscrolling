import React, { useState } from 'react';
import { X, Briefcase, Sparkles, Plus, Trash2, CheckCircle2, ArrowRight } from 'lucide-react';
import { Job } from '../types';

interface JobModalProps {
  onClose: () => void;
  onJobCreated: (job: Job) => void;
}

export const JobModal: React.FC<JobModalProps> = ({ onClose, onJobCreated }) => {
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [location, setLocation] = useState('San Francisco, CA (Hybrid)');
  const [type, setType] = useState<'Full-time' | 'Contract' | 'Remote' | 'Hybrid'>('Full-time');
  const [minExp, setMinExp] = useState(4);
  const [description, setDescription] = useState(`We are seeking an experienced engineer to join our core product team.
Requirements:
- 4+ years of software engineering experience
- Strong proficiency in TypeScript, React, and Node.js
- Experience with PostgreSQL and relational databases
- Familiarity with AWS and Docker containerization

Nice to have:
- Next.js or GraphQL experience
- Team leadership and technical mentoring`);

  const [requiredSkills, setRequiredSkills] = useState<string[]>(['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'AWS']);
  const [niceSkills, setNiceSkills] = useState<string[]>(['Next.js', 'GraphQL', 'Docker']);
  const [newRequiredInput, setNewRequiredInput] = useState('');
  const [newNiceInput, setNewNiceInput] = useState('');

  const [isExtracting, setIsExtracting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [extractedSuccess, setExtractedSuccess] = useState(false);

  const handleExtractFromDescription = async () => {
    if (!description.trim()) return;
    setIsExtracting(true);
    setExtractedSuccess(false);

    try {
      const res = await fetch('/api/jobs/extract-skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description })
      });
      if (!res.ok) throw new Error('Extraction failed');
      const data = await res.json();

      if (data.required_skills && data.required_skills.length > 0) {
        setRequiredSkills(data.required_skills);
      }
      if (data.nice_to_have_skills && data.nice_to_have_skills.length > 0) {
        setNiceSkills(data.nice_to_have_skills);
      }
      if (data.min_experience_years) {
        setMinExp(data.min_experience_years);
      }
      setExtractedSuccess(true);
      setTimeout(() => setExtractedSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleAddRequired = () => {
    if (newRequiredInput.trim() && !requiredSkills.includes(newRequiredInput.trim())) {
      setRequiredSkills([...requiredSkills, newRequiredInput.trim()]);
      setNewRequiredInput('');
    }
  };

  const handleAddNice = () => {
    if (newNiceInput.trim() && !niceSkills.includes(newNiceInput.trim())) {
      setNiceSkills([...niceSkills, newNiceInput.trim()]);
      setNewNiceInput('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setIsSaving(true);

    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          department,
          location,
          type,
          description,
          required_skills: requiredSkills,
          nice_to_have_skills: niceSkills,
          min_experience_years: minExp
        })
      });

      if (!res.ok) throw new Error('Failed to create job');
      const newJob = await res.json();
      onJobCreated(newJob);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-[#faf8f5]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-stone-900">Open a Thoughtful Role</h3>
              <p className="text-xs text-stone-500">Define realistic core competencies and transparent expectations</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-stone-400 hover:text-stone-700">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[calc(100vh-180px)] overflow-y-auto">
          
          {/* Title & Department */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-stone-700">Role Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Senior Product Engineer"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-xs p-2 rounded-xl border border-stone-200 bg-[#faf8f5] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-stone-700">Team / Department</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full text-xs p-2 rounded-xl border border-stone-200 bg-[#faf8f5] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-bold text-stone-700">Location Workstyle</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full text-xs p-2 rounded-xl border border-stone-200 bg-[#faf8f5] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-stone-700">Employment Type</label>
              <select
                value={type}
                onChange={(e: any) => setType(e.target.value)}
                className="w-full text-xs p-2 rounded-xl border border-stone-200 bg-[#faf8f5] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
              >
                <option value="Full-time">Full-time</option>
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Contract">Contract</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-bold text-stone-700">Min Experience (Yrs)</label>
              <input
                type="number"
                min="0"
                value={minExp}
                onChange={(e) => setMinExp(Number(e.target.value))}
                className="w-full text-xs p-2 rounded-xl border border-stone-200 bg-[#faf8f5] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
          </div>

          {/* Job Description with Extract Button */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-bold text-stone-700">
                Job Opportunity Description
              </label>
              <button
                type="button"
                onClick={handleExtractFromDescription}
                disabled={isExtracting || !description.trim()}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] font-bold bg-amber-100/70 text-amber-900 hover:bg-amber-100 border border-amber-300/80 transition"
              >
                <Sparkles className={`w-3 h-3 ${isExtracting ? 'animate-spin' : 'text-amber-700'}`} />
                <span>{isExtracting ? 'Analyzing Description...' : 'Synthesize Key Expectations'}</span>
              </button>
            </div>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-[#faf8f5] focus:bg-white leading-relaxed focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
            />
            {extractedSuccess && (
              <p className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Expectations and experience requirement synthesized!</span>
              </p>
            )}
          </div>

          {/* Required Skills (Must-Have, 45% weight) */}
          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-serif text-xs font-bold text-amber-950">
                Foundational Core Talents (45% Alignment Weight)
              </span>
              <span className="text-[11px] text-amber-800 font-medium">Clear essentials</span>
            </div>
            
            <div className="flex flex-wrap gap-1.5">
              {requiredSkills.map((skill, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-white border border-amber-200 text-stone-900 font-semibold shadow-2xs"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => setRequiredSkills(requiredSkills.filter(s => s !== skill))}
                    className="text-stone-400 hover:text-red-500 ml-0.5"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2 pt-1">
              <input
                type="text"
                placeholder="Add essential craft (e.g. TypeScript, System Architecture)..."
                value={newRequiredInput}
                onChange={(e) => setNewRequiredInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddRequired(); } }}
                className="flex-1 text-xs p-2 rounded-lg border border-stone-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
              />
              <button
                type="button"
                onClick={handleAddRequired}
                className="px-3.5 py-1.5 bg-amber-700 text-white text-xs font-semibold rounded-lg hover:bg-amber-800 shadow-xs"
              >
                Add
              </button>
            </div>
          </div>

          {/* Nice-to-have Skills (20% weight) */}
          <div className="p-4 rounded-xl border border-stone-200 bg-[#faf8f5] space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-serif text-xs font-bold text-stone-900">
                Bonus & Growth Talents (20% Alignment Weight)
              </span>
              <span className="text-[11px] text-stone-500 font-medium">Enriching background</span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {niceSkills.map((skill, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-white border border-stone-200 text-stone-700 font-medium"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => setNiceSkills(niceSkills.filter(s => s !== skill))}
                    className="text-stone-400 hover:text-red-500 ml-0.5"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2 pt-1">
              <input
                type="text"
                placeholder="Add welcome talent (e.g. Mentorship, GraphQL)..."
                value={newNiceInput}
                onChange={(e) => setNewNiceInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddNice(); } }}
                className="flex-1 text-xs p-2 rounded-lg border border-stone-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
              />
              <button
                type="button"
                onClick={handleAddNice}
                className="px-3.5 py-1.5 bg-stone-700 text-white text-xs font-semibold rounded-lg hover:bg-stone-800"
              >
                Add
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-amber-700 text-white text-xs font-semibold hover:bg-amber-800 shadow-xs"
            >
              {isSaving ? 'Publishing...' : 'Open Opportunity'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
