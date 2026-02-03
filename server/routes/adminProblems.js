// server/routes/adminProblems.js
import { Router } from 'express';
import authMiddleware, { requireAdmin } from '../middleware/auth.js';
import Problem from '../models/Problem.js';
import TestCase from '../models/TestCase.js';

const router = Router();

// GET /api/admin/problems
router.get('/', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const problems = await Problem.find().sort({ number: 1 });
    res.json(problems);
  } catch (err) {
    console.error('Error in GET /api/admin/problems:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/admin/problems
router.post('/', authMiddleware, requireAdmin, async (req, res) => {
  try {
    let {
      number,
      code,
      title,
      statement,
      difficulty,
      statementMarkdown,
      constraintsMarkdown,
      editorialMarkdown,
    } = req.body;

    if (!number || !code || !title || !statement || !difficulty) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    number = Number(number);

    const existing = await Problem.findOne({ code });
    if (existing) {
      return res.status(400).json({ error: 'Problem code already exists' });
    }

    const problem = await Problem.create({
      number,
      code,
      title,
      statement,
      difficulty,
      statementMarkdown: statementMarkdown || '',
      constraintsMarkdown: constraintsMarkdown || '',
      editorialMarkdown: editorialMarkdown || '',
    });

    res.status(201).json(problem);
  } catch (err) {
    console.error('Error in POST /api/admin/problems:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/admin/problems/:id
router.put('/:id', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      number,
      code,
      title,
      statement,
      difficulty,
      statementMarkdown,
      constraintsMarkdown,
      editorialMarkdown,
    } = req.body;

    const problem = await Problem.findById(id);
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    if (code && code !== problem.code) {
      const exists = await Problem.findOne({ code });
      if (exists) {
        return res.status(400).json({ error: 'Problem code already exists' });
      }
      problem.code = code;
    }

    if (number != null) problem.number = Number(number);
    if (title != null) problem.title = title;
    if (statement != null) problem.statement = statement;
    if (difficulty != null) problem.difficulty = difficulty;
    if (statementMarkdown != null) problem.statementMarkdown = statementMarkdown;
    if (constraintsMarkdown != null) problem.constraintsMarkdown = constraintsMarkdown;
    if (editorialMarkdown != null) problem.editorialMarkdown = editorialMarkdown;

    await problem.save();
    res.json(problem);
  } catch (err) {
    console.error('Error in PUT /api/admin/problems/:id:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/admin/problems/:id
router.delete('/:id', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const problem = await Problem.findById(id);
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    await TestCase.deleteMany({ problemId: problem._id });
    await problem.deleteOne();

    res.json({ message: 'Problem and its test cases deleted' });
  } catch (err) {
    console.error('Error in DELETE /api/admin/problems/:id:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/admin/problems/:id/testcases
router.get('/:id/testcases', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const testcases = await TestCase.find({ problemId: id }).sort({ _id: 1 });
    res.json(testcases);
  } catch (err) {
    console.error('Error in GET /api/admin/problems/:id/testcases:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/admin/problems/:id/testcases
router.post('/:id/testcases', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { input, expectedOutput, isSample } = req.body;

    if (input == null || expectedOutput == null) {
      return res
        .status(400)
        .json({ error: 'input and expectedOutput are required' });
    }

    const tc = await TestCase.create({
      problemId: id,
      input,
      expectedOutput,
      isSample: !!isSample,
    });

    res.status(201).json(tc);
  } catch (err) {
    console.error('Error in POST /api/admin/problems/:id/testcases:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/admin/testcases/:tcId
router.put('/testcases/:tcId', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { tcId } = req.params;
    const { input, expectedOutput, isSample } = req.body;

    const tc = await TestCase.findById(tcId);
    if (!tc) {
      return res.status(404).json({ error: 'Testcase not found' });
    }

    if (input != null) tc.input = input;
    if (expectedOutput != null) tc.expectedOutput = expectedOutput;
    if (isSample != null) tc.isSample = !!isSample;

    await tc.save();
    res.json(tc);
  } catch (err) {
    console.error('Error in PUT /api/admin/testcases/:tcId:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/admin/testcases/:tcId
router.delete('/testcases/:tcId', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { tcId } = req.params;

    const tc = await TestCase.findById(tcId);
    if (!tc) {
      return res.status(404).json({ error: 'Testcase not found' });
    }

    await tc.deleteOne();
    res.json({ message: 'Testcase deleted' });
  } catch (err) {
    console.error('Error in DELETE /api/admin/testcases/:tcId:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;