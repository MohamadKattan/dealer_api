import jwt from 'jsonwebtoken';
import reusable from './reusable_functoins.js';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

// secuer header 
const helmetHeader = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "trusted.cdn.com"]
        }
    },
    hsts: { maxAge: 31536000 },
    xssFilter: true,
    hidePoweredBy: true
});


// express-rate-limit
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
    standardHeaders: 'draft-8', // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
    keyGenerator: req => req.ip + req.body.email,
    handler: (req, res) => {
        res.setHeader('Retry-After', 900);
        return reusable.sendRes(res, reusable.tK.typeError, reusable.tK.kauthLimt);
    }

});

const authLimter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    keyGenerator: req => req.ip + req.body.email,
    handler: (req, res) => {
        res.setHeader('Retry-After', 900);
        return reusable.sendRes(res, reusable.tK.typeError, reusable.tK.kauthLimt);
    }

});

//cors
const corsOptions = {
    // origin: process.env.NODE_ENV === 'production'
    //     ? ['https://yourdomain.com']
    //     : ['http://localhost:3000'],
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
    optionsSuccessStatus: 200,
    allowedHeaders: ['Content-Type', 'Authorization']
}

// token
const secretKey = process.env.TOKEN_SECRET
const ALLOWED_ALGORITHMS = ['HS256'];

const getAlgorithm = () => {
    const envAlgorithm = process.env.HASH_TOKEN;
    return ALLOWED_ALGORITHMS.includes(envAlgorithm)
        ? envAlgorithm
        : 'HS256';
};

const createToken = async (data) => {

    const newUser = {
        userName: data?.user_name,
        per: data?.per,
        userId: data?.id
    }
    try {
        const options = { algorithm: getAlgorithm(), expiresIn: '10d' }

        const token = jwt.sign(newUser, secretKey, options);
        return token;
    } catch (error) {
        console.error('error to create new token' + error)
        return { error: error };
    }
}

const verifyToken = async (req, res, next) => {
    const token = req.headers?.authorization || req.headers?.Authorization;
    
    if (!token) {
        return res.status(403).send(JSON.stringify({ statusCode: 403, status: "fail", msg: "No token provided" })).end();

    }

    jwt.verify(token, secretKey, {
        algorithms: [getAlgorithm()]
    }, (err, decoded) => {

        if (err) {
            console.error('InviledToken');
            return reusable.sendRes(res, reusable.tK?.typeError, reusable.tK?.kInviledToken);
        }
        req.user = decoded;
        console.log('token is okay');
        next();
    });

}


const appSecure = { createToken, verifyToken, corsOptions, limiter, authLimter, helmetHeader }

export default appSecure;