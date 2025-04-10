import mysql from 'mysql2/promise';



export const poolConfig = mysql.createPool({
    host: process.env.HOST_DB,
    user: process.env.USER_DB,
    password: process.env.PASSWORD_DB,
    database: process.env.NAME_DB,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 10000,
    idleTimeout: 60000,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
    // ssl: process.env.NODE_ENV === 'production' 
    // ? {
    //     rejectUnauthorized: true,
    //     ca: process.env.DB_SSL_CA // For AWS RDS/Google Cloud SQL
    // } : {},
    typeCast: (field, next) => {
        // Prevent boolean conversion attacks
        if (field.type === 'TINY' && field.length === 1) {
            return field.string() === '1';
        }
        return next();
    }
});


export const checkPoolHealth = async () => {
    let conn;
    try {
        conn = await poolConfig.getConnection();
        await conn.ping();
        console.info('Database connection healthy');
        return true;
    } catch (err) {
        console.error('Database health check failed', err);
        return false;
    } finally {
        if (conn) conn.release();
    }
};

poolConfig.on('connection', (conn) => {
    console.info('New DB connection established');
});

poolConfig.on('release', () => {
    console.info('db on release');
});

process.on('SIGTERM', async () => {
    console.info('Closing database pool');
    await poolConfig.end();
});