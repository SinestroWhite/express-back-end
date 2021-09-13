import emailSender from '../emails/email-sender.js';
import db from '../../../config/database.js';

import authService from './auth-service.js';
import confirmService from './confirm-service.js';

import BadRequestError from '../../../errors/bad-request-error.js';

import GLOBAL_CONSTANTS from '../../../common/global-constants.js';
const CONFIRMATIONS = GLOBAL_CONSTANTS.CONFIRMATIONS;

export default {
    forgotten,
    forgottenConfirm
};

async function forgotten(email) {
    const user = await authService.getUserByEmail(email);

    const confirmation_id = await confirmService.insertConfirmation(user.id, CONFIRMATIONS.forgotten);
    await emailSender.sendEmailForgottenPassword(email, confirmation_id);
}

async function forgottenConfirm(confirmationId, newPassword) {
    const user_id = await confirmService.getUserIdFromConfirmation(confirmationId);
    await confirmService.deleteConfirmationById(confirmationId);

    const hash = await authService.hashPassword(newPassword);
    const items = await db.promiseQuery('UPDATE users SET password = ? WHERE id = ?', [hash, user_id]);
    if (items.affectedRows !== 1) {
        throw new BadRequestError('Invalid auth token');
    }
}
