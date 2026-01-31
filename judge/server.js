import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { configDotenv } from 'dotenv';
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
const PORT = process.env.PORT || 4000; //start at 4000 if port no. not given in .env

app.use(cors());
app.use(express.json());


// creating a temp directory where the input and test files will be generated from received response data and then these will be passed to container
function createTempDir() {
  const prefix = path.join(os.tmpdir(), 'oj-');
  return fs.mkdtempSync(prefix);
}

//ek testcase ko laker codde ko run karta hai below function in new container and then returns the response based on output from the image.
//hum ek child process ka use karre hai to achieve this task 
//2 sec ka hard timelimit deraha hai ek docker image run karke finish hone ko per testcase.
function runInDocker({ language, srcPath, inputPath, timeLimitMs = 2000  }) { 
  return new Promise((resolve, reject) => { //ek promise create karna padega to handle this async task.
    const image = 'oj-runner:30-jan'; //filhal idhar hardcode kiya hai,  if needed in future we can read the same from an .env file

    const workDirOnHost = path.dirname(srcPath);
    const workDirInContainer = '/runner/work';

    const dockerArgs = [    // ye apna dynamically generated docker run command rahega. for exact breakdown ki kon kya karra hai, I have written in for_owner_use_only.md
      '--rm',
      '--cpus=0.5',  //hard resource limit dera hu abhi isko badme change karuga agar jarurat padito
      '--memory=256m',
      '-v', `${workDirOnHost}:${workDirInContainer}`,
      '--entrypoint', '/bin/sh',
      image,
      '-c',
      `/runner/run.sh ${language} work/${path.basename(srcPath)} work/${path.basename(inputPath)}`
    ]; 

    const child = spawn('docker', ['run', ...dockerArgs]); 

    let stdout = '';
    let stderr = '';
    let finished = false;

    //for enforcing timeLimitMs [jo 2 sec hai abhi]
    const timeout = setTimeout(() => {
      if (finished) return;
      finished = true;
      // kill docker run (which kills the container)
      child.kill('SIGKILL');
      resolve({ code: 124, stdout, stderr: stderr + '\nTIME LIMIT EXCEEDED\n' });
    }, timeLimitMs);

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('error', (err) => {
      if (finished) return;
      finished = true;
      clearTimeout(timeout); //this is javascripts function jo erailer defined setTimeout ke timer ko stop karta hai, isko wo setTimeout wale alarm/timer ka unique id pass karna hota hai taki wo isko dhundke wo timerband karsake. 
      reject(err);
    }); //agar error milega to promise reject return karega with error data/text

    child.on('close', (code) => {
      if (finished) return;
      finished = true;
      clearTimeout(timeout);
      resolve({ code, stdout, stderr });
    }); //agar close aya to pure details return hoge resolve se.
  });
}

// POST /judge/run
app.post('/judge/run', async (req, res) => {
  const { code, language, problemId, testCases } = req.body;

  if (!code || !language || !problemId || !Array.isArray(testCases)) {
    return res.status(400).json({ message: 'Invalid request body' });
  }

  // Create a temp dir and write source file
  const tempDir = createTempDir();

  // Decide source file name by language we get from req
  let srcFileName;
  if (language === 'python' || language === 'python3') srcFileName = 'main.py'; //agar sirf python ya python3 bhi kiya hota to bhi chalega kyuki isko server/server.js me halgle karlenge
  else if (language === 'java') srcFileName = 'Main.java';
  else if (language === 'cpp') srcFileName = 'main.cpp';
  else if (language === 'javascript' || language === 'js') srcFileName = 'main.js';
  else return res.status(400).json({ message: 'Unsupported language' }); //ye waise to hoga nahi kabhi run but fir bhi daldera hu

  const srcPath = path.join(tempDir, srcFileName);
  fs.writeFileSync(srcPath, code, 'utf8'); // basically new temp file create hora hai at srcPath location jo hum dynamically generate karrahe hai and usme hum req se jo code aya wo write karre hai.


  let finalVerdict = 'Accepted';
   //ye hum child process se milage jab runInDocker ko call hoga tab
  let aggregatedStdout = ''; //ye hum child process se milage jab runInDocker ko call hoga tab
  let aggregatedStderr = '';

  try {
    for (let i = 0; i < testCases.length; i++) {
      const tc = testCases[i];
      const inputPath = path.join(tempDir, `input_${i}.txt`);
      fs.writeFileSync(inputPath, tc.input ?? '', 'utf8'); //ye tescases ke liye input file generate hore hai

      const { code: exitCode, stdout, stderr } = await runInDocker({
        language,
        srcPath,
        inputPath,
      });

      aggregatedStdout += `# Testcase ${i + 1}\n${stdout}\n`;
      if (stderr) {
        aggregatedStderr += `# Testcase ${i + 1}\n${stderr}\n`;
      }

      if (exitCode === 100) {
        finalVerdict = 'Compilation Error';
        break;
      } else if (exitCode === 101) {
        finalVerdict = 'Runtime Error';
        break;
      } else if (exitCode === 124) {
        // ye tle ke liye hai error code 124 cutom defined kiya hua
        finalVerdict = 'Time Limit Exceeded';
        break;
      } else if (exitCode !== 0) {
        finalVerdict = 'Judge Error';
        break;
      } else {
        // comparing stdout vs expected
        const cleanedStdout = stdout.trim();
        const expected = (tc.expectedOutput ?? '').trim();
        if (cleanedStdout !== expected) {
          finalVerdict = 'Wrong Answer';
          break;
        }
      }
    }

    return res.status(200).json({
      verdict: finalVerdict,
      stdout: aggregatedStdout,
      stderr: aggregatedStderr,
      timeMs: 0, //harcode karre hai filhal ye and memory
      memoryKb: 0,
    });
  } catch (err) {
    console.error('Judge error:', err);
    return res.status(500).json({ message: 'Judge internal error' });
  } finally {
    // temp dir ko clean karrahe hai after every submission request's completion to keep everything clean.
    fs.rm(tempDir, { recursive: true, force: true }, () => {});
  }
});


// start and shutdown of server
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
// shutdown
process.on('SIGINT', async () => {
    console.log('Judge Server is shutting down...');
    process.exit(0);
});