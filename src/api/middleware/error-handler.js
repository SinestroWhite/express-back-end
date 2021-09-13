import format from '../../utilities/format.js';
import logger from '../../config/logger.js';

export default function (err, req, res) {
    if (process.env.NODE_ENV === 'development') {
        console.log('ErrorHandle', err);
    }

    if (!err.status || err.status === 500) {
        logger.error(err.stack);
    }

    const message = err.status ? err.message : 'Something went wrong. Please, try again.';

    res.status(err.status || 500);
    res.json(format.error(message));
}
