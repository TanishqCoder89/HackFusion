import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Globe2,
  FileCheck2,
  Code2,
  CheckCircle,
  PlayCircle,
  Users2,
  Layers,
  ChevronRight
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// Configurable hero video path
const HERO_VIDEO_PATH = '/videos/hero-video.mp4';
const FALLBACK_VIDEO_PATH = '/parallax.mp4';

export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef(null);

  // Check prefers-reduced-motion
  const prefersReducedMotion = typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (prefersReducedMotion) return;

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [prefersReducedMotion]);

  // Calculate half-parallax translateY (approx 45% of scroll distance)
  const parallaxTranslateY = prefersReducedMotion ? 0 : Math.min(scrollY * 0.45, 350);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0A0A] text-neutral-900 dark:text-white selection:bg-sky-500/20 selection:text-sky-500">
      
      {/* Floating Navbar */}
      <Navbar />

      {/* Hero Section with Half-Parallax Video */}
      <section
        id="hero"
        className="relative w-full min-h-[92vh] sm:min-h-screen flex items-center justify-center overflow-hidden pt-20"
      >
        {/* Parallax Video Container */}
        <div
          className="absolute inset-0 w-full h-[125%] -top-[12%] pointer-events-none will-change-transform"
          style={{
            transform: `translate3d(0, ${parallaxTranslateY}px, 0)`,
            transition: prefersReducedMotion ? 'none' : 'transform 0.05s linear'
          }}
        >
          <video
            ref={videoRef}
            src={HERO_VIDEO_PATH}
            onError={() => {
              // Try fallback path if first fails
              if (videoRef.current && videoRef.current.src !== window.location.origin + FALLBACK_VIDEO_PATH) {
                videoRef.current.src = FALLBACK_VIDEO_PATH;
              } else {
                setVideoError(true);
              }
            }}
            onLoadedData={() => setVideoLoaded(true)}
            autoPlay
            loop
            muted
            playsInline
            className={`w-full h-full object-cover object-center transition-opacity duration-1000 ${
              videoLoaded ? 'opacity-85 dark:opacity-65' : 'opacity-0'
            }`}
          />

          {/* Fallback solid background if video fails or is loading */}
          {(!videoLoaded || videoError) && (
            <div className="absolute inset-0 bg-neutral-900 opacity-90" />
          )}

          {/* Solid Overlays for readable typography */}
          <div className="absolute inset-0 bg-white/70 dark:bg-[#0A0A0A]/75" />
        </div>

        {/* Hero Foreground Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-16 sm:py-24">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border border-neutral-200/80 dark:border-neutral-700/80 shadow-xs mb-8">
            <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></span>
            <span className="text-xs font-semibold tracking-wide text-neutral-800 dark:text-neutral-200">
              Multilingual Adaptive Interview Intelligence
            </span>
          </div>

          {/* Headline - Single Solid Color */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-neutral-900 dark:text-white leading-[1.1] mb-6">
            Interviews That Understand <br className="hidden sm:inline" />
            <span className="text-sky-500 dark:text-sky-400">
              Every Candidate.
            </span>
          </h1>

          {/* Description */}
          <p className="max-w-2xl mx-auto text-base sm:text-xl text-neutral-600 dark:text-neutral-300 leading-relaxed mb-10 font-normal">
            A smarter way to assess talent through multilingual interviews, personalized questions, and structured skill evaluations.
          </p>

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-sm shadow-lg shadow-sky-500/25 transition-all transform hover:-translate-y-0.5"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href="#how-it-works"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border border-neutral-300/80 dark:border-neutral-700/80 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 font-semibold text-sm shadow-xs transition-all"
            >
              <span>Explore How It Works</span>
              <ChevronRight className="w-4 h-4 text-neutral-400" />
            </a>
          </div>

          {/* Trust metric preview */}
          <div className="mt-14 pt-8 border-t border-neutral-200/60 dark:border-neutral-800/60 flex flex-wrap items-center justify-center gap-8 sm:gap-14 text-xs font-medium text-neutral-500 dark:text-neutral-400">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>Resume-tailored questions</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>C++ sandboxed coding editor</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>Multilingual speech & text</span>
            </div>
          </div>

        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="py-24 sm:py-32 bg-neutral-50/60 dark:bg-[#0D0D0D] border-y border-neutral-200/60 dark:border-neutral-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-sky-600 dark:text-sky-400">
              About the Platform
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
              Rethinking the First Interview.
            </h2>
            <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-300 leading-relaxed font-normal">
              NexaHire helps companies streamline initial screening while giving candidates a structured opportunity to demonstrate their skills. The platform combines resume-based questions, multilingual interviews, coding assessments, and transparent evaluation workflows.
            </p>
          </div>

          {/* Three Concise Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Highlight 1 */}
            <div className="bg-white dark:bg-[#141414] p-8 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950/50 text-sky-500 dark:text-sky-400 flex items-center justify-center mb-6">
                <Globe2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-3">
                Multilingual Accessibility
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Break language barriers with seamless multilingual question presentation and natural spoken or typed responses, ensuring talent isn’t limited by language fluency alone.
              </p>
            </div>

            {/* Highlight 2 */}
            <div className="bg-white dark:bg-[#141414] p-8 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950/50 text-sky-500 dark:text-sky-400 flex items-center justify-center mb-6">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-3">
                Structured and Consistent Interviews
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Eliminate interviewer subjectivity through standardized evaluation rubrics, calibrated scoring models, and comprehensive session audit logs reviewed by human recruiters.
              </p>
            </div>

            {/* Highlight 3 */}
            <div className="bg-white dark:bg-[#141414] p-8 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950/50 text-sky-500 dark:text-sky-400 flex items-center justify-center mb-6">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-3">
                Resume-Based Skill Assessment
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Intelligently parses uploaded resumes to generate targeted questions that directly challenge the candidate's actual projects, frameworks, and claimed domain proficiencies.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-20">
            <span className="text-xs font-bold uppercase tracking-widest text-sky-600 dark:text-sky-400">
              Clear 5-Step Process
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
              How It Works
            </h2>
            <p className="text-base text-neutral-600 dark:text-neutral-400">
              From job creation to data-backed hiring decisions, designed for speed and transparency.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative">
            
            {/* Step 1 */}
            <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-[#141414] border border-neutral-200/70 dark:border-neutral-800 space-y-3 relative">
              <span className="text-3xl font-extrabold text-sky-500 dark:text-sky-400">01</span>
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                Create & Configure
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Companies create a job opening and configure an interview session with custom skill rubrics and coding requirements.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-[#141414] border border-neutral-200/70 dark:border-neutral-800 space-y-3 relative">
              <span className="text-3xl font-extrabold text-sky-500 dark:text-sky-400">02</span>
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                Apply & Upload Resume
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Candidates apply and upload their PDF or DOCX resume to extract education, experience, and verified technical skills.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-[#141414] border border-neutral-200/70 dark:border-neutral-800 space-y-3 relative">
              <span className="text-3xl font-extrabold text-sky-500 dark:text-sky-400">03</span>
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                Generate Questions
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                The system dynamically selects or generates interview questions calibrated directly against the job and candidate profile.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-[#141414] border border-neutral-200/70 dark:border-neutral-800 space-y-3 relative">
              <span className="text-3xl font-extrabold text-sky-500 dark:text-sky-400">04</span>
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                Interview & Coding
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Candidates complete the proctored interview room questions followed by the professional C++ coding assessment.
              </p>
            </div>

            {/* Step 5 */}
            <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-[#141414] border border-neutral-200/70 dark:border-neutral-800 space-y-3 relative">
              <span className="text-3xl font-extrabold text-sky-500 dark:text-sky-400">05</span>
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                Review & Reports
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Companies review candidate responses, code correctness, proctoring audit trails, and structured evaluation reports.
              </p>
            </div>

          </div>

          {/* Bottom CTA Banner - Solid Single Color */}
          <div className="mt-20 p-8 sm:p-12 rounded-3xl bg-neutral-900 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl border border-neutral-800">
            <div className="space-y-2 text-center md:text-left">
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Ready to experience modern AI recruitment?
              </h3>
              <p className="text-neutral-400 text-sm max-w-xl">
                Try the candidate interview flow or log in as a recruiter to review submissions in real time.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/signup"
                className="px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-sm shadow transition-all"
              >
                Sign Up Now
              </Link>
              <Link
                to="/login"
                className="px-6 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-sm border border-neutral-700 transition-all"
              >
                Sign In
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* Footer */}
      <Footer />

    </div>
  );
}
