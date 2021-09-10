const router = require('express').Router();

const authController = require('../api/controllers/auth-controller');
const authenticateToken = require('../api/middleware/authentication');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/resend', authenticateToken, authController.resend);
router.get('/confirm', authController.confirm);

router.get('/forgotten', authController.confirm);
router.post('/change-password', authenticateToken, authController.changePassword);
router.post('/change-email', authenticateToken, authController.changeEmail);


module.exports = router;
