//import moongose
import mongoose from 'mongoose';
//read process.env.MONGODB_URI [this is calling for uri from the machine, so we need to insure that it is setup in the machine]
/*
Notes for self, 
1. Mongoose's connect() is asynchronous.
2. we are using async function to connect to the database because we are using await keyword to wait for the database to connect.
*/
// server/config/db.js

const dbConnection = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    });
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

export default dbConnection;

//log process
