import {Router} from 'express';
import authController from '../api/controllers/AuthController.js';
import authenticateToken from '../api/middleware/Authentication.js';

import Joi from 'joi';
import validation from '../api/middleware/Validation.js';

const router = Router();
const schemas = {
    register: Joi.object().keys({
        title: Joi.string().required(),
        description: Joi.string().required(),
        year: Joi.number()
    }),
    login: Joi.object().keys({
        email: Joi.string().required(),
        password: Joi.string().required()
    })
};

router.post('/register', validation(schemas.register, 'body'), authController.register);
router.post('/login', validation(schemas.login, 'body'), authController.login);
router.get('/resend', authenticateToken, authController.resend);
router.get('/confirm', authController.confirm);

// router.get('/forgotten', authController.confirm);
router.post('/change-password', authenticateToken, authController.changePassword);
router.post('/change-email', authenticateToken, authController.changeEmail);

export default router;
