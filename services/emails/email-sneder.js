const nodemailer = require('nodemailer');
const fs = require("fs");
const path = require("path");

const GLOBAL_CONSTANTS = require('../../common/global-constants');

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

module.exports = {
    sendMail: async (receiver, subject, content) => {
        const message = {
            from: 'Gallery',
            to: `${receiver}`,
            subject: subject,
            html: content
        };
        const result = await transport.sendMail(message);
    },

    sendEmailConfirmationLink: async (email, token) => {
        // const html = fs.readFileSync(path.join(__dirname,"templates/confirm/confirm.html"));

        const message = {
            from: 'Gallery <office@gallery.net>',
            to: email,
            subject: 'Gallery Email Confirmation',
            html: `http://localhost:${process.env.HTTP_PORT}/api/v1/auth/confirm?token=${token}` //html.toString('utf8')
                // .replace(/#hynewz#/g, GLOBAL_CONSTANTS.FRONT_END + 'confirm.html?token=' + token)
        };

        try {
            await transport.sendMail(message);
        } catch(err) {
            console.log(err);
            return false;
        }
        return true;
    }
};
