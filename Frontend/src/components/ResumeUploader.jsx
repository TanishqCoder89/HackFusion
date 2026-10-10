import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, Trash2, RefreshCw, Plus, X, Sparkles, AlertCircle } from 'lucide-react';
import { uploadCandidateResume, deleteCandidateResume, updateCandidateProfile } from '../services/storageService';

export default function ResumeUploader({ profile, onProfileUpdated }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [newSkillInput, setNewSkillInput] = useState('');
  const fileInputRef = useRef(null);

  const handleFile = async (file) => {
    setError('');
    if (!file) return;

    // Validate extension & type
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const validExts = ['.pdf', '.docx'];
    const hasValidExt = validExts.some(ext => file.name.toLowerCase().endsWith(ext));

    if (!validTypes.includes(file.type) && !hasValidExt) {
      setError('Please upload a valid PDF or DOCX file.');
      return;
    }

    // Max 10MB limit
    if (file.size > 10 * 1024 * 1024) {
      setError('File size exceeds the 10MB limit.');
      return;
    }

    setIsProcessing(true);
    try {
      const updated = await uploadCandidateResume(file);
      if (onProfileUpdated) onProfileUpdated(updated);
    } catch (err) {
      setError(err.message || 'Failed to process document. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDelete = async () => {
    try {
      const updated = await deleteCandidateResume();
      if (onProfileUpdated) onProfileUpdated(updated);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!newSkillInput.trim()) return;
    const skillName = newSkillInput.trim();
    if (!profile.skills.includes(skillName)) {
      const updatedSkills = [...profile.skills, skillName];
      try {
        const updated = await updateCandidateProfile({ skills: updatedSkills });
        if (onProfileUpdated) onProfileUpdated(updated);
      } catch (err) {
        setError(err.message);
      }
    }
    setNewSkillInput('');
  };

  const handleRemoveSkill = async (skillToRemove) => {
    const updatedSkills = profile.skills.filter(s => s !== skillToRemove);
    try {
      const updated = await updateCandidateProfile({ skills: updatedSkills });
      if (onProfileUpdated) onProfileUpdated(updated);
    } catch (err) {
      setError(err.message);
    }
  };

  const resume = profile?.resume;

  return (
    <div className="bg-white dark:bg-[#171717] rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 sm:p-7 shadow-sm space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-200 dark:border-neutral-800 pb-5">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <span>Resume Intelligence</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-semibold">
              AI-Parsed
            </span>
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Upload your resume to automatically tailor questions and align coding competencies with company standards.
          </p>
        </div>
        {resume && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-xs font-semibold self-start sm:self-auto border border-emerald-200 dark:border-emerald-800/40">
            <CheckCircle2 className="w-4 h-4" /> Active Resume Loaded
          </span>
        )}
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-center gap-2 text-xs text-red-600 dark:text-red-300">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Upload area or current file card */}
      {!resume ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center space-y-3 ${
            isDragging
              ? 'border-sky-400 bg-sky-50/50 dark:border-sky-500 dark:bg-sky-950/20'
              : 'border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-600 bg-neutral-50/50 dark:bg-neutral-800/20'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          <div className="w-14 h-14 rounded-2xl bg-sky-50 dark:bg-sky-950/40 text-sky-500 dark:text-sky-400 flex items-center justify-center shadow-sm">
            {isProcessing ? (
              <RefreshCw className="w-7 h-7 animate-spin" />
            ) : (
              <UploadCloud className="w-7 h-7" />
            )}
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
              {isProcessing ? 'Analyzing and parsing resume contents...' : 'Click to upload or drag & drop resume'}
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Supported formats: PDF, DOCX (Max size: 10 MB)
            </p>
          </div>
        </div>
      ) : (
        <div className="p-4 sm:p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                {resume.fileName}
              </h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Uploaded {new Date(resume.uploadedAt).toLocaleDateString()} • {resume.fileSize} • {resume.status}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-300 dark:border-neutral-600 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-white dark:hover:bg-neutral-700 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Replace</span>
            </button>
            <button
              onClick={handleDelete}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-200 dark:border-red-900/60 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      )}

      {/* Detected Skills Chips & Editor */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
            Identified Technical Competencies
          </label>
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            {profile?.skills?.length || 0} skills verified
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {profile?.skills?.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 group hover:border-sky-300 dark:hover:border-sky-500 transition-colors"
            >
              <span>{skill}</span>
              <button
                type="button"
                onClick={() => handleRemoveSkill(skill)}
                className="text-neutral-400 hover:text-red-500 transition-colors"
                title={`Remove ${skill}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {/* Add skill input */}
          <form onSubmit={handleAddSkill} className="inline-flex items-center">
            <div className="flex items-center border border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl px-2.5 py-1 text-xs bg-transparent">
              <input
                type="text"
                placeholder="+ Add skill"
                value={newSkillInput}
                onChange={(e) => setNewSkillInput(e.target.value)}
                className="bg-transparent focus:outline-none w-20 sm:w-24 text-neutral-800 dark:text-neutral-200 placeholder:text-neutral-400 text-xs"
              />
              <button type="submit" className="text-sky-500 dark:text-sky-400 hover:scale-110 transition-transform">
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Parsed Profile Highlights */}
      {resume?.parsedData && (
        <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-700/60">
            <span className="font-semibold text-neutral-900 dark:text-white block mb-1">
              Academic Background
            </span>
            {resume.parsedData.education?.[0] ? (
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {resume.parsedData.education[0].institution} — {resume.parsedData.education[0].degree} ({resume.parsedData.education[0].years})
              </p>
            ) : (
              <p className="text-neutral-500">Self-taught / Ongoing degree</p>
            )}
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-700/60">
            <span className="font-semibold text-neutral-900 dark:text-white block mb-1">
              Highlighted Project
            </span>
            {resume.parsedData.projects?.[0] ? (
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                <span className="font-medium text-neutral-800 dark:text-neutral-200">{resume.parsedData.projects[0].name}</span>: {resume.parsedData.projects[0].description}
              </p>
            ) : (
              <p className="text-neutral-500">No project parsed</p>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
