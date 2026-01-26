import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

import { dbConnection } from './config/db.js';
import express from 'express';
import authRouter from './routes/auth.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 5000;

// Register all routes BEFORE starting the server
app.get('/', (req, res) => {
    res.send('Server run hora hai!');
});

app.use('/api/auth', authRouter);

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

