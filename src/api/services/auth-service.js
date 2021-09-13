import argon2 from 'argon2';
import db from '../../config/database.js';
import jwt from 'jsonwebtoken';

import logger from '../../config/logger.js';
import encryption from '../../utilities/encryption.js';
import emailSender from './emails/email-sender.js';

import BadRequestError from '../../errors/bad-request-error.js';
import InternalServerError from '../../errors/internal-server-error.js';

import GLOBAL_CONSTANTS from '../../common/global-constants.js';
import UnauthorizedError from '../../errors/unauthorized-error.js';
import ForbiddenError from '../../errors/forbidden-error.js';
const EXPIRE = GLOBAL_CONSTANTS.TOKEN_EXPIRE_TIME;
const REFRESH_EXPIRE = GLOBAL_CONSTANTS.REFRESH_TOKEN_EXPIRE_TIME;
const CONFIRMATIONS = GLOBAL_CONSTANTS.CONFIRMATIONS;

export default {
    authenticate,
    register,
    resend,
    confirm,
    changePassword,
    changeEmail,
    forgotten,
    forgottenConfirm,
    refreshToken,
    revokeToken,
    validateToken
};

async function authenticate(email, password) {
    const user = await getUserByEmail(email);

    let isSame = await verifyPassword(user.password, password);
    if (!isSame) {
        throw new BadRequestError('Invalid password.');
    }

    const accessToken = generateAccessToken(user.id, email);
    const refreshToken = await insertRefreshToken(user.id, email);
    const isConfirmed = await isUserConfirmed(user.id);

    return {
        access_token: accessToken,
        refresh_token: refreshToken,
        is_confirmed: isConfirmed
    };
}

async function register(email, password) {
    const hash = await hashPassword(password);

    // Register a new user and generate a confirmation entry
    const user_id = await insertUser(email, hash);
    const confirmation_id = await insertConfirmation(user_id, CONFIRMATIONS.email);

    await emailSender.sendEmailConfirmationLink(email, confirmation_id);
    const accessToken = generateAccessToken(user_id, email);
    const refreshToken = await insertRefreshToken(user_id, email);

    return {
        access_token: accessToken,
        refresh_token: refreshToken,
        is_confirmed: false
    };
}

async function resend(id, email) {
    await deleteConfirmationByUserIdAndType(id, CONFIRMATIONS.email);
    const confirmation_id = await insertConfirmation(id, CONFIRMATIONS.email);
    await emailSender.sendEmailConfirmationLink(email, confirmation_id);
}

async function confirm(id) {
    await deleteConfirmationById(id);
}

async function changePassword(id, email, oldPassword, newPassword) {
    const user = await getUserByEmail(email);

    let isSame = await verifyPassword(user.password, oldPassword);
    if (!isSame) {
        throw new BadRequestError('Invalid old password.');
    }

    const hash = await hashPassword(newPassword);
    const items = await db.promiseQuery('UPDATE users SET password = ? WHERE id = ?', [hash, id]);
    if (items.affectedRows !== 1) {
        throw new BadRequestError('Invalid auth token');
    }
}

async function changeEmail(id, email, newEmail) {
    await updateEmail(newEmail, id);

    const confirmation_id = await insertConfirmation(id, CONFIRMATIONS.email);
    await emailSender.sendEmailConfirmationLink(newEmail, confirmation_id);

    const token = generateAccessToken(id, newEmail);
    return { token, is_confirmed: false };
}

async function forgotten(email) {
    const user = await getUserByEmail(email);

    const confirmation_id = await insertConfirmation(user.id, CONFIRMATIONS.forgotten);
    await emailSender.sendEmailForgottenPassword(email, confirmation_id);
}

async function forgottenConfirm(confirmationId, newPassword) {
    const user_id = await getUserIdFromConfirmation(confirmationId);
    await deleteConfirmationById(confirmationId);

    const hash = await hashPassword(newPassword);
    const items = await db.promiseQuery('UPDATE users SET password = ? WHERE id = ?', [hash, user_id]);
    if (items.affectedRows !== 1) {
        throw new BadRequestError('Invalid auth token');
    }
}

async function getUserIdFromConfirmation(confirmationId) {
    const rows = await db.promiseQuery('SELECT * FROM confirmations WHERE id = ?', confirmationId);
    if (rows.length === 0) {
        throw new BadRequestError('Invalid confirmation token.');
    }
    return rows[0].user_id;
}

async function refreshToken(refresh_token) {
    const rows = await db.promiseQuery('SELECT * FROM refresh_tokens WHERE token = ?', refresh_token);
    if (rows.length === 0) {
        throw new BadRequestError('Invalid refresh token.');
    }

    const isRevoked = rows[0].revoked;
    if (isRevoked) {
        throw new ForbiddenError('Refresh token has been revoked.');
    }

    const { id, email } = validateToken(refresh_token);
    const token = generateAccessToken(id, email);
    return {
        access_token: token
    };
}

async function revokeToken(refresh_token) {
    const items = await db.promiseQuery('UPDATE refresh_tokens SET revoked = ? WHERE token = ?', [
        new Date(),
        refresh_token
    ]);

    if (items.affectedRows === 0) {
        throw new BadRequestError('Invalid refresh token.');
    }

    if (items.affectedRows !== 1) {
        logger.error('Token Revoke Exception: Multiple revoked rows', items);
        throw new InternalServerError('There was a problem revoking the token.');
    }
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

async function getUserByEmail(email) {
    // Check if the email is registered
    const data = await db.promiseQuery('SELECT * FROM users WHERE email = ?', email);

    if (data.length === 0) {
        throw new BadRequestError('Email not registered.');
    } else if (data.length > 1) {
        logger.error('Database Exception:', 'Duplicate email entries in the users table', data);
        throw new InternalServerError();
    }

    return data[0];
}

async function isUserConfirmed(id) {
    let isConfirmed = true;

    const data = await db.promiseQuery('SELECT * FROM confirmations WHERE user_id = ?', id);
    if (data.length > 0) {
        isConfirmed = false;
    }

    return isConfirmed;
}

function generateAccessToken(id, email) {
    return jwt.sign({id, email}, process.env.TOKEN_SECRET, { expiresIn: EXPIRE });
}

function generateRefreshToken(id, email) {
    return jwt.sign({id, email}, process.env.TOKEN_SECRET, { expiresIn: REFRESH_EXPIRE.toString() });
}

async function insertUser(email, password) {
    const user_id = encryption.generateGuid();

    try {
        await db.promiseQuery('INSERT INTO users (id, email, password) VALUES (?, ?, ?);', [
            user_id,
            email,
            password
        ]);
    } catch (exception) {
        if (exception.code === 'ER_DUP_ENTRY') {
            throw new BadRequestError('Email already registered.');
        }
        throw exception;
    }

    return user_id;
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

async function deleteConfirmationByUserIdAndType(user_id, type) {
    const items = await db.promiseQuery('DELETE FROM confirmations WHERE user_id = ? AND type = ?', [
        user_id,
        type
    ]);
    if (items.affectedRows === 0) {
        throw new BadRequestError('Your account has been already confirmed or you have provided an invalid token.');
    }
}

async function deleteConfirmationById(id) {
    const items = await db.promiseQuery('DELETE FROM confirmations WHERE id = ?', id);
    if (items.affectedRows === 0) {
        throw new BadRequestError('Invalid confirmation token.');
    }
}

async function verifyPassword(hash, password) {
    let isSame;

    try {
        isSame = await argon2.verify(hash, password);
    } catch (exception) {
        logger.error('Argon2 Internal Exception:', exception)
        throw new InternalServerError();
    }

    return isSame;
}

async function hashPassword(password) {
    let hash;

    try {
        hash = await argon2.hash(password);
    } catch (exception) {
        logger.error('Argon2 Internal Exception:', exception);
        throw new InternalServerError();
    }

    return hash;
}

async function insertRefreshToken(user_id, email) {
    const refreshToken = generateRefreshToken(user_id, email);
    const refreshTokenId = encryption.generateGuid();
    const expireDate = new Date(new Date() + REFRESH_EXPIRE)

    await db.promiseQuery('INSERT INTO refresh_tokens (id, user_id, token, expires) VALUES (?, ?, ?, ?);', [
        refreshTokenId,
        user_id,
        refreshToken,
        expireDate
    ]);

    return refreshToken;
}

function validateToken(token) {
    let result;
    jwt.verify(token, process.env.TOKEN_SECRET, (err, data) => {
        if (err) {
            throw new ForbiddenError('Error while validating token.');
        }

        result = data;
    });
    return result;
}



