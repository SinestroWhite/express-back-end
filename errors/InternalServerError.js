
const ApplicationError = require('./ApplicationError');

class InternalServerError extends ApplicationError {
    constructor(message) {
        super(message, 500);
    }
}

module.exports = InternalServerError;
