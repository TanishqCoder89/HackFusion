import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, GraduationCap, Building2, Globe, FileText, Award, Briefcase, Save, LogOut } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import { useAuth } from '../context/AuthContext';
import {
  getSubmissions,
  getInterviews,
  getJobs,
  getPracticeAttempts,
  updateCompanyProfile,
  updateCandidateProfile,
  getCandidateProfile
} from '../services/storageService';

const inputCls =
  'w-full px-3 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-sm';

const FIELDS = {
  candidate: [
    ['name', 'Full name'],
    ['phone', 'Phone'],
    ['college', 'College / University'],
    ['degree', 'Degree'],
    ['graduationYear', 'Graduation year']
  ],
  company: [
    ['name', 'Contact name'],
    ['companyName', 'Company name'],
    ['designation', 'Designation'],
    ['website', 'Website'],
    ['industry', 'Industry'],
    ['size', 'Company size'],
    ['phone', 'Phone']
  ]
};

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuth();
  const role = user?.role;
  const dashboard = role === 'company' ? '/company/dashboard' : '/candidate/dashboard';

  const [profile, setProfile] = useState(user);
  const [form, setForm] = useState({});
  const [stats, setStats] = useState([]);
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (role === 'candidate') {
          const [prof, subs, attempts] = await Promise.all([getCandidateProfile(), getSubmissions(), getPracticeAttempts()]);
          if (cancelled) return;
          const scores = subs.map((s) => s.evaluationReport?.overallScore).filter((n) => typeof n === 'number');
          setProfile({ ...user, ...prof });
          setStats([
            ['Interviews completed', subs.length],
            ['Average score', scores.length ? `${Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)}%` : '—'],
            ['Problems practiced', attempts.length]
          ]);
        } else {
          const [jobs, ints, subs] = await Promise.all([getJobs(), getInterviews(), getSubmissions()]);
          if (cancelled) return;
          setStats([['Job openings', jobs.length], ['Interviews published', ints.length], ['Candidate submissions', subs.length]]);
        }
      } catch (err) {
        if (!cancelled) setMsg(err.message);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  useEffect(() => {
    const next = {};
    (FIELDS[role] || []).forEach(([key]) => { next[key] = profile?.[key] ?? ''; });
    setForm(next);
  }, [profile, role]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    try {
      const updated = role === 'candidate' ? await updateCandidateProfile(form) : await updateCompanyProfile(form);
      setProfile((p) => ({ ...p, ...updated }));
      updateUser(updated);
      setMsg('Profile saved.');
    } catch (err) {
      setMsg(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;
  const skills = profile?.skills || [];
  const resume = profile?.resume;

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-[#0A0A0A] text-neutral-900 dark:text-white">
      <header className="h-16 bg-white dark:bg-[#121212] border-b border-neutral-200 dark:border-neutral-800 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Link to={dashboard} className="p-2 rounded-xl text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800" title="Back to dashboard">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h1 className="text-base font-bold">My Profile</h1>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button onClick={logout} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30">
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 sm:p-8 space-y-6">
        {/* Identity card */}
        <section className="p-6 rounded-3xl bg-white dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-sky-500 text-white flex items-center justify-center text-3xl font-extrabold shrink-0">
            {(profile?.name || 'U')[0].toUpperCase()}
          </div>
          <div className="space-y-1 min-w-0">
            <h2 className="text-2xl font-extrabold truncate">{profile?.name}</h2>
            <p className="text-sm text-neutral-500 capitalize">{role}{role === 'company' && profile?.companyName ? ` • ${profile.companyName}` : ''}</p>
            <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-neutral-600 dark:text-neutral-400 pt-1">
              <span className="inline-flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />{profile?.email}</span>
              {profile?.phone && <span className="inline-flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />{profile.phone}</span>}
              {role === 'candidate' && profile?.college && <span className="inline-flex items-center gap-1.5"><GraduationCap className="w-3.5 h-3.5" />{profile.college}</span>}
              {role === 'company' && profile?.website && <span className="inline-flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" />{profile.website}</span>}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map(([label, value]) => (
            <div key={label} className="p-5 rounded-2xl bg-white dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800">
              <p className="text-xs font-semibold text-neutral-500">{label}</p>
              <p className="text-2xl font-bold mt-1">{value}</p>
            </div>
          ))}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Edit form */}
          <form onSubmit={handleSave} className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800 space-y-4 text-xs">
            <h3 className="text-base font-bold flex items-center gap-2">
              {role === 'company' ? <Building2 className="w-4 h-4 text-sky-500" /> : <GraduationCap className="w-4 h-4 text-sky-500" />}
              Personal details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(FIELDS[role] || []).map(([key, label]) => (
                <div key={key}>
                  <label className="block font-semibold mb-1">{label}</label>
                  <input className={inputCls} value={form[key] ?? ''} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
                </div>
              ))}
              <div className="sm:col-span-2">
                <label className="block font-semibold mb-1">Email (cannot be changed)</label>
                <input disabled className={inputCls + ' opacity-60'} value={profile?.email || ''} />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button type="submit" disabled={saving} className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold disabled:opacity-50">
                <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save changes'}
              </button>
              {msg && <span className="text-neutral-500">{msg}</span>}
            </div>
          </form>

          {/* Side column */}
          <div className="space-y-6">
            {role === 'candidate' && (
              <>
                <section className="p-6 rounded-2xl bg-white dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800 space-y-3 text-xs">
                  <h3 className="text-base font-bold flex items-center gap-2"><Award className="w-4 h-4 text-sky-500" /> Skills</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {skills.length === 0 && <span className="text-neutral-400">No skills yet. Upload a resume to detect them.</span>}
                    {skills.map((s) => (
                      <span key={s} className="px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-[11px] font-medium">{s}</span>
                    ))}
                  </div>
                </section>
                <section className="p-6 rounded-2xl bg-white dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800 space-y-2 text-xs">
                  <h3 className="text-base font-bold flex items-center gap-2"><FileText className="w-4 h-4 text-sky-500" /> Resume</h3>
                  {resume ? (
                    <>
                      <p className="font-semibold truncate">{resume.fileName}</p>
                      <p className="text-neutral-500">Uploaded {new Date(resume.uploadedAt).toLocaleDateString()} • {resume.fileSize}</p>
                    </>
                  ) : (
                    <p className="text-neutral-400">No resume uploaded.</p>
                  )}
                  <Link to="/candidate/dashboard" state={{ tab: 'resume' }} className="text-sky-600 dark:text-sky-400 font-semibold inline-block pt-1">
                    Manage resume
                  </Link>
                  <div className="pt-3">
                    <div className="flex justify-between font-semibold mb-1"><span>Profile completeness</span><span>{profile?.profileCompletion ?? 0}%</span></div>
                    <div className="h-2 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
                      <div className="h-full bg-sky-500" style={{ width: `${profile?.profileCompletion ?? 0}%` }} />
                    </div>
                  </div>
                </section>
              </>
            )}
            {role === 'company' && (
              <section className="p-6 rounded-2xl bg-white dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800 space-y-2 text-xs">
                <h3 className="text-base font-bold flex items-center gap-2"><Briefcase className="w-4 h-4 text-sky-500" /> Company</h3>
                <p><span className="text-neutral-500">Name: </span>{profile?.companyName || '—'}</p>
                <p><span className="text-neutral-500">Industry: </span>{profile?.industry || '—'}</p>
                <p><span className="text-neutral-500">Size: </span>{profile?.size || '—'}</p>
              </section>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
