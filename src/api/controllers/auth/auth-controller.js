// Auth Controller
// Description: Handles the authentication operations

import STATUS_CODES from '../../../common/enums/status-codes.js';
import format from '../../../utilities/format.js';
import authService from '../../services/auth/auth-service.js';

export default {
    login,
    register,
    refreshToken,
    logout
};

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

function refreshToken(req, res, next) {
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
