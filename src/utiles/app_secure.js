import jwt from 'jsonwebtoken';
import reusable from './reusable_functoins.js';


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
            return reusable.sendRes(res, reusable.tK?.tterror, reusable.tK?.kNoTokenP, null);
        }
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err) {
                return reusable.sendRes(res, reusable.tK?.tterror, reusable.tK?.kInviledToken, null);
            }

            req.user = decoded;
            next();

        });
    } catch (error) {
        console.error(`error at verifyToken :: ${error}`);
        return reusable.sendRes(res, reusable.tK?.tterror, reusable.tK?.kserverError, null);

    }
}

const appSecure = { createToken, verifyToken, corsOptions }

export default appSecure;
