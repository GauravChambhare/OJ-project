// server/routes/ai.js
// ai route and functionality define karre hai for ai review.
import { Router } from 'express';
import authMiddleware from '../middleware/auth.js';
import Submission from '../models/Submission.js';
import Problem from '../models/Problem.js';
import User from '../models/User.js';

const router = Router();

// POST /api/ai/review/:submissionId
router.post('/review/:submissionId', authMiddleware, async (req, res) => {
    try {
        const { submissionId } = req.params;
        const userId = req.user.userId;

        // 1. Find the submission
        const submission = await Submission.findById(submissionId);
        if (!submission) {
            return res.status(404).json({ error: 'Submission not found' });
        }

        // 2. Verify ownership
        if (submission.userId.toString() !== userId) {
            return res.status(403).json({ error: 'Not your submission' });
        }

        // 3. Check if already reviewed
        if (submission.aiReviewRequested) {
            return res.json({
                message: 'Already reviewed',
                review: submission.aiReviewContent,
            });
        }

        // 4. Check daily limit (skip for admins)
        const user = await User.findById(userId);

        // Admins have unlimited AI reviews
        if (!user.isAdmin) {
            const today = new Date().toDateString();
            const lastReviewDate = user.lastAiReviewDate
                ? new Date(user.lastAiReviewDate).toDateString()
                : null;

            if (lastReviewDate === today && user.dailyAiReviews >= 5) {
                return res.status(429).json({
                    error: 'Daily limit reached (5 reviews/day). Try again tomorrow.',
                });
            }

            // Reset counter if new day
            if (lastReviewDate !== today) {
                user.dailyAiReviews = 0;
            }
        }

        // 5. Fetch problem details
        const problem = await Problem.findById(submission.problemId);
        if (!problem) {
            return res.status(404).json({ error: 'Problem not found' });
        }

        // 6. Call Gemini API
        const reviewContent = await callGeminiAPI(
            problem,
            submission.sourceCode,
            submission.language,
            submission.verdict
        );

        // 7. Update submission
        submission.aiReviewRequested = true;
        submission.aiReviewContent = reviewContent;
        submission.aiReviewedAt = new Date();
        await submission.save();

        // 8. Update user counters (only for non-admins)
        if (!user.isAdmin) {
            user.dailyAiReviews += 1;
            user.lastAiReviewDate = new Date();
            await user.save();
        }

        return res.json({
            message: 'AI review generated',
            review: reviewContent,
        });
    } catch (err) {
        console.error('Error in POST /api/ai/review/:submissionId:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

async function callGeminiAPI(problem, code, language, verdict) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('GEMINI_API_KEY not set in environment');
    }

    const prompt = `Review this ${language} solution for "${problem.title}".

    **Code:**
    \`\`\`${language}
    ${code}
    \`\`\`
    
    **Verdict:** ${verdict}
    
    Provide a BRIEF review (max 150 words):
    
    ### Correctness
    One sentence on logic correctness and bugs.
    
    ### Complexity
    State ONLY: Time O(?), Space O(?). One improvement suggestion IF applicable.
    
    ### Code Quality
    One sentence on readability/structure.
    
    Be concise. Skip obvious statements. Focus on actionable feedback only.`;

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [{ text: prompt }],
                    },
                ],
            }),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        console.error('Gemini API error:', data);
        throw new Error('Gemini API request failed');
    }

    return data.candidates[0].content.parts[0].text;
}

export default router;