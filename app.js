import express from 'express';
import os from 'node:os';
import cluster from 'node:cluster';
import cors from 'cors';
import hpp from 'hpp';
import ExpressMongoSanitize from 'express-mongo-sanitize';
import 'dotenv/config';
import morgan from 'morgan';
import mainRouter from './src/routering/main_router.js';
import appSecure from './src/utiles/app_secure.js';


const numCPUs = os.cpus().length;
const PORT = process.env.port || process.env.MY_PORT;
const app = express();

app.use(morgan('dev'));
app.use('/', express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(appSecure.helmetHeader);
app.use(cors(appSecure.corsOptions));
app.use(hpp());
// app.use(ExpressMongoSanitize());
app.use(mainRouter);
app.use((err, req, res, next) => {
    res.status(err.status || 500).json({
        error: {
            message: process.env.NODE_ENV === 'development'
                ? err.message
                : 'Operation failed',
            code: err.code,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        }
    });
});
if (cluster.isPrimary) {
    console.log(`Master ${process.pid} is running`);

    // Calculate optimal worker count
    const MAX_WORKERS = process.env.NODE_ENV === 'production'
        ? Math.min(numCPUs, 8)  // Cap at 8 in production
        : 1;  // Single worker in development

    console.log(`Launching ${MAX_WORKERS} workers`);

    // Fork workers (single loop)
    for (let i = 0; i < MAX_WORKERS; i++) {
        cluster.fork();
    }

    cluster.on('online', (worker) => {
        console.log(`Worker ${worker.process.pid} is ready`);
    });

    // Worker restart logic
    let restartAttempts = 0;
    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died (${signal || code})`);

        if (restartAttempts < 5) {
            console.log('Restarting worker...');
            cluster.fork();
            restartAttempts++;
        } else {
            console.error('Max restart attempts reached');
        }
    });
} else {
    app.listen(PORT, () => {
        console.log(`Worker ${process.pid} serving on port ${PORT}`);
    });
}

export default app;