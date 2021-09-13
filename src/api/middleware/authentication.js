import jwt from 'jsonwebtoken';

export default function (req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        return res.sendStatus(401);
    }

    jwt.verify(token, process.env.TOKEN_SECRET, (err, data) => {
        if (err) {
            return res.sendStatus(403);
        }

        req.email = data.email;
        req.id = data.id;

        next();
    });
}
