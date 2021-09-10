// Auth Controller
// Description: Handles the authentication operations

const STATUS_CODES = require('../../common/enums/status-codes');
const GLOBAL_CONSTANTS = require('../../common/global-constants');
const format = require('../../utilities/format');

const emailRegex = GLOBAL_CONSTANTS.EMAIL_REGEX;

const BadRequestError = require('../../errors/BadRequestError');
const authService = require('../services/auth-service');

function login(req, res, next) {
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
}

function register(req, res, next) {
    let email = req.body.email;
    const password = req.body.password;
    const confirm = req.body.confirm_password;

    // Validate fields
    if (!emailRegex.test(email)) {
        return next(new BadRequestError('Invalid email.'));
    }

    email = email.toLowerCase();
    if (!password || !confirm) {
        return next(new BadRequestError('Invalid password or confirm password.'));
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
}

function resend(req, res, next) {
    const id = req.id;
    const email = req.email;

    authService.resend(id, email).then(() => {
        res.status(STATUS_CODES.OK);
        res.json(format.success('A new email has been sent. Please, check your spam box.'));
    }).catch(next);
}

function confirm(req, res, next) {
    const id = req.query.token;

    authService.confirm(id).then(() => {
        res.status(STATUS_CODES.OK);
        res.json(format.success('Your account has been confirmed.'));
    }).catch(next);
}

function changePassword(req, res, next) {
    const id = req.id;
    const email = req.email;
    const oldPassword = req.body.old_password;
    const newPassword = req.body.new_password;
    const confirm = req.body.confirm_password;

    if (!oldPassword || !confirm || !newPassword) {
        return next(new BadRequestError('Old password or new password or confirm password fields are missing.'));
    }

    if (newPassword.length <= 5) {
        return next(new BadRequestError('New password must be at least 6 symbols.'));
    }

    if (newPassword !== confirm) {
        return next(new BadRequestError('Passwords does not match.'));
    }

    authService.changePassword(id, email, oldPassword, newPassword).then(() => {
        res.status(STATUS_CODES.OK);
        res.json(format.success('Your password has been changed.'));
    }).catch(next);
}

function changeEmail(req, res, next) {
    const id = req.id;
    const email = req.email;
    const newEmail = req.body.new_email;

    // Validate fields
    if (!emailRegex.test(newEmail)) {
        return next(new BadRequestError('Invalid new email.'));
    }

    authService.changeEmail(id, email, newEmail).then((data) => {
        res.status(STATUS_CODES.OK);
        res.json(data);
    }).catch(next);
}

module.exports = {
    login,
    register,
    resend,
    confirm,
    changeEmail,
    changePassword
};
