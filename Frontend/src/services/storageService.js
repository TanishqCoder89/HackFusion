// Data layer: every function talks to the Express/MySQL backend. Nothing is persisted in the browser.
import { api } from './api';

// Jobs
export const getJobs = async () => (await api('/jobs')).jobs;
export const createJob = async (job) => (await api('/jobs', { method: 'POST', body: job })).job;
export const updateJob = async (id, updates) => (await api(`/jobs/${id}`, { method: 'PUT', body: updates })).job;
export const deleteJob = async (id) => { await api(`/jobs/${id}`, { method: 'DELETE' }); return true; };

// Interviews
export const getInterviews = async () => (await api('/interviews')).interviews;
export const getInterviewById = async (id) => (await api(`/interviews/${id}`)).interview;
export const createInterview = async (data) => (await api('/interviews', { method: 'POST', body: data })).interview;
export const deleteInterview = async (id) => { await api(`/interviews/${id}`, { method: 'DELETE' }); return true; };
export const generateInterviewQuestions = async (params) =>
  (await api('/interviews/generate-questions', { method: 'POST', body: params })).questions;

// Coding problems
export const getCodingProblems = async () => (await api('/problems')).problems;
export const getCodingProblemById = async (id) => (await api(`/problems/${id}`)).problem;
export const createProblem = async (problem) => (await api('/problems', { method: 'POST', body: problem })).problem;
export const updateProblem = async (id, problem) => (await api(`/problems/${id}`, { method: 'PUT', body: problem })).problem;
export const deleteProblem = async (id) => { await api(`/problems/${id}`, { method: 'DELETE' }); return true; };
export const generateProblem = async (params) => (await api('/problems/generate', { method: 'POST', body: params })).draft;
export const previewTestCases = async (params) => (await api('/problems/preview-tests', { method: 'POST', body: params })).testCases;
export const runCode = async ({ problemId, code, language, mode }) =>
  (await api('/problems/run', { method: 'POST', body: { problemId, code, language, mode } })).execution;
export const savePracticeAttempt = async (attempt) => api('/problems/practice/attempts', { method: 'POST', body: attempt });
export const getPracticeAttempts = async () => (await api('/problems/practice/attempts')).attempts;

// Candidate profile & resume
export const getCandidateProfile = async () => (await api('/candidate/profile')).profile;
export const updateCandidateProfile = async (updates) => (await api('/candidate/profile', { method: 'PUT', body: updates })).profile;
export const uploadCandidateResume = async (file) => {
  const formData = new FormData();
  formData.append('resume', file);
  return (await api('/candidate/resume', { method: 'POST', formData })).profile;
};
export const deleteCandidateResume = async () => (await api('/candidate/resume', { method: 'DELETE' })).profile;
export const getAdaptiveQuestions = async () => (await api('/candidate/adaptive-questions')).questions;

// Submissions & evaluation reports
export const getSubmissions = async () => (await api('/submissions')).submissions;
export const getSubmissionById = async (id) => (await api(`/submissions/${id}`)).submission;
export const updateSubmissionReview = async (id, recruiterNotes, verdict) =>
  (await api(`/submissions/${id}/review`, { method: 'PUT', body: { recruiterNotes, verdict } })).submission;
export const createFinalSubmission = async (data) => (await api('/submissions', { method: 'POST', body: data })).submission;

// Proctoring
export const logProctoringEvent = (event) => api('/proctoring/event', { method: 'POST', body: event }).catch(() => {});

// Company profile (stored on the user row)
export const updateCompanyProfile = async (updates) => (await api('/auth/profile', { method: 'PUT', body: updates })).user;
