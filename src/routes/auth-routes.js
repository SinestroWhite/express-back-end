import {Router} from 'express';
import authController from '../api/controllers/auth-controller.js';
import authenticateToken from '../api/middleware/authentication.js';

import authValidation from '../api/validation/auth-validation.js';
import validation from '../api/middleware/validation.js';

const router = Router();

router.post('/register', validation(authValidation.register, 'body'), authController.register);
router.post('/login', validation(authValidation.login, 'body'), authController.login);
router.get('/resend', authenticateToken, authController.resend);
router.get('/confirm', validation(authValidation.confirm, 'query'), authController.confirm);

// router.get('/forgotten', authController.confirm);
router.post('/change-password', validation(authValidation.changePassword, 'body'), authenticateToken, authController.changePassword);
router.post('/change-email', validation(authValidation.changeEmail, 'query'), authenticateToken, authController.changeEmail);

export default router;
