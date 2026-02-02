import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 4000; 

app.use(cors());
app.use(express.json());

// temp dir for code + tests
function createTempDir() {
  const prefix = path.join(os.tmpdir(), 'oj-');
  return fs.mkdtempSync(prefix);
}

// Run 1 container for the whole run, executing /runner/runner.js
function runInDockerOnce({ testsJsonPath }) {
  return new Promise((resolve, reject) => {
    const image = 'oj-runner:1-feb';
    const workDirOnHost = path.dirname(testsJsonPath);
    const workDirInContainer = '/runner/work';

    const dockerArgs = [
      '--rm',
      '--cpus=0.5',
      '--memory=256m',
      '-v',
      `${workDirOnHost}:${workDirInContainer}`,
      '--entrypoint',
      'node',
      image,
      '/runner/runner.js',
      `${workDirInContainer}/tests.json`,
    ];

    const child = spawn('docker', ['run', ...dockerArgs]);

    let stdout = '';
    let stderr = '';

    // overall cap per run (e.g. 10s)
    const timeoutMs = 10000;
    const timeout = setTimeout(() => {
      child.kill('SIGKILL');
    }, timeoutMs);

    child.stdout.on('data', (d) => {
      stdout += d.toString();
    });

    child.stderr.on('data', (d) => {
      stderr += d.toString();
    });

    child.on('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });

    child.on('close', (code) => {
      clearTimeout(timeout);
      resolve({ code, stdout, stderr });
    });
  });
}

// POST /judge/run 
app.post('/judge/run', async (req, res) => {
  const { code, language, problemId, testCases } = req.body;

  if (!code || !language || !problemId || !Array.isArray(testCases)) {
    return res.status(400).json({ message: 'Invalid request body' });
  }

  const tempDir = createTempDir();

  try {

    const testsPayload = {
      language,
      code,
      testCases: testCases.map((tc) => ({
        input: tc.input ?? '',
        expectedOutput: tc.expectedOutput ?? '',
      })),
    };

    const testsJsonPath = path.join(tempDir, 'tests.json');
    fs.writeFileSync(testsJsonPath, JSON.stringify(testsPayload), 'utf8');

    const { code: exitCode, stdout, stderr } = await runInDockerOnce({
      testsJsonPath,
    });

    if (exitCode !== 0 && !stdout) {
      // container failed 
      return res.status(500).json({
        message: 'Judge container error',
        stderr,
      });
    }

    let parsed;
    try {
      parsed = JSON.parse(stdout);
    } catch {
      return res.status(500).json({
        message: 'Judge returned invalid JSON',
        raw: stdout,
        stderr,
      });
    }

    //  verdict, stdout, stderr, tests, timeMs, memoryKb
    return res.status(200).json(parsed);
  } catch (err) {
    console.error('Error in POST /judge/run:', err);
    return res.status(500).json({ message: 'Judge internal error' });
  } finally {
    // clean up temp dir
    fs.rm(tempDir, { recursive: true, force: true }, () => {});
  }
});

// start & shutdown
async function startServer() {
  try {
    app.listen(PORT, () => {
      console.log(`Judge service listening on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start Judge server:', error);
    process.exit(1);
  }
}

startServer();

process.on('SIGINT', async () => {
  console.log('Judge Server is shutting down...');
  process.exit(0);
});