import mysql from 'mysql';

const pool = mysql.createPool({
    connectionLimit: 10,
    host: process.env.HOST_DB,
    user: process.env.USER_DB,
    password: process.env.PASSWORD_DB,
    database: process.env.NAME_DB,
});

// show or get
const showAllTable = async () => {
    const sql = 'SHOW TABLES';
    const listOfTables = [];
    return new Promise((resolve, reject) => {
        pool.query(sql, function (error, results, fields) {
            if (error) {
                console.error('Error showing all tables :', error);
                return reject({ error: error });
            }
            if (results.length <= 0) {
                return resolve({ result: `Number of tables is: ${results.length}  No tables exist yet...` });
            }
            for (const ele of results) {
                listOfTables.push(ele?.Tables_in_dealer);
            }
            resolve({ data: `Number of tables is: ${results.length}\n list of tables is : ${listOfTables}` });
        });

    });
}

const showColumns = async (req, res) => {
    const tableName = req.body?.tableName;
    let listOfColumns = '';
    if (!tableName) {
        return await res.status(400).send('Error: tableName is null !!').end();
    }
    pool.escapeId(tableName);
    const sql = `SHOw COLUMNS FROM ${tableName}`;

    pool.query(sql, async function (error, results, fields) {
        if (error) {
            console.error('Error  :', error);
            return await res.status(401).send(`${error}`).end();
        }
        if (results.length <= 0) {
            return await res.status(200).send(`Number of columns is: ${results.length}  No columns exist yet...`).end();

        }
        for (const ele of results) {
            listOfColumns += `name: ${ele?.Field}, type : ${ele?.Type}, null : ${ele?.Null}\n==============\n`;
        }

        await res.status(200).send(`${listOfColumns}`).end();
    });
}

// create
const createNewTable = async (req, res) => {
    const tableName = req.body?.tableName;
    const columns = req.body?.columns;
    let sqlColumns = '';
    let index = 0;

    if (!tableName || !columns || columns.length <= 0) {
        return res.status(400).send('Error: can not create new table tableName or Columns is null !!').end();
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
            sqlColumns += ` DEFAULT ${pool.escape(element?.default)}`;
        }

        if (element?.autoIncrement) {
            sqlColumns += ' AUTO_INCREMENT'
        }

        if (element?.primaryKey) {
            sqlColumns += ' PRIMARY KEY';
        }

        if (element?.foreignKey) {
            sqlColumns += ' FOREIGN KEY';
        }
        if (index !== columns.length) {
            sqlColumns += ', ';
        }

    }
    const newsql = `CREATE TABLE ${tableName}(${sqlColumns})`;
    pool.query(newsql, function (error, results, fields) {
        if (error) {
            console.error('Error creating table:', error);
            return res.status(401).send(`${error}`).end();
        }
        res.status(200).send(`Table has been create`).end();
    });
}

// del
const dropAnTable = async (req, res) => {
    const tableName = req.body?.tableName;
    if (!tableName) {
        return await res.status(400).send('Error : table name').end();
    }
    pool.escapeId(tableName);
    const sql = `DROP TABLE ${tableName}`;
    pool.query(sql, async function (error, results, fields) {
        if (error) {
            console.error('Error drop an tables :', error);
            return await res.status(401).send(`${error}`).end();
        }
        await res.status(200).send('Table has been Droped').end();
    });

}

const truncateTable = async (req, res) => {
    const tableName = req.body?.tableName;
    if (!tableName) {
        return await res.status(400).send('Error : table name').end();
    }
    pool.escapeId(tableName);
    const sql = `TRUNCATE TABLE ${tableName}`;
    pool.query(sql, async function (error, results, fields) {
        if (error) {
            console.error('Error TRUNCATE  tables :', error);
            return await res.status(401).send(`${error}`).end();
        }
        await res.status(200).send('All data has been delete').end();
    });

}

const deleteAnColumn = async (req, res) => {
    const tableName = req.body?.tableName;
    const oneColumn = req.body?.oneColumn;
    if (!tableName || !oneColumn || !oneColumn?.name) {
        return await res.status(400).send('Error: can not drop column  tableName or Column is null !!').end();
    }

    pool.escapeId(tableName);
    pool.escapeId(oneColumn?.name);

    const newsql = `ALTER TABLE ${tableName} DROP COLUMN ${oneColumn?.name};`;
    pool.query(newsql, async function (error, results, fields) {
        if (error) {
            console.error('Error DROP COLUMN from a table:', error);
            return await res.status(401).send(`${error}`).end();
        }
        await res.status(200).send(`Column has been delete`).end();
    });
}

// modefiy
const modefiyAnColumn = async (req, res) => {
    const tableName = req.body?.tableName;
    const oneColumn = req.body?.oneColumn;
    let sqlColumn = '';

    if (!tableName || !oneColumn || !oneColumn?.name || !oneColumn?.type) {
        return await res.status(400).send('Error: column table name,column name or column type is null !!').end();
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
        sqlColumn += ' FOREIGN KEY';
    }

    const newsql = `ALTER TABLE ${tableName} MODIFY COLUMN ${sqlColumn};`;
    pool.query(newsql, async function (error, results, fields) {
        if (error) {
            console.error('Error ALTER column:', error);
            return await res.status(401).send(`${error}`).end();
        }
        await res.status(200).send(`Column has been alter`).end();
    });

}

const modefiyAnTable = async (req, res) => {
    const tableName = req.body?.tableName;
    const oneColumn = req.body?.oneColumn;
    let sqlColumns = '';


    if (!tableName || !oneColumn || !oneColumn?.name || !oneColumn?.type) {
        return await res.status(400).send('Error: tableName or Column name / type is null !!').end();
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
        sqlColumns += ' FOREIGN KEY';
    }

    const newsql = `ALTER TABLE ${tableName} ADD ${sqlColumns};`;
    pool.query(newsql, async function (error, results, fields) {
        if (error) {
            console.error('Error ALTER table:', error);
            return await res.status(401).send(`${error}`).end();
        }
        await res.status(200).send(`Table has been alter`).end();
    });
}

// get data from db
const getData = async (res, sql, val) => {
    return new Promise((resolve, reject) => {
        pool.query(sql, val, function (error, results, fields) {
            if (error) {
                console.error('Error to get data:', error);
                return reject({ error: error });
            }
            if (results.length <= 0) {
                resolve({ error: 'No found user match with data you instert check your info and try again' });
            }
            resolve(results);
        });
    }).catch(error => {
        console.error('Unhandled Promise Rejection:', error);
        return res.status(400).send({ error: error });
    });;

}

// insert  data into db 
const insertNewData = async (req, res, tableName, column, values) => {
    if (!tableName) {
        return await res.status(400).send('can not create new user table name is null');
    }
    pool.escapeId(tableName);
    const placeholders = values.map(() => '(?)').join(',');
    const sql = `INSERT INTO ${tableName}(${column}) VALUES (${placeholders});`;
    const flattenedValues = values.flat();
    pool.query(sql, flattenedValues, async function (error, results, fields) {
        if (error) {
            console.error('Error to insert new data :', error);
            return await res.status(401).send(`${error}`).end();
        }
        await res.status(200).send('insert new data is okay').end();
    });

}

const modefiyAnRow = () => { }

const deleteAnRaw = () => { }

const my_db = { pool, createNewTable, showAllTable, dropAnTable, truncateTable, modefiyAnTable, deleteAnColumn, modefiyAnColumn, showColumns, insertNewData, getData };

export default my_db;
