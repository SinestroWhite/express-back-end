import Joi from 'joi';

const schemas = {
    register: Joi.object().keys({
        email: Joi.string().required().lowercase().trim().email(),
        password: Joi.string().required().min(6),
        confirm_password: Joi.string().required().equal(Joi.ref('password'))
    }),
    login: Joi.object().keys({
        email: Joi.string().required().email(),
        password: Joi.string().required()
    }),
    confirm: Joi.object().keys({
        token: Joi.string().required()
    }),
    changePassword: Joi.object().keys({
        old_password: Joi.string().required().min(6),
        new_password: Joi.string().required().min(6),
        confirm_password: Joi.string().required().equal(Joi.ref('new_password'))
    }),
    changeEmail: Joi.object().keys({
        new_email: Joi.string().required().lowercase().trim().email(),
    }),
};

export default schemas;
