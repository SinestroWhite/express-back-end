// Auth Controller
// Description: Handles the authentication operations

const STATUS_CODES = require('../../common/enums/status-codes');
const GLOBAL_CONSTANTS = require('../../common/global-constants');
const db = require('../../database/config');
const emailSender = require('../../services/emails/email-sneder');
const format = require('../../utilities/format');
const encryption = require('../../utilities/encryption');

const log4js = require('log4js');
const logger = log4js.getLogger('error');

const argon2 = require('argon2');
const jwt = require('jsonwebtoken');

const emailRegex = GLOBAL_CONSTANTS.EMAIL_REGEX;
const expireTime = GLOBAL_CONSTANTS.TOKEN_EXPIRE_TIME;

function generateAccessToken(id, email) {
    return jwt.sign({id, email}, process.env.TOKEN_SECRET, { expiresIn: expireTime });
}

module.exports = {
    login: async (req, res) => {
        const email = req.body.email;
        const password = req.body.password;

        // Validate fields
        if (!email || !password) {
            res.status(STATUS_CODES.BadRequest);
            res.json(format.error('Missing email or password.'));
            return;
        }

        try {
            // Check if the email is registered
            const data = await db.promiseQuery('SELECT * FROM users WHERE email = ?', email);

            if (data.length === 0) {
                res.status(STATUS_CODES.BadRequest);
                res.json(format.error(['Invalid credentials.']));
                return;
            }

            if (data.length > 1) {
                logger.error('Login Exception:', 'Duplicate email entries in the users table', data);
                res.status(STATUS_CODES.InternalServerError);
                res.json(format.error(['There was an internal error. Please, try again later.']));
                return;
            }

            if (!await argon2.verify(data[0].password, password)) {
                res.status(STATUS_CODES.BadRequest);
                res.json(format.error(['Invalid credentials.']));
                return;
            }

            const id = data[0].id;
            const token = generateAccessToken(id, email);

            res.status(STATUS_CODES.OK);
            res.json({ token });
        } catch (exception) {
            console.log(exception);
            logger.error('Login Database Exception:', exception);
            res.status(STATUS_CODES.InternalServerError);
            res.json(format.error(['There was an internal error. You cannot be authenticated.']));
        }
    },
    register: async (req, res) => {
        const email = req.body.email;
        const password = req.body.password;
        const confirm = req.body.confirm_password;

        // Validate fields
        if (!emailRegex.test(email)) {
            res.status(STATUS_CODES.BadRequest);
            res.json(format.error('Invalid email.'));
            return;
        }

        if (!password || !confirm) {
            res.status(STATUS_CODES.BadRequest);
            res.json(format.error('Password and Confirm password fields are missing'));
            return;
        }

        if (password.length <= 5) {
            res.status(STATUS_CODES.BadRequest);
            res.json(format.error('Password must be at least 6 symbols'));
            return;
        }

        if (password !== confirm) {
            res.status(STATUS_CODES.BadRequest);
            res.json(format.error('Passwords does not match.'));
            return;
        }

        let hash;
        try {
            hash = await argon2.hash(password);
        } catch (exception) {
            console.log(exception);
            logger.error('Register Argon2 Exception:', exception);
            res.status(STATUS_CODES.InternalServerError);
            res.json(format.error(['There was an internal error. Email could not be registered.']));
        }

        try {
            // Check if the email is already registered
            const data = await db.promiseQuery('SELECT * FROM users WHERE email = ?', email);
            if (data.length !== 0) {
                res.status(STATUS_CODES.BadRequest);
                res.json(format.error(['Email already registered.']));
                return;
            }

            // Register a new user and generate a confirmation entry
            const user_id = encryption.generateGuid();
            await db.promiseQuery('INSERT INTO users (id, email, password) VALUES (?, ?, ?);', [
                user_id,
                email.toLowerCase(),
                hash
            ]);

            const confirmation_id = encryption.generateGuid();
            await db.promiseQuery('INSERT INTO confirmations (id, user_id) VALUES (?, ?);', [
                confirmation_id,
                user_id
            ]);

            await emailSender.sendEmailConfirmationLink(email, confirmation_id);
            const token = generateAccessToken(user_id, email);

            res.status(STATUS_CODES.OK);
            res.json({ token });
        } catch (exception) {
            console.log(exception);
            logger.error('Register Database Exception:', exception);
            res.status(STATUS_CODES.InternalServerError);
            res.json(format.error(['There was an internal error. Email could not be registered.']));
        }
    },
    resend: async (req, res) => {
        const id = req.id;
        const email = req.email;

        try {
            const items = await db.promiseQuery('DELETE FROM confirmations WHERE user_id = ?', id);
            if (items.affectedRows === 0) {
                res.status(STATUS_CODES.BadRequest);
                res.json(format.error(['Your account has been confirmed or you have provided invalid id.']));
                return;
            }

            const confirmation_id = encryption.generateGuid();
            await db.promiseQuery('INSERT INTO confirmations (id, user_id) VALUES (?, ?);', [
                confirmation_id,
                id
            ]);

            await emailSender.sendEmailConfirmationLink(email, confirmation_id);
            res.status(STATUS_CODES.OK);
            res.json(format.success(['A new email has been sent, please, check your spam box.']));
        } catch (exception) {
            console.log(exception);
            logger.error('Resend Database Exception:', exception);
            res.status(STATUS_CODES.InternalServerError);
            res.json(format.error(['There was an internal error. A new email could not be resend.']));
        }
    },
    confirm: async (req, res) => {
        const id = req.query.token;

        try {
            // Check if the token exists
            const items = await db.promiseQuery('DELETE FROM confirmations WHERE id = ?', id);
            if (items.affectedRows === 0) {
                res.status(STATUS_CODES.BadRequest);
                res.json(format.error(['Invalid confirmation token.']));
                return;
            }

            res.status(STATUS_CODES.OK);
            res.json(format.success(['Your account has been confirmed.']));
        } catch (exception) {
            console.log(exception);
            logger.error('Confirm Database Exception:', exception);
            res.status(STATUS_CODES.InternalServerError);
            res.json(format.error(['There was an internal error. Your account could not be confirmed.']));
        }
    }
};
