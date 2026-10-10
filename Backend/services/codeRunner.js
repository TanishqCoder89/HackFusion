import { spawn } from 'child_process';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';

const MAX_OUTPUT_BYTES = 256 * 1024;
const COMPILE_TIMEOUT_MS = 20000;
const RUN_TIMEOUT_MS = 5000;

export const SUPPORTED_LANGUAGES = {
  cpp: { label: 'C++', file: 'main.cpp' },
  python: { label: 'Python', file: 'main.py' },
  javascript: { label: 'JavaScript', file: 'main.js' }
};

const exec = (cmd, args, { cwd, stdin = '', timeoutMs }) =>
  new Promise((resolve) => {
    const started = Date.now();
    let stdout = '';
    let stderr = '';
    let timedOut = false;
    let child;

    try {
      child = spawn(cmd, args, { cwd, windowsHide: true });
    } catch (err) {
      return resolve({ code: -1, stdout: '', stderr: err.message, timedOut: false, ms: 0 });
    }

    const timer = setTimeout(() => {
      timedOut = true;
      child.kill('SIGKILL');
    }, timeoutMs);

    child.stdout.on('data', (d) => {
      if (stdout.length < MAX_OUTPUT_BYTES) stdout += d.toString();
    });
    child.stderr.on('data', (d) => {
      if (stderr.length < MAX_OUTPUT_BYTES) stderr += d.toString();
    });
    child.on('error', (err) => {
      clearTimeout(timer);
      resolve({ code: -1, stdout, stderr: stderr || err.message, timedOut, ms: Date.now() - started });
    });
    child.on('close', (code) => {
      clearTimeout(timer);
      resolve({ code, stdout, stderr, timedOut, ms: Date.now() - started });
    });

    child.stdin.on('error', () => {});
    child.stdin.end(stdin);
  });

const normalize = (s) =>
  String(s ?? '')
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((l) => l.trimEnd())
    .join('\n')
    .trim();

/**
 * Compiles (if needed) and runs `code` once per test case, feeding `input` on stdin
 * and comparing stdout to `expectedOutput`.
 */
export const runTestCases = async ({ language, code, testCases }) => {
  const lang = SUPPORTED_LANGUAGES[language];
  if (!lang) {
    throw Object.assign(new Error(`Unsupported language "${language}".`), { status: 400 });
  }

  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'hf-run-'));
  try {
    const srcPath = path.join(dir, lang.file);
    await fs.writeFile(srcPath, code, 'utf8');

    let runCmd;
    let runArgs;

    if (language === 'cpp') {
      const exe = path.join(dir, process.platform === 'win32' ? 'main.exe' : 'main');
      const compile = await exec('g++', ['-O2', '-std=c++17', srcPath, '-o', exe], {
        cwd: dir,
        timeoutMs: COMPILE_TIMEOUT_MS
      });
      if (compile.code !== 0) {
        return { compileError: compile.stderr || 'Compilation failed.', results: [] };
      }
      runCmd = exe;
      runArgs = [];
    } else if (language === 'python') {
      runCmd = process.platform === 'win32' ? 'python' : 'python3';
      runArgs = [srcPath];
    } else {
      runCmd = process.execPath;
      runArgs = [srcPath];
    }

    const results = [];
    for (let i = 0; i < testCases.length; i++) {
      const tc = testCases[i];
      const run = await exec(runCmd, runArgs, { cwd: dir, stdin: String(tc.input ?? ''), timeoutMs: RUN_TIMEOUT_MS });
      const actual = normalize(run.stdout);
      const expected = normalize(tc.expectedOutput);
      const passed = !run.timedOut && run.code === 0 && actual === expected;

      let error = null;
      if (run.timedOut) error = `Time limit exceeded (${RUN_TIMEOUT_MS / 1000}s).`;
      else if (run.code !== 0) error = run.stderr.trim().slice(0, 600) || `Process exited with code ${run.code}.`;

      results.push({
        id: tc.id || `tc-${i + 1}`,
        index: i + 1,
        input: tc.input,
        expected: tc.expectedOutput,
        actual: error ? error : actual,
        passed,
        runtime: `${run.ms}ms`,
        isPublic: tc.isPublic !== undefined ? tc.isPublic : true,
        error
      });
    }

    return { compileError: null, results };
  } finally {
    fs.rm(dir, { recursive: true, force: true }).catch(() => {});
  }
};
