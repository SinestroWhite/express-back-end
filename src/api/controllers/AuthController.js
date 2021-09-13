// Auth Controller
// Description: Handles the authentication operations

import STATUS_CODES from '../../common/enums/StatusCodes.js';
import format from '../../utilities/Format.js';
import BadRequestError from '../../errors/BadRequestError.js';
import authService from '../services/AuthService.js';

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

export default {
    login,
    register,
    resend,
    confirm,
    changeEmail,
    changePassword
};
