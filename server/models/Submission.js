import mongoose from 'mongoose';

const { Schema } = mongoose;

const submissionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    problemId: { type: Schema.Types.ObjectId, ref: 'Problem', required: true },
    language: { type: String, required: true }, // java, c++, js and python support karta hai
    sourceCode: { type: String, required: true }, //ye user submited code hai
    verdict: { type: String, default: 'Pending' },
    stdout: { type: String },
    stderr: { type: String },
    executionTimeMs: { type: Number },
    memoryUsedKb: { type: Number },
    submittedAt: { type: Date, default: Date.now },
    aiReviewRequested: { type: Boolean, default: false },
    aiReviewContent: { type: String },
    aiReviewedAt: { type: Date },
  }
);

const Submission = mongoose.model('Submission', submissionSchema);

export default Submission;