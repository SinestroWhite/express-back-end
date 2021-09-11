import express from 'express';
import https from 'https';
import http from 'http';
import fs from 'fs';

import './src/config/Database.js';
import expressConfig from './src/config/Express.js';
import routesConfig from './src/routes/index.js';

const app = express();

expressConfig(app);
routesConfig(app);

const environment = process.env.NODE_ENV;
if (environment === 'production') {
    const privateKey = fs.readFileSync(process.env.PRIVATE_KEY_LOCATION, 'utf8');
    const certificate = fs.readFileSync(process.env.CERTIFICATE_LOCATION, 'utf8');
    const authority = fs.readFileSync(process.env.CA_ECC_LOCATION, 'utf8');

    const credentials = { key: privateKey, cert: certificate, ca: authority };

    const httpsServer = https.createServer(credentials, app);
    const httpsPort = process.env.HTTPS_PORT;

    httpsServer.listen(httpsPort, () => {
        console.log(`HTTPS server listening on port ${httpsPort}...`);
    });
}

const httpServer = http.createServer(app);
const httpPort = process.env.HTTP_PORT;

httpServer.listen(httpPort, () => {
    console.log(`HTTP server listening on port ${httpPort}...`);
});
