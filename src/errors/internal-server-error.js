import ApplicationError from './application-error.js';

class InternalServerError extends ApplicationError {
    constructor(message) {
        super(message, 500);
    }
}

export default InternalServerError;
