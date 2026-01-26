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
    createdAt: {
        type: Date,
        default: Date.now,//default value is the current date and time.
    }
});

const User = mongoose.model('User', userSchema);

export default User; //xports the model so you we can import it elsewhere