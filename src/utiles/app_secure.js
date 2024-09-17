import jwt from 'jsonwebtoken';
import { checkSchema } from 'express-validator';
import userValidator from './app_validator.js';


//cors
const allowedOrigins = [
    '*', // Development
    'https://your-flutter-app-domain.com' // Production
];

const originDomin = (origin, callback) => {

    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) === -1) {
        const msg = 'The CORS policy for this site does not allow access from the specified origin.';
        return callback(new Error(msg), false);
    }
    return callback(null, true);
}

const corsOptions = {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}

// token
const secretKey = process.env.TOKEN_SECRET

const createToken = async (data) => {

    const newUser = {
        userName: data?.user_name,
        per: data?.per,
        userId: data?.user_id
    }
    try {
        const options = { expiresIn: Math.floor(Date.now() / 1000) + (60 * 60) }

        const token = jwt.sign(newUser, secretKey, options);
        return token;
    } catch (error) {
        console.error('error to create new token' + error)
        return { error: error };
    }
}

const verifyToken = async (req, res, next) => {
    try {
        const token = req.headers['authorization'];
        if (!token) {
            console.error('No token provided');
            return res.status(403).send({ status: "fail", msg: 'No token provided' });
        }
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err) {
                return res.status(401).send({ status: "fail", msg: 'Invalid token' });
            }
            req.user = decoded;
            next();

        });
    } catch (error) {
        console.error(`error at verifyToken :: ${error}`);
        return res.status(500).send({ status: "fail", msg: `Un expexted error ${error}` });
    }
}

const appSecure = { createToken, verifyToken, corsOptions }

export default appSecure;
