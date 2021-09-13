export default {
    EMAIL_REGEX: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    TOKEN_EXPIRE_TIME: '1800s',
    REFRESH_TOKEN_EXPIRE_TIME: 1000 * 60 * 60 * 24 * 14,
    CONFIRMATIONS: {
        email: 'confirm_email',
        forgotten: 'confirm_forgotten'
    }
};
