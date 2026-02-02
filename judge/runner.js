// /runner/runner.js – runs inside container
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Run one testcase with timeout using spawn + setTimeout
function runOneTest({ language, srcPath, inputPath, timeLimitMs }) {
  return new Promise((resolve) => {
    const child = spawn('/runner/run.sh', [language, srcPath, inputPath], {
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';
    let finished = false;

    const start = Date.now();

    const timeout = setTimeout(() => {
      if (finished) return;
      finished = true;
      child.kill('SIGKILL');
      const elapsed = Date.now() - start;
      resolve({
        exitCode: 124,
        stdout,
        stderr: stderr + '\nTIME LIMIT EXCEEDED\n',
        timeMs: elapsed,
      });
    }, timeLimitMs);

    child.stdout.on('data', (d) => {
     stdout += d.toString();
    });

    child.stderr.on('data', (d) => {
      stderr += d.toString();
    });

    child.on('error', () => {
      if (finished) return;
      finished = true;
      clearTimeout(timeout);
      const elapsed = Date.now() - start;
      resolve({
        exitCode: 500,
        stdout,
        stderr: stderr + '\nJUDGE RUNTIME ERROR\n',
        timeMs: elapsed,
      });
    });

    child.on('close', (code) => {
      if (finished) return;
      finished = true;
      clearTimeout(timeout);
      const elapsed = Date.now() - start;
      resolve({
        exitCode: code ?? 0,
        stdout,
        stderr,
        timeMs: elapsed,
      });
    });
  });
}

async function main() {
  const jsonPath = process.argv[2]; // e.g. /runner/work/tests.json
  if (!jsonPath) {
    console.log(
      JSON.stringify({
        verdict: 'Judge Error',
        stdout: '',
        stderr: 'tests.json path not provided',
        tests: [],
        timeMs: 0,
        memoryKb: 0,
      })
    );
    return;
  }

  let payload;
  try {
    const raw = fs.readFileSync(jsonPath, 'utf8');
    payload = JSON.parse(raw);
  } catch {
    console.log(
      JSON.stringify({
        verdict: 'Judge Error',
        stdout: '',
        stderr: 'Failed to read or parse tests.json',
        tests: [],
        timeMs: 0,
        memoryKb: 0,
      })
    );
    return;
  }

  const { language, code, testCases } = payload || {};
  if (!language || !code || !Array.isArray(testCases)) {
    console.log(
      JSON.stringify({
        verdict: 'Judge Error',
        stdout: '',
        stderr: 'Invalid payload: missing language/code/testCases',
        tests: [],
        timeMs: 0,
        memoryKb: 0,
      })
    );
    return;
  }

  // Decide source file name
  let srcFileName;
  if (language === 'python' || language === 'python3') srcFileName = 'main.py';
  else if (language === 'java') srcFileName = 'Main.java';
  else if (language === 'cpp') srcFileName = 'main.cpp';
  else if (language === 'javascript' || language === 'js') srcFileName = 'main.js';
  else {
    console.log(
      JSON.stringify({
        verdict: 'Judge Error',
        stdout: '',
        stderr: `Unsupported language: ${language}`,
        tests: [],
        timeMs: 0,
        memoryKb: 0,
      })
    );
    return;
  }

  const workDir = path.dirname(jsonPath); // /runner/work
  const srcPath = path.join(workDir, srcFileName);
  fs.writeFileSync(srcPath, code, 'utf8');

  // Per-language time limit (ms)
  const defaultLimit = 2000;
  const perLanguageLimit =
    language === 'java' ? 4000 : defaultLimit; // give Java a bit more time

  let finalVerdict = 'Accepted';
  let aggregatedStdout = '';
  let aggregatedStderr = '';
  const tests = [];
  let totalTimeMs = 0;

  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    const inputPath = path.join(workDir, `input_${i}.txt`);
    fs.writeFileSync(inputPath, tc.input ?? '', 'utf8');

    const { exitCode, stdout, stderr, timeMs } = await runOneTest({
      language,
      srcPath,
      inputPath,
      timeLimitMs: perLanguageLimit,
    });

    aggregatedStdout += `# Testcase ${i + 1}\n${stdout}\n`;
    if (stderr) {
      aggregatedStderr += `# Testcase ${i + 1}\n${stderr}\n`;
    }

    totalTimeMs += timeMs;

    let status = 'passed';
    let reason = '';

    if (exitCode === 100) {
      finalVerdict = 'Compilation Error';
      status = 'failed';
      reason = 'Compilation Error';
    } else if (exitCode === 101) {
      finalVerdict = 'Runtime Error';
      status = 'failed';
      reason = 'Runtime Error';
    } else if (exitCode === 124) {
      finalVerdict = 'Time Limit Exceeded';
      status = 'failed';
      reason = 'Time Limit Exceeded';
    } else if (exitCode !== 0) {
      finalVerdict = 'Judge Error';
      status = 'failed';
      reason = 'Judge Error';
    } else {
      const cleanedStdout = stdout.trim();
      const expected = (tc.expectedOutput ?? '').trim();
      if (cleanedStdout !== expected) {
        finalVerdict = 'Wrong Answer';
        status = 'failed';
        reason = 'Wrong Answer';
      }
    }

    tests.push({
      index: i + 1,
      input: tc.input ?? '',
      expectedOutput: tc.expectedOutput ?? '',
      actualOutput: stdout,
      status,
      reason,
      timeMs,
    });

    if (status === 'failed') break;
  }

  console.log(
    JSON.stringify({
      verdict: finalVerdict,
      stdout: aggregatedStdout,
      stderr: aggregatedStderr,
      tests,
      timeMs: totalTimeMs,
      memoryKb: 0,
    })
  );
}

main();
