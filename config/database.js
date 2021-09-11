import mysql from 'mysql';
import fs from 'fs';
import path from 'path';
import logger from './logger.js';

import dotenv from 'dotenv';
dotenv.config();

// Create database connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Promisify query function
db.promiseQuery = (...args) => { //util.promisify(db.query).bind(db);
    return new Promise((resolve, reject) => {
        db.query(...args, (err, rows) => {
            if (err) {
                return reject(err);
            }

            resolve(rows);
        });
    });
}

// Connect to database and execute migrations and seeds
db.connect(async function (err) {
    if (err) {
        logger.error('Database Connection Exception:', err);
        throw err;
    }

    console.log('Connected to the DB!');

    const migrationsDir = path.resolve(path.resolve(), 'database/migrations');
    await iterateQueryDir(migrationsDir);

    console.log('Migrations have been executed!');

    const seedsDir = path.resolve(path.resolve(), 'database/seeds');
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
            await db.promiseQuery(query);
        } catch (err) {
            logger.error('Migration Exception:', err);
            throw err;
        }
    }
}

export default db;
