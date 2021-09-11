import BadRequestError from '../../errors/BadRequestError.js';

export default function (schema, property) {
    return function (req, res, next) {
        const { error } = schema.validate(req[property]);
        const valid = error == null;

        if (!valid) {
            const { details } = error;
            const message = details.map(i => i.message).join(',');
            return next(new BadRequestError(message));
        }

        next();
    }
}
