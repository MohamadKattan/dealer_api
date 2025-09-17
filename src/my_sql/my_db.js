
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

const TABLE_BlackLIST = new Set(['users']);
const ALLOWED_TYPES = new Set(['INT', 'VARCHAR(255)', 'CHAR(255)', 'TEXT', 'DATETIME']);


// show or get 
const showAllTable = async (req, res) => {
    let conn;
    try {
        const sql = 'SHOW TABLES';
        const per = req?.user?.per;

        const level = 1;
        const checkPer = await reusable.checkPer(res, per, level);
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
        return reusable.sendRes(res, reusable.tK?.typeError, reusable.tK?.kserverError, error?.code ?? null);
    } finally {
        if (conn) conn.release();
    }
};

const showColumns = async (req, res) => {
    let conn;
    const per = req?.user?.per;
    const tableName = req.body?.tableName?.trim();
    const level = 1;
    const checkPer = await reusable.checkPer(res, per, level);
    if (!checkPer) return;

    if (!tableName) {
        return reusable.sendRes(res, reusable.tK.typeError, reusable.tK.kNoTables, 'table name is not defined')
    }

    if (TABLE_BlackLIST.has(tableName)) {
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
const createNewTable = async (req, res) => {
    const per = req?.user?.per;
    const { tableName, columns } = req.body;

    let conn;
    let errorMsg;
    let ColumnsValue = '';
    let index = 0;
    const maxColums = 20;

    const level = 1;
    const checkPer = await reusable.checkPer(res, per, level);
    if (!checkPer) return;

    if (!tableName || !columns || columns.length <= 0) {
        errorMsg = ' INVALID_TABLE_NAME OR COLUMN IS NULL';
        return reusable.sendRes(res, reusable.tK?.typeError, reusable.tK?.kErrorMysQL, errorMsg);
    }

    const isString = await reusable.typeIsString(tableName.trim());
    if (!isString) {
        return reusable.sendRes(res, reusable.tK.typeError, reusable.tK.kNoAccess, 'INVALID_TABLE_NAME');
    }

    if (columns.length > maxColums) {
        errorMsg = 'TOO_MANY_COLUMNS_MAX_IS 20';
        return reusable.sendRes(res, reusable.tK?.typeError, reusable.tK?.kErrorMysQL, errorMsg);

    }


    for (const element of columns) {
        if (!element?.name || !element?.type) {
            errorMsg = 'INVALID_COLUMN_NAME_OR_TYPE';
            return reusable.sendRes(res, reusable.tK?.typeError, reusable.tK?.kErrorMysQL, errorMsg);
        }

        if (!ALLOWED_TYPES.has(element?.type.toUpperCase())) {
            errorMsg = `INVALID_COLUMN_TYPE ${element} !!`;
            return reusable.sendRes(res, reusable.tK?.typeError, reusable.tK?.kErrorMysQL, errorMsg);
        }

        index++
        ColumnsValue += `${poolConfig.escapeId(element?.name)} ${element?.type}`;

        if (element?.notNull) {
            ColumnsValue += ' NOT NULL'
        }

        if (element?.default) {
            ColumnsValue += ` DEFAULT ${poolConfig.escape(element?.default)}`;
        }

        if (element?.autoIncrement) {
            ColumnsValue += ' AUTO_INCREMENT'
        }

        if (element?.primaryKey) {
            ColumnsValue += ' PRIMARY KEY';
        }

        if (element?.foreignKey) {
            ColumnsValue += ` FOREIGN KEY (${poolConfig.escapeId(element?.name)}) REFERENCES users(id)`;
        }

        if (element?.unique) {
            ColumnsValue += ' UNIQUE';
        }
        if (index !== columns.length) {
            ColumnsValue += ', ';
        }

    };
    const sql = `CREATE TABLE ${poolConfig.escapeId(tableName)} (${ColumnsValue})`;
    try {
        conn = await poolConfig.getConnection();
        await conn.query({
            sql: sql,
            timeout: process.env.NODE_ENV === 'production' ? 1000 : 5000
        });
        return reusable.sendRes(res, reusable.tK?.typeSuccess, reusable.tK?.kcreateTable);
    } catch (error) {
        console.error({ errormsg: error?.message, errorCode: error?.code });
        return reusable.sendRes(res, reusable.tK?.typeError, reusable.tK?.kserverError, error?.code ?? null);
    } finally {
        if (conn) conn.release();
    }
}

const queryByDev = async (req, res) => {
    let conn;
    const per = req?.user?.per;
    const pass = req.body.pass;
    const bodySql = req.body.text;
    try {
        const level = 1;
        const checkPer = await reusable.checkPer(res, per, level);
        if (!checkPer) return;

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
const dropAnTable = async (req, res) => {
    let conn;
    const sql = `DROP TABLE ??`;
    const per = req?.user?.per;
    const tableName = req.body?.tableName.trim();

    const level = 1;
    const checkPer = await reusable.checkPer(res, per, level);
    if (!checkPer) return;

    const isString = await reusable.typeIsString(tableName);
    if (!isString) {
        return reusable.sendRes(res, reusable.tK.typeError, reusable.tK.kNoAccess, 'INVALID_TABLE_NAME');
    }

    if (TABLE_BlackLIST.has(tableName)) {
        return reusable.sendRes(res, reusable.tK.typeError, reusable.tK.kNoAccess, 'INVALID_TABLE');
    }

    try {
        conn = await poolConfig.getConnection();
        await conn.query({
            sql: sql,
            values: [tableName],
            timeout: process.env.NODE_ENV === 'production' ? 1000 : 5000
        });

        return reusable.sendRes(res, reusable.tK?.typeSuccess, reusable.tK?.ksuccess, 'Table has been Droped');

    } catch (error) {
        console.error({
            sql: sql,
            msg: error?.message
        });
        return reusable.sendRes(res, reusable.tK?.typeError, reusable.tK?.kErrorMysQL, error?.code);
    } finally { if (conn) conn.release() }
}

const truncateTable = async (req, res) => {
    let conn;
    const per = req?.user?.per;
    const tableName = req.body?.tableName.trim();
    const sql = 'TRUNCATE TABLE ??';

    const level = 1;
    const checkPer = await reusable.checkPer(res, per, level);
    if (!checkPer) return;


    const isString = await reusable.typeIsString(tableName);
    if (!isString) {
        return reusable.sendRes(res, reusable.tK.typeError, reusable.tK.kNoAccess, 'INVALID_TABLE_NAME');
    }

    if (TABLE_BlackLIST.has(tableName)) {
        return reusable.sendRes(res, reusable.tK.typeError, reusable.tK.kNoAccess, 'INVALID_TABLE');
    }

    try {
        conn = await poolConfig.getConnection()
        await conn.query({
            sql: sql,
            values: [tableName],
            timeout: process.env.NODE_ENV === 'production' ? 1000 : 5000
        });

        return reusable.sendRes(res, reusable.tK?.typeSuccess, reusable.tK?.ksuccess, 'Table has been TRUNCATE');

    } catch (error) {
        console.error({ sql: sql, msg: error?.message });
        return reusable.sendRes(res, reusable.tK?.typeError, reusable.tK?.kErrorMysQL, error?.code);

    } finally { if (conn) conn.release(); }
}

const deleteAnColumn = async (req, res) => {
    let conn;
    const per = req?.user?.per;
    const { tableName, oneColumn } = req.body;

    const level = 1;
    const checkPer = await reusable.checkPer(res, per, level);
    if (!checkPer) return;

    if (!tableName || !oneColumn || !oneColumn?.name) {
        return reusable.sendRes(res, reusable.tK.typeError, reusable.tK.kErrorMysQL, 'INVALID_TABLE_NAME_OR_COlUMN');
    }

    if (TABLE_BlackLIST.has(tableName.trim())) {
        return reusable.sendRes(res, reusable.tK.typeError, reusable.tK.kErrorMysQL, 'INVALID_TABLE_NAME');
    }

    const isString = await reusable.typeIsString(tableName.trim());
    if (!isString) {
        return reusable.sendRes(res, reusable.tK.typeError, reusable.tK.kErrorMysQL, 'INVALID_TABLE_NAME');
    }




    try {
        const sql = `ALTER TABLE ${poolConfig.escapeId(tableName)} DROP COLUMN ${poolConfig.escapeId(oneColumn?.name)};`;
        conn = await poolConfig.getConnection();
        await conn.query({
            sql: sql,
            timeout: process.env.NODE_ENV === 'production' ? 1000 : 5000
        });

        return reusable.sendRes(res, reusable.tK.typeSuccess, reusable.tK.ksuccess, 'One_Col_Deleted');

    } catch (error) {
        console.error({
            msg: error?.code
        });
        return reusable.sendRes(res, reusable.tK.typeError, reusable.tK.kErrorMysQL, 'ERROR_DEL_ONECOLUMN');
    } finally { if (conn) conn.release(); }
}

// modefiy 
const modefiyAnColumn = async (req, res) => {
    const per = req?.user?.per;
    const { tableName, oneColumn } = req.body;
    let sqlColumn = '';
    let conn;

    const level = 1;
    const checkPer = await reusable.checkPer(res, per, level);
    if (!checkPer) return;

    if (!tableName || !oneColumn || !oneColumn?.name) {
        return reusable.sendRes(res, reusable.tK.typeError, reusable.tK.kErrorMysQL, 'INVALID_TABLE_NAME_OR_COlUMN');
    }

    if (TABLE_BlackLIST.has(tableName.trim())) {
        return reusable.sendRes(res, reusable.tK.typeError, reusable.tK.kErrorMysQL, 'INVALID_TABLE_NAME');
    }

    const isString = await reusable.typeIsString(tableName.trim());
    if (!isString) {
        return reusable.sendRes(res, reusable.tK.typeError, reusable.tK.kErrorMysQL, 'INVALID_TABLE_NAME');
    }


    if (!ALLOWED_TYPES.has(oneColumn?.type.toUpperCase())) {
        return reusable.sendRes(res, reusable.tK?.typeError, reusable.tK?.kErrorMysQL, 'INVALID_COLUMN_TYPE');

    }


    sqlColumn += ` ${poolConfig.escapeId(oneColumn?.name)} ${oneColumn?.type}`;

    if (oneColumn?.notNull) {
        sqlColumn += ' NOT NULL'
    }

    if (oneColumn?.default) {
        sqlColumn += ` DEFAULT ${poolConfig.escape(element?.default)}`;
    }

    if (oneColumn?.autoIncrement) {
        sqlColumn += ' AUTO_INCREMENT'
    }

    if (oneColumn?.primaryKey) {
        sqlColumn += ' PRIMARY KEY';
    }

    if (oneColumn?.foreignKey) {
        sqlColumn += ` FOREIGN KEY (${poolConfig.escapeId(oneColumn?.name)}) REFERENCES users(id)`;
    }

    if (oneColumn?.unique) {
        sqlColumn += ' UNIQUE';
    }

    try {
        const newsql = `ALTER TABLE ${poolConfig.escapeId(tableName)} MODIFY COLUMN ${sqlColumn};`;
        conn = await poolConfig.getConnection();
        conn.query({
            sql: newsql,
            timeout: process.env.NODE_ENV === 'production' ? 1000 : 5000
        });

        return reusable.sendRes(res, reusable.tK?.typeSuccess, reusable.tK?.ksuccess, 'COLUMN_HAS_BEEN_EDIT');

    } catch (error) {
        console.error({ msg: error?.code });
        return reusable.sendRes(res, reusable.tK?.typeError, reusable.tK?.kErrorMysQL, 'ERROR_EDITE_COLUMN');
    }
    finally { if (conn) conn.release() }
}

const modefiyAnTable = async (req, res) => {
    const per = req?.user?.per;
    const { tableName, oneColumn } = req.body;
    let sqlColumns = '';
    let conn;

    const level = 1;
    const checkPer = await reusable.checkPer(res, per, level);
    if (!checkPer) return;

    if (!tableName || !oneColumn || !oneColumn?.name) {
        return reusable.sendRes(res, reusable.tK.typeError, reusable.tK.kErrorMysQL, 'INVALID_TABLE_NAME_OR_COlUMN');
    }

    if (TABLE_BlackLIST.has(tableName.trim())) {
        return reusable.sendRes(res, reusable.tK.typeError, reusable.tK.kErrorMysQL, 'INVALID_TABLE_NAME');
    }

    const isString = await reusable.typeIsString(tableName.trim());

    if (!isString) {
        return reusable.sendRes(res, reusable.tK.typeError, reusable.tK.kErrorMysQL, 'INVALID_TABLE_NAME');
    }


    if (!ALLOWED_TYPES.has(oneColumn?.type.toUpperCase())) {
        return reusable.sendRes(res, reusable.tK?.typeError, reusable.tK?.kErrorMysQL, 'INVALID_COLUMN_TYPE');
    }

    sqlColumns += ` ${poolConfig.escapeId(oneColumn?.name)} ${oneColumn?.type}`;


    if (oneColumn?.notNull) {
        sqlColumns += ' NOT NULL'
    }

    if (oneColumn?.default) {
        sqlColumns += ` DEFAULT ${poolConfig.escape(oneColumn?.default)}`;
    }

    if (oneColumn?.autoIncrement) {
        sqlColumns += ' AUTO_INCREMENT'
    }

    if (oneColumn?.primaryKey) {
        sqlColumns += ' PRIMARY KEY';
    }

    if (oneColumn?.foreignKey) {
        sqlColumns += ` FOREIGN KEY (${poolConfig.escapeId(oneColumn?.name)}) REFERENCES users(id)`;
    }

    if (oneColumn?.unique) {
        sqlColumns += ' UNIQUE';
    }


    try {
        const newsql = `ALTER TABLE ${poolConfig.escapeId(tableName)} ADD ${sqlColumns};`;
        conn = await poolConfig.getConnection();
        conn.query({
            sql: newsql,
            timeout: process.env.NODE_ENV === 'production' ? 1000 : 5000
        });

        return reusable.sendRes(res, reusable.tK?.typeSuccess, reusable.tK?.ksuccess, 'TABLE_HAS_BEEN_EDIT');

    } catch (error) {
        console.error({ code: error?.code, msg: error?.msg });
        return reusable.sendRes(res, reusable.tK.typeError, reusable.tK.kErrorMysQL, 'ERROR_EDIT_TABLE')

    }
    finally {
        if (conn) conn.release();
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
const selectQuery = async (sql, val = null) => {
    let conn;
    try {
        conn = await poolConfig.getConnection();
        const result = val != null
            ? await conn.query(sql, val)
            : await conn.query(sql)
        return result
    } catch (error) {
        return { error: error?.code ?? error };
    }
    finally {
        if (conn) conn.release();
    }
}

// insert data into db 
const insertNewData = async (tableName, column, values) => {
    let conn;
    try {
        const placeholders = values.map(() => '?').join(',');
        const sql = `INSERT INTO ${tableName}(${column}) VALUES (${placeholders});`;
        const flattenedValues = values.flat();
        conn = await poolConfig.getConnection();
        const result = await conn.query(sql, flattenedValues);
        return result;
    } catch (error) {
        console.error('Un handel error in insert NewData');
        return ({ error: error });
    } finally {
        if (conn) conn.release();
    }
}

const my_db = { pool, createNewTable, showAllTable, dropAnTable, truncateTable, modefiyAnTable, deleteAnColumn, modefiyAnColumn, showColumns, insertNewData, selectQuery, queryByDev };

export default my_db;
