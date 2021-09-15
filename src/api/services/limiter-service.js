import rateLimit from 'express-rate-limit';

const slowDownMessage = 'Too many requests, please, slow down.';

const register = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    message: {
        message: slowDownMessage
    }
});

const login = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    message: {
        message: slowDownMessage
    },
    keyGenerator: function (req) {
        return req.body.email
    }
});

const resend = rateLimit({
    windowMs: 600 * 1000,
    max: 3,
    message: {
        message: slowDownMessage
    },
    keyGenerator: function (req) {
        return req.email
    }
});

const forgotten = rateLimit({
    windowMs: 600 * 1000,
    max: 3,
    message: {
        message: slowDownMessage
    },
    keyGenerator: function (req) {
        return req.body.email
    }
});

const message = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    message: {
        message: slowDownMessage
    }
});

export default {
    register,
    login,
    resend,
    forgotten,
    message
};
