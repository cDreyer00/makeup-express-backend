require('dotenv').config();

const express = require('express');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const Assistants = require('./Assistants');

var imgGenInstruction = "based on the person in the image, create a prompt for Dalle image generation containing informations about the person and its looks";

let requests = 0;

const upload = multer({ storage: multer.memoryStorage() });

const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'public'));

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

    const chatAssistant = Assistants.BaseAssistant(apiKey);
    for (let i = 0; i < prompts.length; i++)
      if (i == 0)
        await chatAssistant.chat(prompts[i], img);
      else
        await chatAssistant.chat(prompts[i]);
    
    const imgPrompterAssistant = Assistants.ImgGenPrompter(apiKey);
    imgPrompterAssistant.messages = chatAssistant.messages;
    let chatRes = imgPrompterAssistant.chat(imgGenInstruction, img);
    let generatedImg = await chatAssistant.generateImage(chatRes.response.content);
    console.log({ requestId: rId, messages: chatAssistant.messages, generatedImg });
    console.log("✅");

    return res.render('responses', { messages: chatAssistant.messages, generatedImg });
  }
  catch (err) {
    console.log("❌");
    console.error({ requestId: rId, error: err });
    res.status(500).json({ requestId: rId, error: err });
  }
}