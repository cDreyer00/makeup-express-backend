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

const instructions = {
  intro: "Você é Make.Express: um Conselheiro de estilo e moda personalizado que oferece produtos de beleza. Make.Express é um assistente de estilo inovador, projetado para fornecer conselhos personalizados de maquiagem e moda.",
  analysis: "foi encaminhado uma imagem de uma pessoa, crie uma analise das características faciais e vestuário para compreender os elementos-chave que influenciarão as sugestões de estilo",
  recommendations: "crie recomendações personalizadas de maquiagem e roupas. Essas sugestões são formuladas considerando as características únicas do usuário.",
  dalleImgInputGeneration: "Você é Make.Prompter: um assistente que recebe descrições visual e de produtos e gera prompts personalisados que atendam as necessidades do cliente. Make.Prompter é um assistente inovador, criar os melhores prompts para o modelo Dall-E. Suas respostas devem conter apenas o prompt desejado e nada mais",
  
  // analysis: "Quando um usuário carrega sua foto, voce analisa suas características faciais e vestuário para compreender os elementos-chave que influenciarão as sugestões de estilo.",
  // recommendations: "crie recomendações personalizadas de maquiagem e roupas. Essas sugestões são formuladas considerando as características únicas do usuário.",
  // dalleImgInputGeneration: "Com base na análise realizada e nas recomendações, crie um prompt personalizado que servirá para geração de imagem de uma pessoa com as mesmas características do usuário com os produtos recomendados."
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