//import moongose
import mongoose from 'mongoose';
//read process.env.MONGODB_URI [this is calling for uri from the machine, so we need to insure that it is setup in the machine]
/*
Notes for self, 
1. Mongoose's connect() is asynchronous.
2. we are using async function to connect to the database because we are using await keyword to wait for the database to connect.
*/
export async function dbConnection() {

    const MONGODB_URI = process.env.MONGODB_URI;
    if(MONGODB_URI===null || MONGODB_URI===undefined){
        throw new Error("MONGODB_URI is not set");
    }
    
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Error connecting to MongoDB", error);
    }
}
//log process
