// Auth Controller
// Description: Handles the authentication operations

const STATUS_CODES = require('../../common/enums/status-codes');
const GLOBAL_CONSTANTS = require('../../common/global-constants');
const db = require('../../database/config');
const emailSender = require('../services/emails/email-sneder');
const format = require('../../utilities/format');
const encryption = require('../../utilities/encryption');

const log4js = require('log4js');
const logger = log4js.getLogger('error');

const argon2 = require('argon2');
const jwt = require('jsonwebtoken');

const BadRequestError = require('../../errors/BadRequestError');
const InternalServerError = require('../../errors/InternalServerError');

const emailRegex = GLOBAL_CONSTANTS.EMAIL_REGEX;
const expireTime = GLOBAL_CONSTANTS.TOKEN_EXPIRE_TIME;

const authService = require('../services/auth-service');

function generateAccessToken(id, email) {
    return jwt.sign({id, email}, process.env.TOKEN_SECRET, { expiresIn: expireTime });
}

module.exports = {
    login: async (req, res, next) => {
        const email = req.body.email.toLowerCase();
        const password = req.body.password;

        // Validate fields
        if (!email || !password) {
            return next(new BadRequestError('Missing email or password.'));
        }

        authService.authenticate(email, password).then((data) => {
            res.status(STATUS_CODES.OK);
            res.json(data);
        }).catch(next);
    },
    register: async (req, res, next) => {
        let email = req.body.email;
        const password = req.body.password;
        const confirm = req.body.confirm_password;

        // Validate fields
        if (!emailRegex.test(email)) {
            return next(new BadRequestError('Invalid email.'));
        }

        email = email.toLowerCase();
        if (!password || !confirm) {
            return next(new BadRequestError('Invalid password or confirm_password.'));
        }

        if (password.length <= 5) {
            return next(new BadRequestError('Password must be at least 6 symbols.'));
        }

        if (password !== confirm) {
            return next(new BadRequestError('Passwords does not match.'));
        }

        authService.register(email, password).then((data) => {
            res.status(STATUS_CODES.OK);
            res.json(data);
        }).catch(next);
    },
    resend: async (req, res, next) => {
        const id = req.id;
        const email = req.email;

        authService.resend(id, email).then(() => {
            res.status(STATUS_CODES.OK);
            res.json(format.success('A new email has been sent. Please, check your spam box.'));
        }).catch(next);
    },
    confirm: async (req, res) => {
        const id = req.query.token;

        try {
            // Check if the token exists
            const items = await db.promiseQuery('DELETE FROM confirmations WHERE id = ?', id);
            if (items.affectedRows === 0) {
                res.status(STATUS_CODES.BadRequest);
                res.json(format.error('Invalid confirmation token.'));
                return;
            }

            res.status(STATUS_CODES.OK);
            res.json(format.success('Your account has been confirmed.'));
        } catch (exception) {
            console.log(exception);
            logger.error('Confirm Database Exception:', exception);
            res.status(STATUS_CODES.InternalServerError);
            res.json(format.error('There was an internal error. Your account could not be confirmed.'));
        }
    },
    changePassword: async (req, res) => {
        const id = req.id;
        const email = req.email;
        const oldPassword = req.body.old_password;
        const newPassword = req.body.new_password;
        const confirm = req.body.confirm_password;

        if (!oldPassword || !confirm || !newPassword) {
            res.status(STATUS_CODES.BadRequest);
            res.json(format.error('Old password or new password or confirm password fields are missing'));
            return;
        }

        if (newPassword.length <= 5) {
            res.status(STATUS_CODES.BadRequest);
            res.json(format.error('New password must be at least 6 symbols'));
            return;
        }

        if (newPassword !== confirm) {
            res.status(STATUS_CODES.BadRequest);
            res.json(format.error('Passwords does not match.'));
            return;
        }

        try {
            // Check if the email is registered
            const data = await db.promiseQuery('SELECT * FROM users WHERE id = ?', id);

            if (data.length === 0) {
                res.status(STATUS_CODES.BadRequest);
                res.json(format.error('Invalid user email.'));
                return;
            }

            if (data.length > 1) {
                logger.error('Change Password Exception:', 'Duplicate email entries in the users table', data);
                res.status(STATUS_CODES.InternalServerError);
                res.json(format.error('There was an internal error. Please, try again later.'));
                return;
            }

            if (!await argon2.verify(data[0].password, oldPassword)) {
                res.status(STATUS_CODES.BadRequest);
                res.json(format.error('Invalid old password.'));
                return;
            }

            const hash = await argon2.hash(newPassword);
            const items = await db.promiseQuery('UPDATE users SET password = ? WHERE id = ?', [hash, id]);
            if (items.affectedRows !== 1) {
                res.status(STATUS_CODES.BadRequest);
                res.json(format.error('Invalid user id.'));
                return;
            }

            res.status(STATUS_CODES.OK);
            res.json(format.success('Your password has been changed.'));
        } catch (exception) {
            // console.log(exception);
            logger.error('Change Password Database Exception:', exception);
            res.status(STATUS_CODES.InternalServerError);
            res.json(format.error('There was an internal error. Your password could not be changed.'));
        }
    },
    changeEmail: async (req, res) => {
        const id = req.id;
        const email = req.email;
        const newEmail = req.body.new_email;

        // Validate fields
        if (!emailRegex.test(newEmail)) {
            res.status(STATUS_CODES.BadRequest);
            res.json(format.error('Invalid new email.'));
            return;
        }

        try {
            // Check if the email is registered
            const data = await db.promiseQuery('SELECT * FROM users WHERE email = ?', newEmail);
            if (data.length !== 0) {
                res.status(STATUS_CODES.BadRequest);
                res.json(format.error('Email already used by another user.'));
                return;
            }

            const result = await db.promiseQuery('UPDATE users SET email = ? WHERE id = ?', [newEmail, id]);
            if (result.affectedRows !== 1) {
                res.status(STATUS_CODES.InternalServerError);
                res.json(format.error('There was an internal error. Please, try again later'));
                return;
            }

            const confirmation_id = encryption.generateGuid();
            await db.promiseQuery('INSERT INTO confirmations (id, user_id) VALUES (?, ?);', [
                confirmation_id,
                id
            ]);

            await emailSender.sendEmailConfirmationLink(newEmail, confirmation_id);
            const token = generateAccessToken(id, newEmail);

            res.status(STATUS_CODES.OK);
            res.json({ token, is_confirmed: false });
        } catch (exception) {
            console.log(exception);
            logger.error('Change Email Database Exception:', exception);
            res.status(STATUS_CODES.InternalServerError);
            res.json(format.error('There was an internal error. Your email could not be changed.'));
        }
    }
};
