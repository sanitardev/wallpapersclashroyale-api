// In src/index.js
const express = require('express');
const path = require('path');
const fs = require('fs');
const morgan = require('morgan');
const bodyParser = require('body-parser');

// *** ADD ***
const app = express();
const PORT = process.env.PORT || 80;

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(express.static("images"));

// *** REMOVE ***
app.get('/', (req, res) => {
    res.send("<h2>Wallpapers Clash Royale API</h2>");
});

app.get('/.well-known/pki-validation/F279C989C03E502F8249828EA58D23E0.txt', (req, res) => {
  const filePath = path.join(__dirname, '.well-known', 'pki-validation', 'F279C989C03E502F8249828EA58D23E0.txt');

  // Check if the file exists
  if (fs.existsSync(filePath)) {
      // Send the file
      res.sendFile(filePath);
  } else {
      // File not found
      res.status(404).send('File not found');
  }
});

const IMAGES_FOLDER = path.join(__dirname, 'images');

app.get('/random', (req, res) => {
    const imageFiles = fs.readdirSync(IMAGES_FOLDER).filter(file => fs.statSync(path.join(IMAGES_FOLDER, file)).isFile());
    const random_iamge_number = Math.floor(Math.random() * imageFiles.length);
    const image = imageFiles[random_iamge_number];
    var fullUrl = req.protocol + '://' + req.get('host') + `:${PORT}`  + `/${image}`;

    res.send(fullUrl);
  });

app.get('/getAll', (req, res) => {
    const imageFiles = fs.readdirSync(IMAGES_FOLDER).filter(file => fs.statSync(path.join(IMAGES_FOLDER, file)).isFile());
    const fullUrls = imageFiles.map(image => req.protocol + '://' + req.get('host') + `:${PORT}`  + `/${image}`);

    res.json(fullUrls);
});


app.listen(PORT, () => {
  console.log(`Node.js app listening at http://localhost:${PORT}`);
});