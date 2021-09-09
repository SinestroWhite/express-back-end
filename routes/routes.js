const authRoutes = require('./auth-routes');
const STATUS_CODES = require('../common/enums/status-codes');

module.exports = (app) => {
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
        res.status(404);
        res.json({
            message: STATUS_CODES.NotFound
        });
    });
};
