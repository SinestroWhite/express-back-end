import ApplicationError from './application-error.js';

class UnauthorizedError extends ApplicationError {
    constructor(message) {
        super(message, 401);
    }
}

export default UnauthorizedError;
