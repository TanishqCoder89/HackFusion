import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bot, UserCheck, Briefcase, Lock, Mail, User, School, GraduationCap, Building2, Globe, AlertCircle, ArrowRight } from 'lucide-react';
import Slideshow from '../components/Slideshow';
import ThemeToggle from '../components/ThemeToggle';
import { useAuth } from '../context/AuthContext';

export default function SignupPage() {
  const [role, setRole] = useState('candidate'); // 'candidate' | 'company'
  const [error, setError] = useState('');
  const { signup, loading } = useAuth();
  const navigate = useNavigate();

  // Candidate state
  const [candidateForm, setCandidateForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    college: '',
    degree: '',
    graduationYear: '2025',
    termsAccepted: false
  });

  // Company state
  const [companyForm, setCompanyForm] = useState({
    name: '',
    email: '',
    companyName: '',
    designation: '',
    website: '',
    password: '',
    confirmPassword: '',
    termsAccepted: false
  });

  const handleCandidateChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCandidateForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCompanyChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCompanyForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const form = role === 'candidate' ? candidateForm : companyForm;

    if (!form.termsAccepted) {
      setError('You must accept the terms and proctoring governance to proceed.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    if (form.password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    const payload = role === 'candidate'
      ? {
          name: candidateForm.name,
          email: candidateForm.email,
          password: candidateForm.password,
          college: candidateForm.college,
          degree: candidateForm.degree,
          graduationYear: candidateForm.graduationYear
        }
      : {
          name: companyForm.name,
          email: companyForm.email,
          companyName: companyForm.companyName,
          designation: companyForm.designation,
          website: companyForm.website,
          password: companyForm.password
        };

    const res = await signup(payload, role);
    if (res.success) {
      navigate(role === 'company' ? '/company/dashboard' : '/candidate/dashboard', { replace: true });
    } else {
      setError(res.error || 'Failed to create account.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white dark:bg-[#0A0A0A] text-neutral-900 dark:text-white">
      
      {/* Left 55% Column: Slideshow */}
      <div className="hidden lg:block lg:w-[55%] relative h-screen sticky top-0 overflow-hidden">
        <Slideshow />
      </div>

      {/* Right 45% Column: Signup Form Panel */}
      <div className="w-full lg:w-[45%] min-h-screen flex flex-col justify-between p-6 sm:p-12 lg:p-14 overflow-y-auto">
        
        {/* Top Navbar items */}
        <div className="flex items-center justify-between pb-6">
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

        {/* Center Form Container */}
        <div className="max-w-md w-full mx-auto my-auto py-4 space-y-5">
          
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
              Create your account
            </h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              Join NexaHire to assess and showcase engineering excellence.
            </p>
          </div>

          {/* Role selector tabs */}
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
              <span>Candidate Portal</span>
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
              <span>Company Recruiter</span>
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
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            
            {role === 'candidate' ? (
              <>
                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Full Legal Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-neutral-400 absolute left-3.5 top-2.5" />
                    <input
                      type="text"
                      required
                      name="name"
                      value={candidateForm.name}
                      onChange={handleCandidateChange}
                      placeholder="Alex Rivera"
                      className="w-full pl-10 pr-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-300 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-sky-400 dark:focus:ring-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-2.5" />
                    <input
                      type="email"
                      required
                      name="email"
                      value={candidateForm.email}
                      onChange={handleCandidateChange}
                      placeholder="alex@candidate.com"
                      className="w-full pl-10 pr-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-300 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-sky-400 dark:focus:ring-sky-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                      College / University
                    </label>
                    <div className="relative">
                      <School className="w-4 h-4 text-neutral-400 absolute left-3.5 top-2.5" />
                      <input
                        type="text"
                        required
                        name="college"
                        value={candidateForm.college}
                        onChange={handleCandidateChange}
                        placeholder="Stanford University"
                        className="w-full pl-10 pr-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-300 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-sky-400 dark:focus:ring-sky-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                      Degree / Program
                    </label>
                    <div className="relative">
                      <GraduationCap className="w-4 h-4 text-neutral-400 absolute left-3.5 top-2.5" />
                      <input
                        type="text"
                        required
                        name="degree"
                        value={candidateForm.degree}
                        onChange={handleCandidateChange}
                        placeholder="B.S. in CS"
                        className="w-full pl-10 pr-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-300 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-sky-400 dark:focus:ring-sky-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Graduation Year
                  </label>
                  <select
                    name="graduationYear"
                    value={candidateForm.graduationYear}
                    onChange={handleCandidateChange}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-300 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-400"
                  >
                    {[2024, 2025, 2026, 2027, 2028].map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                      Contact Person Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-neutral-400 absolute left-3.5 top-2.5" />
                      <input
                        type="text"
                        required
                        name="name"
                        value={companyForm.name}
                        onChange={handleCompanyChange}
                        placeholder="Sarah Jenkins"
                        className="w-full pl-10 pr-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-300 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-sky-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                      Work Email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-2.5" />
                      <input
                        type="email"
                        required
                        name="email"
                        value={companyForm.email}
                        onChange={handleCompanyChange}
                        placeholder="recruiter@company.com"
                        className="w-full pl-10 pr-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-300 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-sky-400"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                      Company Name
                    </label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-neutral-400 absolute left-3.5 top-2.5" />
                      <input
                        type="text"
                        required
                        name="companyName"
                        value={companyForm.companyName}
                        onChange={handleCompanyChange}
                        placeholder="TechCorp Global"
                        className="w-full pl-10 pr-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-300 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-sky-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                      Recruiter Designation
                    </label>
                    <input
                      type="text"
                      required
                      name="designation"
                      value={companyForm.designation}
                      onChange={handleCompanyChange}
                      placeholder="Lead Talent Partner"
                      className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-300 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-sky-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Company Website (Optional)
                  </label>
                  <div className="relative">
                    <Globe className="w-4 h-4 text-neutral-400 absolute left-3.5 top-2.5" />
                    <input
                      type="url"
                      name="website"
                      value={companyForm.website}
                      onChange={handleCompanyChange}
                      placeholder="https://company.io"
                      className="w-full pl-10 pr-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-300 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-sky-400"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-2.5" />
                  <input
                    type="password"
                    required
                    name="password"
                    value={role === 'candidate' ? candidateForm.password : companyForm.password}
                    onChange={role === 'candidate' ? handleCandidateChange : handleCompanyChange}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-300 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-sky-400"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-2.5" />
                  <input
                    type="password"
                    required
                    name="confirmPassword"
                    value={role === 'candidate' ? candidateForm.confirmPassword : companyForm.confirmPassword}
                    onChange={role === 'candidate' ? handleCandidateChange : handleCompanyChange}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-300 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-sky-400"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-start gap-2 cursor-pointer text-neutral-600 dark:text-neutral-400 select-none">
                <input
                  type="checkbox"
                  required
                  name="termsAccepted"
                  checked={role === 'candidate' ? candidateForm.termsAccepted : companyForm.termsAccepted}
                  onChange={role === 'candidate' ? handleCandidateChange : handleCompanyChange}
                  className="mt-0.5 rounded text-sky-500 focus:ring-sky-400"
                />
                <span className="text-xs leading-normal">
                  I accept the Privacy Policy, Terms of Service, and Proctoring Audit Governance.
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-sm shadow-md shadow-sky-500/25 transition-all transform active:scale-98 disabled:opacity-50"
            >
              <span>{loading ? 'Creating Account...' : 'Complete Registration'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Switch to Login */}
          <div className="text-center pt-2 text-xs text-neutral-600 dark:text-neutral-400">
            Already registered?{' '}
            <Link
              to="/login"
              className="font-bold text-sky-600 dark:text-sky-400 hover:underline"
            >
              Sign in to your account
            </Link>
          </div>

        </div>

      </div>

    </div>
  );
}
