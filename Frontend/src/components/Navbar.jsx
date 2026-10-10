import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Bot, Menu, X, ArrowRight, UserCircle, LogOut } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isLandingPage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 25) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollTo = (id) => {
    setMobileMenuOpen(false);
    if (!isLandingPage) {
      navigate(`/#${id}`);
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/90 dark:bg-[#0A0A0A]/90 backdrop-blur-md shadow-sm border-b border-neutral-200/50 dark:border-neutral-800/60 py-3.5'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Logo & Brand */}
          <Link
            to="/"
            className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 rounded-lg"
          >
            <div className="w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform duration-200">
              <Bot className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight text-neutral-900 dark:text-white leading-tight">
                Nexa<span className="text-sky-500 dark:text-sky-400">Hire</span>
              </span>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-neutral-500 dark:text-neutral-400">
                Interviewer
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8">
            <button
              onClick={() => handleScrollTo('hero')}
              className="text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:text-sky-500 dark:hover:text-sky-400 transition-colors"
            >
              Home
            </button>
            <button
              onClick={() => handleScrollTo('about')}
              className="text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:text-sky-500 dark:hover:text-sky-400 transition-colors"
            >
              About Us
            </button>
            <button
              onClick={() => handleScrollTo('how-it-works')}
              className="text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:text-sky-500 dark:hover:text-sky-400 transition-colors"
            >
              How It Works
            </button>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />

            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  to={user.role === 'company' ? '/company/dashboard' : '/candidate/dashboard'}
                  className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all border border-neutral-300/60 dark:border-neutral-700"
                >
                  <UserCircle className="w-4 h-4 text-sky-500 dark:text-sky-400" />
                  <span>{user.role === 'company' ? 'Company Hub' : 'My Dashboard'}</span>
                </Link>
                <button
                  onClick={logout}
                  title="Sign out"
                  className="p-2 rounded-xl text-neutral-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-sm font-medium px-4 py-2 text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white shadow-sm hover:shadow hover:shadow-sky-500/20 transition-all duration-200 transform hover:-translate-y-0.5"
                >
                  <span>Sign Up</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-3 pb-6 bg-white dark:bg-[#0A0A0A] border-b border-neutral-200 dark:border-neutral-800 shadow-xl space-y-3">
          <div className="flex flex-col space-y-2">
            <button
              onClick={() => handleScrollTo('hero')}
              className="text-left px-3 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg"
            >
              Home
            </button>
            <button
              onClick={() => handleScrollTo('about')}
              className="text-left px-3 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg"
            >
              About Us
            </button>
            <button
              onClick={() => handleScrollTo('how-it-works')}
              className="text-left px-3 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg"
            >
              How It Works
            </button>
          </div>

          <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 flex flex-col gap-2">
            {user ? (
              <>
                <Link
                  to={user.role === 'company' ? '/company/dashboard' : '/candidate/dashboard'}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 font-semibold text-sm text-neutral-800 dark:text-neutral-200"
                >
                  {user.role === 'company' ? 'Company Dashboard' : 'Candidate Dashboard'}
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-center py-2 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-sm font-medium text-neutral-700 dark:text-neutral-300"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl bg-sky-500 text-white font-semibold text-sm shadow"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
