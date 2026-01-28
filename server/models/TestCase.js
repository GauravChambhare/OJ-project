import mongoose from 'mongoose';

const { Schema } = mongoose;

const testCaseSchema = new Schema(
  {
    problemId: { type: Schema.Types.ObjectId, ref: 'Problem', required: true },
    input: { type: String, required: true },
    expectedOutput: { type: String, required: true },
    isSample: { type: Boolean, default: false },
  }
);

const TestCase = mongoose.model('TestCase', testCaseSchema);

export default TestCase;