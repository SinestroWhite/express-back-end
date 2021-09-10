const format = require('../../utilities/format');
const log4js = require('log4js');
const logger = log4js.getLogger('error');

function errorHandler(err, req, res, next) {
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

module.exports = errorHandler;
