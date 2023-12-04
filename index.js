const express = require('express');
const path = require('path');
const multer  = require('multer');
const upload = multer({ dest: 'uploads/' }); // specify the folder to save uploaded files
const app = express();

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

app.post('/upload', upload.single('img'), (req, res) => {
  console.log(req.file); // contains information about the uploaded file
  res.send('File uploaded successfully');
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});