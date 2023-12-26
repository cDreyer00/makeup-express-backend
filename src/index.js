require('dotenv').config();

const express = require('express');
const path = require('path');
const multer = require('multer');
const Assistants = require('./Assistants');
const imgUploader = require('./imageUploader');

var imgGenInstruction = "based on the person in the image, create a prompt for Dalle image generation containing informations about the person and its looks";

let requests = 0;

const upload = multer({ storage: multer.memoryStorage() });

const app = express();
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/', (req, res) => res.sendFile(path.join(__dirname, '..', 'public', 'index.html')));
app.post('/upload', upload.single('img'), testUpload);

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});

async function uploadRoute(req, res) {
  let rId = requests++;
  try {
    console.log("🚀 request " + rId);

    const prompts = Array.isArray(req.body.prompt) ? req.body.prompt : [req.body.prompt];

    //openai api key
    // const apiKey = req.body.apiKey;
    const apiKey = process.env.OPENAI_KEY;

    const img = req.file.buffer.toString('base64');
    const imgUrl = await imgUploader.submit(img);

    const chatAssistant = Assistants.BaseAssistant(apiKey);
    for (let i = 0; i < prompts.length; i++)
      if (i == 0)
        await chatAssistant.chat(prompts[i], imgUrl);
      else
        await chatAssistant.chat(prompts[i]);

    const imgPrompterAssistant = Assistants.ImgGenPrompter(apiKey);
    imgPrompterAssistant.messages = chatAssistant.messages;

    let chatRes = await imgPrompterAssistant.chat(imgGenInstruction, imgUrl);
    let generatedImg = await chatAssistant.generateImage(chatRes.response.content, imgUrl);

    console.log({ requestId: rId, messages: chatAssistant.messages, generatedImg });
    console.log("✅");

    // return res.render('responses', { messages: chatAssistant.messages, generatedImg });
    return res.json({ requestId: rId, messages: chatAssistant.messages, generatedImg });
  }
  catch (err) {
    console.log("❌");
    console.error({ requestId: rId, error: err });
    res.status(500).json({ requestId: rId, error: err });
  }
}

async function testUpload(req, res) {
  let rId = requests++;
  try {
    console.log("🚀 request " + rId);

    const prompts = Array.isArray(req.body.prompt) ? req.body.prompt : [req.body.prompt];
    const apiKey = process.env.OPENAI_KEY;

    const img = req.file.buffer.toString('base64');
    const imgUrl = await imgUploader.submit(img);

    const chatAssistant = Assistants.BaseAssistant(apiKey);
    let generatedImg = await chatAssistant.generateImage("woman cyberpunk, beautiful, futuristic, highly detailed, high resolution, high quality, realistic, high fidelity, high definition", imgUrl);

    return res.json({ requestId: rId, generatedImg });
  }
  catch (err) {
    console.log("❌");
    console.error({ requestId: rId, error: err });
    res.status(500).json({ requestId: rId, error: err });
  }
}