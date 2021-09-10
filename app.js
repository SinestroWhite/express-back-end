const express = require('express');
const https = require('https');
const http = require('http');
const path = require('path');
const fs = require('fs');
const log4js = require("log4js");

const app = express();
require('dotenv').config();

require('./config/express')(app);
require('./routes/routes')(app);
require('./database/config');

app.use(express.static(path.join(__dirname, 'public')));

// Configure logger
log4js.configure({
    appenders: { error: { type: 'file', filename: 'errors.log' } },
    categories: { default: { appenders: ['error'], level: 'error' } }
});

// const privateKey = fs.readFileSync(process.env.PRIVATE_KEY_LOCATION, 'utf8');
// const certificate = fs.readFileSync(process.env.CERTIFICATE_LOCATION, 'utf8');
// const authority = fs.readFileSync(process.env.CA_ECC_LOCATION, 'utf8');
//
// const credentials = { key: privateKey, cert: certificate, ca: authority };

// const httpsServer = https.createServer(credentials, app);

// const httpsPort = process.env.HTTPS_PORT;
//
// httpsServer.listen(httpsPort, () => {
//     console.log(`HTTPS server listening on port ${httpsPort}...`);
// });

const httpServer = http.createServer(app);
const httpPort = process.env.HTTP_PORT;

httpServer.listen(httpPort, () => {
    console.log(`HTTP server listening on port ${httpPort}...`);
});
