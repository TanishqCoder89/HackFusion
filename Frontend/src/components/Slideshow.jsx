import React, { useState, useEffect, useRef } from 'react';
import { Code2, Video, FileCheck, Terminal, LineChart, Globe2, ChevronLeft, ChevronRight } from 'lucide-react';

const SLIDES = [
  {
    id: 1,
    tag: 'Coding Assessment',
    title: 'Show what you can do.',
    subtitle: 'Solve algorithmic challenges in a professional C++ environment with live test runs and automated evaluation.',
    icon: Code2,
    bgColor: 'bg-[#0B132B]',
    accentColor: '#38bdf8',
    previewType: 'code'
  },
  {
    id: 2,
    tag: 'AI Video Interview',
    title: 'Your skills. Your interview. Your opportunity.',
    subtitle: 'Adaptive questions dynamically attuned to your background, projects, and domain specialization.',
    icon: Video,
    bgColor: 'bg-[#0D1B2A]',
    accentColor: '#38bdf8',
    previewType: 'video'
  },
  {
    id: 3,
    tag: 'Resume Intelligence',
    title: 'Assess talent beyond a resume.',
    subtitle: 'Structured information extraction accurately identifies core proficiencies and generates tailored technical screening.',
    icon: FileCheck,
    bgColor: 'bg-[#111D2B]',
    accentColor: '#2dd4bf',
    previewType: 'resume'
  },
  {
    id: 4,
    tag: 'Multilingual Support',
    title: 'Interviews that speak your language.',
    subtitle: 'Break down linguistic barriers with native real-time transcription and multilingual voice interactions.',
    icon: Globe2,
    bgColor: 'bg-[#0F172A]',
    accentColor: '#38bdf8',
    previewType: 'multilingual'
  },
  {
    id: 5,
    tag: 'Recruiter Analytics',
    title: 'Objective, evidence-based hiring decisions.',
    subtitle: 'Transparent scoring rubrics, code correctness stats, and audit logs empower hiring teams to select top talent.',
    icon: LineChart,
    bgColor: 'bg-[#0A192F]',
    accentColor: '#34d399',
    previewType: 'analytics'
  }
];

export default function Slideshow() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef(null);

  // Check prefers-reduced-motion
  const prefersReducedMotion = typeof window !== 'undefined' 
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (isHovered || prefersReducedMotion) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
    }, 5000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isHovered, prefersReducedMotion]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
  };

  const currentSlide = SLIDES[currentIndex];
  const IconComponent = currentSlide.icon;

  return (
    <div
      className="relative w-full h-full min-h-[450px] lg:min-h-screen overflow-hidden flex flex-col justify-between p-8 lg:p-14 text-white select-none group bg-slate-900"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Slides with crossfade - Single solid colors */}
      {SLIDES.map((slide, idx) => (
        <div
          key={slide.id}
          className={`absolute inset-0 ${slide.bgColor} transition-opacity duration-1000 ease-in-out ${
            idx === currentIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        />
      ))}

      {/* Top Header Badge */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-semibold tracking-wide uppercase">
          <IconComponent className="w-3.5 h-3.5 text-white animate-pulse" />
          <span>{currentSlide.tag}</span>
        </div>
        <div className="text-xs font-mono text-white/70 bg-black/20 px-2.5 py-1 rounded-md backdrop-blur-sm">
          0{currentIndex + 1} / 0{SLIDES.length}
        </div>
      </div>

      {/* Center Interactive UI Visual Representation */}
      <div className="relative z-10 my-auto py-6">
        <div className="max-w-md mx-auto rounded-2xl bg-black/40 backdrop-blur-xl border border-white/15 p-5 shadow-2xl transition-all duration-500 transform hover:scale-[1.02]">
          {currentSlide.previewType === 'code' && (
            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-white/10 text-white/60">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/80"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500/80"></span>
                  <span className="ml-2 text-[11px] text-white/80">solution.cpp</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-sans font-semibold">Test Passed (3/3)</span>
              </div>
              <div className="text-white/80 space-y-1">
                <span className="text-sky-300">class</span> <span className="text-yellow-300">Solution</span> {'{'}<br/>
                &nbsp;&nbsp;<span className="text-sky-300">int</span> <span className="text-blue-400">subarraySum</span>(vector&lt;<span className="text-sky-300">int</span>&gt;& nums, <span className="text-sky-300">int</span> k) {'{'}<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-sky-300">unordered_map</span>&lt;<span className="text-sky-300">int</span>, <span className="text-sky-300">int</span>&gt; counts;<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-emerald-400">// O(N) optimal hash tracking</span><br/>
                &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-sky-300">return</span> count;<br/>
                &nbsp;&nbsp;{'}'}<br/>
                {'}'};
              </div>
            </div>
          )}

          {currentSlide.previewType === 'video' && (
            <div className="space-y-3">
              <div className="relative rounded-xl overflow-hidden bg-neutral-900 aspect-video flex items-center justify-center border border-white/10">
                <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                  <Video className="w-6 h-6 text-white" />
                </div>
                <div className="absolute bottom-3 left-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  <span className="text-xs font-medium text-white/90">AI Evaluator • Adaptive Q2/4</span>
                </div>
                <div className="absolute top-3 right-3 text-[10px] px-2 py-0.5 rounded bg-black/60 text-white/80">
                  00:24:15
                </div>
              </div>
              <p className="text-xs text-white/80 italic bg-white/5 p-2 rounded-lg border border-white/10">
                "Tell me how your distributed worker queue maintains consensus under network partition..."
              </p>
            </div>
          )}

          {currentSlide.previewType === 'resume' && (
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between font-semibold pb-2 border-b border-white/10">
                <span className="flex items-center gap-1.5 text-white">
                  <FileCheck className="w-4 h-4 text-teal-400" /> Resume Profile Verified
                </span>
                <span className="text-teal-400 text-[11px]">Match 94%</span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                <div className="bg-white/10 p-2 rounded-lg">
                  <span className="text-white/60 block text-[10px]">Education</span>
                  <span className="font-semibold text-white">B.S. Computer Science</span>
                </div>
                <div className="bg-white/10 p-2 rounded-lg">
                  <span className="text-white/60 block text-[10px]">Experience</span>
                  <span className="font-semibold text-white">Full-Stack & Systems</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 pt-1">
                {['React', 'C++', 'Python', 'Docker', 'System Design'].map((s) => (
                  <span key={s} className="px-2 py-0.5 rounded-md bg-teal-500/20 text-teal-200 text-[10px] border border-teal-500/30">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {currentSlide.previewType === 'multilingual' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-white/10">
                <span className="font-semibold flex items-center gap-1.5">
                  <Globe2 className="w-4 h-4 text-sky-400" /> Multilingual Audio Stream
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-sky-500/30 text-sky-200">Real-time</span>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="p-2 rounded bg-white/10 text-white/90">
                  <span className="text-[10px] text-sky-300 block font-semibold">EN (English)</span>
                  "The state store synchronizes atomic actions..."
                </div>
                <div className="p-2 rounded bg-white/10 text-white/90">
                  <span className="text-[10px] text-sky-300 block font-semibold">ES / DE / HI Transcription</span>
                  "El almacén de estado sincroniza las acciones atómicas..."
                </div>
              </div>
            </div>
          )}

          {currentSlide.previewType === 'analytics' && (
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="font-semibold flex items-center gap-1.5">
                  <LineChart className="w-4 h-4 text-emerald-400" /> Evaluation Report
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                  Strong Hire (94/100)
                </span>
              </div>
              <div className="space-y-1.5">
                <div>
                  <div className="flex justify-between text-[11px] mb-1 text-white/80">
                    <span>Technical Architecture</span>
                    <span>95%</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="w-[95%] h-full bg-emerald-400 rounded-full"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[11px] mb-1 text-white/80">
                    <span>Algorithmic Correctness</span>
                    <span>100%</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="w-[100%] h-full bg-emerald-400 rounded-full"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[11px] mb-1 text-white/80">
                    <span>Proctoring Integrity</span>
                    <span>98%</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="w-[98%] h-full bg-emerald-400 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Content & Navigation */}
      <div className="relative z-10 space-y-5">
        <div>
          <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight mb-2 drop-shadow-sm text-white">
            {currentSlide.title}
          </h2>
          <p className="text-sm lg:text-base text-white/80 max-w-lg leading-relaxed">
            {currentSlide.subtitle}
          </p>
        </div>

        {/* Carousel controls */}
        <div className="flex items-center justify-between pt-2">
          {/* Pagination dots */}
          <div className="flex items-center gap-2">
            {SLIDES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToSlide(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`transition-all duration-300 rounded-full ${
                  idx === currentIndex
                    ? 'w-7 h-2 bg-white'
                    : 'w-2 h-2 bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
          </div>

          {/* Prev / Next buttons */}
          <div className="flex items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handlePrev}
              aria-label="Previous slide"
              className="p-1.5 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-sm border border-white/20 transition-transform active:scale-90"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              aria-label="Next slide"
              className="p-1.5 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-sm border border-white/20 transition-transform active:scale-90"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
