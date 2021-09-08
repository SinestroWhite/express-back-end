const mysql = require('mysql');
const fs = require('fs');
const path = require('path');

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect((err) => {
    if (err) {
        throw err;
    }

    console.log('Connected to the DB!');

    const migrationsDir = path.resolve(__dirname, 'migrations');
    iterateQueryDir(migrationsDir);

    // console.log('Migrations have been executed!');

    const seedsDir = path.resolve(__dirname, 'seeds');
    iterateQueryDir(seedsDir);

    // console.log('Seeds have been executed!');
});

function iterateQueryDir(dir) {
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

        db.query(query, (err, rows) => {
            if (err) {
                throw err;
            }

            // console.log('Executed: ' + query);
            // console.log('Result: ');
            // console.log(rows);
        });
    }
}

module.exports = db;
