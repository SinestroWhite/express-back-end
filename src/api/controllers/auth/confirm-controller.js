import confirmService from '../../services/auth/confirm-service.js';
import STATUS_CODES from '../../../common/enums/status-codes.js';
import format from '../../../utilities/format.js';

export default {
    resend,
    confirm
};

function resend(req, res, next) {
    const id = req.id;
    const email = req.email;

    confirmService.resend(id, email).then(() => {
        res.status(STATUS_CODES.OK);
        res.json(format.success('A new email has been sent. Please, check your spam box.'));
    }).catch(next);
}

function confirm(req, res, next) {
    const id = req.body.token;

    confirmService.confirm(id).then(() => {
        res.status(STATUS_CODES.OK);
        res.json(format.success('Your account has been confirmed.'));
    }).catch(next);
}


