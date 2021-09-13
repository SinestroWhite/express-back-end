import ApplicationError from './application-error.js';

class BadRequestError extends ApplicationError {
    constructor(message) {
        super(message || 'There is invalid data in your request.', 400);
    }
}

export default BadRequestError;
