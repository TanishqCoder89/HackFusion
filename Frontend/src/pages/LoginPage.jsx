import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Bot, Eye, EyeOff, Lock, Mail, ArrowRight, UserCheck, Briefcase, AlertCircle, Sparkles } from 'lucide-react';
import Slideshow from '../components/Slideshow';
import ThemeToggle from '../components/ThemeToggle';
import { useAuth } from '../context/AuthContext';

const SHOW_DEMO = import.meta.env.DEV || import.meta.env.VITE_SHOW_DEMO === 'true';

export default function LoginPage() {
  const [role, setRole] = useState('candidate'); // 'candidate' | 'company'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');

  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleFillDemo = (demoRole) => {
    setRole(demoRole);
    if (demoRole === 'candidate') {
      setEmail('alex@candidate.com');
      setPassword('password123');
    } else {
      setEmail('recruiter@techcorp.io');
      setPassword('password123');
    }
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    const res = await login(email, password, role);
    if (res.success) {
      const target = location.state?.from?.pathname || (role === 'company' ? '/company/dashboard' : '/candidate/dashboard');
      navigate(target, { replace: true });
    } else {
      setError(res.error || 'Authentication failed. Please verify credentials.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white dark:bg-[#0A0A0A] text-neutral-900 dark:text-white">
      
      {/* Left 55% Column: Dynamic Slideshow */}
      <div className="hidden lg:block lg:w-[55%] relative h-screen sticky top-0 overflow-hidden">
        <Slideshow />
      </div>

      {/* Right 45% Column: Authentication Form Panel */}
      <div className="w-full lg:w-[45%] min-h-screen flex flex-col justify-between p-6 sm:p-12 lg:p-14 overflow-y-auto">
        
        {/* Top Navbar items inside right panel */}
        <div className="flex items-center justify-between pb-8">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-500 flex items-center justify-center text-white shadow-sm">
              <Bot className="w-4 h-4" />
            </div>
            <span className="font-bold text-base tracking-tight text-neutral-900 dark:text-white">
              Nexa<span className="text-sky-500 dark:text-sky-400">Hire</span>
            </span>
          </Link>
          <ThemeToggle />
        </div>

        {/* Center Auth Form */}
        <div className="max-w-md w-full mx-auto my-auto py-6 space-y-6">
          
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
              Welcome back
            </h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              Select your workspace role and enter your credentials.
            </p>
          </div>

          {/* Quick Demo Autofill Helpers: dev builds only (set VITE_SHOW_DEMO=true to show in production) */}
          {SHOW_DEMO && (
          <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-900/80 border border-neutral-200/80 dark:border-neutral-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 font-medium">
              <span className="flex items-center gap-1.5 font-semibold text-neutral-700 dark:text-neutral-300">
                <Sparkles className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" /> Demo Quick-Fill
              </span>
              <span>Click to test role</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleFillDemo('candidate')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all text-left ${
                  role === 'candidate' && email === 'alex@candidate.com'
                    ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-300 dark:border-sky-600 text-sky-700 dark:text-sky-300'
                    : 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 text-neutral-700 dark:text-neutral-300'
                }`}
              >
                <div className="font-bold">Candidate</div>
                <div className="text-[10px] text-neutral-400 truncate">alex@candidate.com</div>
              </button>

              <button
                type="button"
                onClick={() => handleFillDemo('company')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all text-left ${
                  role === 'company' && email === 'recruiter@techcorp.io'
                    ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-300 dark:border-sky-600 text-sky-700 dark:text-sky-300'
                    : 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 text-neutral-700 dark:text-neutral-300'
                }`}
              >
                <div className="font-bold">Company Recruiter</div>
                <div className="text-[10px] text-neutral-400 truncate">recruiter@techcorp.io</div>
              </button>
            </div>
          </div>
          )}

          {/* Role Toggle Selector */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200/80 dark:border-neutral-700/80">
            <button
              type="button"
              onClick={() => { setRole('candidate'); setError(''); }}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                role === 'candidate'
                  ? 'bg-white dark:bg-[#181818] text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />
              <span>Candidate</span>
            </button>
            <button
              type="button"
              onClick={() => { setRole('company'); setError(''); }}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                role === 'company'
                  ? 'bg-white dark:bg-[#181818] text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />
              <span>Company</span>
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-start gap-2.5 text-xs text-red-600 dark:text-red-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                {role === 'company' ? 'Work Email Address' : 'Email Address'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={role === 'company' ? 'recruiter@techcorp.io' : 'alex@candidate.com'}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-300 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-sky-400 dark:focus:ring-sky-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-300 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-sky-400 dark:focus:ring-sky-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-neutral-600 dark:text-neutral-400 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-sky-500 focus:ring-sky-400"
                />
                <span>Remember me</span>
              </label>
              <span className="text-sky-600 dark:text-sky-400 hover:underline cursor-pointer">
                Forgot password?
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-sm shadow-md shadow-sky-500/25 transition-all transform active:scale-98 disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Switch to Signup */}
          <div className="text-center pt-4 text-xs text-neutral-600 dark:text-neutral-400">
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="font-bold text-sky-600 dark:text-sky-400 hover:underline"
            >
              Create an account
            </Link>
          </div>

        </div>

        {/* Footer info */}
        <div className="text-center text-xs text-neutral-400 dark:text-neutral-500 pt-6 border-t border-neutral-200/60 dark:border-neutral-800/60">
          Protected by NexaHire session tokens & proctoring integrity.
        </div>

      </div>

    </div>
  );
}
