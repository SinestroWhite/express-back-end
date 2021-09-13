import forgottenService from '../../services/auth/forgotten-service.js';
import STATUS_CODES from '../../../common/enums/status-codes.js';
import format from '../../../utilities/format.js';

export default {
    forgotten,
    forgottenConfirm
};

function forgotten(req, res, next) {
    const email = req.body.email;

    forgottenService.forgotten(email).then(() => {
        res.status(STATUS_CODES.OK);
        res.json(format.success('We have send you an email. Please, check your inbox.'));
    }).catch(next);
}

function forgottenConfirm(req, res, next) {
    const id = req.body.token;
    const password = req.body.password;

    forgottenService.forgottenConfirm(id, password).then(() => {
        res.status(STATUS_CODES.OK);
        res.json(format.success('Your password has been reset.'));
    }).catch(next);
}

