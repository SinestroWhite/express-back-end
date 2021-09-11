import express from 'express';
import path from 'path';
import STATUS_CODES from '../common/enums/StatusCodes.js';
import authRoutes from './AuthRoutes.js';
import errorHandler from '../api/middleware/ErrorHandler.js';

export default function (app) {
    app.use('/api/v1/auth', authRoutes);

    app.get('/api/v1/', (req, res) => {
        res.json({message: "Hello"});
    });

    // app.get('/api/v1/attachment', (req, res) => {
    //     let id = req.query.id;
    //     const file = `${__dirname}/../attachments/${id}`;
    //     res.download(file, 'data.json');
    // });

    app.all('*', (req, res) => {
        res.status(STATUS_CODES.NotFound);
        res.json({
            message: STATUS_CODES.NotFound
        });
    });

    app.use(express.static(path.join(path.resolve(), 'public')));
    app.use(errorHandler);
}
