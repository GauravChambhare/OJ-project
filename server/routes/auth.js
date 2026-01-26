import { Router } from 'express';
import bcrypt from 'bcrypt';
import User from '../models/User.js'; 
import jwt from 'jsonwebtoken';
import authMiddleware from '../middleware/auth.js';

const authRouter = Router();

authRouter.post('/signup', async (req, res) => {
    try {
        //pehele body read 
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'All fields are required'});
        }
        if (password.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters'});
        }
        if (!email.includes('@')) {
            return res.status(400).json({ message: 'Invalid email format'});
        } 
            // Check if it is an existing user.
        const existingUser = await User.findOne({
            $or: [
                { username: username },
                { email: email }
            ]
        });

        if(existingUser){
            return res.status(409).json({ message: 'Username or email already exists'});
        }

        //hashing passord now.
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        //create and save user
        const user = new User({
            username: username,
            email: email,
            passwordhash: hashedPassword
        });

        await user.save();

        //agar succesfully user save hogaya to status code and msg return karna
        res.status(201).json({ message: 'User created successfully' });
    
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Internal server error' });
    } 

});

authRouter.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        //Checking now if username is there and password is there.
        if(!email || !password){
            res.status(400).json({ message: 'Email and password are required'});
        }
        // Finding user by email
        const user = await User.findOne({ email: email });

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        //check for creds validity
        const isPasswordValid = await bcrypt.compare(password, user.passwordhash); //bcrypt.compare() compares plain password with hash
        
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // NEWO now sign jwt token
        const payload = {
            userId: user._id,
            username: user.username
        };        
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
        /* ye kya karra hai niche hai
        payload contains data to encode in the token
        user._id is the MongoDB document ID
        jwt.sign() creates the token
        process.env.JWT_SECRET is the secret from .env
        { expiresIn: '1h' } sets expiration to 1 hour
        */
        // return success
        res.status(200).json({ 
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });

    }
    // res.send('Login route hit');
});

authRouter.get('/profile', authMiddleware, async (req, res) => {
    try {
        // Get userId from req.user (set by middleware)
        const userId = req.user.userId;

        // Finding user in MongoDB
        const user = await User.findById(userId); //findById() finds a user by MongoDB _id
        //reminder here thisid we are talking about is document_id in mongodb which is unique for each document
        
        // Check if user exists
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Return user info (without password ofcourse)
        res.status(200).json({
            id: user._id,
            username: user.username,
            email: user.email
        });

    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


export default authRouter; // without this, we will not be able to import it in any other .js file.


