import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { configDotenv } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 4000; //start at 4000 if port no. not given in .env

app.use(cors());
app.use(express.json());

// POST /judge/run
app.post('/judge/run', (req, res) => {
  const { code, language, problemId, testCases } = req.body;

  // Basic validation
  if (!code || !language || !problemId || !Array.isArray(testCases)) {
    return res.status(400).json({ message: 'Invalid request body' });
  }

  // For now, return a dummy success response
  return res.status(200).json({
    verdict: 'Accepted',
    stdout: '',
    stderr: '',
    timeMs: 0,
    memoryKb: 0,
  });
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