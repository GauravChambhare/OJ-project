import { Router } from 'express';
import Problem from '../models/Problem.js';

const router = Router();

// GET /api/problems  – list basic info
router.get('/', async (req, res) => {
  try {
    const problems = await Problem.find({})
      .sort({ number: 1 })
      .select('number title code difficulty createdAt');

    return res.json(
      problems.map(p => ({
        id: p._id,
        number: p.number,
        title: p.title,
        code: p.code,
        difficulty: p.difficulty,
        createdAt: p.createdAt,
      }))
    );
  } catch (err) {
    console.error('Error in GET /api/problems:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/problems/:code – full details for one problem
router.get('/:code', async (req, res) => {
  try {
    const { code } = req.params;

    const problem = await Problem.findOne({ code });
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    return res.json({
      id: problem._id,
      number: problem.number,
      title: problem.title,
      code: problem.code,
      statement: problem.statement,
      difficulty: problem.difficulty,
      createdAt: problem.createdAt,
    });
  } catch (err) {
    console.error('Error in GET /api/problems/:code:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
