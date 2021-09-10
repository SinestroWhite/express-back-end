const db = require('../../database/config');
const argon2 = require('argon2');

const log4js = require('log4js');
const logger = log4js.getLogger('error');

const BadRequestError = require('../../errors/BadRequestError');
const InternalServerError = require('../../errors/InternalServerError');

const jwt = require('jsonwebtoken');

const GLOBAL_CONSTANTS = require('../../common/global-constants');
const encryption = require('../../utilities/encryption');
const emailSender = require('./emails/email-sneder');

const expireTime = GLOBAL_CONSTANTS.TOKEN_EXPIRE_TIME;

module.exports = {
    authenticate,
    register
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



