import nodemailer from 'nodemailer';

import InternalServerError from '../../../errors/internal-server-error.js';
import logger from '../../../config/logger.js';

const transport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD
    },
    tls: {
        rejectUnauthorized: false
    }
});

export default {
    sendEmailConfirmationLink: async (email, token) => {
        const message = {
            from: 'Gallery <office@gallery.net>',
            to: email,
            subject: 'Gallery Email Confirmation',
            html: `http://localhost:${process.env.HTTP_PORT}/api/v1/auth/confirm?token=${token}`
        };

        try {
            await transport.sendMail(message);
        } catch(exception) {
            logger.error('Nodemailer:', exception);
            throw new InternalServerError();
        }
        return true;
    }
};
