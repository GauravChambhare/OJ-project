import { Router } from 'express';
import axios from 'axios';
import authMiddleware, { requireAdmin } from '../middleware/auth.js';
import Submission from '../models/Submission.js';
import Problem from '../models/Problem.js';
import TestCase from '../models/TestCase.js';

const router = Router();

// POST /api/submissions
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { problemCode, language, code } = req.body;

    if (!problemCode || !language || !code) {
      return res.status(400).json({ message: 'problemCode, language, and code are required' });
    }

    // Look up the Problem by code
    const problem = await Problem.findOne({ code: problemCode });
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    //  Create submission with with ObjectId problemId
    const submission = await Submission.create({
      userId: req.user.userId,
      problemId: problem._id,
      language,
      sourceCode: code,
      verdict: 'Pending',
      submittedAt: new Date(),
    });

    // fetching all testcases for that problemTd
    const testCases = await TestCase.find({ problemId: problem._id }).lean();

    if (!testCases.length) {
      return res.status(500).json({ message: 'No test cases configured for this problem' });
    }
    
    // apan judge service ke input, output format ke hisab se map karre hai
    const judgeTestCases = testCases.map(tc => ({
      input: tc.input,
      expectedOutput: tc.expectedOutput,
    }));

    let judgeData;
    try {
      const judgeResponse = await axios.post('http://localhost:4000/judge/run', {
        code,
        language,
        problemId: problem._id.toString(),
        testCases: judgeTestCases,
      });

      judgeData = judgeResponse.data;
    } catch (err) {
      console.error('Error calling judge service:', err.message);
      submission.verdict = 'Judge Error';
      submission.stderr = 'Judge service error';
      await submission.save();
      return res.status(500).json({ message: 'Judge service error' });
    }

    // Mapping the judge's response to schema field names
    submission.verdict = judgeData.verdict || 'Judge Error';
    submission.stdout = judgeData.stdout || '';
    submission.stderr = judgeData.stderr || '';
    submission.executionTimeMs =
      typeof judgeData.timeMs === 'number' ? judgeData.timeMs : undefined;
    submission.memoryUsedKb =
      typeof judgeData.memoryKb === 'number' ? judgeData.memoryKb : undefined;

    await submission.save();

    return res.status(201).json({
      id: submission._id,
      problemId: submission.problemId,
      language: submission.language,
      verdict: submission.verdict,
      timeMs: submission.executionTimeMs,
      memoryKb: submission.memoryUsedKb,
      createdAt: submission.submittedAt,
      stdout: submission.stdout || '', // if no output then keep empty space
      stderr: submission.stderr || '',
    });    
  } catch (err) {
    console.error('Error in POST /api/submissions:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

//ye niche wale read API's hai
// This route gets the list of submissions for a problem by a user.
// GET /api/submissions?problemCode=SUM2
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { problemCode } = req.query;

    const filter = { userId: req.user.userId };

    if (problemCode) {
      const problem = await Problem.findOne({ code: problemCode });
      if (!problem) {
        return res.json([]); // no such problem
      }
      filter.problemId = problem._id;
    }

    const submissions = await Submission.find(filter)
      .sort({ submittedAt: -1 })
      .limit(50);

    return res.json(
      submissions.map(sub => ({
        id: sub._id,
        problemId: sub.problemId,
        language: sub.language,
        verdict: sub.verdict,
        timeMs: sub.executionTimeMs,
        memoryKb: sub.memoryUsedKb,
        createdAt: sub.submittedAt,
      }))
    );
  } catch (err) {
    console.error('Error in GET /api/submissions:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// this gives one specific past submission made by the user for a problem
// GET /api/submissions/:id
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const sub = await Submission.findById(id);

    if (!sub) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    if (sub.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    return res.json({
      id: sub._id,
      problemId: sub.problemId,
      language: sub.language,
      verdict: sub.verdict,
      timeMs: sub.executionTimeMs,
      memoryKb: sub.memoryUsedKb,
      createdAt: sub.submittedAt,
      // sourceCode: sub.sourceCode,  //ye optional hai jarurat nahi hai final version me
      stdout: sub.stdout,
      stderr: sub.stderr,
    });
  } catch (err) {
    console.error('Error in GET /api/submissions/:id:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// ADMIN ke liye api hai: list submissions with filters
// GET /api/submissions/admin?userId=&problemCode=&verdict=&language=&limit=&page=
router.get('/admin', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { userId, problemCode, verdict, language, limit = 50, page = 1 } = req.query;

    const filter = {};

    if (userId) {
      filter.userId = userId;
    }

    if (problemCode) {
      const problem = await Problem.findOne({ code: problemCode });
      if (!problem) {
        return res.json({ items: [], total: 0 });
      }
      filter.problemId = problem._id;
    }

    if (verdict) {
      filter.verdict = verdict;
    }

    if (language) {
      filter.language = language;
    }

    const perPage = Math.min(Number(limit) || 50, 100);
    const skip = (Number(page) - 1) * perPage;

    const [items, total] = await Promise.all([
      Submission.find(filter)
        .sort({ submittedAt: -1 })
        .skip(skip)
        .limit(perPage),
      Submission.countDocuments(filter),
    ]);

    const result = items.map(sub => ({
      id: sub._id,
      userId: sub.userId,
      problemId: sub.problemId,
      language: sub.language,
      verdict: sub.verdict,
      timeMs: sub.executionTimeMs,
      memoryKb: sub.memoryUsedKb,
      createdAt: sub.submittedAt,
    }));

    res.json({ items, total, page: Number(page), limit: perPage, data: result });
  } catch (err) {
    console.error('Error in GET /api/submissions/admin:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ADMIN ke liye api: get full details of any submission
// GET /api/submissions/admin/:id
router.get('/admin/:id', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const sub = await Submission.findById(id);
    if (!sub) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    return res.json({
      id: sub._id,
      userId: sub.userId,
      problemId: sub.problemId,
      language: sub.language,
      verdict: sub.verdict,
      timeMs: sub.executionTimeMs,
      memoryKb: sub.memoryUsedKb,
      createdAt: sub.submittedAt,
      stdout: sub.stdout,
      stderr: sub.stderr,
      sourceCode: sub.sourceCode,
    });
  } catch (err) {
    console.error('Error in GET /api/submissions/admin/:id:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});


export default router;