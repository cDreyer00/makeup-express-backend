require('dotenv').config();

const express = require('express');
const multer = require('multer');

// routes import
const advices = require('./routes/advices');
const generateImage = require('./routes/generateImage');

const app = require('./app');

const upload = multer({ storage: multer.memoryStorage() });

app.get('/', (req, res) => res.send("Hello World!"));
app.post('/api/advices', upload.single('img'), advices);
app.post('/api/generateImage', upload.single('img'), generateImage);

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});