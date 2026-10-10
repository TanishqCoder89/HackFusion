import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Video,
  Code2,
  Award,
  Settings,
  LogOut,
  Briefcase,
  PlusCircle,
  Users,
  BarChart3,
  ClipboardList,
  Sparkles,
  Bot
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function DashboardSidebar({ activeTab, setActiveTab, role = 'candidate', isOpen, setIsOpen }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const candidateNavItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'resume', label: 'My Resume', icon: FileText },
    { id: 'available', label: 'Available Interviews', icon: Video },
    { id: 'coding', label: 'Coding Assessments', icon: Code2 },
    { id: 'results', label: 'Results & Feedback', icon: Award },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const companyNavItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'jobs', label: 'Job Openings', icon: Briefcase },
    { id: 'create-interview', label: 'Create Interview', icon: PlusCircle },
    { id: 'invitations', label: 'Interview Invitations', icon: ClipboardList },
    { id: 'candidates', label: 'Candidates Directory', icon: Users },
    { id: 'coding-problems', label: 'Coding Assessments', icon: Code2 },
    { id: 'reports', label: 'Evaluation Reports', icon: Award },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const items = role === 'company' ? companyNavItems : candidateNavItems;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/40 z-30 lg:hidden backdrop-blur-xs"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 bottom-0 left-0 lg:h-screen lg:self-start z-40 w-64 bg-white dark:bg-[#121212] border-r border-neutral-200 dark:border-neutral-800 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Branding */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="h-16 flex items-center gap-3 px-6 border-b border-neutral-200 dark:border-neutral-800">
            <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center text-white shadow-sm">
              <Bot className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm tracking-tight text-neutral-900 dark:text-white leading-tight">
                Nexa<span className="text-sky-500 dark:text-sky-400">Hire</span>
              </span>
              <span className="text-[10px] uppercase font-semibold text-neutral-400">
                {role === 'company' ? 'Recruiter Hub' : 'Candidate Workspace'}
              </span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-1">
            {items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    if (setIsOpen) setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 border border-sky-200/80 dark:border-sky-800/40 shadow-xs'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-sky-500 dark:text-sky-400' : 'text-neutral-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom User info & Logout */}
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 shrink-0">
          <Link
            to="/profile"
            title="View my profile"
            className="block p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700/60 mb-2 hover:border-sky-400 transition-colors"
          >
            <p className="text-xs font-bold text-neutral-900 dark:text-white truncate">
              {user?.name}
            </p>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
              {user?.email || 'user@example.com'}
            </p>
          </Link>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
