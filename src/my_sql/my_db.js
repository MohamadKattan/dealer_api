
import appSecure from "../utiles/app_secure.js";
import reusable from "../utiles/reusable_functoins.js";
import { poolConfig } from './config_db.js';
import mysql from 'mysql2';

// right now old 
const pool = mysql.createPool({
    host: process.env.HOST_DB,
    user: process.env.USER_DB,
    password: process.env.PASSWORD_DB,
    database: process.env.NAME_DB,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    keepAliveInitialDelay: 10000
});

const TABLE_WHITELIST = new Set(['users']);


// show or get 
const showAllTable = async (req, res) => {
    let conn;
    try {
        const sql = 'SHOW TABLES';
        const per = req?.user?.per;

        const checkPer = await reusable.checkPerType(res, per);
        if (!checkPer) return;
        conn = await poolConfig.getConnection();
        const [results] = await conn.execute(sql);

        if (results.length === 0) {
            return reusable.sendRes(res, reusable.tK.typeSuccess, reusable.tK.kNoTables);
        }

        const listOfTables = results.map(row => row.Tables_in_dealer);
        return reusable.sendRes(res, reusable.tK?.typeSuccess, reusable.tK?.ksuccess, 'ok', listOfTables);

    } catch (error) {
        console.error(`[DB] showAllTable failed:`, {
            error: error.message,
            sql: sql,
            timestamp: new Date().toISOString()
        });
        return reusable.sendRes(res, reusable.tK?.typeError, reusable.tK?.kserverError, error.code ?? null);
    } finally {
        if (conn) conn.release();
    }
};

const showColumns = async (req, res) => {
    let conn;
    const per = req?.user?.per;
    const tableName = req.body?.tableName?.trim();

    const checkPer = await reusable.checkPerType(res, per);
    if (!checkPer) return;

    if (!tableName) {
        return reusable.sendRes(res, reusable.tK.typeError, reusable.tK.kNoTables, 'table name is not defined')
    }

    if (!TABLE_WHITELIST.has(tableName)) {
        return reusable.sendRes(res, reusable.tK.typeError, reusable.tK.kNoAccess, 'INVALID_TABLE');
    }


    const isString = await reusable.typeIsString(tableName);
    if (!isString) {
        return reusable.sendRes(res, reusable.tK.typeError, reusable.tK.kNoAccess, 'INVALID_TABLE_NAME');
    }

    try {
        conn = await poolConfig.getConnection();
        const sql = `SHOW COLUMNS FROM ??`;
        const [results] = await conn.query({
            sql: sql,
            values: [tableName],
            timeout: process.env.NODE_ENV === 'production' ? 1000 : 5000
        });

        if (results.length <= 0) {
            return reusable.sendRes(res, reusable.tK.typeSuccess, reusable.tK.ksuccess, 'No columns exist yet...', [])

        }

        const columns = results.map(({ Field, Type, Null }) => ({
            name: Field,
            type: Type,
            nullable: Null === 'YES'
        }));

        return reusable.sendRes(res, reusable.tK.typeSuccess, reusable.tK.ksuccess, 'ok', columns)

    } catch (error) {
        console.error('[SECURE_DB] showColumns:', {
            table: req.body.tableName?.substring(0, 20),
            error: error?.code
        });
        return reusable.sendRes(res, reusable.tK?.typeError, reusable.tK?.kserverError, error.code);
    } finally {
        if (conn) conn.release();
    }
}

// create
const createNewTable = async (tableName, columns) => {
    let sqlColumns = '';
    let index = 0;
    try {
        const result = await new Promise((resolve, reject) => {

            if (!tableName || !columns || columns.length <= 0) {
                return reject({ error: 'can not create new table tableName or Columns is null !!' });
            }
            pool.escapeId(tableName);

            for (const element of columns) {

                if (!element?.name || !element?.type) {
                    return res.status(400).send('Error: column name or type is null !!').end();
                }
                index++
                sqlColumns += `${pool.escapeId(`${element?.name}`)} ${element?.type}`;

                if (element?.notNull) {
                    sqlColumns += ' NOT NULL'
                }

                if (element?.default) {
                    const newdefult = pool.escape(element?.default)
                    sqlColumns += ` DEFAULT ${newdefult}`;
                }

                if (element?.autoIncrement) {
                    sqlColumns += ' AUTO_INCREMENT'
                }

                if (element?.primaryKey) {
                    sqlColumns += ' PRIMARY KEY';
                }

                if (element?.foreignKey) {
                    sqlColumns += ` FOREIGN KEY (${element?.name}) REFERENCES users(user_id)`;
                }

                if (element?.unique) {
                    sqlColumns += ' UNIQUE';
                }
                if (index !== columns.length) {
                    sqlColumns += ', ';
                }

            }

            const newsql = `CREATE TABLE ${tableName}(${sqlColumns})`;
            pool.query(newsql, function (error, results, fields) {
                if (error) {
                    console.error('Error creating table:', error?.sqlMessage);
                    return reject({ error: error?.sqlMessage });
                }
                resolve({ msg: 'Table has been create' });
            });
        });
        return result;
    } catch (error) {
        console.error('Unexpected error in create new table', error);
        return { error: error };

    }
}

const queryByDev = async (req, res) => {
    let conn;
    const per = req?.user?.per;
    const pass = req.body.pass;
    const bodySql = req.body.text;
    try {
        const chekPer = await reusable.checkPerType(res, per);
        if (!chekPer) return;

        if (pass !== process.env.KEY_SQL) {
            return reusable.sendRes(res, reusable.tK.typeError, reusable.tK?.kNoAccess, 'NO Access onle devloper');
        }

        conn = await poolConfig.getConnection();
        await conn.execute(bodySql);


        return reusable.sendRes(res, reusable.tK?.typeSuccess, reusable.tK?.ksuccess);

    } catch (error) {
        console.error(`[DB] queryByDev failed:`, {
            error: error.message,
            sql: bodySql,
            timestamp: new Date().toISOString()
        });
        return reusable.sendRes(res, reusable.tK?.typeError, reusable.tK?.kserverError, error.message ?? null);
    } finally {
        if (conn) conn.release();
    }
}

// del 
const dropAnTable = async (tableName) => {
    try {
        const result = await new Promise((resolve, reject) => {
            if (!tableName) {
                return reject({ error: 'table name is null ' });
            }
            pool.escapeId(tableName);
            const sql = `DROP TABLE ${tableName}`;
            pool.query(sql, async function (error, results, fields) {
                if (error) {
                    console.error('Error drop an tables :', error);
                    return reject({ error: error?.message ?? error });
                }
                resolve({ msg: 'Table has been Droped' });
            });

        });
        return result;
    } catch (error) {
        console.error('Unexpected error in delete table', error);
        return { error: error?.message ?? error };

    }
}

const truncateTable = async (tableName) => {
    try {
        const result = await new Promise((resolve, reject) => {
            if (!tableName) {
                return reject({ error: 'table name is null' });
            }
            pool.escapeId(tableName);
            const sql = `TRUNCATE TABLE ${tableName}`;
            pool.query(sql, async function (error, results, fields) {
                if (error) {
                    console.error('Error TRUNCATE  tables :', error?.message);
                    return reject({ error: error?.message });
                }
                resolve({ msg: 'All data has been delete' });
            });
        });
        return result;
    } catch (error) {
        console.error('Unexpected error in truncet table', error);
        return { error: error?.message ?? error };
    }
}

const deleteAnColumn = async (tableName, oneColumn) => {
    try {
        const result = await new Promise((resolve, reject) => {

            if (!tableName || !oneColumn || !oneColumn?.name) {
                return reject({ error: 'tableName or Column is null !!' });
            }

            pool.escapeId(tableName);
            pool.escapeId(oneColumn?.name);
            const newsql = `ALTER TABLE ${tableName} DROP COLUMN ${oneColumn?.name};`;
            pool.query(newsql, async function (error, results, fields) {
                if (error) {
                    console.error('Error DROP COLUMN from a table:', error);
                    return reject({ error: error?.message ?? error });
                }
                resolve({ msg: 'Column has been delete' });
            });

        })
        return result;
    } catch (error) {
        console.error('Unexpected error in truncet table', error);
        return { error: error?.message ?? error };
    }
}

// modefiy 
const modefiyAnColumn = async (tableName, oneColumn) => {
    let sqlColumn = '';
    try {
        const result = await new Promise((resolve, reject) => {
            if (!tableName || !oneColumn || !oneColumn?.name || !oneColumn?.type) {
                return reject({ error: 'Column table name,column name or column type is null !!' });
            }
            pool.escapeId(tableName);
            pool.escapeId(oneColumn?.name);
            sqlColumn += ` ${oneColumn?.name} ${oneColumn?.type}`;

            if (oneColumn?.notNull) {
                sqlColumn += ' NOT NULL'
            }

            if (oneColumn?.default) {
                sqlColumn += ` DEFAULT ${pool.escape(element?.default)}`;
            }

            if (oneColumn?.autoIncrement) {
                sqlColumn += ' AUTO_INCREMENT'
            }

            if (oneColumn?.primaryKey) {
                sqlColumn += ' PRIMARY KEY';
            }

            if (oneColumn?.foreignKey) {
                sqlColumn += ` FOREIGN KEY (${oneColumn?.name}) REFERENCES users(user_id)`;
            }

            if (oneColumn?.unique) {
                sqlColumn += ' UNIQUE';
            }

            const newsql = `ALTER TABLE ${tableName} MODIFY COLUMN ${sqlColumn};`;
            pool.query(newsql, async function (error, results, fields) {
                if (error) {
                    console.error('Error ALTER column ', error);
                    return reject({ error: error?.sqlMessage ?? error });
                }
                resolve({ msg: 'Column has been alter' });
            });
        });
        return result;
    } catch (error) {
        console.error('Unexpected error in modefiyAnColumn', error);
        return { error: error?.message ?? error };
    }
}

const modefiyAnTable = async (tableName, oneColumn) => {
    let sqlColumns = '';
    try {
        const result = await new Promise((resolve, reject) => {
            if (!tableName || !oneColumn || !oneColumn?.name || !oneColumn?.type) {
                return reject({ error: ' tableName,Column name or type is null !!' });
            }
            pool.escapeId(tableName);
            pool.escapeId(oneColumn?.name);
            sqlColumns += ` ${oneColumn?.name} ${oneColumn?.type}`;
            if (oneColumn?.notNull) {
                sqlColumns += ' NOT NULL'
            }

            if (oneColumn?.default) {
                sqlColumns += ` DEFAULT ${pool.escape(oneColumn?.default)}`;
            }

            if (oneColumn?.autoIncrement) {
                sqlColumns += ' AUTO_INCREMENT'
            }

            if (oneColumn?.primaryKey) {
                sqlColumns += ' PRIMARY KEY';
            }

            if (oneColumn?.foreignKey) {
                sqlColumns += ` FOREIGN KEY (${oneColumn?.name}) REFERENCES users(user_id)`;
            }

            if (oneColumn?.unique) {
                sqlColumns += ' UNIQUE';
            }

            const newsql = `ALTER TABLE ${tableName} ADD ${sqlColumns};`;
            pool.query(newsql, async function (error, results, fields) {
                if (error) {
                    console.error('Error ALTER table:', error);
                    return reject({ error: error?.sqlMessage ?? error });
                }
                resolve({ msg: 'Table has been alter' });
            });
        });
        return result;
    } catch (error) {
        console.error('error in modefiyAnTable' + error);
        return { error: error }

    }
}


const errorPatterns = {
    'Duplicate entry': /Duplicate entry '[^']+'/
};

function extractErrorMessage(errorMessage = null) {
    for (const patternName in errorPatterns) {
        const pattern = errorPatterns[patternName];
        const match = errorMessage.match(pattern);
        if (match) {
            return match[0];
        }
    }
    return errorMessage;
}


// get data from db
const queryMyDb = async (sql, val = null) => {
    try {
        const result = await new Promise((resolve, reject) => {

            const callBack = (error, results) => {
                if (error) {
                    return reject({ error: error?.sqlMessage ?? error });
                }
                if (results.length <= 0) {
                    return resolve({ msg: 'No found' });
                }
                resolve({ results });
            }
            if (val != null) {
                pool.query(sql, val, callBack);

            } else {
                pool.query(sql, callBack);
            }
        });
        return result;
    } catch (error) {
        return { error: error };
    }
}

// insert  data into db 
const insertNewData = async (tableName, column, values) => {
    try {
        const result = await new Promise((resolve, reject) => {

            if (!tableName) {
                return reject({ error: 'can not create new user table name is null' });
            }
            pool.escapeId(tableName);
            const placeholders = values.map(() => '(?)').join(',');
            const sql = `INSERT INTO ${tableName}(${column}) VALUES (${placeholders});`;
            const flattenedValues = values.flat();
            pool.query(sql, flattenedValues, async function (error, results, fields) {
                if (error) {
                    console.error('Error to insert new data :', error?.sqlMessage);
                    const extractedMessage = extractErrorMessage(error?.sqlMessage);
                    return reject({ error: extractedMessage ?? error?.sqlMessage });
                }
                resolve({ msg: 'New data has been sat' });
            });
        });
        return result;
    } catch (error) {
        console.error('Un handel error in insert NewData');
        return ({ error: error });
    }
}

const my_db = { pool, createNewTable, showAllTable, dropAnTable, truncateTable, modefiyAnTable, deleteAnColumn, modefiyAnColumn, showColumns, insertNewData, queryMyDb, queryByDev };

export default my_db;
