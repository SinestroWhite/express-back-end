import userService from '../../services/auth/user-service.js';
import STATUS_CODES from '../../../common/enums/status-codes.js';
import format from '../../../utilities/format.js';
import BadRequestError from '../../../errors/bad-request-error.js';

export default {
    changePassword,
    changeEmail
};

function changePassword(req, res, next) {
    const id = req.id;
    const email = req.email;
    const oldPassword = req.body.old_password;
    const newPassword = req.body.new_password;

    userService.changePassword(id, email, oldPassword, newPassword).then(() => {
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

    userService.changeEmail(id, email, newEmail).then((data) => {
        res.status(STATUS_CODES.OK);
        res.json(data);
    }).catch(next);
}
