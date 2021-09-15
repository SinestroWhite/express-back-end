import messageService from '../services/message-service.js';
import STATUS_CODES from '../../common/enums/status-codes.js';
import format from '../../utilities/format.js';

export default {
    save
};

function save(req, res, next) {
    const { email, name, message } = req.body;

    messageService.save(email, name, message).then(() => {
        res.status(STATUS_CODES.OK);
        res.json(format.success('Your message has been saved.'));
    }).catch(next);
}


