import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import morgan from 'morgan';
import session from 'express-session';
import MySQLStore from 'express-mysql-session';
import cluster from 'cluster';
import os from 'os';
import mainRouter from './src/routering/main_router.js';


const numCPUs = os.cpus().length;
const PORT = process.env.port || process.env.MY_PORT;
const app = express();

const sessionStoreOptions = {
    host: process.env.HOST_DB,
    port: 3306,
    user: process.env.USER_DB,
    password: process.env.PASSWORD_DB,
    database: process.env.NAME_DB
}
const sessionStore = new (MySQLStore(session))(sessionStoreOptions);

const sessionOption = {
    secret: process.env.SESSION_SECRET,
    name: process.env.SESSION_NAME,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
        path: '/',
        httpOnly: true,
        secure: false,
        maxAge: 60000 * 60,
        sameSite: 'None'
    }
};

if (app.get('env') === 'production') {
    app.set('trust proxy', 1)
    sessionOption.cookie.secure = true;
}

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

app.use(morgan('dev'));
app.use('/', express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));
app.use(session(sessionOption));
app.use(mainRouter);
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({ status: 'error', msg: " Something went wrong! " });
});

if (cluster.isPrimary) {
    console.log(`Master ${process.pid} is running`);

    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died`);
        console.log('Forking a new worker...');
        cluster.fork();
    });
} else {
    app.listen(PORT, () => {
        console.log(`Worker ${process.pid} started server on port ${PORT}`);
    });
}