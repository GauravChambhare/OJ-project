import mongoose from 'mongoose';

const { Schema } = mongoose;

const submissionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    problemId: { type: Schema.Types.ObjectId, ref: 'Problem', required: true },
    language: { type: String, required: true }, // v1 me filhal java
    sourceCode: { type: String, required: true }, //ye user submited code hai
    verdict: { type: String, default: 'Pending' },
    executionTimeMs: { type: Number },
    memoryUsedKb: { type: Number },
    submittedAt: { type: Date, default: Date.now },
  }
);

const Submission = mongoose.model('Submission', submissionSchema);

export default Submission;