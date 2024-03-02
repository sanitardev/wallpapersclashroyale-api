// In src/index.js
const express = require('express');
const path = require('path');
const fs = require('fs');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const https= require('https');
const axios = require('axios'); // Added axios

// *** ADD ***
const app = express();
const PORT = process.env.PORT || 80;
const HTTPS_PORT = process.env.HTTPS_PORT || 443; // Choose a suitable HTTPS port

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(express.static("images"));

function generateUniqueFilename() {
    const timestamp = new Date().getTime();
    return `image_${timestamp}.jpg`;
}

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


app.post('/addImage', async (req, res) => {
    const { imageUrl } = req.body;

    if (!imageUrl) {
        return res.status(400).json({ error: 'Image URL is required.' });
    }

    try {
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const imageFileName = generateUniqueFilename();
        const imagePath = path.join(__dirname, 'images', imageFileName);

        fs.writeFileSync(imagePath, Buffer.from(response.data));

        const fullUrl = req.protocol + '://' + req.get('host') + `:${HTTPS_PORT}` + `/${imageFileName}`;
        res.json({ success: true, imageUrl: fullUrl, imageName: imageFileName});
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch and save the image.' });
    }
});

app.get('/getAllFilenames', (req, res) => {
    const imagesFolder = path.join(__dirname, 'images');

    try {
        const filenames = fs.readdirSync(imagesFolder);
        res.json({ filenames });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to retrieve filenames from the images folder.' });
    }
});


app.delete('/deleteImage/:filename', (req, res) => {
    const { filename } = req.params;
    const imagesFolder = path.join(__dirname, 'images');
    const filePath = path.join(imagesFolder, filename);

    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            res.json({ success: true, message: `File '${filename}' has been deleted.` });
        } else {
            res.status(404).json({ error: `File '${filename}' not found.` });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: `Failed to delete file '${filename}'.` });
    }
});


httpsServer.listen(HTTPS_PORT, () => {
  console.log(`Node.js app listening at https://localhost:${HTTPS_PORT}`);
});