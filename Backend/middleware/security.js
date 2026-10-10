import rateLimit from 'express-rate-limit';

// Rate limiter for authentication routes (login / register) to prevent brute-force attacks
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 login/register requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many authentication attempts from this IP. Please try again after 15 minutes.'
  }
});

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 400, // Limit each IP to 400 requests per 15 minutes
  // The live interview room polls signalling and streams TTS/vision calls; those have their own limits
  skip: (req) => /^\/(webrtc|tts|stt|detect-mobile|ice-config|network-ip)/.test(req.path),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Rate limit exceeded. Please throttle your requests.'
  }
});

// Limiter for code execution / AI generation (CPU- and cost-heavy endpoints)
export const runLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many run/generate requests. Please wait a minute and try again.'
  }
});
