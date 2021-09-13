import db from '../../../config/database.js';
import emailSender from '../emails/email-sender.js';
import logger from '../../../config/logger.js';

import BadRequestError from '../../../errors/bad-request-error.js';
import InternalServerError from '../../../errors/internal-server-error.js';

import authService from './auth-service.js';
import confirmService from './confirm-service.js';

import GLOBAL_CONSTANTS from '../../../common/global-constants.js';
const CONFIRMATIONS = GLOBAL_CONSTANTS.CONFIRMATIONS;

export default {
    changeEmail,
    changePassword
};

async function changePassword(id, email, oldPassword, newPassword) {
    const user = await authService.getUserByEmail(email);

    let isSame = await authService.verifyPassword(user.password, oldPassword);
    if (!isSame) {
        throw new BadRequestError('Invalid old password.');
    }

    const hash = await authService.hashPassword(newPassword);
    const items = await db.promiseQuery('UPDATE users SET password = ? WHERE id = ?', [hash, id]);
    if (items.affectedRows !== 1) {
        throw new BadRequestError('Invalid auth token');
    }
}

async function changeEmail(id, email, newEmail) {
    await updateEmail(newEmail, id);

    const confirmation_id = await confirmService.insertConfirmation(id, CONFIRMATIONS.email);
    await emailSender.sendEmailConfirmationLink(newEmail, confirmation_id);

    const token = authService.generateAccessToken(id, newEmail);
    return { token, is_confirmed: false };
}

async function updateEmail(newEmail, id) {
    let data;

    try {
        data = await db.promiseQuery('UPDATE users SET email = ? WHERE id = ?', [newEmail, id]);
    } catch (exception) {
        if (exception.code === 'ER_DUP_ENTRY') {
            throw new BadRequestError('Email already used by another user.');
        }
        throw exception;
    }

    if (data.affectedRows === 0) {
        throw new BadRequestError('Invalid auth token.');
    }

    if (data.affectedRows > 1) {
        logger.error('Database Exception:',
            'Duplicate email entries in the users table. Multiple rows affected during email change.', data);
        throw new InternalServerError();
    }
}
