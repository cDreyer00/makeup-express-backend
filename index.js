require('dotenv').config();

const express = require('express');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const Assistants = require('./Assistants');

let requests = 0;

const upload = multer({ storage: multer.memoryStorage() });

const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'public'));

// var imgGenInstruction = "based on all this conversation, create a prompt for dall image generation containing informations about the person and looks";
var imgGenInstruction = "based on the person in the image, create a prompt for Dalle image generation containing informations about the person and its looks";

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.post('/upload', upload.single('img'), upload);

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});

async function upload(req, res) {
  let rId = requests++;
  try {
    console.log("🚀 request " + rId);

    const prompts = Array.isArray(req.body.prompt) ? req.body.prompt : [req.body.prompt];
    const apiKey = req.body.apiKey;
    const img = req.file.buffer.toString('base64');

    const assistant = new Assistants(apiKey);
    for (let i = 0; i < prompts.length; i++)
      if (i == 0)
        await assistant.chat(prompts[i], img);
      else
        await assistant.chat(prompts[i]);

    let chatRes = await assistant.chat(imgGenInstruction);
    let generatedImg = await assistant.generateImage(chatRes.response.content);
    console.log({ requestId: rId, messages: assistant.messages, generatedImg });
    console.log("✅");

    return res.render('responses', { messages: assistant.messages, generatedImg });
  }
  catch (err) {
    console.log("❌");
    console.error({ requestId: rId, error: err });
    res.status(500).json({ requestId: rId, error: err });
  }
}