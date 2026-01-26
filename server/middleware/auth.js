
import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
    try {
        // reading auth headers
        const authHeader = req.headers.authorization;
        
        // validation
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Authorization token missing' });
        }
        //extract the token now as token is not missing or mangaled

        const token = authHeader.substring(7); // "Bearer " is 7 characters

        // token verification
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Attach user info to request
        req.user = {
            userId: decoded.userId,
            username: decoded.username
        };
        // Call next() to continue to the route handler
        next();
    
    } catch (error) {
        // // If token is invalid or expired, jwt.verify error throw karega
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
}

// finally isko export karna hai
export default authMiddleware;