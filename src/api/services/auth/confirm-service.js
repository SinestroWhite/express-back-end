import emailSender from '../emails/email-sender.js';
import encryption from '../../../utilities/encryption.js';
import db from '../../../config/database.js';

import BadRequestError from '../../../errors/bad-request-error.js';

import GLOBAL_CONSTANTS from '../../../common/global-constants.js';
const CONFIRMATIONS = GLOBAL_CONSTANTS.CONFIRMATIONS;

export default {
    resend,
    confirm,
    insertConfirmation,
    deleteConfirmationById,
    isUserConfirmed,
    getUserIdFromConfirmation
};

async function resend(id, email) {
    await deleteConfirmationByUserIdAndType(id, CONFIRMATIONS.email);
    const confirmation_id = await insertConfirmation(id, CONFIRMATIONS.email);
    await emailSender.sendEmailConfirmationLink(email, confirmation_id);
}

async function confirm(id) {
    await deleteConfirmationById(id);
}

async function insertConfirmation(user_id, type) {
    const confirmation_id = encryption.generateGuid();

    await db.promiseQuery('INSERT INTO confirmations (id, user_id, type) VALUES (?, ?, ?);', [
        confirmation_id,
        user_id,
        type
    ]);

    return confirmation_id;
}

async function deleteConfirmationById(id) {
    const items = await db.promiseQuery('DELETE FROM confirmations WHERE id = ?', id);
    if (items.affectedRows === 0) {
        throw new BadRequestError('Invalid confirmation token.');
    }
}

async function isUserConfirmed(id) {
    let isConfirmed = true;

    const data = await db.promiseQuery('SELECT * FROM confirmations WHERE user_id = ?', id);
    if (data.length > 0) {
        isConfirmed = false;
    }

    return isConfirmed;
}

async function getUserIdFromConfirmation(confirmationId) {
    const rows = await db.promiseQuery('SELECT * FROM confirmations WHERE id = ?', confirmationId);
    if (rows.length === 0) {
        throw new BadRequestError('Invalid confirmation token.');
    }
    return rows[0].user_id;
}

async function deleteConfirmationByUserIdAndType(user_id, type) {
    const items = await db.promiseQuery('DELETE FROM confirmations WHERE user_id = ? AND type = ?', [
        user_id,
        type
    ]);
    if (items.affectedRows === 0) {
        throw new BadRequestError('Your account has been already confirmed or you have provided an invalid token.');
    }
}


