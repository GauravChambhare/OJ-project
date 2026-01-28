import mongoose from 'mongoose';

const { Schema } = mongoose;

const problemSchema = new Schema(
  {
    number: { type: Number, required: true, unique: true }, 
    title: { type: String, required: true },
    code: { type: String, required: true, unique: true },   
    statement: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Easy',
    },
    createdAt: { type: Date, default: Date.now },
  }
);

const Problem = mongoose.model('Problem', problemSchema);

export default Problem;