import {Router} from 'express';

import messageController from '../api/controllers/message-controller.js';

import validateFields from '../api/middleware/validation.js';

import messageValidation from '../api/validation/message-validation.js';
import limiter from '../api/services/limiter-service.js';

const router = Router();

router.post('/', limiter.message, validateFields(messageValidation.save, 'body'), messageController.save);

export default router;
