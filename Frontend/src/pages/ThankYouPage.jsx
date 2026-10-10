import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { CheckCircle2, Award, ArrowRight, Bot, ShieldCheck, Building2, Calendar, Clock } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import { getInterviewById, getSubmissionById } from '../services/storageService';

export default function ThankYouPage() {
  const { interviewId } = useParams();
  const location = useLocation();
  const [interview, setInterview] = useState(null);
  const [submission, setSubmission] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getInterviewById(interviewId).then((i) => { if (!cancelled) setInterview(i); }).catch(() => {});
    if (location.state?.submissionId) {
      getSubmissionById(location.state.submissionId).then((s) => { if (!cancelled) setSubmission(s); }).catch(() => {});
    }
    return () => { cancelled = true; };
  }, [interviewId, location.state?.submissionId]);

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-[#0A0A0A] text-neutral-900 dark:text-white flex flex-col justify-between">
      
      {/* Top Bar */}
      <header className="h-16 bg-white dark:bg-[#121212] border-b border-neutral-200 dark:border-neutral-800 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-sky-500 flex items-center justify-center text-white shadow-sm">
            <Bot className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm tracking-tight text-neutral-900 dark:text-white">
            Nexa<span className="text-sky-500 dark:text-sky-400">Hire</span>
          </span>
        </Link>
        <ThemeToggle />
      </header>

      {/* Main Success Container */}
      <main className="max-w-2xl mx-auto w-full p-6 sm:p-10 my-auto text-center space-y-8">
        
        {/* Celebration Icon */}
        <div className="w-20 h-20 rounded-3xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10 border border-emerald-200 dark:border-emerald-800/40">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        {/* Heading & Notice */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
            Thank You for Completing Your Interview!
          </h1>
          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 max-w-lg mx-auto leading-relaxed">
            Your responses and assessment have been submitted successfully. The company can review your interview results according to its evaluation process.
          </p>
        </div>

        {/* Submission Details Card */}
        <div className="bg-white dark:bg-[#141414] rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm text-left space-y-3 text-xs">
          <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800/80 pb-3">
            <span className="text-neutral-500 dark:text-neutral-400">Submission Status</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed & Recorded
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-neutral-500 dark:text-neutral-400">Target Role</span>
            <span className="font-semibold text-neutral-900 dark:text-white">
              {submission?.jobTitle || interview?.jobTitle || '—'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-neutral-500 dark:text-neutral-400">Organization</span>
            <span className="font-semibold text-neutral-900 dark:text-white">
              {interview?.companyName || '—'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-neutral-500 dark:text-neutral-400">Timestamp</span>
            <span className="font-mono text-neutral-700 dark:text-neutral-300">
              {new Date(submission?.submittedAt || Date.now()).toLocaleString()}
            </span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-neutral-500 dark:text-neutral-400">Audit Protocol</span>
            <span className="text-neutral-700 dark:text-neutral-300 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Proctoring Log Saved
            </span>
          </div>
        </div>

        {/* CTA Button */}
        <div>
          <Link
            to="/candidate/dashboard"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-sm shadow-md transition-all transform hover:-translate-y-0.5"
          >
            <span>Return to Candidate Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </main>

      {/* Footer info */}
      <footer className="p-6 text-center text-xs text-neutral-400 border-t border-neutral-200 dark:border-neutral-800">
        NexaHire — Secure Submission Handshake Completed
      </footer>

    </div>
  );
}
