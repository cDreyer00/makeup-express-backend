require('dotenv').config();

const express = require('express');
const path = require('path');
const multer = require('multer');
const assistants = require('./assistants');
const imgUploader = require('./imageUploader');

let requests = 0;

const upload = multer({ storage: multer.memoryStorage() });

const app = express();
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/', (req, res) => res.sendFile(path.join(__dirname, '..', 'public', 'index.html')));
app.post('/upload', upload.single('img'), uploadRoute);

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});

async function uploadRoute(req, res) {
  let rId = requests++;
  try {
    console.log("🚀 request " + rId);

    const apiKey = process.env.OPENAI_KEY;

    let img = req.file.buffer.toString('base64');
    let imgUrl = await imgUploader.submit({ img });

    let preferences = req.body.prompt;
    if (preferences == "") preferences = undefined;
    if (preferences) preferences = preferences.toString();

    let request = { img: imgUrl, message: preferences };
    console.log(request);

    let resLength = 0;
    do {
      var chatAssistant = assistants.createMakeupExpressAssistant(apiKey);
      let makeupRes = await chatAssistant.chat(request);
      resLength = makeupRes.content.length;
      console.log("resLength", resLength);
      if (resLength < 500) console.log(makeupRes.content);
    }
    while (resLength < 500)

    const imgPrompterAssistant = assistants.createImgGenPrompter(apiKey);
    imgPrompterAssistant.messages = chatAssistant.messages;

    let imgPrompt = await imgPrompterAssistant.chat({
      message: "create a prompt to generate the person described, include previous visual recomendations on the prompt",
      img: imgUrl
    });

    let generatedImg = await chatAssistant.generateImage({ prompt: imgPrompt.content, imgUrl });

    let result = {
      requestId: rId,
      aiInfos: {
        instruction: imgPrompterAssistant.instruction,
        messages: imgPrompterAssistant.messages
      },
      generatedImg
    }

    console.log(result);
    console.log("✅");

    return res.json(result);
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

    const chatAssistant = assistants.createBaseAssistant(apiKey);
    let generatedImg = await chatAssistant.generateImage("woman cyberpunk, beautiful, futuristic, highly detailed, high resolution, high quality, realistic, high fidelity, high definition", imgUrl);

    return res.json({ requestId: rId, generatedImg });
  }
  catch (err) {
    console.log("❌");
    console.error({ requestId: rId, error: err });
    res.status(500).json({ requestId: rId, error: err });
  }
}