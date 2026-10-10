import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import CandidateDashboard from './pages/CandidateDashboard';
import CompanyDashboard from './pages/CompanyDashboard';
import InterviewSetupPage from './pages/InterviewSetupPage';
import InterviewSessionPage from './pages/InterviewSessionPage';
import CodingAssessmentPage from './pages/CodingAssessmentPage';
import PracticePage from './pages/PracticePage';
import ProfilePage from './pages/ProfilePage';
import FinalAssessmentPage from './pages/FinalAssessmentPage';
import ThankYouPage from './pages/ThankYouPage';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* Candidate Protected Routes */}
            <Route
              path="/candidate/dashboard"
              element={
                <ProtectedRoute allowedRole="candidate">
                  <CandidateDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/practice/:problemId"
              element={
                <ProtectedRoute allowedRole="candidate">
                  <PracticePage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            {/* Company Protected Routes */}
            <Route
              path="/company/dashboard"
              element={
                <ProtectedRoute allowedRole="company">
                  <CompanyDashboard />
                </ProtectedRoute>
              }
            />

            {/* Interview Assessment Workflow Routes */}
            <Route
              path="/interview/:interviewId/setup"
              element={
                <ProtectedRoute>
                  <InterviewSetupPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/interview/:interviewId/session"
              element={
                <ProtectedRoute>
                  <InterviewSessionPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/interview/:interviewId/coding"
              element={
                <ProtectedRoute>
                  <CodingAssessmentPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/interview/:interviewId/assessment"
              element={
                <ProtectedRoute>
                  <FinalAssessmentPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/interview/:interviewId/thank-you"
              element={
                <ProtectedRoute>
                  <ThankYouPage />
                </ProtectedRoute>
              }
            />

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}
