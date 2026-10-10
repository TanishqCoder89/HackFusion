import { getPool } from './db.js';

// Seeded problems originally had free-text test inputs that could not be executed.
// Convert them to real stdin/stdout problems so submissions are genuinely run and graded.

const prob1 = {
  difficulty: 'Medium',
  timeLimit: 30,
  title: 'Subarray Sum Equals K',
  description:
    'Given an array of integers and an integer `k`, print the total number of contiguous non-empty subarrays whose sum equals `k`.\n\n**Input format**\nLine 1: two integers `n` and `k`\nLine 2: `n` integers (the array)\n\n**Output format**\nA single integer: the number of subarrays with sum `k`.',
  examples: [
    { input: '3 2\n1 1 1', output: '2', explanation: 'Subarrays [1,1] at indices (0,1) and (1,2) both sum to 2.' },
    { input: '3 3\n1 2 3', output: '2', explanation: '[1,2] and [3] both sum to 3.' }
  ],
  constraints: ['1 <= n <= 2 * 10^4', '-1000 <= nums[i] <= 1000', '-10^7 <= k <= 10^7'],
  testCases: [
    { id: 'tc-1', input: '3 2\n1 1 1', expectedOutput: '2', isPublic: true },
    { id: 'tc-2', input: '3 3\n1 2 3', expectedOutput: '2', isPublic: true },
    { id: 'tc-3', input: '3 0\n1 -1 0', expectedOutput: '3', isPublic: false },
    { id: 'tc-4', input: '5 5\n1 2 3 -2 5', expectedOutput: '2', isPublic: false },
    { id: 'tc-5', input: '4 0\n0 0 0 0', expectedOutput: '10', isPublic: false }
  ],
  starterCodes: {
    cpp: `#include <bits/stdc++.h>
using namespace std;

int subarraySum(vector<int>& nums, int k) {
    // Your code here
    return 0;
}

int main() {
    int n, k;
    cin >> n >> k;
    vector<int> nums(n);
    for (auto& x : nums) cin >> x;
    cout << subarraySum(nums, k) << endl;
    return 0;
}
`,
    python: `import sys

def subarray_sum(nums, k):
    # Your code here
    return 0

def main():
    data = sys.stdin.read().split()
    n, k = int(data[0]), int(data[1])
    nums = list(map(int, data[2:2 + n]))
    print(subarray_sum(nums, k))

main()
`,
    javascript: `const tokens = require('fs').readFileSync(0, 'utf8').split(/\\s+/).filter(Boolean).map(Number);
const n = tokens[0], k = tokens[1];
const nums = tokens.slice(2, 2 + n);

function subarraySum(nums, k) {
  // Your code here
  return 0;
}

console.log(subarraySum(nums, k));
`
  },
  referenceSolution: `import sys
from collections import defaultdict
d = sys.stdin.read().split()
n, k = int(d[0]), int(d[1])
a = list(map(int, d[2:2 + n]))
c = defaultdict(int); c[0] = 1; s = 0; r = 0
for x in a:
    s += x; r += c[s - k]; c[s] += 1
print(r)
`
};

const prob2 = {
  difficulty: 'Easy',
  timeLimit: 20,
  title: 'Valid Parentheses & Bracket Validation',
  description:
    'Given a string `s` containing only the characters `(`, `)`, `{`, `}`, `[` and `]`, print `true` if the brackets are valid, otherwise `false`.\n\nA string is valid when every opening bracket is closed by the same type of bracket, in the correct order.\n\n**Input format**\nA single line containing the string `s`.\n\n**Output format**\n`true` or `false`.',
  examples: [
    { input: '()', output: 'true', explanation: 'Matched single pair.' },
    { input: '()[]{}', output: 'true', explanation: 'All bracket sequences correctly closed.' },
    { input: '(]', output: 'false', explanation: 'Mismatched closing bracket.' }
  ],
  constraints: ['1 <= s.length <= 10^4', 's consists of parentheses only: ()[]{}'],
  testCases: [
    { id: 'tc-1', input: '()', expectedOutput: 'true', isPublic: true },
    { id: 'tc-2', input: '()[]{}', expectedOutput: 'true', isPublic: true },
    { id: 'tc-3', input: '(]', expectedOutput: 'false', isPublic: true },
    { id: 'tc-4', input: '{[]}', expectedOutput: 'true', isPublic: false },
    { id: 'tc-5', input: '((', expectedOutput: 'false', isPublic: false }
  ],
  starterCodes: {
    cpp: `#include <bits/stdc++.h>
using namespace std;

bool isValid(const string& s) {
    // Your code here
    return false;
}

int main() {
    string s;
    cin >> s;
    cout << (isValid(s) ? "true" : "false") << endl;
    return 0;
}
`,
    python: `import sys

def is_valid(s):
    # Your code here
    return False

print("true" if is_valid(sys.stdin.read().strip()) else "false")
`,
    javascript: `const s = require('fs').readFileSync(0, 'utf8').trim();

function isValid(s) {
  // Your code here
  return false;
}

console.log(isValid(s) ? 'true' : 'false');
`
  },
  referenceSolution: `s = input().strip()
pairs = {')': '(', ']': '[', '}': '{'}
st = []
ok = True
for ch in s:
    if ch in '([{': st.append(ch)
    elif not st or st.pop() != pairs[ch]: ok = False; break
print('true' if ok and not st else 'false')
`
};

const upgrades = { 'prob-1': prob1, 'prob-2': prob2 };

export const migrateProblems = async () => {
  const pool = getPool();
  for (const [id, p] of Object.entries(upgrades)) {
    const [rows] = await pool.query('SELECT starter_codes FROM coding_problems WHERE id = ?', [id]);

    if (rows.length === 0) {
      // Fresh production database (no demo seed): install the built-in question bank
      await pool.query(
        `INSERT INTO coding_problems (id, title, difficulty, time_limit_minutes, language, description, examples, constraints,
           starter_code, starter_codes, test_cases, reference_solution, source)
         VALUES (?, ?, ?, ?, 'cpp', ?, ?, ?, ?, ?, ?, ?, 'seed')`,
        [
          id, p.title, p.difficulty, p.timeLimit, p.description, JSON.stringify(p.examples), JSON.stringify(p.constraints),
          p.starterCodes.cpp, JSON.stringify(p.starterCodes), JSON.stringify(p.testCases), p.referenceSolution
        ]
      );
      console.log(`[Migrate] Installed built-in problem ${id}.`);
      continue;
    }
    if (rows[0].starter_codes) continue; // already migrated

    await pool.query(
      `UPDATE coding_problems SET title = ?, description = ?, examples = ?, constraints = ?, test_cases = ?,
         starter_codes = ?, starter_code = ?, reference_solution = ?, source = 'seed', language = 'cpp' WHERE id = ?`,
      [
        p.title,
        p.description,
        JSON.stringify(p.examples),
        JSON.stringify(p.constraints),
        JSON.stringify(p.testCases),
        JSON.stringify(p.starterCodes),
        p.starterCodes.cpp,
        p.referenceSolution,
        id
      ]
    );
    console.log(`[Migrate] Converted ${id} to executable stdin/stdout format.`);
  }
};
