import { Router } from 'express';
import axios from 'axios'; // ye ek http client hai iske jaisa kam karne wala javascript ka fetch method hota hai

const router = Router();

// POST /api/judge/run
router.post('/run', async (req, res) => {
  const { code, language, problemId, testCases } = req.body;

  // Basic validation (backend-facing API)
  if (!code || !language || !problemId || !Array.isArray(testCases)) {
    return res.status(400).json({ message: 'Invalid request body' });
  }

  try {
    // Call judge service
    const response = await axios.post('http://localhost:4000/judge/run', {
      code,
      language,
      problemId,
      testCases,
    });

    // Forward judge response to client
    return res.status(200).json(response.data);
  } catch (err) {
    console.error('Error calling judge service:', err.message);

    if (err.response) {
      // Judge service returned an error status
      return res
        .status(err.response.status || 500)
        .json(err.response.data || { message: 'Judge service error' });
    }

    // Network/other error
    return res.status(500).json({ message: 'Unable to reach judge service' });
  }
});

export default router;