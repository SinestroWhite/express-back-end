const jwt = require('jsonwebtoken');
const log4js = require('log4js');
const logger = log4js.getLogger('error');

module.exports = function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        return res.sendStatus(401);
    }

    jwt.verify(token, process.env.TOKEN_SECRET, (err, data) => {
        console.log(err);
        // logger.error('Token Verification Exception: ', err);

        if (err) {
            return res.sendStatus(403);
        }

        req.email = data.email;
        req.id = data.id;

        next();
    });
}
