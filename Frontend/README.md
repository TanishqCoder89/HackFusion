# NexaHire — Frontend

A comprehensive, production-grade web application for **NexaHire**, connecting candidates and companies through AI-assisted, multilingual interviews, proctored assessments, and C++ algorithmic coding evaluations.

## 🚀 Key Features

### 1. Landing Page with Video Half-Parallax
- **Hero Video Half-Parallax**: Uses the provided video asset (`/videos/hero-video.mp4` & `/parallax.mp4`) with hardware-accelerated translateY at ~45% scroll velocity.
- **Accessible & Resilient**: Supports `prefers-reduced-motion` fallbacks, auto-play, muted loop, and overlay gradients for crisp typography.
- **Transparent Floating Navbar**: Fixed floating header with smooth blur transitions on scroll, brand logo, responsive mobile navigation, and theme toggle.
- **About Us & How It Works**: Highlights multilingual accessibility, structured rubrics, resume intelligence, and the 5-step recruitment workflow.

### 2. Premium Authentication with Slideshow (`/login` & `/signup`)
- **Split-Screen Design**: 55% carousel on desktop, 45% authentication form.
- **Dynamic Feature Slideshow**: 5 rich slides highlighting coding assessments, video rooms, resume intelligence, multilingual stream, and recruiter analytics.
- **Multi-Role Support**: Dedicated forms and instant quick-fill demo buttons for **Candidate** and **Company Recruiter**.
- **Role-based Protected Routes**: Guards candidate vs company dashboards and assessment paths with session persistence in `localStorage`.

### 3. Candidate Experience
- **Interactive Dashboard** (`/candidate/dashboard`): Overview of scheduled assessments, profile completeness, AI curriculum recommendations, and historical evaluations.
- **Resume Intelligence**: Drag-and-drop PDF/DOCX parser simulation, extracting skills, education, and projects, enabling skill-tag adjustments and triggering adaptive question recommendations.
- **Hardware Verification & Proctoring Setup** (`/interview/:id/setup`):
  - Live webcam preview via `navigator.mediaDevices.getUserMedia`.
  - Real-time Web Audio API amplitude meter.
  - Device enumeration for camera and microphone selection.
  - Interactive speaker diagnostic tone generator.
  - 10-point proctoring guidelines & explicit consent check before launching fullscreen.
- **Adaptive Interview Room** (`/interview/:id/session`):
  - Single-question display with timers, progress indicators, and rubric tips.
  - Voice dictation via Web Speech API and typed response inputs.
  - Proctoring event detection: monitors window blur and tab switches with a 5-strike warning policy.
- **Monaco Code Assessment** (`/interview/:id/coding`):
  - Embedded Microsoft Monaco Editor for C++ algorithmic problems.
  - Test runner validating public and hidden test cases with runtime and memory diagnostics.
  - Draft autosaving and state restoration.
- **Final Assessment Review & Thank-You** (`/interview/:id/assessment` & `.../thank-you`):
  - Review recorded responses and C++ code.
  - Candidate integrity declaration.
  - Submits evaluation to persistent storage and renders the confirmation receipt.

### 4. Company Recruiter Workspace (`/company/dashboard`)
- **Recruiter Console**: Real-time metrics on applicants, completion rates, and average scores.
- **Job Postings Management**: Create, view, and manage open positions with technical skill tags.
- **Interview Configuration**: Multi-step builder specifying duration, languages, questions, rubrics, and assigned coding problems.
- **Candidate Directory**: Search and filter candidate applications.
- **Evaluation Reports**: Detailed dossiers showing technical knowledge, communication, coding correctness, proctoring audit trails, with editable recruiter notes and final hiring decisions.
- **Analytics**: Completion rates, average times, and proctoring incident metrics.

### 5. Design System & Theming
- **Tailwind CSS class-based Dark Mode**: Light mode (pure white `#FFFFFF`, sky blue `#38BDF8`) & Dark mode (near-black `#0A0A0A`, charcoal cards, muted violet `#A78BFA`).
- **Anti-Flash Theme Script**: Saves preference to `localStorage` and initializes before render.

---

## 🛠️ Tech Stack
- **Framework**: React 19 + Vite 8
- **Routing**: React Router DOM 7
- **Styling**: Tailwind CSS 3.4
- **Icons**: Lucide React
- **Code Editor**: `@monaco-editor/react`
- **APIs**: Browser MediaDevices API, Web Audio API, Web Speech API

---

## 🔑 Demo Test Accounts

| Role | Email | Password |
|---|---|---|
| **Candidate** | `alex@candidate.com` | `password123` |
| **Company Recruiter** | `recruiter@techcorp.io` | `password123` |

*(Quick-fill buttons are also provided directly on the login page)*

---

## 💻 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Production Build
```bash
npm run build
```
Build output will be bundled into `dist/`.
