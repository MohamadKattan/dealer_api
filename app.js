import express from 'express';
import 'dotenv/config';
import morgan from 'morgan';
import session from 'express-session';
import MySQLStore from 'express-mysql-session';
import my_db from './src/my_sql/my_db.js';
import cluster from 'cluster';
import os from 'os';
const numCPUs = os.cpus().length;
import mainRouter from './src/routering/main_router.js';

const PORT = process.env.port || process.env.MY_PORT;
const app = express();
// const sessionStore = new MySQLStore(my_db?.options);
// const sessionStore = new MySQLStore(my_db?.options, my_db?.pool);

const sessionOption = {
    secret: process.env.SESSION_SECRET,
    // store: sessionStore,
    name: process.env.SESSION_NAME,
    resave: false,
    saveUninitialized: false,
    cookie: { path: '/', httpOnly: true, secure: false, maxAge: 60000 * 60 }
};

if (app.get('env') === 'production') {
    app.set('trust proxy', 1)
    sessionOption.cookie.secure = true
}

app.use(morgan('dev'));
app.use('/', express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session(sessionOption));
app.use(mainRouter);
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

// sessionStore.onReady().then(() => {

//     console.log('MySQLStore ready');
// }).catch(error => {

//     console.error(`Error  MySQLStore ::  ${error}`);
// });

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

// export default app;