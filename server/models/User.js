import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  passwordhash: {
    type: String,
    required: true,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  dailyAiReviews: { //to prevent ai review misuse mai add karrahu ye field, ye track karege ki last konse din ko user ne ai review use kiya tha and add agar wo din hai to total kitna times ai review use kiya hai wo track karega per user
    type: Number,
    default: 0,
  },
  lastAiReviewDate: {
    type: Date,
  },
});

const User = mongoose.model('User', userSchema);

export default User;
