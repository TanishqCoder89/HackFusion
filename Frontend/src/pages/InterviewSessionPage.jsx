import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { ArrowRight, ShieldAlert, Loader2 } from 'lucide-react';
import { getInterviewById } from '../services/storageService';
import { setAvatarResult } from '../services/avatarResult';

// The live assessment room is the AI avatar interviewer (served from /avatar). It runs the voice interview and the
// full proctoring suite (fullscreen lock, tab/focus tracking, face + gaze detection, extra monitors, phone camera),
// then reports its result back here via postMessage.
export default function InterviewSessionPage() {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  const iframeRef = useRef(null);

  // The room may only be entered through the setup page (rules accepted)
  const started = sessionStorage.getItem(`interview_started_${interviewId}`);

  const [interview, setInterview] = useState(null);
  const [roomReady, setRoomReady] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!started) return;
    let cancelled = false;
    getInterviewById(interviewId)
      .then((i) => { if (!cancelled) setInterview(i); })
      .catch((err) => { if (!cancelled) setError(err.message); });
    return () => { cancelled = true; };
  }, [interviewId, started]);

  useEffect(() => {
    const onMessage = (event) => {
      if (event.origin !== window.location.origin) return;
      if (event.source !== iframeRef.current?.contentWindow) return;
      const { type, payload, message } = event.data || {};
      if (type === 'avatar-ready') setRoomReady(true);
      if (type === 'avatar-error') setError(message || 'The interview room could not load.');
      if (type === 'avatar-complete' && payload) {
        setAvatarResult(interviewId, payload);
        setResult(payload);
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [interviewId]);

  if (!started) return <Navigate to={`/interview/${interviewId}/setup`} replace />;

  const disqualified = Boolean(result?.report?.isDisqualified);
  const hasCoding = Boolean(interview?.codingProblemId) && !disqualified;

  const handleContinue = () => {
    if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
    navigate(`/interview/${interviewId}/${hasCoding ? 'coding' : 'assessment'}`);
  };

  return (
    <div className="fixed inset-0 bg-neutral-950">
      <iframe
        ref={iframeRef}
        title="AI Interview Room"
        src={`/avatar/index.html?interviewId=${encodeURIComponent(interviewId)}`}
        allow="camera; microphone; fullscreen; autoplay; display-capture; clipboard-write; window-management"
        className="w-full h-full border-0"
      />

      {!roomReady && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-neutral-950 text-neutral-300 text-sm">
          <Loader2 className="w-6 h-6 animate-spin text-sky-400" />
          <span>Preparing your proctored interview room…</span>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-neutral-950 text-sm">
          <ShieldAlert className="w-8 h-8 text-red-400" />
          <p className="text-red-300 max-w-md text-center">{error}</p>
          <button onClick={() => navigate('/candidate/dashboard')} className="px-4 py-2 rounded-xl bg-white/10 text-white text-xs font-semibold">
            Back to dashboard
          </button>
        </div>
      )}

      {result && (
        <div className="absolute bottom-5 right-5 z-50 max-w-sm p-4 rounded-2xl bg-white dark:bg-[#141414] text-neutral-900 dark:text-white shadow-2xl border border-neutral-200 dark:border-neutral-700 space-y-3">
          <div>
            <p className="text-sm font-bold">{disqualified ? 'Interview terminated' : 'Interview complete'}</p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {disqualified
                ? 'The session ended because of repeated proctoring violations. You can still review and submit.'
                : hasCoding
                  ? 'Next: the coding round. Your interview result is saved for the final submission.'
                  : 'Next: review and submit your assessment.'}
            </p>
          </div>
          <button
            onClick={handleContinue}
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold"
          >
            <span>{hasCoding ? 'Continue to coding round' : 'Continue to review'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
