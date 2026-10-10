-- Schema definition for AI Interview Platform (HackFusion)

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  role ENUM('candidate', 'company') NOT NULL,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(191) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(50) DEFAULT NULL,
  college VARCHAR(191) DEFAULT NULL,
  degree VARCHAR(191) DEFAULT NULL,
  graduation_year VARCHAR(20) DEFAULT NULL,
  company_name VARCHAR(191) DEFAULT NULL,
  designation VARCHAR(191) DEFAULT NULL,
  website VARCHAR(255) DEFAULT NULL,
  industry VARCHAR(120) DEFAULT NULL,
  size VARCHAR(100) DEFAULT NULL,
  profile_completion INT DEFAULT 70,
  skills JSON DEFAULT NULL,
  resume JSON DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS jobs (
  id VARCHAR(64) PRIMARY KEY,
  company_id VARCHAR(64) NOT NULL,
  company_name VARCHAR(191) NOT NULL,
  title VARCHAR(191) NOT NULL,
  department VARCHAR(100) DEFAULT 'Engineering',
  location VARCHAR(191) DEFAULT 'Remote',
  type VARCHAR(50) DEFAULT 'Full-time',
  experience VARCHAR(50) DEFAULT '2+ years',
  description TEXT,
  responsibilities JSON DEFAULT NULL,
  required_skills JSON DEFAULT NULL,
  status VARCHAR(50) DEFAULT 'Published',
  applicants_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_company (company_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS coding_problems (
  id VARCHAR(64) PRIMARY KEY,
  title VARCHAR(191) NOT NULL,
  difficulty ENUM('Easy', 'Medium', 'Hard') DEFAULT 'Medium',
  time_limit_minutes INT DEFAULT 30,
  language VARCHAR(50) DEFAULT 'cpp',
  description MEDIUMTEXT,
  examples JSON DEFAULT NULL,
  constraints JSON DEFAULT NULL,
  starter_code MEDIUMTEXT,
  test_cases JSON DEFAULT NULL,
  starter_codes JSON DEFAULT NULL,
  reference_solution MEDIUMTEXT,
  topic VARCHAR(191) DEFAULT NULL,
  source VARCHAR(20) DEFAULT 'manual',
  created_by VARCHAR(64) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS interviews (
  id VARCHAR(64) PRIMARY KEY,
  job_id VARCHAR(64) DEFAULT NULL,
  job_title VARCHAR(191) DEFAULT NULL,
  company_id VARCHAR(64) DEFAULT NULL,
  company_name VARCHAR(191) DEFAULT NULL,
  title VARCHAR(191) NOT NULL,
  description TEXT,
  duration_minutes INT DEFAULT 45,
  language VARCHAR(50) DEFAULT 'English',
  supported_languages JSON DEFAULT NULL,
  scheduled_date VARCHAR(100) DEFAULT NULL,
  status VARCHAR(50) DEFAULT 'Ready to Start',
  required_skills JSON DEFAULT NULL,
  proctoring_config JSON DEFAULT NULL,
  scoring_rubric JSON DEFAULT NULL,
  coding_problem_id VARCHAR(64) DEFAULT 'prob-1',
  questions JSON DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_job (job_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS submissions (
  id VARCHAR(64) PRIMARY KEY,
  interview_id VARCHAR(64) NOT NULL,
  interview_title VARCHAR(191) DEFAULT NULL,
  job_id VARCHAR(64) DEFAULT NULL,
  job_title VARCHAR(191) DEFAULT NULL,
  candidate_id VARCHAR(64) NOT NULL,
  candidate_name VARCHAR(191) NOT NULL,
  candidate_email VARCHAR(191) NOT NULL,
  candidate_college VARCHAR(191) DEFAULT NULL,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50) DEFAULT 'Submitted',
  time_spent_minutes INT DEFAULT 35,
  proctoring_summary JSON DEFAULT NULL,
  answers JSON DEFAULT NULL,
  coding_submission JSON DEFAULT NULL,
  evaluation_report JSON DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_interview (interview_id),
  INDEX idx_candidate (candidate_id),
  INDEX idx_candidate_email (candidate_email),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS proctoring_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  interview_id VARCHAR(64) NOT NULL,
  candidate_id VARCHAR(64) NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  details TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_interview_logs (interview_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS practice_attempts (
  id VARCHAR(64) PRIMARY KEY,
  candidate_id VARCHAR(64) NOT NULL,
  problem_id VARCHAR(64) NOT NULL,
  language VARCHAR(50) NOT NULL,
  code MEDIUMTEXT,
  passed_count INT DEFAULT 0,
  total_count INT DEFAULT 0,
  score INT DEFAULT 0,
  status VARCHAR(50) DEFAULT 'Wrong Answer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_practice_candidate (candidate_id),
  INDEX idx_practice_problem (problem_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
