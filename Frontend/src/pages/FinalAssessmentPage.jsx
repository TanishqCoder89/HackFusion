import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, Navigate } from 'react-router-dom';
import {
  CheckCircle2,
  AlertCircle,
  FileText,
  Code2,
  Clock,
  ShieldCheck,
  Award,
  Send,
  ArrowLeft
} from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import { getInterviewById, createFinalSubmission } from '../services/storageService';
import { getAvatarResult, clearAvatarResult, totalWarnings } from '../services/avatarResult';

const readJson = (key, fallback) => {
  try { return JSON.parse(sessionStorage.getItem(key) || 'null') ?? fallback; } catch { return fallback; }
};

export default function FinalAssessmentPage() {
  const { interviewId } = useParams();
  const navigate = useNavigate();

  const started = sessionStorage.getItem(`interview_started_${interviewId}`);
  const [interview, setInterview] = useState(null);
  const [loadError, setLoadError] = useState('');

  // Answers, code and proctoring events captured during the session
  const savedAnswers = readJson(`interview_answers_${interviewId}`, {});
  const codingSubmission = readJson(`interview_code_submission_${interviewId}`, null);
  const avatar = getAvatarResult(interviewId);
  const breakdown = avatar?.report?.breakdown || [];
  const disqualified = Boolean(avatar?.report?.isDisqualified);
  const proctorEvents = avatar
    ? Array.from({ length: totalWarnings(avatar.warningCounts) })
    : readJson(`interview_events_${interviewId}`, []);

  const [declarationChecked, setDeclarationChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!started) return;
    let cancelled = false;
    getInterviewById(interviewId)
      .then((i) => { if (!cancelled) setInterview(i); })
      .catch((err) => { if (!cancelled) setLoadError(err.message); });
    return () => { cancelled = true; };
  }, [interviewId, started]);

  const questionsCount = avatar ? breakdown.length : (interview?.questions?.length || 0);
  const answeredCount = avatar
    ? breakdown.filter((b) => b.answer && !/^\(no response|^\(assessment cancelled/i.test(b.answer.trim())).length
    : Object.keys(savedAnswers).filter(k => savedAnswers[k]?.trim()).length;

  const handleSubmit = async () => {
    setError('');
    if (!declarationChecked) {
      setError('Please acknowledge the integrity declaration to finalize submission.');
      return;
    }

    setIsSubmitting(true);
    try {
      const startedAt = Number(started) || Date.now();
      // The server re-runs the code, scores the answers and computes the integrity score itself.
      const newSubmission = await createFinalSubmission({
        interviewId,
        timeSpentMinutes: Math.max(1, Math.round((Date.now() - startedAt) / 60000)),
        proctoringEvents: proctorEvents,
        answers: savedAnswers,
        codingSubmission,
        avatar
      });

      // Clear session keys
      sessionStorage.removeItem(`interview_answers_${interviewId}`);
      sessionStorage.removeItem(`interview_code_submission_${interviewId}`);
      sessionStorage.removeItem(`interview_code_${interviewId}`);
      sessionStorage.removeItem(`interview_events_${interviewId}`);
      sessionStorage.removeItem(`interview_started_${interviewId}`);
      clearAvatarResult(interviewId);

      navigate(`/interview/${interviewId}/thank-you`, {
        state: { submissionId: newSubmission.id }
      });
    } catch (err) {
      setError(err.message || 'Submission failed. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (!started) return <Navigate to={`/interview/${interviewId}/setup`} replace />;
  if (loadError) return <div className="min-h-screen flex items-center justify-center text-sm text-red-500">{loadError}</div>;
  if (!interview) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0A0A0A]">
        <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-[#0A0A0A] text-neutral-900 dark:text-white flex flex-col justify-between">
      
      {/* Top Header */}
      <header className="h-16 bg-white dark:bg-[#121212] border-b border-neutral-200 dark:border-neutral-800 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Link
            to={`/interview/${interviewId}/coding`}
            className="p-2 rounded-xl text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-base font-bold text-neutral-900 dark:text-white leading-tight">
              Final Assessment Review & Submission
            </h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {interview?.title} • {interview?.companyName}
            </p>
          </div>
        </div>

        <ThemeToggle />
      </header>

      {/* Main Review Body */}
      <main className="max-w-4xl mx-auto w-full p-4 sm:p-8 flex-1 space-y-6">
        
        {error && (
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 flex items-center gap-3 text-xs text-red-600 dark:text-red-300">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        {/* Status Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500">
              <FileText className="w-4 h-4 text-sky-500 dark:text-sky-400" />
              <span>Questions Answered</span>
            </div>
            <div className="text-2xl font-bold">
              {answeredCount} / {questionsCount}
            </div>
            <p className="text-[11px] text-emerald-500 font-semibold">{answeredCount === questionsCount ? "Stage Complete" : "Some questions unanswered"}</p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500">
              <Code2 className="w-4 h-4 text-sky-500 dark:text-sky-400" />
              <span>Coding Assessment</span>
            </div>
            <div className="text-2xl font-bold">
              {!interview.codingProblemId ? 'Not required' : codingSubmission?.code ? 'Code captured' : 'No code submitted'}
            </div>
            <p className="text-[11px] text-sky-500 font-semibold">{codingSubmission?.code ? "Graded against all test cases on submit" : "Will score 0"}</p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500">
              <ShieldCheck className="w-4 h-4 text-sky-500 dark:text-sky-400" />
              <span>Integrity & Audit</span>
            </div>
            <div className="text-2xl font-bold">
              {disqualified ? 'Disqualified' : proctorEvents.length === 0 ? 'Clean (0 Strikes)' : `${proctorEvents.length} Notices`}
            </div>
            <p className="text-[11px] text-sky-500 font-semibold">{proctorEvents.length >= 5 ? "Policy limit reached" : "Within Policy Limits"}</p>
          </div>
        </div>

        {/* Responses Review */}
        <div className="bg-white dark:bg-[#141414] rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 space-y-4">
          <h2 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-sky-500 dark:text-sky-400" />
            <span>Interview Question Responses</span>
          </h2>

          <div className="space-y-3">
            {disqualified && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-xs text-red-700 dark:text-red-300">
                This interview was terminated by the proctoring system. The score will be recorded as 0.
              </div>
            )}
            {avatar && breakdown.length === 0 && !disqualified && (
              <p className="text-xs text-neutral-400">No spoken responses were recorded.</p>
            )}
            {avatar
              ? breakdown.map((b, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-700/60 text-xs space-y-1.5"
                  >
                    <div className="font-semibold text-neutral-900 dark:text-white">Q{idx + 1}: {b.question}</div>
                    <p className="text-neutral-600 dark:text-neutral-300 italic">"{b.answer || 'No answer recorded.'}"</p>
                  </div>
                ))
              : interview?.questions?.map((q, idx) => (
                  <div
                    key={q.id}
                    className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-700/60 text-xs space-y-1.5"
                  >
                    <div className="font-semibold text-neutral-900 dark:text-white">Q{idx + 1}: {q.question}</div>
                    <p className="text-neutral-600 dark:text-neutral-300 italic">"{savedAnswers[q.id] || 'No answer recorded.'}"</p>
                  </div>
                ))}
          </div>
        </div>

        {/* Coding Solution Review */}
        <div className="bg-white dark:bg-[#141414] rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 space-y-4">
          <h2 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <Code2 className="w-4 h-4 text-sky-500 dark:text-sky-400" />
            <span>Submitted Code Solution{codingSubmission?.language ? ` (${codingSubmission.language})` : ''}</span>
          </h2>
          <pre className="p-4 rounded-xl bg-neutral-900 text-neutral-200 font-mono text-xs overflow-x-auto max-h-56">
            {codingSubmission?.code || '// No code was submitted.'}
          </pre>
        </div>

        {/* Declaration and Submit CTA */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800 space-y-5">
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={declarationChecked}
              onChange={(e) => {
                setDeclarationChecked(e.target.checked);
                if (e.target.checked) setError('');
              }}
              className="mt-1 w-4 h-4 rounded text-sky-500 dark:text-sky-400 focus:ring-sky-400"
            />
            <div className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
              <span className="font-bold text-neutral-900 dark:text-white block mb-0.5">
                Candidate Final Declaration
              </span>
              I certify that all responses and code submissions provided in this session are my own original work completed under the disclosed assessment guidelines.
            </div>
          </label>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-sm shadow-md transition-all transform active:scale-98 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? 'Transmitting Submission...' : 'Submit Final Assessment'}</span>
          </button>
        </div>

      </main>

    </div>
  );
}
