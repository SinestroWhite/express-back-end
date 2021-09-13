import {Router} from 'express';

import authController from '../api/controllers/auth/auth-controller.js';
import confirmController from '../api/controllers/auth/confirm-controller.js';
import forgottenController from '../api/controllers/auth/forgotten-controller.js';
import userController from '../api/controllers/auth/user-controller.js';

import validateAccessToken from '../api/middleware/authentication.js';
import validateFields from '../api/middleware/validation.js';

import authValidation from '../api/validation/auth-validation.js';

const router = Router();
// TODO: Add rate limiter
router.post('/register', validateFields(authValidation.register, 'body'), authController.register);
router.post('/login', validateFields(authValidation.login, 'body'), authController.login);
router.post('/logout', validateFields(authValidation.confirm, 'body'), authController.logout);
router.post('/refresh-token', validateFields(authValidation.confirm, 'body'), authController.refreshToken);

router.get('/resend', validateAccessToken, confirmController.resend);
router.post('/confirm', validateFields(authValidation.confirm, 'body'), confirmController.confirm);

router.post('/forgotten', validateFields(authValidation.forgotten, 'body'), forgottenController.forgotten);
router.post('/forgotten-confirm', validateFields(authValidation.forgottenConfirm, 'body'), forgottenController.forgottenConfirm);

router.post('/change-password', validateFields(authValidation.changePassword, 'body'), validateAccessToken, userController.changePassword);
router.post('/change-email', validateFields(authValidation.changeEmail, 'query'), validateAccessToken, userController.changeEmail);

export default router;
