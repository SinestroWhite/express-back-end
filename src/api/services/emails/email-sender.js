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

async function sendEmail(message) {
    try {
        await transport.sendMail(message);
    } catch(exception) {
        logger.error('Nodemailer:', exception);
        throw new InternalServerError();
    }
}

export default {
    async sendEmailConfirmationLink(email, token) {
        const message = {
            from: 'Office <office@office.net>',
            to: email,
            subject: 'Office Email Confirmation',
            html: `http://localhost:${process.env.HTTP_PORT}/api/v1/auth/confirm?token=${token}`
        };

        await sendEmail(message);
        return true;
    },
    async sendEmailForgottenPassword(email, token) {
        const message = {
            from: 'Office <office@office.net>',
            to: email,
            subject: 'Office Forgotten Password',
            html: `Confirmation token: ${token}`
        };

        await sendEmail(message);
        return true;
    }
};
