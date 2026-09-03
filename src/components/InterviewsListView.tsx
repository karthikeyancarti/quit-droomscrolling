import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Video, 
  User, 
  Briefcase, 
  CheckCircle2, 
  ExternalLink,
  Plus,
  Link as LinkIcon
} from 'lucide-react';
import { InterviewEvent } from '../types';

interface InterviewsListViewProps {
  onOpenCandidateSlotPicker: (interviewId: string) => void;
  onOpenUpload: () => void;
}

export const InterviewsListView: React.FC<InterviewsListViewProps> = ({
  onOpenCandidateSlotPicker,
  onOpenUpload
}) => {
  const [interviews, setInterviews] = useState<InterviewEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchInterviews = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/interviews');
      if (res.ok) {
        const data = await res.json();
        setInterviews(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, []);

  return (
    <div className="px-4 lg:px-8 py-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200/90 shadow-2xs">
        <div>
          <h3 className="font-serif text-base font-bold text-stone-900">Conversations & Respectful Scheduling</h3>
          <p className="text-xs text-stone-500">Live calendar coordination centered on candidate flexibility and zero stress</p>
        </div>
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
          {interviews.length} Total Sessions
        </span>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-xs text-stone-400 animate-pulse font-serif">
          Gathering conversation calendar...
        </div>
      ) : interviews.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-stone-200 text-center max-w-md mx-auto shadow-2xs">
          <Calendar className="w-10 h-10 text-stone-300 mx-auto mb-3" />
          <p className="font-serif text-sm font-bold text-stone-700">No scheduled conversations yet</p>
          <p className="text-xs text-stone-400 mt-1 leading-relaxed">
            Propose respectful meeting times for any candidate on the pipeline board to start a genuine dialogue.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {interviews.map(item => {
            const isConfirmed = item.status === 'confirmed';
            const scheduledDate = item.scheduled_at ? new Date(item.scheduled_at) : null;

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-2xs hover:shadow-md transition space-y-3"
              >
                {/* Status & Duration */}
                <div className="flex items-center justify-between text-xs">
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium capitalize flex items-center gap-1 ${
                    isConfirmed ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-amber-50 text-amber-900 border border-amber-200'
                  }`}>
                    {isConfirmed ? <CheckCircle2 className="w-3 h-3 text-emerald-700" /> : <Clock className="w-3 h-3 text-amber-700" />}
                    {isConfirmed ? 'Confirmed Time' : 'Awaiting Choice'}
                  </span>
                  <span className="text-stone-400 font-medium">{item.duration_mins} mins</span>
                </div>

                {/* Candidate & Role */}
                <div>
                  <h4 className="font-serif text-sm font-bold text-stone-900">{item.candidate_name}</h4>
                  <p className="text-xs text-amber-800 font-medium">{item.job_title}</p>
                </div>

                {/* Interviewer */}
                <div className="flex items-center gap-2 text-xs text-stone-700 bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                  <User className="w-3.5 h-3.5 text-stone-400" />
                  <span>Host: <strong className="text-stone-900 font-serif">{item.interviewer_name}</strong></span>
                </div>

                {/* Scheduled Time or Slots */}
                {isConfirmed && scheduledDate ? (
                  <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/70 text-xs text-emerald-950 space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">Confirmed Conversation</span>
                    <p className="font-serif font-bold text-sm">
                      {scheduledDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at {scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-[#faf8f5] border border-stone-200 text-xs text-stone-600">
                    <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">Offered Options ({item.proposed_slots.length})</span>
                    <p className="text-xs text-stone-600 mt-0.5">Applicant is choosing a comfortable time</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onOpenCandidateSlotPicker(item.id)}
                    className="text-xs font-semibold text-amber-800 hover:text-amber-950 flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Candidate Booking Page</span>
                  </button>

                  {item.meet_link && (
                    <a
                      href={item.meet_link}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-stone-900 text-stone-100 text-xs font-semibold hover:bg-stone-800 transition flex items-center gap-1.5"
                    >
                      <Video className="w-3 h-3 text-amber-400" />
                      <span>Join Room</span>
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
