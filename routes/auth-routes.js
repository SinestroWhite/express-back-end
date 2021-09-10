const router = require('express').Router();

const authController = require('../api/controllers/auth-controller');
const authenticateToken = require('../api/middleware/authentication');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/resend', authenticateToken, authController.resend);
router.get('/confirm', authController.confirm);
router.get('/forgotten', authController.confirm);
router.get('/change-password', authenticateToken, authController.confirm);
router.get('/change-email', authenticateToken, authController.confirm);


module.exports = router;
