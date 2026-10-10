import React from 'react';
import { Link } from 'react-router-dom';
import { Bot, Mail, Shield, Globe, Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-neutral-50 dark:bg-[#0E0E0E] border-t border-neutral-200/80 dark:border-neutral-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Brand info */}
          <div className="md:col-span-1 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-sky-500 flex items-center justify-center text-white shadow-sm">
                <Bot className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg text-neutral-900 dark:text-white tracking-tight">
                Nexa<span className="text-sky-500 dark:text-sky-400">Hire</span>
              </span>
            </Link>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Empowering fair, multilingual, and structured AI interviews alongside sandboxed coding assessments for forward-thinking engineering teams.
            </p>
            <div className="flex items-center gap-3 text-neutral-500 dark:text-neutral-400 pt-1">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                System Operational
              </span>
            </div>
          </div>

          {/* Quick links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
              Platform
            </h4>
            <ul className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
              <li>
                <a href="#hero" className="hover:text-sky-500 dark:hover:text-sky-400 transition-colors">
                  Home Overview
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-sky-500 dark:hover:text-sky-400 transition-colors">
                  About the Platform
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-sky-500 dark:hover:text-sky-400 transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <Link to="/interview/int-201/setup" className="hover:text-sky-500 dark:hover:text-sky-400 transition-colors flex items-center gap-1">
                  <span>Demo Interview Room</span>
                  <Sparkles className="w-3 h-3 text-amber-500" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Portals */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
              Portals & Roles
            </h4>
            <ul className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
              <li>
                <Link to="/login" className="hover:text-sky-500 dark:hover:text-sky-400 transition-colors">
                  Candidate Login
                </Link>
              </li>
              <li>
                <Link to="/signup" className="hover:text-sky-500 dark:hover:text-sky-400 transition-colors">
                  Candidate Registration
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-sky-500 dark:hover:text-sky-400 transition-colors">
                  Company Recruiter Portal
                </Link>
              </li>
              <li>
                <Link to="/company/dashboard" className="hover:text-sky-500 dark:hover:text-sky-400 transition-colors">
                  Recruitment Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Privacy & Governance */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
              Trust & Security
            </h4>
            <ul className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
              <li className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400">
                <Shield className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />
                <span>Ethical AI & Fair Scoring</span>
              </li>
              <li className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400">
                <Globe className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />
                <span>Multi-Language Audio Evaluation</span>
              </li>
              <li className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400">
                <Mail className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />
                <span>contact@nexahire.ai</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-10 mt-10 border-t border-neutral-200 dark:border-neutral-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 gap-4">
          <p>© {new Date().getFullYear()} NexaHire. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors">
              Privacy Policy
            </span>
            <span className="hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors">
              Proctoring Governance
            </span>
            <span className="hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors">
              Terms of Service
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
