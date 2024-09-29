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
    try {
        const result = await new Promise((resolve, reject) => {
            pool.query(sql, (error, results) => {
                if (error) {
                    console.error('Error showing all tables:', error);
                    return reject({ error: error.message }); // Return error message
                }
                if (results.length <= 0) {
                    return resolve({ msg: 'No tables exist yet...', data: [] });
                }
                // Collect table names
                for (const ele of results) {
                    listOfTables.push(ele?.Tables_in_dealer);
                }
                resolve({ msg: `Number of tables: ${results.length}}`, data: listOfTables });
            });
        });

        return result;
    } catch (error) {
        console.error('Unexpected error in showAllTable:', error);
        return { error: error.message }; // Return error message
    }
};

const showColumns = async (table) => {
    const tableName = table;
    let listOfColumns = [];
    try {
        const result = await new Promise((resolve, reject) => {

            if (!tableName) {
                return reject({ error: 'table name is not defined' });
            }
            pool.escapeId(tableName);
            const sql = `SHOw COLUMNS FROM ${tableName}`;

            pool.query(sql, async function (error, results, fields) {
                if (error) {
                    console.error('Error  :', error?.message);
                    return reject({ error: error?.message });
                }

                if (results.length <= 0) {
                    return resolve({ msg: `No columns exist yet...`, data: [] });

                }
                for (const ele of results) {
                    const oneColumn = {
                        name: ele?.Field,
                        type: ele?.Type,
                        null: ele?.Null
                    }
                    listOfColumns.push(oneColumn);
                    // listOfColumns.push(`name: ${ele?.Field}, type : ${ele?.Type}, null : ${ele?.Null}`);
                }

                resolve({ msg: "ok", data: listOfColumns });
            });

        });
        return result;
    } catch (error) {
        console.error('Unexpected error in showColumns', error);
        return { error: error.message };
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

const queryByDev = async (sql) => {
    try {
        const result = new Promise((resolve, reject) => {
            pool.query(sql, function (error, results, fields) {
                if (error) {
                    console.error('Error query dev:', error?.sqlMessage);
                    return reject({ error: error?.sqlMessage });
                }
                resolve({ msg: 'okay' });
            });

        });
        return result;
    } catch (error) {
        console.error(error);
        return { error: error };
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

// get data from db
const getData = async (sql, val) => {
    try {
        const result = await new Promise((resolve, reject) => {
            pool.query(sql, val, function (error, results, fields) {
                if (error) {
                    console.error('Error to get data:', error?.message ?? error);
                    return reject({ error: error?.message ?? error });
                }
                if (results.length <= 0) {
                    return resolve({ msg: 'No found' });
                }
                resolve({ msg: 'ok', data: results });
            });
        });
        return result;
    } catch (error) {
        console.error('error in get data from db ' + error);
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
                    console.error('Error to insert new data :', error.message);
                    return reject({ error: error?.message ?? error });
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


const my_db = { pool, createNewTable, showAllTable, dropAnTable, truncateTable, modefiyAnTable, deleteAnColumn, modefiyAnColumn, showColumns, insertNewData, getData, queryByDev };

export default my_db;
