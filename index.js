require('dotenv').config();

const express = require('express');
const path = require('path');
const multer = require('multer');
const OpenAi = require('openai');
const fs = require('fs');

const sd_key = process.env.STABLE_DIFFUSION_KEY;

const openai_key = process.env.OPENAI_KEY;
const openai = new OpenAi({ apiKey: openai_key });

const upload = multer({ storage: multer.memoryStorage() });

const app = express();
app.use(express.static(path.join(__dirname, 'public')));

const models = {
  gpt4: "gpt-4",
  gpt4Vision: "gpt-4-vision-preview",
  dallE: "dall-e-3",
}

async function GenerateAnalysis(img) {
  const completion = await openai.chat.completions.create({
    model: models.gpt4Vision,
    messages: [
      {
        role: "system",
        content: instructions.intro
      },
      {
        role: "user",
        content: [
          { type: "image", image: img },
          { type: "text", text: instructions.analysis },
        ]
      }
    ],
    max_tokens: 1000,
  });

  return completion.choices[0].message.content;
}

async function GenerateRecommendations(img, analysis) {  
  const completion = await openai.chat.completions.create({
    model: models.gpt4Vision,
    messages: [
      {
        role: "system",
        content: instructions.intro
      },
      {
        role: "user",
        content: [
          { type: "image", image: img },
          { type: "text", text: analysis },
          { type: "text", text: instructions.recommendations },
        ]
      }
    ],
    max_tokens: 1000,
  });

  return completion.choices[0].message.content;
}

async function GeneratePromptForImage(referenceDescription) {
  const completion = await openai.chat.completions.create({
    model: models.gpt4,
    messages: [
      {
        role: "system",
        content: instructions.dalleImgInputGeneration
      },
      {
        role: "user",
        content: [
          { type: "text", text: referenceDescription },
          { type: "text", text: "eu gostaria de um prompt para gerar uma imagem de uma pessoa com as caracteristicas e produtos mencionados" }
        ]
      }
    ],
    max_tokens: 400,
  });

  return completion.choices[0].message.content;
}

async function GenerateImages(prompt) {
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
  console.log("Running");
  const formPrompts = req.body;
  console.log(formPrompts)
  return res.json();

  const img = req.file.buffer.toString('base64');
  try {
    const analyses = await GenerateAnalysis(img);
    console.log("analyses: ", analyses);
    console.log("====================================");
    
    const recommendations = await GenerateRecommendations(img, analyses);
    console.log("recommendations: ", recommendations);
    console.log("====================================");

    const imgPrompt = await GeneratePromptForImage(analyses);
    console.log("imgPrompt: ", imgPrompt);
    console.log("====================================");
    
    const img_url = await GenerateImages(imgPrompt);
    console.log("img_url: ", img_url);
    console.log("✅");
    
    return res.json({ instructions, analyses, imgPrompt, img_url });
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