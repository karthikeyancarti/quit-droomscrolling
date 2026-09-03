import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Video, 
  User, 
  Briefcase, 
  AlertCircle, 
  X,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { PublicInterviewDetails } from '../types';

interface CandidateSlotPickerProps {
  interviewId: string;
  onClose: () => void;
  onSlotConfirmed?: () => void;
}

export const CandidateSlotPicker: React.FC<CandidateSlotPickerProps> = ({
  interviewId,
  onClose,
  onSlotConfirmed
}) => {
  const [details, setDetails] = useState<PublicInterviewDetails | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchInterviewDetails();
  }, [interviewId]);

  const fetchInterviewDetails = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/interviews/${interviewId}/slots`);
      if (!res.ok) throw new Error('Interview invite not found or expired');
      const data = await res.json();
      setDetails(data);
      // Preselect the first slot if unselected
      if (data.proposed_slots && data.proposed_slots.length > 0) {
        const alreadySelected = data.proposed_slots.find((s: any) => s.is_selected);
        setSelectedSlotId(alreadySelected ? alreadySelected.id : data.proposed_slots[0].id);
      }
    } catch (e: any) {
      setErrorMessage(e.message || 'Unable to load interview details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmSlot = async () => {
    if (!selectedSlotId) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/interviews/${interviewId}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slot_id: selectedSlotId })
      });
      if (!res.ok) throw new Error('Failed to confirm slot');
      await fetchInterviewDetails();
      if (onSlotConfirmed) onSlotConfirmed();
    } catch (e: any) {
      setErrorMessage(e.message || 'Error confirming slot');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Candidate Portal Header */}
        <div className="bg-stone-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30 mb-2">
            <Sparkles className="w-3 h-3" />
            <span>Quit Droomscrolling • Respectful Candidate Space</span>
          </div>
          <h2 className="font-serif text-xl font-bold tracking-tight">Select Your Conversation Time</h2>
          <p className="text-xs text-stone-400 mt-1 leading-relaxed">
            No logins, no stress. Pick a time slot where you can speak comfortably with the team.
          </p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {isLoading ? (
            <div className="py-12 text-center text-xs text-stone-500 animate-pulse">
              Finding thoughtful available times...
            </div>
          ) : errorMessage ? (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          ) : details ? (
            <>
              {/* Meeting Info Card */}
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/90 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-3.5 h-3.5 text-amber-700" />
                    <span className="font-serif font-bold text-stone-900">{details.job_title}</span>
                  </div>
                  <span className="text-stone-500">{details.duration_mins} minutes</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-stone-600">
                  <User className="w-3.5 h-3.5 text-stone-400" />
                  <span>Talking with <strong className="text-stone-800">{details.interviewer_name}</strong></span>
                </div>
              </div>

              {/* Status Banner */}
              {details.status === 'confirmed' ? (
                <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <h4 className="font-serif text-base font-bold text-emerald-900">Your Conversation is Confirmed!</h4>
                  <p className="text-xs text-emerald-800">
                    Set for {new Date(details.scheduled_at!).toLocaleString([], {
                      weekday: 'long',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                  {details.meet_link && (
                    <div className="pt-2">
                      <a
                        href={details.meet_link}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition shadow-xs"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Join Video Call</span>
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                /* Slot Selection Radio List */
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider">
                    Available Time Slots:
                  </label>

                  <div className="space-y-2">
                    {details.proposed_slots.map((slot) => {
                      const start = new Date(slot.start_time);
                      const isSelected = selectedSlotId === slot.id;

                      return (
                        <div
                          key={slot.id}
                          onClick={() => setSelectedSlotId(slot.id)}
                          className={`p-3.5 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'border-amber-600 bg-amber-50/50 ring-2 ring-amber-500/20 shadow-xs'
                              : 'border-stone-200 hover:border-stone-300 bg-white'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              isSelected ? 'border-amber-600 bg-amber-600 text-white' : 'border-stone-300'
                            }`}>
                              {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-stone-900">
                                {start.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                              </p>
                              <p className="text-[11px] text-stone-500 flex items-center gap-1 mt-0.5">
                                <Clock className="w-3 h-3 text-stone-400" />
                                <span>{start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({details.duration_mins} mins)</span>
                              </p>
                            </div>
                          </div>

                          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                            isSelected ? 'bg-amber-700 text-white' : 'text-stone-500 bg-stone-100'
                          }`}>
                            {isSelected ? 'Selected' : 'Select'}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    onClick={handleConfirmSlot}
                    disabled={!selectedSlotId || isSubmitting}
                    className="w-full mt-4 py-3 rounded-xl bg-amber-700 text-white text-xs font-bold hover:bg-amber-800 transition shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isSubmitting ? 'Confirming...' : 'Confirm Selected Time'}</span>
                  </button>
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 text-center">
          <p className="text-[11px] text-stone-500">
            Powered by Quit Droomscrolling • Respectful & Human Candidate Scheduling
          </p>
        </div>

      </div>
    </div>
  );
};
