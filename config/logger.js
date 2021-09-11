// Configure logger
import log4js from 'log4js';

log4js.configure({
    appenders: { error: { type: 'file', filename: 'errors.log' } },
    categories: { default: { appenders: ['error'], level: 'error' } }
});

export default log4js.getLogger();
