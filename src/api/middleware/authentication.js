import jwt from 'jsonwebtoken';
import authService from '../services/auth/auth-service.js';
import UnauthorizedError from '../../errors/unauthorized-error.js';

export default function (req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        next(new UnauthorizedError('Invalid token.'))
    }

    const { email, id } = authService.validateToken(token);

    req.id = id;
    req.email = email;
    console.log(id, email);

    next();
}
