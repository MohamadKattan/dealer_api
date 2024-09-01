import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import morgan from 'morgan';
import session from 'express-session';
import cluster from 'cluster';
import os from 'os';
import mainRouter from './src/routering/main_router.js';
import appSecure from './src/utiles/app_secure.js';

const numCPUs = os.cpus().length;
const PORT = process.env.port || process.env.MY_PORT;
const app = express();

if (app.get('env') === 'production') {
    app.set('trust proxy', 1)
    appSecure.sessionOption.cookie.secure = true;
}

app.use(morgan('dev'));
app.use('/', express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(appSecure.corsOptions));
app.use(session(appSecure.sessionOption));
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

export default app;