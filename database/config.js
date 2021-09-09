const mysql = require('mysql');
const fs = require('fs');
const path = require('path');

const util = require('util');
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.promiseQuery = util.promisify(db.query).bind(db);

db.connect(async (err) => {
    if (err) {
        throw err;
    }

    console.log('Connected to the DB!');

    const migrationsDir = path.resolve(__dirname, 'migrations');
    await iterateQueryDir(migrationsDir);

    console.log('Migrations have been executed!');

    const seedsDir = path.resolve(__dirname, 'seeds');
    await iterateQueryDir(seedsDir);

    console.log('Seeds have been executed!');
});

async function iterateQueryDir(dir) {
    // list files in directory and loop through
    for (const file of fs.readdirSync(dir).sort()) {
        // builds full path of file
        const fPath = path.resolve(dir, file);

        let query;
        try {
            query = fs.readFileSync(fPath, 'utf8');
        } catch (err) {
            throw err;
        }

        await db.promiseQuery(query);
    }
}

module.exports = db;
