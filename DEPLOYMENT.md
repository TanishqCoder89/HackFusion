# NexaHire — Deployment

NexaHire deploys as **one service**: the Express server serves the API *and* the built React app (and the AI interview room) from the same domain. You need that service plus a **MySQL 8** database.

## 1. What you need
| Thing | Why |
|---|---|
| MySQL 8 database | all data (users, jobs, interviews, submissions, question bank) |
| A host that runs Node 20+ **with `g++` and `python3`** | the coding round compiles/runs candidate code. The included `Dockerfile` installs both |
| **HTTPS** + a real domain | browsers only allow camera/mic on HTTPS (phones are strict) |
| Groq API key | the live AI avatar interviewer |
| (Recommended) a TURN server | phone-as-second-camera across different networks |

## 2. Environment variables
See [`.env.example`](.env.example) for the full annotated list. Minimum to boot in production:

```
NODE_ENV=production
CLIENT_URL=https://your-domain.com
JWT_SECRET=<48+ random chars>      # node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
DB_URL=mysql://USER:PASSWORD@HOST:3306/DATABASE
DB_SSL=true                         # if your MySQL provider requires TLS
GROQ_API_KEY=...                    # AI interviewer
TRUST_PROXY=true
```
The server **refuses to start** in production if `JWT_SECRET`, the database, or `CLIENT_URL` are missing/unsafe.

Optional: `ANTHROPIC_API_KEY` (or `GEMINI_API_KEY`) for "Generate with AI" question creation, `SECONDARY_GROQ_API_KEY`, Google Cloud voice (`GOOGLE_APPLICATION_CREDENTIALS`, `GCP_PROJECT_ID`), `TURN_URLS` / `TURN_USERNAME` / `TURN_CREDENTIAL`, `SEED_DEMO_DATA`.

## 3. Deploy

### A. Docker (any host: Render, Railway, Fly.io, a VPS…)
```
docker build -t nexahire .
docker run -p 5000:5000 --env-file .env nexahire
```
Local production-like stack with its own MySQL: copy `.env.example` to `.env`, then `docker compose up --build` → http://localhost:5000.

On Render/Railway/Fly choose **Docker** as the runtime, set the variables above in the dashboard, and use `/api/health` as the health check.

### B. Plain Node (VPS)
```
npm install            # installs Backend + Frontend
npm run build          # builds Frontend/dist
NODE_ENV=production npm start
```
Install `g++` and `python3` on the machine (`apt install build-essential python3`). Put nginx/Caddy in front for HTTPS and set `TRUST_PROXY=true`.

## 4. First run
- Tables are created automatically; the built-in coding problems are installed.
- **No demo users are created in production.** Register a Company account on the signup page and start creating jobs and interviews.
- `SEED_DEMO_DATA=true` creates the demo accounts (`alex@candidate.com`, `recruiter@techcorp.io`, password `password123`) — use only on a throwaway environment.

## 5. Persistent storage
Resumes and proctoring screenshots are written to `Backend/uploads/`. On hosts with an ephemeral disk, mount a persistent volume there (the compose file does), otherwise they disappear on redeploy.

## 6. WebRTC / phone camera checklist
- Site must be **HTTPS**; the phone opens `https://your-domain/avatar/mobile-cam.html?...` from the QR code.
- Add a TURN server (`TURN_URLS`, `TURN_USERNAME`, `TURN_CREDENTIAL`, e.g. coturn or a hosted TURN). STUN alone fails behind many mobile/corporate networks.
- Signalling is held in memory, so run **one instance** (or enable sticky sessions) for the interview service.

## 7. Security notes
- Rotate any API keys that were ever committed or shared; `.env` is git-ignored.
- Don't set `VITE_SHOW_DEMO` in production.
- Code submitted by candidates runs on the server (5 s limit per test). For a public product, run the container with a non-root user (the Dockerfile does) and resource limits.
