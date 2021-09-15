import Joi from 'joi';

const schemas = {
    save: Joi.object().keys({
        name: Joi.string().required(),
        email: Joi.string().required().lowercase().trim().email(),
        message: Joi.string().required().min(50)
    }),
};


export default schemas;
