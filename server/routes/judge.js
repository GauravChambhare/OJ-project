import { Router } from 'express';
import axios from 'axios';
import Problem from '../models/Problem.js';
import TestCase from '../models/TestCase.js';
import authMiddleware from '../middleware/auth.js';

const router = Router();

// POST /api/judge/run
// This is for "Run" only: no DB write, just call judge and return result.
router.post('/run', authMiddleware, async (req, res) => {
  try {
    const { problemCode, language, code } = req.body;

    if (!problemCode || !language || !code) {
      return res
        .status(400)
        .json({ message: 'problemCode, language, and code are required' });
    }

    // Find problem by code
    const problem = await Problem.findOne({ code: problemCode });
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    // Fetch testcases for this problem
    const testCases = await TestCase.find({ problemId: problem._id }).lean();
    if (!testCases.length) {
      return res
        .status(500)
        .json({ message: 'No test cases configured for this problem' });
    }

    const judgeTestCases = testCases.map((tc) => ({
      input: tc.input,
      expectedOutput: tc.expectedOutput,
    }));

    // Call judge service
    const response = await axios.post('http://localhost:4000/judge/run', {
      code,
      language,
      problemId: problem._id.toString(),
      testCases: judgeTestCases,
    });

    // Forward judge response directly to client
    return res.status(200).json(response.data);
  } catch (err) {
    console.error('Error in POST /api/judge/run:', err.message || err);
    if (err.response) {
      return res
        .status(err.response.status || 500)
        .json(err.response.data || { message: 'Judge service error' });
    }
    return res.status(500).json({ message: 'Unable to reach judge service' });
  }
});

export default router;