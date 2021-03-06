import BadRequestError from '../../errors/bad-request-error.js';

export default function (schema, property) {
    return function (req, res, next) {

        const { error } = schema.validate(req[property], {
            errors: {
                wrap: {
                    label: ''
                }
            }
        });

        const valid = error == null;

        if (!valid) {
            const { details } = error;
            const message = details.map(i => i.message).join(',');
            return next(new BadRequestError(message));
        }

        next();
    }
}
