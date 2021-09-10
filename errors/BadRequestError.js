
const ApplicationError = require('./ApplicationError');

class BadRequestError extends ApplicationError {
    constructor(message) {
        super(message || 'There is invalid data in your request.', 400);
    }
}

module.exports = BadRequestError;
