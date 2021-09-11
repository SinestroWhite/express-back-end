import ApplicationError from './ApplicationError.js';

class InternalServerError extends ApplicationError {
    constructor(message) {
        super(message, 500);
    }
}

export default InternalServerError;
