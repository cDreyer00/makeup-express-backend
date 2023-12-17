require('dotenv').config();

const express = require('express');
const path = require('path');
const multer = require('multer');
const OpenAi = require('openai');
const fs = require('fs');

const sd_key = process.env.STABLE_DIFFUSION_KEY;

const upload = multer({ storage: multer.memoryStorage() });

const app = express();
app.use(express.static(path.join(__dirname, 'public')));

const models = {
  gpt4: "gpt-4",
  gpt4Vision: "gpt-4-vision-preview",
  dallE: "dall-e-3",
}

function VisionGptMessagesType({ img, imgPrompt }, previousMessages = undefined) {
  const newMessages = []

  if (previousMessages) {
    for (let i = 0; i < previousMessages.length; i++) {
      const msg = previousMessages[i];
      newMessages.push({
        role: msg.role,
        content: [{ type: "text", text: msg.content }],
      });
    }
  }

  newMessages.push({
    role: "user",
    content: [
      {
        type: "image",
        image: img,
      },
      {
        type: "text",
        text: imgPrompt,
      },
    ],
  });

  return newMessages;
}

async function GenerateResponse(openai, { messages, img = undefined, max_tokens = 400 }) {
  let model = img ? models.gpt4Vision : models.gpt4;
  messages = img ? VisionGptMessagesType({ img, imgPrompt: messages[0].content }) : messages;
  console.log("messages: ", messages);
  const completion = await openai.chat.completions.create({
    model,
    messages,
    max_tokens,
  });

  return completion.choices[0].message;
}

async function GenerateImage(openai, prompt) {
  const response = await openai.images.generate({
    model: models.dallE,
    prompt: prompt,
    n: 1,
    size: "1024x1024",
  });
  image_url = response.data[0].url;
  return image_url;
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/upload', upload.single('img'), async (req, res) => {
  try {
    const prompts = req.body.prompt;
    const apiKey = req.body.apiKey;
    const img = req.file.buffer.toString('base64');

    const openai = new OpenAi({ apiKey });

    const messagesThread = [];
    for (let i = 0; i < prompts.length; i++) {
      
      messagesThread.push({
        role: "user",
        content: prompts[i],
      });
      
      if (i === 0) {
        var gptRes = await GenerateResponse(openai, { messages: messagesThread, img });
      } else {
        gptRes = await GenerateResponse(openai, { messages: messagesThread });
      }
      messagesThread.push(gptRes);
    }
    let generatedImg = await GenerateImage(openai, gptRes.content);
    console.log("✅");
    return res.json({ responses: messagesThread, generatedImg });
  }
  catch (err) {
    console.log("❌");
    console.log(err);
    res.status(500).send('Something went wrong');
  }
});

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
