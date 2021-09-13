// Auth Controller
// Description: Handles the authentication operations

import STATUS_CODES from '../../common/enums/status-codes.js';
import format from '../../utilities/format.js';
import BadRequestError from '../../errors/bad-request-error.js';
import authService from '../services/auth-service.js';

function login(req, res, next) {
    const email = req.body.email.toLowerCase();
    const password = req.body.password;

    authService.authenticate(email, password).then((data) => {
        res.status(STATUS_CODES.OK);
        res.json(data);
    }).catch(next);
}

function register(req, res, next) {
    let email = req.body.email;
    const password = req.body.password;

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
    const id = req.body.token;

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

    authService.changePassword(id, email, oldPassword, newPassword).then(() => {
        res.status(STATUS_CODES.OK);
        res.json(format.success('Your password has been changed.'));
    }).catch(next);
}

function changeEmail(req, res, next) {
    const id = req.id;
    const email = req.email;
    const newEmail = req.body.new_email;

    if (email === newEmail) {
        return next(new BadRequestError('This email is already used by you.'));
    }

    authService.changeEmail(id, email, newEmail).then((data) => {
        res.status(STATUS_CODES.OK);
        res.json(data);
    }).catch(next);
}

function forgotten(req, res, next) {
    const email = req.body.email;

    authService.forgotten(email).then(() => {
        res.status(STATUS_CODES.OK);
        res.json(format.success('We have send you an email. Please, check your inbox.'));
    }).catch(next);
}

function forgottenConfirm(req, res, next) {
    const id = req.body.token;
    const password = req.body.password;

    authService.forgottenConfirm(id, password).then(() => {
        res.status(STATUS_CODES.OK);
        res.json(format.success('Your password has been reset.'));
    }).catch(next);
}

function refreshToken(req, res, next) {
    // const authHeader = req.headers['authorization'];
    // const token = authHeader && authHeader.split(' ')[1];
    const refresh_token = req.body.token;

    authService.refreshToken(refresh_token).then((data) => {
        res.status(STATUS_CODES.OK);
        res.json(data);
    }).catch(next);
}

function logout(req, res, next) {
    const refresh_token = req.body.token;

    authService.revokeToken(refresh_token).then(() => {
        res.status(STATUS_CODES.OK);
        res.json(format.success('You have been successfully logout.'));
    }).catch(next);
}

export default {
    login,
    register,
    resend,
    confirm,
    changeEmail,
    changePassword,
    forgotten,
    forgottenConfirm,
    refreshToken,
    logout
};
