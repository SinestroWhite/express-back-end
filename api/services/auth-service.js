import argon2 from 'argon2';
import db from '../../config/database.js';
import jwt from 'jsonwebtoken';

import logger from '../../config/logger.js';
import encryption from '../../utilities/encryption.js';
import emailSender from './emails/email-sneder.js';

import BadRequestError from '../../errors/BadRequestError.js';
import InternalServerError from '../../errors/InternalServerError.js';

import GLOBAL_CONSTANTS from '../../common/global-constants.js';
const expireTime = GLOBAL_CONSTANTS.TOKEN_EXPIRE_TIME;

export default {
    authenticate,
    register,
    resend,
    confirm,
    changePassword,
    changeEmail
};

async function authenticate(email, password) {
    const user = await getUserByEmail(email);

    let isSame = await verifyPassword(user.password, password);
    if (!isSame) {
        throw new BadRequestError('Wrong password.');
    }

    const token = generateAccessToken(user.id, email);
    return {
        token,
        is_confirmed: await isUserConfirmed(user.id)
    };
}

async function register(email, password) {
    const hash = await hashPassword(password);

    // Register a new user and generate a confirmation entry
    const user_id = await insertUser(email, hash);
    const confirmation_id = await insertConfirmation(user_id);

    await emailSender.sendEmailConfirmationLink(email, confirmation_id);
    const token = generateAccessToken(user_id, email);

    return { token, is_confirmed: false };
}

async function resend(id, email) {
    await deleteConfirmationByUserId(id);
    const confirmation_id = await insertConfirmation(id);
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

    const confirmation_id = await insertConfirmation(id);
    await emailSender.sendEmailConfirmationLink(newEmail, confirmation_id);

    const token = generateAccessToken(id, newEmail);
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

    if (data.affectedRows  === 0) {
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
    return jwt.sign({id, email}, process.env.TOKEN_SECRET, { expiresIn: expireTime });
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

async function insertConfirmation(user_id) {
    const confirmation_id = encryption.generateGuid();

    await db.promiseQuery('INSERT INTO confirmations (id, user_id) VALUES (?, ?);', [
        confirmation_id,
        user_id
    ]);

    return confirmation_id;
}

async function deleteConfirmationByUserId(user_id) {
    const items = await db.promiseQuery('DELETE FROM confirmations WHERE user_id = ?', user_id);
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



