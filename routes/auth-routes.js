import {Router} from 'express';
import authController from '../api/controllers/auth-controller.js';
import authenticateToken from '../api/middleware/authentication.js';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/resend', authenticateToken, authController.resend);
router.get('/confirm', authController.confirm);

// router.get('/forgotten', authController.confirm);
router.post('/change-password', authenticateToken, authController.changePassword);
router.post('/change-email', authenticateToken, authController.changeEmail);

export default router;
