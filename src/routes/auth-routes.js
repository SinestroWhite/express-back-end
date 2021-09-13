import {Router} from 'express';
import authController from '../api/controllers/auth-controller.js';
import authenticateToken from '../api/middleware/authentication.js';

import authValidation from '../api/validation/auth-validation.js';
import validation from '../api/middleware/validation.js';

const router = Router();
// TODO: Add rate limiter
router.post('/register', validation(authValidation.register, 'body'), authController.register);
router.post('/login', validation(authValidation.login, 'body'), authController.login);

router.post('/logout', validation(authValidation.confirm, 'body'), authController.logout);
router.post('/refresh-token', validation(authValidation.confirm, 'body'), authController.refreshToken);

router.get('/resend', authenticateToken, authController.resend);
router.post('/confirm', validation(authValidation.confirm, 'body'), authController.confirm);

router.post('/forgotten', validation(authValidation.forgotten, 'body'), authController.forgotten);
router.post('/forgotten-confirm', validation(authValidation.forgottenConfirm, 'body'), authController.forgottenConfirm);

router.post('/change-password', validation(authValidation.changePassword, 'body'), authenticateToken, authController.changePassword);
router.post('/change-email', validation(authValidation.changeEmail, 'query'), authenticateToken, authController.changeEmail);

export default router;
