const format = require('../../utilities/format');
const log4js = require('log4js');
const logger = log4js.getLogger('error');

function errorHandler(err, req, res, next) {
    if (process.env.NODE_ENV === 'development') {
        console.log(err.status);
    }

    if (err.status === 500) {
        logger.error(err.stack);
    }

    res.status(err.status);
    res.json(format.error(err.message));
}

module.exports = errorHandler;
