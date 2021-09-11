import bodyParser from 'body-parser';

import cookieParser from 'cookie-parser';
import session from 'express-session';
import cors from 'cors';

export default function (app) {
    //Define middlewares
    app.use(cookieParser());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
        extended: true
    }));

    app.use(session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false
    }));

    app.use(cors());

    app.use((req, res, next) => {
        if (req.user) {
            res.locals.currentUser = req.user;
        }
        next();
    });

    console.log('Express ready!');
}
