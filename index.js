/// OPENAI DOC
/*
Response
{
  "created": 1589478378,
  "data": [
    {
      "url": "https://..."
    },
    {
      "url": "https://..."
    }
  ]
}
*/
/// DOC END

require('dotenv').config();

const express = require('express');
const path = require('path');
const multer = require('multer');
const OpenAi = require('openai');
const fs = require('fs');

const sd_key = process.env.STABLE_DIFFUSION_KEY;

const openai_key = process.env.OPENAI_KEY;
const openai = new OpenAi({ apiKey: openai_key });
const completions = openai.chat.completions;

const upload = multer({ storage: multer.memoryStorage() });

const app = express();
app.use(express.static(path.join(__dirname, 'public')));

const models = {
  gpt4: "gpt-4",
  gpt4Vision: "gpt-4-vision-preview",
  dallE: "dall-e-3",
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/upload', upload.single('img'), async (req, res) => {
  const img = req.file.buffer.toString('base64');
  const prompt = req.body.prompt;
  try {
    const analyses = await GetAnalyse(img);
    const reco = await GetRecomendations(analyses);
    const img_url = await GenerateImages(reco);
    return res.json({ analyses, reco, img_url });
  }
  catch (err) {
    console.log(err);
    res.status(500).send('Something went wrong');
  }
});

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});

const instructions = `
Você é Make.Express: um Conselheiro de estilo e moda personalizado que oferece links de compra. Make.Express é um assistente de estilo inovador, projetado para fornecer conselhos personalizados de maquiagem e moda. Quando um usuário carrega sua foto, o Make.Express analisa suas características faciais e vestuário para gerar sugestões de maquiagem e roupas sob medida. Após gerar as recomendações e imagens usando a ferramenta dalle, o Make.Express usa a ferramenta de navegador para procurar links de produtos relacionados às sugestões de estilo na Amazon brasileira, fornecendo links de compra para os usuários ao final de cada resposta. Esta representação visual e os links de compras ajudam os usuários a visualizarem e adquirirem os estilos recomendados. O serviço prioriza a privacidade do usuário e a segurança dos dados, garantindo uma jornada de estilo segura e personalizada.
`;

async function GetAnalyse(img, max_tokens = 400) {
  const completion = await openai.chat.completions.create({
    model: models.gpt4Vision,
    messages: [
      {
        role: "system",
        content: instructions
      },
      {
        role: "user",
        content: [
          { type: "text", text: "I will send an image of a person and I want that you create a text describing the overall person's visual aspects and general apperance." },
          { type: "image", image: img }
        ]
      }
    ],
    max_tokens,
  })

  return completion.choices[0].message.content;
}

async function GetRecomendations(prompt, max_tokens = 400) {
  const completion = await openai.chat.completions.create({
    model: models.gpt4,
    messages: [
      {
        role: "user",
        content: prompt
      },
      {
        role: "user",
        content: "send me a list of visual elements like makeups and/or hairstyles that would suit the person in the description"
      }
    ],
    max_tokens,
  })

  return completion.choices[0].message.content;
}

// generate a image identical to the person in the picture with the chagnes listed on recomendations response  
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


