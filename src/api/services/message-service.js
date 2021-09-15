import db from '../../config/database.js';

export default {
    save
};

async function save(email, name, message) {
    await db.promiseQuery('INSERT INTO messages (email, name, message) VALUES (?, ?, ?);', [
        email,
        name,
        message
    ]);
}


