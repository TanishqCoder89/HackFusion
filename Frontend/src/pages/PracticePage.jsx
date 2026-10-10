import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Code2, ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import CodeEditor from '../components/CodeEditor';
import ThemeToggle from '../components/ThemeToggle';
import { getCodingProblemById, runCode, savePracticeAttempt } from '../services/storageService';

// Standalone practice mode. It is deliberately NOT part of an interview session:
// going back always returns to the dashboard and never starts or resumes an interview.
export default function PracticePage() {
  const { problemId } = useParams();
  const navigate = useNavigate();

  const [problem, setProblem] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verdict, setVerdict] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getCodingProblemById(problemId)
      .then((p) => { if (!cancelled) setProblem(p); })
      .catch((err) => { if (!cancelled) setLoadError(err.message); });
    return () => { cancelled = true; };
  }, [problemId]);

  const goBack = useCallback(() => navigate('/candidate/dashboard', { state: { tab: 'coding' } }), [navigate]);

  const handleSubmit = async (code, _results, language) => {
    setIsSubmitting(true);
    setVerdict(null);
    try {
      const execution = await runCode({ problemId, code, language, mode: 'submit' });
      await savePracticeAttempt({
        problemId,
        language,
        code,
        passedCount: execution.passedCount,
        totalCount: execution.totalCount,
        score: execution.score,
        status: execution.status
      });
      setVerdict(execution);
    } catch (err) {
      setVerdict({ status: 'Error', error: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-[#0A0A0A] text-neutral-900 dark:text-white flex flex-col">
      <header className="h-16 bg-white dark:bg-[#121212] border-b border-neutral-200 dark:border-neutral-800 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={goBack}
            className="p-2 rounded-xl text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800"
            title="Back to dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="p-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
            <Code2 className="w-5 h-5" />
          </span>
          <div>
            <h1 className="text-sm font-bold leading-tight">Practice — {problem?.title || 'Loading…'}</h1>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">Practice mode • not part of any interview</p>
          </div>
        </div>
        <ThemeToggle />
      </header>

      <main className="max-w-7xl mx-auto w-full p-4 sm:p-6 flex-1 flex flex-col gap-4">
        {loadError && <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 text-xs text-red-700 dark:text-red-300">{loadError}</div>}

        {verdict && (
          <div
            className={`p-4 rounded-xl border text-sm flex items-center gap-3 ${
              verdict.status === 'Accepted'
                ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300'
            }`}
          >
            {verdict.status === 'Accepted' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
            <div>
              <p className="font-bold">{verdict.status}</p>
              <p className="text-xs opacity-90">
                {verdict.error || verdict.compileError
                  ? verdict.error || 'Compilation failed — see the Execution Output tab after running.'
                  : `Passed ${verdict.passedCount} of ${verdict.totalCount} test cases (including hidden ones). Attempt saved.`}
              </p>
            </div>
          </div>
        )}

        {problem && (
          <CodeEditor
            problem={problem}
            onSubmitSolution={handleSubmit}
            isSubmitting={isSubmitting}
            submitLabel="Submit Solution"
            submittingLabel="Evaluating..."
          />
        )}
      </main>
    </div>
  );
}
