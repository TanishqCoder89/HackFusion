import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { Code2, Clock } from 'lucide-react';
import CodeEditor from '../components/CodeEditor';
import { getInterviewById, getCodingProblemById } from '../services/storageService';

const draftKey = (id) => `interview_code_${id}`;

export default function CodingAssessmentPage() {
  const { interviewId } = useParams();
  const navigate = useNavigate();

  // The interview must have been started from the setup page (permissions + rules accepted)
  const started = sessionStorage.getItem(`interview_started_${interviewId}`);

  const [interview, setInterview] = useState(null);
  const [problem, setProblem] = useState(null);
  const [draft, setDraft] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(null);

  useEffect(() => {
    if (!started) return;
    let cancelled = false;
    (async () => {
      try {
        const int = await getInterviewById(interviewId);
        if (cancelled) return;
        setInterview(int);
        if (!int.codingProblemId) {
          navigate(`/interview/${interviewId}/assessment`, { replace: true });
          return;
        }
        const prob = await getCodingProblemById(int.codingProblemId);
        if (cancelled) return;
        setProblem(prob);
        setSecondsRemaining((prob.timeLimitMinutes || 30) * 60);
        try {
          setDraft(JSON.parse(sessionStorage.getItem(draftKey(interviewId)) || 'null'));
        } catch { setDraft(null); }
      } catch (err) {
        if (!cancelled) setLoadError(err.message);
      }
    })();
    return () => { cancelled = true; };
  }, [interviewId, started, navigate]);

  useEffect(() => {
    if (secondsRemaining === null) return undefined;
    const timer = setInterval(() => setSecondsRemaining((prev) => Math.max(0, prev - 1)), 1000);
    return () => clearInterval(timer);
  }, [secondsRemaining === null]);

  const [latest, setLatest] = useState({ code: '', language: 'cpp' });

  const handleCodeChange = useCallback((newCode, language) => {
    setLatest({ code: newCode, language });
    try {
      sessionStorage.setItem(draftKey(interviewId), JSON.stringify({ code: newCode, language }));
    } catch { /* storage full or unavailable */ }
  }, [interviewId]);

  const handleSubmit = (finalCode, _results, language) => {
    setIsSubmitting(true);
    sessionStorage.setItem(
      `interview_code_submission_${interviewId}`,
      JSON.stringify({ problemId: problem.id, language: language || latest.language, code: finalCode ?? latest.code })
    );
    navigate(`/interview/${interviewId}/assessment`);
  };

  // Auto-advance when the coding timer runs out
  useEffect(() => {
    if (secondsRemaining === 0 && problem && !isSubmitting) {
      handleSubmit(latest.code || draft?.code || '', null, latest.language || draft?.language);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsRemaining]);

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!started) {
    return <Navigate to={`/interview/${interviewId}/setup`} replace />;
  }

  if (loadError) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-red-500">{loadError}</div>;
  }

  if (!problem || !interview) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0A0A0A]">
        <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-[#0A0A0A] text-neutral-900 dark:text-white flex flex-col justify-between selection:bg-sky-400/20 selection:text-sky-500">
      <header className="h-16 bg-white dark:bg-[#121212] border-b border-neutral-200 dark:border-neutral-800 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
            <Code2 className="w-5 h-5" />
          </span>
          <div>
            <h1 className="text-sm font-bold text-neutral-900 dark:text-white leading-tight">
              Coding Assessment — {problem.title}
            </h1>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              {interview.companyName} • {interview.title}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 font-mono text-xs font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40 px-3 py-1.5 rounded-xl border border-sky-200 dark:border-sky-800/40">
            <Clock className="w-3.5 h-3.5" />
            <span>{formatTimer(secondsRemaining ?? 0)}</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto w-full p-4 sm:p-6 flex-1 flex flex-col">
        <CodeEditor
          problem={problem}
          initialCode={draft?.code}
          initialLanguage={draft?.language}
          onCodeChange={handleCodeChange}
          onSubmitSolution={handleSubmit}
          isSubmitting={isSubmitting}
          submitLabel="Proceed to Review"
          submittingLabel="Locking..."
        />
      </main>
    </div>
  );
}
