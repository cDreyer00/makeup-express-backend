require('dotenv').config();


const instruction = `you HAVE to ALWAYS respond with "Good morging" no matter what the user says, and only that, nothing more.`

const Assistant = require('./Assistants');
const assistant = new Assistant(process.env.OPENAI_KEY);
const fs = require('fs');

const RunTest = async () => {
    // assistant.setInstruction(instruction);
    const img = fs.readFileSync('./public/img/54314405.jpg', { encoding: 'base64' });
    await assistant.chat("when you were born?", img);
    await assistant.chat("what is on the image?");
    return assistant;
}

RunTest()
    .then((res) => console.log(res.messages))
    .catch((err) => console.log(err));