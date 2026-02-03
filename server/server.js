import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

import dbConnection from './config/db.js';
import express from 'express';
import authRouter from './routes/auth.js';
import judgeRouter from './routes/judge.js';
import submissionsRouter from './routes/submissions.js';
import problemsRouter from './routes/problems.js';
import adminProblemsRouter from './routes/adminProblems.js';
import aiRouter from './routes/ai.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 5000;

// Register all routes BEFORE starting the server
app.get('/', (req, res) => {
    res.send('Server run hora hai!');
});
// mounting routers in server/routes/ dir
app.use('/api/auth', authRouter);
app.use('/api/judge', judgeRouter);
app.use('/api/submissions', submissionsRouter);
app.use('/api/problems', problemsRouter);
app.use('/api/admin/problems', adminProblemsRouter);
app.use('/api/ai', aiRouter);

// Start server after routes are registered
async function startServer() {
    try {
        await dbConnection();
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();
// shutdown
process.on('SIGINT', async () => {
    console.log('Server is shutting down...');
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
    process.exit(0);
});

