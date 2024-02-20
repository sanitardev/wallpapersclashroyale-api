// In src/index.js
const express = require('express');
const path = require('path');
const fs = require('fs');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const https = require('https');

// *** ADD ***
const app = express();
const PORT = process.env.PORT || 80;
const HTTPS_PORT = process.env.HTTPS_PORT || 443; // Choose a suitable HTTPS port

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(express.static("images"));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://squid-app-tiggw.ondigitalocean.app/');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

const sslOptions = {
  key: fs.readFileSync('.crt/private.key'),
  cert: fs.readFileSync('.crt/certificate.crt'),
};

// Create an HTTPS server
const httpsServer = https.createServer(sslOptions, app);

// *** REMOVE ***
app.get('/', (req, res) => {
    res.send("<h2>Wallpapers Clash Royale API</h2>");
});


const IMAGES_FOLDER = path.join(__dirname, 'images');

app.get('/random', (req, res) => {
    const imageFiles = fs.readdirSync(IMAGES_FOLDER).filter(file => fs.statSync(path.join(IMAGES_FOLDER, file)).isFile());
    const random_iamge_number = Math.floor(Math.random() * imageFiles.length);
    const image = imageFiles[random_iamge_number];
    var fullUrl = req.protocol + '://' + req.get('host') + `:${HTTPS_PORT}`  + `/${image}`;

    res.send(fullUrl);
  });

app.get('/getAll', (req, res) => {
    const imageFiles = fs.readdirSync(IMAGES_FOLDER).filter(file => fs.statSync(path.join(IMAGES_FOLDER, file)).isFile());
    const fullUrls = imageFiles.map(image => req.protocol + '://' + req.get('host') + `:${HTTPS_PORT}`  + `/${image}`);

    res.json(fullUrls);
});


httpsServer.listen(HTTPS_PORT, () => {
  console.log(`Node.js app listening at http://localhost:${HTTPS_PORT}`);
});