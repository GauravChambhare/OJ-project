import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Problem from './models/Problem.js';
import TestCase from './models/TestCase.js';

dotenv.config(); // so MONGODB_URI is loaded

async function main() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding problems');

    // Clear old data (optional for now)
    // await Problem.deleteMany({});
    // await TestCase.deleteMany({});

    // Create one dummy problem: Sum Two Numbers
    const problem = await Problem.create({
      number: 1,
      title: 'Sum Two Numbers',
      code: 'SUM2',
      statement: 'Given two integers, output their sum. Input: two integers a and b. Output: a + b.',
      difficulty: 'Easy',
    });

    console.log('Created problem:', problem._id.toString());

    // Create a couple of test cases
    const testCases = [
      {
        problemId: problem._id,
        input: '1 2\n',
        expectedOutput: '3\n',
        isSample: true,
      },
      {
        problemId: problem._id,
        input: '5 7\n',
        expectedOutput: '12\n',
        isSample: false,
      },
    ];

    await TestCase.insertMany(testCases);
    console.log('Inserted test cases.');

    console.log('Seeding done.');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding problems:', err);
    process.exit(1);
  }
}

main();