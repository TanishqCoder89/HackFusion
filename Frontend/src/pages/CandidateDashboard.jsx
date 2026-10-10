import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Menu,
  Bell,
  Sparkles,
  Calendar,
  Clock,
  Briefcase,
  PlayCircle,
  CheckCircle2,
  AlertCircle,
  Award,
  ChevronRight,
  TrendingUp,
  FileCheck,
  Code2,
  ExternalLink
} from 'lucide-react';
import DashboardSidebar from '../components/DashboardSidebar';
import ThemeToggle from '../components/ThemeToggle';
import ResumeUploader from '../components/ResumeUploader';
import { useAuth } from '../context/AuthContext';
import {
  getCandidateProfile,
  getInterviews,
  getSubmissions,
  getCodingProblems,
  getAdaptiveQuestions,
  getPracticeAttempts
} from '../services/storageService';

export default function CandidateDashboard() {
  const { user } = useAuth();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.tab || 'overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [profile, setProfile] = useState({ name: user?.name, email: user?.email, skills: [], profileCompletion: user?.profileCompletion || 0 });
  const [interviews, setInterviews] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [codingProblems, setCodingProblems] = useState({});
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [practiceStats, setPracticeStats] = useState({});
  const [loadError, setLoadError] = useState('');

  // All data comes from the MySQL-backed API; reload whenever the tab changes.
  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getCandidateProfile(),
      getInterviews(),
      getSubmissions(),
      getCodingProblems(),
      getAdaptiveQuestions(),
      getPracticeAttempts()
    ])
      .then(([prof, ints, subs, probs, questions, attempts]) => {
        if (cancelled) return;
        setProfile(prof);
        setInterviews(ints);
        setSubmissions(subs);
        setCodingProblems(probs);
        setGeneratedQuestions(questions);
        setPracticeStats(Object.fromEntries(attempts.map((a) => [a.problemId, a])));
        setLoadError('');
      })
      .catch((err) => { if (!cancelled) setLoadError(err.message); });
    return () => { cancelled = true; };
  }, [activeTab]);

  const candidateSubmissions = submissions;
  const latestReport = candidateSubmissions[0]?.evaluationReport;

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-[#0A0A0A] flex text-neutral-900 dark:text-white">
      
      {/* Sidebar */}
      <DashboardSidebar
        role="candidate"
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Topbar */}
        <header className="h-16 bg-white dark:bg-[#121212] border-b border-neutral-200 dark:border-neutral-800 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white capitalize">
              {activeTab.replace('-', ' ')}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="h-8 w-px bg-neutral-200 dark:border-neutral-800 mx-1"></div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-sky-500 flex items-center justify-center text-white font-bold text-xs shadow-xs">
                {user?.name ? user.name[0].toUpperCase() : 'A'}
              </div>
              <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 hidden sm:inline">
                {user?.name || profile.name}
              </span>
            </div>
          </div>
        </header>

        {/* Dashboard Viewport */}
        <main className="p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-8">
          {loadError && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-xs text-red-700 dark:text-red-300">
              {loadError}
            </div>
          )}
          
          {/* TAB: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              
              {/* Welcome & Profile completion banner */}
              <div className="p-6 sm:p-8 rounded-3xl bg-sky-600 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-white shadow-md relative overflow-hidden">
                <div className="relative z-10 max-w-2xl space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold border border-white/25">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Candidate Profile Ready</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                    Welcome back, {user?.name || profile.name}!
                  </h2>
                  <p className="text-white/80 text-sm leading-relaxed">
                    {interviews.filter(i => i.status !== 'Completed').length > 0
                      ? <>You have <span className="font-bold text-white">{interviews.filter(i => i.status !== 'Completed').length}</span> interview(s) waiting for you. </>
                      : 'No interviews are waiting for you right now. '}
                    Your profile lists {profile.skills?.length || 0} technical proficiencies.
                  </p>
                  
                  {/* Progress bar */}
                  <div className="pt-2">
                    <div className="flex justify-between text-xs font-semibold mb-1.5">
                      <span>Profile Completeness</span>
                      <span>{profile.profileCompletion}%</span>
                    </div>
                    <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-white rounded-full transition-all duration-500"
                        style={{ width: `${profile.profileCompletion}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-white dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-2">
                  <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Available Sessions</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-bold">{interviews.length}</span>
                    <span className="text-xs text-sky-500 dark:text-sky-400 font-semibold">Active</span>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-2">
                  <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Coding Assessments</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-bold">{Object.keys(codingProblems).length}</span>
                    <span className="text-xs text-emerald-500 font-semibold">C++ Ready</span>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-2">
                  <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Completed Sessions</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-bold">{candidateSubmissions.length}</span>
                    <span className="text-xs text-neutral-400 font-semibold">Submissions</span>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-2">
                  <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Evaluated Score</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-bold">
                      {latestReport ? `${latestReport.overallScore}%` : '—'}
                    </span>
                    <span className="text-xs text-emerald-500 font-semibold">{latestReport?.verdict || 'No submissions yet'}</span>
                  </div>
                </div>
              </div>

              {/* Ready to start interview card */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                    Next Scheduled Assessment
                  </h3>
                  <button
                    onClick={() => setActiveTab('available')}
                    className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
                  >
                    <span>View all</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {interviews.filter(i => i.status !== 'Completed').slice(0, 1).map((interview) => (
                  <div
                    key={interview.id}
                    className="p-6 rounded-2xl bg-white dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6"
                  >
                    <div className="space-y-2 max-w-xl">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400">
                          {interview.status}
                        </span>
                        <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                          {interview.companyName}
                        </span>
                      </div>
                      <h4 className="text-lg font-bold text-neutral-900 dark:text-white">
                        {interview.title}
                      </h4>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                        {interview.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400 pt-1">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" /> {interview.durationMinutes} minutes
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" /> Oct 12, 2026
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Code2 className="w-3.5 h-3.5" /> C++ Coding Stage Included
                        </span>
                      </div>
                    </div>

                    <Link
                      to={`/interview/${interview.id}/setup`}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-md transition-all shrink-0 hover:scale-[1.02] active:scale-98"
                    >
                      <PlayCircle className="w-4 h-4" />
                      <span>Join Assessment Room</span>
                    </Link>
                  </div>
                ))}
              </div>

              {/* Recommended Skill Improvements */}
              <div className="p-6 rounded-2xl bg-white dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-sky-500 dark:text-sky-400" />
                      <span>AI Curriculum & Skill Alignment</span>
                    </h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                      Suggested focus areas based on common engineering interview topics:
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/70 dark:border-neutral-700/60">
                    <span className="font-bold text-neutral-900 dark:text-white block mb-1">C++ Move Semantics</span>
                    <p className="text-neutral-600 dark:text-neutral-400 text-[11px]">
                      Recommended for low-latency algorithmic questions. Review std::unique_ptr move transfers.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/70 dark:border-neutral-700/60">
                    <span className="font-bold text-neutral-900 dark:text-white block mb-1">SSE vs WebSockets</span>
                    <p className="text-neutral-600 dark:text-neutral-400 text-[11px]">
                      Frequently queried in Full-Stack AI streaming architecture questions.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/70 dark:border-neutral-700/60">
                    <span className="font-bold text-neutral-900 dark:text-white block mb-1">Prefix Sum & Hash Maps</span>
                    <p className="text-neutral-600 dark:text-neutral-400 text-[11px]">
                      Key algorithmic structure featured in current live assessment challenge.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB: MY RESUME */}
          {activeTab === 'resume' && (
            <div className="space-y-6">
              <ResumeUploader
                profile={profile}
                onProfileUpdated={(updated) => setProfile(updated)}
              />

              {/* Dynamic Adaptive Questions generated from resume */}
              <div className="bg-white dark:bg-[#171717] rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm space-y-4">
                <div className="border-b border-neutral-200 dark:border-neutral-800 pb-3">
                  <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-sky-500 dark:text-sky-400" />
                    <span>Dynamic Questions Generated From Your Background</span>
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                    Our adaptive system creates candidate-specific questions directly from your verified skills:
                  </p>
                </div>

                <div className="space-y-3">
                  {generatedQuestions.map((q, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/70 dark:border-neutral-700/70 space-y-1 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider text-[10px]">
                          Target Skill: {q.skill} • {q.category}
                        </span>
                        <span className="text-[10px] text-neutral-400">Generated</span>
                      </div>
                      <p className="text-neutral-800 dark:text-neutral-200 font-medium">
                        "{q.question}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: AVAILABLE INTERVIEWS */}
          {activeTab === 'available' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                  Available Interview Sessions
                </h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  You are authorized to participate in these company assessments. Click "Join Interview" to start hardware verification.
                </p>
              </div>

              <div className="space-y-4">
                {interviews.map((interview) => (
                  <div
                    key={interview.id}
                    className="p-6 rounded-2xl bg-white dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6"
                  >
                    <div className="space-y-2 max-w-xl">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300">
                          {interview.status}
                        </span>
                        <span className="text-xs text-neutral-500 dark:text-neutral-400">
                          {interview.companyName}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                        {interview.title}
                      </h3>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400">
                        {interview.description}
                      </p>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {interview.requiredSkills?.map((skill) => (
                          <span
                            key={skill}
                            className="px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-[11px] text-neutral-700 dark:text-neutral-300"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
                      {interview.status === 'Completed' ? (
                        <span className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-500 font-bold text-xs">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Submitted</span>
                        </span>
                      ) : (
                        <Link
                          to={`/interview/${interview.id}/setup`}
                          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow transition-all hover:scale-[1.02]"
                        >
                          <PlayCircle className="w-4 h-4" />
                          <span>Join Interview</span>
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: CODING ASSESSMENTS */}
          {activeTab === 'coding' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                  Technical Coding Challenges
                </h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  Practice real coding problems; your code is compiled and run against the test cases.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.values(codingProblems).map((prob) => (
                  <div
                    key={prob.id}
                    className="p-6 rounded-2xl bg-white dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800 shadow-xs flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                          {prob.difficulty}
                        </span>
                        <span className="text-xs font-mono text-neutral-400">
                          {(prob.language || 'cpp').toUpperCase()}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                        {prob.title}
                      </h3>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-3">
                        {prob.description}
                      </p>
                    </div>

                    <div className="pt-2 flex items-center justify-between border-t border-neutral-100 dark:border-neutral-800/80">
                      <span className="text-xs text-neutral-500">
                        {prob.testCases?.length || 0} Test Cases
                      </span>
                      {practiceStats[prob.id] && (
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                          Best {practiceStats[prob.id].bestScore}%
                        </span>
                      )}
                      <Link
                        to={`/practice/${prob.id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline"
                      >
                        <span>Practice</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: RESULTS & FEEDBACK */}
          {activeTab === 'results' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                  Evaluation Reports & Feedback
                </h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  Transparent summary of submitted interviews and rubric scores.
                </p>
              </div>

              {candidateSubmissions.length === 0 ? (
                <div className="p-8 text-center bg-white dark:bg-[#141414] rounded-2xl border border-neutral-200 dark:border-neutral-800 text-neutral-400 text-sm">
                  No submissions yet. Complete an interview to view your results.
                </div>
              ) : (
                candidateSubmissions.map((sub) => (
                  <div
                    key={sub.id}
                    className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-6"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-200 dark:border-neutral-800 pb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400">
                            {sub.evaluationReport?.verdict || 'Strong Hire'}
                          </span>
                          <span className="text-xs text-neutral-400">
                            Submitted {new Date(sub.submittedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                          {sub.interviewTitle}
                        </h3>
                        <p className="text-xs text-neutral-500">{sub.jobTitle}</p>
                      </div>

                      <div className="text-right">
                        <span className="text-3xl font-extrabold text-sky-500 dark:text-sky-400">
                          {sub.evaluationReport?.overallScore || 94}
                        </span>
                        <span className="text-sm text-neutral-400"> / 100</span>
                      </div>
                    </div>

                    {/* Breakdown metrics */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/40">
                        <span className="text-neutral-500 block">Technical Knowledge</span>
                        <span className="text-base font-bold text-neutral-900 dark:text-white">
                          {sub.evaluationReport?.rubricScores?.technicalKnowledge || 93}%
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/40">
                        <span className="text-neutral-500 block">Communication</span>
                        <span className="text-base font-bold text-neutral-900 dark:text-white">
                          {sub.evaluationReport?.rubricScores?.communicationClarity || 91}%
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/40">
                        <span className="text-neutral-500 block">Coding Correctness</span>
                        <span className="text-base font-bold text-neutral-900 dark:text-white">
                          {sub.evaluationReport?.rubricScores?.codingCorrectness || 100}%
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/40">
                        <span className="text-neutral-500 block">Integrity Score</span>
                        <span className="text-base font-bold text-neutral-900 dark:text-white">
                          {sub.proctoringSummary?.integrityScore || 98}%
                        </span>
                      </div>
                    </div>

                    {/* Recruiter feedback notes */}
                    {sub.evaluationReport?.recruiterNotes && (
                      <div className="p-4 rounded-xl bg-sky-50/50 dark:bg-sky-950/20 border border-sky-100 dark:border-sky-900/30 text-xs space-y-1">
                        <span className="font-bold text-neutral-900 dark:text-white block">
                          Company Evaluation Feedback
                        </span>
                        <p className="text-neutral-700 dark:text-neutral-300 italic">
                          "{sub.evaluationReport.recruiterNotes}"
                        </p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="bg-white dark:bg-[#141414] rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 sm:p-7 space-y-4 max-w-2xl text-xs">
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Account Settings</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-neutral-600 dark:text-neutral-400 mb-1 font-semibold">Full Name</label>
                  <input
                    type="text"
                    disabled
                    value={user?.name || profile.name}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300"
                  />
                </div>
                <div>
                  <label className="block text-neutral-600 dark:text-neutral-400 mb-1 font-semibold">Email Address</label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || profile.email}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300"
                  />
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

    </div>
  );
}
