// Auth Controller
// Description: Handles the authentication operations

const STATUS_CODES = require('../../common/enums/status-codes');
const GLOBAL_CONSTANTS = require('../../common/global-constants');
const db = require('../../database/config');
const emailSender = require('../../services/emails/email-sneder');
const format = require('../../utilities/format');
const encryption = require('../../utilities/encryption');

const emailRegex = GLOBAL_CONSTANTS.EMAIL_REGEX;

module.exports = {
    login: async (req, res) => {

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
            await db.promiseQuery('INSERT INTO users (id, email, password) VALUES (?);', {
                id: user_id,
                email,
                password
            });

            const confirmation_id = encryption.generateGuid();
            await db.promiseQuery('INSERT INTO confirmations (id, user_id) VALUES (?);', {
                id: confirmation_id,
                user_id
            });

            await emailSender.sendEmailConfirmationLink(email, confirmation_id);
            res.status(STATUS_CODES.OK);
            res.json(format.success(['Email successfully registered.']));
        } catch (exception) {
            console.log(exception);
            res.status(STATUS_CODES.InternalServerError);
            res.json(format.error(['There was an internal error. Email could not be registered.']));
        }
    },
    resend: async (req, res) => {

    },
    confirm: async (req, res) => {

    }
};
