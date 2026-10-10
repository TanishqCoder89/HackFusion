import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Play, ArrowLeft, AlertCircle, CheckCircle, Bot } from 'lucide-react';
import WebcamPreview from '../components/WebcamPreview';
import ProctoringRules from '../components/ProctoringRules';
import ThemeToggle from '../components/ThemeToggle';
import { getInterviewById } from '../services/storageService';

export default function InterviewSetupPage() {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState(null);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let cancelled = false;
    getInterviewById(interviewId)
      .then((i) => { if (!cancelled) setInterview(i); })
      .catch((err) => { if (!cancelled) setLoadError(err.message); });
    return () => { cancelled = true; };
  }, [interviewId]);

  const [hasPermissions, setHasPermissions] = useState(false);
  const [rulesAccepted, setRulesAccepted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isStarting, setIsStarting] = useState(false);

  const handleStartInterview = async () => {
    setErrorMsg('');

    if (!rulesAccepted) {
      setErrorMsg('Please read and accept the proctoring rules and session integrity terms.');
      return;
    }

    setIsStarting(true);

    try {
      // Request fullscreen as direct user action
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen().catch(() => {
          console.warn('Fullscreen request bypassed by browser policy');
        });
      }

      // Initialize session state
      sessionStorage.setItem(`interview_started_${interviewId}`, Date.now().toString());
      sessionStorage.setItem(`interview_strikes_${interviewId}`, '0');

      navigate(`/interview/${interviewId}/session`);
    } catch (err) {
      console.error(err);
      navigate(`/interview/${interviewId}/session`);
    } finally {
      setIsStarting(false);
    }
  };

  if (loadError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-neutral-100 dark:bg-[#0A0A0A] text-sm">
        <p className="text-red-500">{loadError}</p>
        <Link to="/candidate/dashboard" className="text-sky-500 underline">Back to dashboard</Link>
      </div>
    );
  }
  if (!interview) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-100 dark:bg-[#0A0A0A]">
        <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-[#0A0A0A] text-neutral-900 dark:text-white flex flex-col justify-between">
      
      {/* Top Navbar */}
      <header className="h-16 bg-white dark:bg-[#121212] border-b border-neutral-200 dark:border-neutral-800 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Link
            to="/candidate/dashboard"
            className="p-2 rounded-xl text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            title="Return to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-base font-bold text-neutral-900 dark:text-white leading-tight">
              Pre-Interview System & Proctoring Check
            </h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {interview.title} • {interview.companyName}
            </p>
          </div>
        </div>

        <ThemeToggle />
      </header>

      {/* Main Two-Panel Layout */}
      <main className="max-w-7xl mx-auto w-full p-4 sm:p-8 flex-1">
        
        {/* Error notification */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 flex items-center gap-3 text-xs text-red-600 dark:text-red-300">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="font-semibold">{errorMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* Left Panel: Proctoring Rules */}
          <div>
            <ProctoringRules />
          </div>

          {/* Right Panel: Hardware & Webcam Preview */}
          <div className="space-y-6">
            <WebcamPreview onPermissionsGranted={(granted) => setHasPermissions(granted)} />

            {/* Bottom Consent and Launch Card */}
            <div className="bg-white dark:bg-[#171717] rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 sm:p-7 shadow-sm space-y-5">
              <div className="space-y-3">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rulesAccepted}
                    onChange={(e) => {
                      setRulesAccepted(e.target.checked);
                      if (e.target.checked) setErrorMsg('');
                    }}
                    className="mt-1 w-4 h-4 rounded text-sky-500 focus:ring-sky-400"
                  />
                  <div className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    <span className="font-bold text-neutral-900 dark:text-white block mb-0.5">
                      Explicit Consent & Session Declaration
                    </span>
                    I acknowledge that full-screen status and browser focus will be monitored during the {interview.durationMinutes}-minute assessment. My camera and microphone will only be utilized for this active session.
                  </div>
                </label>
              </div>

              <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-neutral-500 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Encrypted peer-to-cloud session token</span>
                </div>

                <button
                  type="button"
                  onClick={handleStartInterview}
                  disabled={isStarting}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-sm shadow-md transition-all transform active:scale-98 disabled:opacity-50"
                >
                  <Play className="w-4 h-4" />
                  <span>{isStarting ? 'Launching Session...' : 'Start Interview'}</span>
                </button>
              </div>
            </div>

          </div>

        </div>

      </main>

    </div>
  );
}
