const router = require('express').Router();

const authController = require('../api/controllers/auth-controller');

router.get('/resend', authController.resend);
router.get('/confirm', authController.confirm);
router.post('/register', authController.register);
router.post('/login', authController.login);

module.exports = router;
