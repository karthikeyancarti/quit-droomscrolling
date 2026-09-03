import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  User, 
  Link as LinkIcon, 
  Check, 
  Copy, 
  Send, 
  Video, 
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { Application, InterviewSlot } from '../types';

interface InterviewModalProps {
  application: Application | null;
  onClose: () => void;
  onInterviewScheduled: () => void;
  onOpenPublicSlotPicker: (interviewId: string) => void;
}

export const InterviewModal: React.FC<InterviewModalProps> = ({
  application,
  onClose,
  onInterviewScheduled,
  onOpenPublicSlotPicker
}) => {
  if (!application) return null;

  const candidate = application.candidate;
  const job = application.job;

  const [interviewerId, setInterviewerId] = useState('usr_interviewer');
  const [durationMins, setDurationMins] = useState(45);
  const [notes, setNotes] = useState('Technical deep dive: architecture, past experience, and problem solving.');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdInterviewId, setCreatedInterviewId] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Generate 3 suggested slots over next few days
  const now = new Date();
  const slotDate1 = new Date(now.getTime() + 2 * 86400000);
  slotDate1.setHours(10, 0, 0, 0);

  const slotDate2 = new Date(now.getTime() + 2 * 86400000);
  slotDate2.setHours(14, 30, 0, 0);

  const slotDate3 = new Date(now.getTime() + 3 * 86400000);
  slotDate3.setHours(11, 0, 0, 0);

  const [slots, setSlots] = useState<InterviewSlot[]>([
    {
      id: 'slot_suggest_1',
      start_time: slotDate1.toISOString(),
      end_time: new Date(slotDate1.getTime() + 45 * 60000).toISOString()
    },
    {
      id: 'slot_suggest_2',
      start_time: slotDate2.toISOString(),
      end_time: new Date(slotDate2.getTime() + 45 * 60000).toISOString()
    },
    {
      id: 'slot_suggest_3',
      start_time: slotDate3.toISOString(),
      end_time: new Date(slotDate3.getTime() + 45 * 60000).toISOString()
    }
  ]);

  const handleCreateInterview = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/interviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          application_id: application.id,
          interviewer_id: interviewerId,
          duration_mins: durationMins,
          notes,
          proposed_slots: slots
        })
      });

      if (!res.ok) throw new Error('Failed to schedule interview');
      const interview = await res.json();
      setCreatedInterviewId(interview.id);
      onInterviewScheduled();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const candidateShareUrl = createdInterviewId
    ? `${window.location.origin}/candidate/schedule/${createdInterviewId}`
    : '';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(candidateShareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-[#faf8f5]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-stone-900">Propose Meeting Times</h3>
              <p className="text-xs text-stone-500">Empower candidate to choose with zero pressure or friction</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-stone-400 hover:text-stone-700">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          
          {createdInterviewId ? (
            /* Success State with Candidate Link */
            <div className="space-y-4 py-2">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto">
                <Check className="w-6 h-6" />
              </div>
              <div className="text-center">
                <h4 className="font-serif text-base font-bold text-stone-900">Conversation Invitation Ready!</h4>
                <p className="text-xs text-stone-600 mt-1 max-w-sm mx-auto leading-relaxed">
                  A personalized, stress-free time picker link is generated. The candidate does not need passwords or apps to select their time.
                </p>
              </div>

              {/* Shareable Link Box */}
              <div className="p-4 bg-[#faf8f5] border border-stone-200 rounded-2xl space-y-2">
                <label className="text-[11px] font-bold text-stone-700 flex items-center gap-1.5">
                  <LinkIcon className="w-3.5 h-3.5 text-amber-700" />
                  <span>Public Candidate Time Selection Link</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={candidateShareUrl}
                    className="flex-1 text-xs p-2.5 rounded-xl bg-white border border-stone-200 text-stone-700 font-mono select-all"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-3.5 py-2.5 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition flex items-center gap-1 shrink-0"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-amber-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Test Button: View Slot Picker as Candidate */}
              <button
                onClick={() => onOpenPublicSlotPicker(createdInterviewId)}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold hover:bg-amber-100 transition flex items-center justify-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5 text-amber-700" />
                <span>Preview Candidate Experience (Open Time Picker)</span>
              </button>

              <div className="text-center pt-2">
                <button
                  onClick={onClose}
                  className="px-6 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* Proposal Form */
            <>
              {/* Candidate Banner */}
              <div className="p-3.5 bg-[#faf8f5] rounded-xl border border-stone-200 flex items-center justify-between text-xs">
                <div>
                  <span className="text-stone-400 block text-[10px] uppercase font-bold tracking-wider">Candidate</span>
                  <span className="font-serif font-bold text-stone-900">{candidate?.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-stone-400 block text-[10px] uppercase font-bold tracking-wider">Role</span>
                  <span className="font-serif font-bold text-stone-900">{job?.title}</span>
                </div>
              </div>

              {/* Interviewer Selector */}
              <div>
                <label className="text-[11px] font-bold text-stone-700 block mb-1">
                  Team Conversationalist / Host
                </label>
                <select
                  value={interviewerId}
                  onChange={(e) => setInterviewerId(e.target.value)}
                  className="w-full text-xs font-semibold text-stone-800 bg-[#faf8f5] border border-stone-200 rounded-xl p-2.5 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
                >
                  <option value="usr_interviewer">David Chen — Staff Engineering Lead</option>
                  <option value="usr_recruiter">Marcus Vance — Senior Talent Partner</option>
                  <option value="usr_admin">Elena Rostova — Head of People & Culture</option>
                </select>
              </div>

              {/* Duration */}
              <div>
                <label className="text-[11px] font-bold text-stone-700 block mb-1">
                  Thoughtful Session Length
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[30, 45, 60].map(mins => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setDurationMins(mins)}
                      className={`py-2 rounded-xl text-xs font-semibold border transition ${
                        durationMins === mins
                          ? 'bg-amber-700 text-white border-amber-700 shadow-2xs'
                          : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                      }`}
                    >
                      {mins} minutes
                    </button>
                  ))}
                </div>
              </div>

              {/* Proposed Slots List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-bold text-stone-700">
                    Offered Time Choices ({slots.length})
                  </label>
                  <span className="text-[11px] text-stone-400">Candidate selects their best fit</span>
                </div>

                <div className="space-y-2">
                  {slots.map((slot, index) => {
                    const start = new Date(slot.start_time);
                    return (
                      <div
                        key={slot.id}
                        className="p-3 rounded-xl bg-[#faf8f5] border border-stone-200 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <Clock className="w-3.5 h-3.5 text-amber-700" />
                          <span className="font-serif font-bold text-stone-900">
                            Choice {index + 1}: {start.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <span className="text-[11px] text-stone-500 font-medium bg-white px-2 py-0.5 rounded border border-stone-200">({durationMins}m)</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Meeting Notes */}
              <div>
                <label className="text-[11px] font-bold text-stone-700 block mb-1">
                  Conversation Purpose & Context
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-[#faf8f5] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div className="pt-2 border-t border-stone-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateInterview}
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-amber-700 text-white text-xs font-semibold hover:bg-amber-800 shadow-xs flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Dispatching...' : 'Generate Candidate Link'}</span>
                </button>
              </div>
            </>
          )}

        </div>

      </div>
    </div>
  );
};
