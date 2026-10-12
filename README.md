# NexaHire — Adaptive AI Interview Platform

NexaHire is a full-stack AI interview platform that helps companies evaluate candidates through adaptive, structured, and proctored interviews. The app combines resume intelligence, live AI-driven interview sessions, coding assessments, recruiter dashboards, and secure candidate workflows in a single product.

This project is designed for modern hiring pipelines where interviews are not static questionnaires, but dynamic conversations that adapt to a candidate's skills, responses, and performance.

## Why this project

Traditional hiring often relies on manual screening, inconsistent interview quality, and limited scalability. NexaHire addresses this by creating an end-to-end interview experience that:

- adapts follow-up questions based on candidate responses
- evaluates communication, technical depth, and coding ability
- supports multiple languages and recruiter workflows
- provides proctoring safeguards and assessment review
- gives companies actionable analytics and hiring decisions

## Core features

### Candidate experience
- Candidate onboarding and role-based authentication
- Resume parsing and skill extraction workflow
- Personalized interview scheduling and dashboard
- Adaptive interview room with timed questions and response capture
- Voice-enabled interview input using browser speech APIs
- Proctoring checks for tab switches, blur state, and consent flow
- C++ coding round with editor-based assessment and test validation
- Final review and submission flow for completed assessments

### Recruiter experience
- Company dashboard with applicant metrics
- Job posting and interview creation tools
- Candidate pipeline management
- Evaluation reports and score summaries
- Interview rubric configuration and coding problem assignment
- Notes, decisions, and hiring recommendations

### AI-powered interview flow
- Live AI interviewer experience using Groq-backed conversational logic
- Avatar-style interview room and AI guidance flow
- Structured evaluation criteria for communication and technical performance
- Multilingual and profile-aware interview adaptation

### Platform readiness
- Secure Express backend with JWT auth and rate limiting
- MySQL persistence for users, jobs, interviews, and submissions
- File uploads for resumes and evidence capture
- Docker support and deployment-ready configuration

## Tech stack

### Frontend
- React 19
- Vite
- React Router
- Tailwind CSS
- Monaco Editor
- Lucide icons

### Backend
- Node.js
- Express
- MySQL 8
- JWT authentication
- Google Cloud / Groq AI integrations
- Multer for file handling
- Helmet, CORS, rate limiting

## Project structure

```text
HackFusion/
├── Backend/                 # Express API and AI interview services
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── services/
│   ├── uploads/
│   ├── package.json
│   └── server.js
├── Frontend/                # React frontend
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.*
├── .env.example             # Environment template
├── .gitignore
├── DEPLOYMENT.md            # Production deployment notes
├── Dockerfile
├── docker-compose.yml
├── package.json             # Root orchestration scripts
├── README.md                # Project documentation
└── LICENSE                  # If present in your repo
```

## Prerequisites

Before running the project, make sure you have:

- Node.js 20 or newer
- MySQL 8
- g++ for coding evaluation
- Python 3 for local tooling and scripts
- Access to AI API keys such as Groq and optionally Anthropic/Gemini
- HTTPS-capable hosting for camera and microphone access in production

## Quick start

### 1. Install dependencies

From the project root:

```bash
npm install
```

This installs both the frontend and backend packages, as configured in the root package scripts.

### 2. Configure environment variables

Copy the example environment file and populate the values:

```bash
copy .env.example .env
```

Then update the required values in `.env`, including:

- `CLIENT_URL`
- `JWT_SECRET`
- `DB_URL` or MySQL credentials
- `GROQ_API_KEY`
- optional AI provider keys
- `PORT` and `TRUST_PROXY` for production

A full sample is available in [.env.example](.env.example).

### 3. Start the app

Run the backend and frontend together using the project scripts:

```bash
npm run dev:backend
npm run dev:frontend
```

Or, from the root, use the standard project script when present.

### 4. Open the app

The frontend is served in development mode on:

```text
http://localhost:5173
```

The backend API runs separately and is typically available on your configured backend port.

## Production build

To build the frontend for deployment:

```bash
npm run build
```

To start the backend in production mode:

```bash
npm start
```

## Demo accounts

The project includes demo test accounts for local evaluation:

| Role | Email | Password |
|---|---|---|
| Candidate | `alex@candidate.com` | `password123` |
| Company Recruiter | `recruiter@techcorp.io` | `password123` |

These are intended for local or throwaway environments only. In production, demo accounts should be disabled unless specifically required.

## Deployment

This project is designed to be deployed as a single service. Full deployment guidance is documented in [DEPLOYMENT.md](DEPLOYMENT.md).

The deployment model assumes:
- a Node 20+ server
- MySQL 8 database
- HTTPS-enabled domain
- AI service API keys
- optional TURN server for mobile/WebRTC connectivity

## Security notes

- Keep `.env` values out of version control
- Rotate any API keys that have been exposed
- Run production deployments behind HTTPS and a trusted reverse proxy
- Treat uploaded applicant documents and proctoring artifacts as sensitive data
- Restrict runtime permissions for candidate code execution environments

## License

This project does not currently declare a repository license in the root. If you are publishing or distributing it, add an appropriate license before release.

## Contributing

Contributions are welcome. For meaningful changes, open an issue or prepare a clean pull request that includes:

- a clear summary of the feature/fix
- relevant screenshots or demonstrations when UI changes are involved
- validation steps for backend or frontend changes

## Summary

NexaHire is a practical adaptive AI interview platform that blends recruitment workflow, AI guidance, coding evaluation, and recruiter analytics into one cohesive product. It is well-suited for demo environments, hiring-tech prototypes, and production-ready interview systems with further hardening and deployment tuning.
