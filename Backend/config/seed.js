import bcrypt from 'bcryptjs';
import { getPool, initializeDatabase, query } from './db.js';

export const seedDatabase = async () => {
  try {
    await initializeDatabase();
    const pool = getPool();

    // Check if users already seeded
    const [existingUsers] = await pool.query('SELECT COUNT(*) as count FROM users');
    if (existingUsers[0].count > 0) {
      console.log('[Seed] Database already contains users. Skipping initial seed.');
      return;
    }

    console.log('[Seed] Seeding database with initial real data...');

    const salt = await bcrypt.genSalt(10);
    const candidateHash = await bcrypt.hash('password123', salt);
    const companyHash = await bcrypt.hash('password123', salt);

    // 1. Seed Users
    const candidateSkills = ['React', 'TypeScript', 'Node.js', 'Python', 'C++', 'Tailwind CSS', 'SQL', 'Git', 'Docker'];
    const candidateResume = {
      fileName: 'Alex_Rivera_Resume_2026.pdf',
      uploadedAt: '2026-10-01T10:14:00Z',
      fileSize: '1.4 MB',
      status: 'Processed & Verified',
      parsedData: {
        contact: {
          name: 'Alex Rivera',
          email: 'alex@candidate.com',
          phone: '+1 (555) 234-8901',
          linkedin: 'linkedin.com/in/alex-rivera-dev',
          github: 'github.com/alexrivera-tech'
        },
        education: [
          {
            institution: 'Stanford University',
            degree: 'B.S. in Computer Science (GPA: 3.88)',
            years: '2021 — 2025',
            coursework: 'Operating Systems, Compilers, Distributed Systems, Algorithms, Machine Learning'
          }
        ],
        experience: [
          {
            title: 'Software Engineering Intern',
            company: 'Nexus Cloud Systems',
            period: 'June 2025 — Sept 2025',
            description: 'Designed real-time metric dashboards using React and WebSocket streams, reducing latency by 32%.'
          },
          {
            title: 'Full-Stack Developer Fellow',
            company: 'Open Source Labs',
            period: 'Jan 2024 — May 2025',
            description: 'Contributed to high-throughput REST API gateways and automated regression testing pipelines.'
          }
        ],
        projects: [
          {
            name: 'Distributed Task Orchestrator',
            tech: 'C++, gRPC, Raft Consensus',
            description: 'Fault-tolerant distributed worker queue supporting 10k tasks/sec with leader election.'
          },
          {
            name: 'AI Code Reviewer CLI',
            tech: 'Python, AST, LLM API',
            description: 'Automated pull-request feedback bot highlighting style and security vulnerabilities.'
          }
        ],
        certifications: [
          'AWS Certified Cloud Practitioner (2025)',
          'Meta Front-End Developer Professional Certificate (2024)'
        ]
      }
    };

    await pool.query(
      `INSERT INTO users (id, role, name, email, password_hash, phone, college, degree, graduation_year, profile_completion, skills, resume)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'cand-1',
        'candidate',
        'Alex Rivera',
        'alex@candidate.com',
        candidateHash,
        '+1 (555) 234-8901',
        'Stanford University',
        'B.S. in Computer Science',
        '2025',
        92,
        JSON.stringify(candidateSkills),
        JSON.stringify(candidateResume)
      ]
    );

    await pool.query(
      `INSERT INTO users (id, role, name, email, password_hash, company_name, designation, website, industry, size)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'comp-1',
        'company',
        'Sarah Jenkins',
        'recruiter@techcorp.io',
        companyHash,
        'TechCorp Global',
        'Lead Technical Talent Partner',
        'https://techcorp.io',
        'Artificial Intelligence & Enterprise Cloud',
        '250 - 500 Employees'
      ]
    );

    // 2. Seed Jobs
    const job1Responsibilities = [
      'Architect robust full-stack web applications and scalable APIs',
      'Integrate AI evaluation pipelines and streaming responses',
      'Build performant, accessible UI interfaces'
    ];
    const job1Skills = ['React', 'Python', 'TypeScript', 'C++', 'System Design', 'REST APIs'];

    await pool.query(
      `INSERT INTO jobs (id, company_id, company_name, title, department, location, type, experience, description, responsibilities, required_skills, status, applicants_count, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'job-101',
        'comp-1',
        'TechCorp Global',
        'Senior Full-Stack & AI Engineer',
        'Engineering',
        'Remote / San Francisco',
        'Full-time',
        '3+ years',
        'We are seeking an adaptable engineer proficient in React, modern Python/Node services, and AI/LLM workflow orchestration.',
        JSON.stringify(job1Responsibilities),
        JSON.stringify(job1Skills),
        'Published',
        14,
        '2026-09-15 10:00:00'
      ]
    );

    const job2Responsibilities = [
      'Optimize data structures and latency-critical backend pathways',
      'Write safe, high-performance C++ and backend services',
      'Conduct code reviews and proctored technical evaluations'
    ];
    const job2Skills = ['C++', 'Data Structures', 'Algorithms', 'Distributed Systems', 'Linux'];

    await pool.query(
      `INSERT INTO jobs (id, company_id, company_name, title, department, location, type, experience, description, responsibilities, required_skills, status, applicants_count, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'job-102',
        'comp-1',
        'TechCorp Global',
        'Systems & Algorithmic Developer',
        'Infrastructure',
        'New York / Hybrid',
        'Full-time',
        '2+ years',
        'Design low-latency data pipelines and high-throughput microservices with algorithmic efficiency.',
        JSON.stringify(job2Responsibilities),
        JSON.stringify(job2Skills),
        'Published',
        9,
        '2026-09-28 14:30:00'
      ]
    );

    // 3. Seed Coding Problems
    const prob1Examples = [
      {
        input: 'nums = [1, 1, 1], k = 2',
        output: '2',
        explanation: 'The subarrays are [1, 1] at index (0, 1) and [1, 1] at index (1, 2).'
      },
      {
        input: 'nums = [1, 2, 3], k = 3',
        output: '2',
        explanation: 'Subarrays [1, 2] and [3] sum to 3.'
      }
    ];
    const prob1Constraints = [
      '1 <= nums.length <= 2 * 10^4',
      '-1000 <= nums[i] <= 1000',
      '-10^7 <= k <= 10^7'
    ];
    const prob1StarterCode = `#include <iostream>
#include <vector>
#include <unordered_map>

using namespace std;

class Solution {
public:
    int subarraySum(vector<int>& nums, int k) {
        // Write your solution here
        unordered_map<int, int> prefixCounts;
        prefixCounts[0] = 1;
        int currentSum = 0;
        int count = 0;
        
        for (int num : nums) {
            currentSum += num;
            if (prefixCounts.find(currentSum - k) != prefixCounts.end()) {
                count += prefixCounts[currentSum - k];
            }
            prefixCounts[currentSum]++;
        }
        
        return count;
    }
};

int main() {
    Solution sol;
    vector<int> test1 = {1, 1, 1};
    cout << "Test 1 Output: " << sol.subarraySum(test1, 2) << endl;
    return 0;
}`;
    const prob1TestCases = [
      { id: 'tc-1', input: '[1, 1, 1], k = 2', expectedOutput: '2', isPublic: true },
      { id: 'tc-2', input: '[1, 2, 3], k = 3', expectedOutput: '2', isPublic: true },
      { id: 'tc-3', input: '[1, -1, 0], k = 0', expectedOutput: '3', isPublic: false }
    ];

    await pool.query(
      `INSERT INTO coding_problems (id, title, difficulty, time_limit_minutes, language, description, examples, constraints, starter_code, test_cases)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'prob-1',
        'Subarray Sum Equals K',
        'Medium',
        30,
        'cpp',
        'Given an array of integers `nums` and an integer `k`, return the total number of subarrays whose sum equals to `k`.\n\nA subarray is a contiguous non-empty sequence of elements within an array.',
        JSON.stringify(prob1Examples),
        JSON.stringify(prob1Constraints),
        prob1StarterCode,
        JSON.stringify(prob1TestCases)
      ]
    );

    const prob2Examples = [
      { input: 's = "()"', output: 'true', explanation: 'Matched single pair.' },
      { input: 's = "()[]{}"', output: 'true', explanation: 'All bracket sequences correctly closed.' },
      { input: 's = "(]"', output: 'false', explanation: 'Mismatched closing bracket.' }
    ];
    const prob2Constraints = ['1 <= s.length <= 10^4', 's consists of parentheses only: ()[]{}'];
    const prob2StarterCode = `#include <iostream>
#include <string>
#include <stack>

using namespace std;

class Solution {
public:
    bool isValid(string s) {
        // Your code here
        stack<char> st;
        for (char c : s) {
            if (c == '(' || c == '{' || c == '[') {
                st.push(c);
            } else {
                if (st.empty()) return false;
                char top = st.top();
                if ((c == ')' && top != '(') ||
                    (c == '}' && top != '{') ||
                    (c == ']' && top != '[')) {
                    return false;
                }
                st.pop();
            }
        }
        return st.empty();
    }
};

int main() {
    Solution sol;
    cout << boolalpha << sol.isValid("()[]{}") << endl;
    return 0;
}`;
    const prob2TestCases = [
      { id: 'tc-1', input: '"()"', expectedOutput: 'true', isPublic: true },
      { id: 'tc-2', input: '"()[]{}"', expectedOutput: 'true', isPublic: true },
      { id: 'tc-3', input: '"(]"', expectedOutput: 'false', isPublic: true },
      { id: 'tc-4', input: '"{[]}"', expectedOutput: 'true', isPublic: false }
    ];

    await pool.query(
      `INSERT INTO coding_problems (id, title, difficulty, time_limit_minutes, language, description, examples, constraints, starter_code, test_cases)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'prob-2',
        'Valid Parentheses & Bracket Validation',
        'Easy',
        20,
        'cpp',
        'Given a string `s` containing just the characters \'(\', \')\', \'{\', \'}\', \'[\' and \']\', determine if the input string is valid.',
        JSON.stringify(prob2Examples),
        JSON.stringify(prob2Constraints),
        prob2StarterCode,
        JSON.stringify(prob2TestCases)
      ]
    );

    // 4. Seed Interviews
    const int1Questions = [
      {
        id: 'q-1',
        type: 'resume-based',
        category: 'Experience & Architecture',
        question: 'Based on your resume, you built full-stack reactive applications. How did you manage state synchronization and minimize redundant re-renders under rapid user interactions?',
        expectedPoints: ['State management strategy', 'Performance optimization', 'Component lifecycle']
      },
      {
        id: 'q-2',
        type: 'technical',
        category: 'System Design & APIs',
        question: 'When architecting a real-time streaming endpoint (e.g. LLM token generation or live proctoring events), would you choose WebSockets, Server-Sent Events (SSE), or WebRTC? Justify your choice based on protocol overhead and error recovery.',
        expectedPoints: ['SSE vs WebSockets tradeoffs', 'Connection lifecycle', 'Reconnection and backoff']
      },
      {
        id: 'q-3',
        type: 'behavioral',
        category: 'Collaboration & Problem-Solving',
        question: 'Describe a situation where a critical production bug or performance bottleneck emerged right before a release. How did you prioritize, diagnose, and communicate the resolution to stakeholders?',
        expectedPoints: ['Root cause triage', 'Calm crisis handling', 'Stakeholder communication']
      },
      {
        id: 'q-4',
        type: 'job-specific',
        category: 'AI Pipeline Engineering',
        question: 'How do you safeguard user data and maintain prompt injection resistance when integrating external LLM APIs with internal databases?',
        expectedPoints: ['Input sanitization', 'Zero trust boundary', 'Audit logging']
      }
    ];

    const int1Proctoring = {
      fullScreenLock: true,
      tabFocusTracking: true,
      webcamGazeMonitoring: true,
      audioNoiseAnalysis: true,
      secondaryCameraRequired: false,
      maxGeneralStrikes: 5
    };

    const int1Rubric = {
      technicalKnowledgeWeight: 35,
      communicationClarityWeight: 20,
      problemSolvingWeight: 20,
      codingCorrectnessWeight: 25
    };

    await pool.query(
      `INSERT INTO interviews (id, job_id, job_title, company_id, company_name, title, description, duration_minutes, language, supported_languages, scheduled_date, status, required_skills, proctoring_config, scoring_rubric, coding_problem_id, questions)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'int-201',
        'job-101',
        'Senior Full-Stack & AI Engineer',
        'comp-1',
        'TechCorp Global',
        'Adaptive AI Technical & Behavioral Screening',
        'Comprehensive evaluation covering your technical stack, project design choices, real-time problem solving, and hands-on coding.',
        45,
        'English',
        JSON.stringify(['English', 'Spanish', 'Hindi', 'German', 'Mandarin']),
        '2026-10-12T14:00:00Z',
        'Ready to Start',
        JSON.stringify(['React', 'Python', 'C++', 'System Design', 'Algorithms']),
        JSON.stringify(int1Proctoring),
        JSON.stringify(int1Rubric),
        'prob-1',
        JSON.stringify(int1Questions)
      ]
    );

    const int2Questions = [
      {
        id: 'q-201',
        type: 'technical',
        category: 'C++ Systems',
        question: 'Explain the difference between std::unique_ptr and std::shared_ptr, including reference counting overhead and how circular references can be prevented with std::weak_ptr.',
        expectedPoints: ['Smart pointer mechanics', 'Control block allocation', 'Memory leak prevention']
      },
      {
        id: 'q-202',
        type: 'algorithmic',
        category: 'Data Structures',
        question: 'When designing a cache with O(1) average lookup and eviction, what data structures would you combine, and how would you handle thread safety under high concurrency?',
        expectedPoints: ['Hash map + Doubly linked list', 'Mutex granularity or lock-free reads']
      }
    ];

    await pool.query(
      `INSERT INTO interviews (id, job_id, job_title, company_id, company_name, title, description, duration_minutes, language, supported_languages, scheduled_date, status, required_skills, proctoring_config, scoring_rubric, coding_problem_id, questions)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'int-202',
        'job-102',
        'Systems & Algorithmic Developer',
        'comp-1',
        'TechCorp Global',
        'Core Systems & Algorithmic Competency',
        'Assesses depth in C++ memory management, concurrency constructs, and algorithmic efficiency.',
        40,
        'English',
        JSON.stringify(['English', 'German', 'French']),
        '2026-10-15T16:30:00Z',
        'Scheduled',
        JSON.stringify(['C++', 'Data Structures', 'Linux', 'Memory Optimization']),
        JSON.stringify(int1Proctoring),
        JSON.stringify(int1Rubric),
        'prob-2',
        JSON.stringify(int2Questions)
      ]
    );

    // 5. Seed Submissions
    const subAnswers = [
      {
        questionId: 'q-1',
        questionText: 'Based on your resume, you built full-stack reactive applications. How did you manage state synchronization and minimize redundant re-renders?',
        candidateAnswer: 'I separated global state from local UI ephemeral state using atomic stores (such as Zustand) and leveraged selective subscriptions. For high-frequency events like metric updates or typing, I utilized debounced updates, memoized selectors, and React 19 compiler-level optimizers to avoid full sub-tree recalculations.',
        score: 95,
        feedback: 'Excellent grasp of rendering lifecycles and practical state separation strategies.'
      },
      {
        questionId: 'q-2',
        questionText: 'When architecting a real-time streaming endpoint, would you choose WebSockets, Server-Sent Events (SSE), or WebRTC?',
        candidateAnswer: 'For unidirectional token or event streaming like LLM outputs, SSE over HTTP/2 is ideal because it uses standard HTTP, handles automatic reconnections natively, and works seamlessly through corporate proxies without custom WS handshakes. For bidirectional low-latency duplexing, WebSockets would be the preferred choice.',
        score: 92,
        feedback: 'Well-reasoned trade-off analysis between SSE and WebSockets.'
      },
      {
        questionId: 'q-3',
        questionText: 'Describe a situation where a critical production bug emerged right before a release.',
        candidateAnswer: 'During a release at Nexus Cloud, memory consumption spiked when 5,000 concurrent sockets connected. I used heap snapshot analysis to identify an unbound event listener in our socket handler, patched the teardown logic in a hotfix branch, tested it with an artillery load script, and documented the root cause in a post-mortem.',
        score: 90,
        feedback: 'Structured response demonstrating calm triage and post-incident accountability.'
      },
      {
        questionId: 'q-4',
        questionText: 'How do you safeguard user data and maintain prompt injection resistance when integrating external LLM APIs?',
        candidateAnswer: 'I enforce a strict boundary: untrusted candidate inputs are wrapped inside delimiter tags with explicit system-prompt guardrails, never executed directly as commands. Furthermore, sensitive PII is tokenized or redacted before API egress, and API egress tokens are strictly bounded by least-privilege service accounts.',
        score: 94,
        feedback: 'Solid security posture and awareness of LLM prompt hygiene.'
      }
    ];

    const subCoding = {
      problemId: 'prob-1',
      problemTitle: 'Subarray Sum Equals K',
      language: 'cpp',
      code: prob1StarterCode,
      testResults: [
        { testCaseId: 'tc-1', passed: true, runtime: '2ms', memory: '14.2MB' },
        { testCaseId: 'tc-2', passed: true, runtime: '2ms', memory: '14.1MB' },
        { testCaseId: 'tc-3', passed: true, runtime: '3ms', memory: '14.5MB' }
      ],
      passedCount: 3,
      totalCount: 3,
      score: 100
    };

    const subReport = {
      overallScore: 94,
      verdict: 'Strong Hire',
      rubricScores: {
        technicalKnowledge: 93,
        communicationClarity: 91,
        problemSolving: 94,
        codingCorrectness: 100,
        integrityScore: 98
      },
      strengths: [
        'Demonstrates deep algorithmic comprehension with optimal O(N) prefix-hash solution',
        'Clear, structured verbal communication with precise terminology',
        'Practical understanding of full-stack scalability and modern browser APIs'
      ],
      areasForGrowth: [
        'Could elaborate further on distributed telemetry tracing across microservices'
      ],
      recruiterNotes: 'Top 5% candidate for the Full-Stack & AI team. Recommend advancing to final leadership chat.',
      status: 'Reviewed'
    };

    const subProctoring = {
      integrityScore: 98,
      strikes: 0,
      eventsCount: 1,
      events: [
        { type: 'TAB_BLUR', timestamp: '2026-10-08T18:12:10Z', details: 'Candidate temporarily blurred browser window for 1.4s (within grace threshold)' }
      ]
    };

    await pool.query(
      `INSERT INTO submissions (id, interview_id, interview_title, job_id, job_title, candidate_id, candidate_name, candidate_email, candidate_college, submitted_at, status, time_spent_minutes, proctoring_summary, answers, coding_submission, evaluation_report)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'sub-301',
        'int-201',
        'Adaptive AI Technical & Behavioral Screening',
        'job-101',
        'Senior Full-Stack & AI Engineer',
        'cand-1',
        'Alex Rivera',
        'alex@candidate.com',
        'Stanford University',
        '2026-10-08 18:45:00',
        'Reviewed',
        38,
        JSON.stringify(subProctoring),
        JSON.stringify(subAnswers),
        JSON.stringify(subCoding),
        JSON.stringify(subReport)
      ]
    );

    console.log('[Seed] Database successfully seeded with real user, jobs, coding problems, and submissions.');
  } catch (error) {
    console.error('[Seed] Error seeding database:', error);
    throw error;
  }
};

// Allow direct execution
if (process.argv[1]?.endsWith('seed.js')) {
  seedDatabase()
    .then(() => {
      console.log('Seed completed successfully.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Seed failed:', err);
      process.exit(1);
    });
}
