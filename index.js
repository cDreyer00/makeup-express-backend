require('dotenv').config();

const express = require('express');
const path = require('path');
const multer = require('multer');
const app = express();
const OpenAi = require('openai');

const sd_key = process.env.STABLE_DIFFUSION_KEY;
const openai_key = process.env.OPENAI_KEY;
const key = process.env.API_KEY;
const openai = new OpenAi({ apiKey: openai_key });

// app.use(express.static(path.join(__dirname, 'public')));

// const upload = multer({ storage: multer.memoryStorage() });

// app.get('/', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public', 'index.html'));
// });

// app.post('/upload', upload.single('img'), (req, res) => {
//   console.log(req.file);
//   console.log(req.file.buffer);

//   res.sendFile(path.join(__dirname, 'public', 'index.html'));
// });

// app.listen(3000, () => {
//   console.log('Server is running on http://localhost:3000');
// });


async function main() {

  const completions = openai.chat.completions;

  // use gtp4 vision to create an analysis of the person in the image
  const analysisRes = await completions.create({
    model: "gpt-4-vision-preview",
    messages: [
      {
        role: "assistant",
        content: [
          { type: "text", text: "Make.Express, previously known as Beauty Muse, has evolved to provide even more personalized beauty advice. Now, users can upload photos of themselves to receive customized suggestions for makeup and hair that not only suit their facial features but also complement their attire. When users share a photo, Make.Express will analyze their outfit and overall appearance to offer beauty solutions that harmonize with their personal style and the occasion they're dressing for. This feature is designed to enhance the user experience, providing a tailored approach to beauty advice. The tool prioritizes user privacy and data security, ensuring that all recommendations are made with the utmost respect for personal information. Make.Express combines visual analysis with fashion and beauty expertise to deliver unique and cohesive styling suggestions." },
        ],
      },
      {
        role: "user",
        content: [
          { type: "image_url", image_url: "https://i.postimg.cc/zB7Wndjk/eu.png" },
          { type: "text", text: "create an descriptive analysis based on the image" },
        ],
      }],
    max_tokens: 400,
  });

  var analysis = analysisRes.choices[0].message.content;
  console.log(`analysis: ${analysis}`);

  const extractionRes = await completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: analysis },
          { type: "text", text: "extract a list of some key visual articles" }
        ]
      }
    ],
    max_tokens: 400,
  });

  var extraction = extractionRes.choices[0].message.content;
  console.log(`extraction: ${extraction}`);

  var generateLinksRes = await completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: extraction },
          { type: "text", text: "send a list of makeup items" }
        ]
      }
    ],
    max_tokens: 400,
  });

  var generateLinks = generateLinksRes.choices[0].message.content;
  console.log(`generateLinks: ${generateLinks}`);

  var promptRest = await completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: generateLinks },
          { type: "text", text: "create a text prompt in order to be used on some AI image generation" }
        ]
      }
    ],
    max_tokens: 400,
  });

  var prompt = promptRest.choices[0].message.content;
  console.log(`prompt: ${prompt}`);

  // const gptResponse = await completions.create({
  //   model: "gpt-4",
  //   messages: [

  //     {
  //       role: "user",
  //       content: [
  //         // { type: "text", text: "Create a shot description about the person in the sent image containing visual aspects and gender and in the description add the visual tags of the object. Send the text response like prompt format" },
  //         // { type: "text", text: "add to description: Red Lipstick" },
  //         // { type: "image_url", image_url: "https://i.postimg.cc/zB7Wndjk/eu.png" },
  //       ],
  //     }],
  //   max_tokens: 200,
  // });
  // console.log(gptResponse.choices[0]);
}

main().catch((error) => {
  console.error(error);
});