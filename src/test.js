require('dotenv').config();

const Assistant = require('./Assistant');
const assistant = new Assistant(process.env.OPENAI_KEY);
const fs = require('fs');

const instruction = `You create text prompts for generating AI images following the user requestes. You are able to recieve another image as input to be use as guidance for the text prompt. here are some prompt examples that you need to create:
"Portrait of a child playing in a park, using natural lighting and candid expressions.";
"Stylized portrait of an entrepreneur against a city skyline, with dramatic lighting and a futuristic look."
"Generate a portrait of a mature individual with a weathered appearance, bathed in natural light to accentuate the textures of aging. The subject should have deep-set hazel eyes, a rugged face with prominent lines and wrinkles, a slightly crooked nose, and thin, weathered lips. Incorporate the character of an experienced individual who has spent a lifetime at sea, capturing a sense of resilience and wisdom in their expression";
"Woman with piercing blue eyes, an angular face shape with defined cheekbones, a straight nose with a subtle curve at the tip, and full lips with a natural pout. Add freckles across the bridge of the nose and cheeks for a touch of youthful charm. The expression should convey a sense of quiet confidence and introspection, with a hint of a smile playing at the corners of the mouth."
`

// experimental prompts
"photo of a woman, striking green hair. makeup includes bold red lipstick and purple eyeliner, she uses casual sports attire, aroud 20 years"
"vibrant red lipstick; bold purple eyeliner; striking green hair, styled in a modern fashion; and casual sports attire that suggests an active lifestyle. The person should have a similar facial structure to the one in the reference image, with expressively arched eyebrows and a subtle, confident expression. The overall image should have a contemporary feel, capturing the fusion of distinct makeup styling with athletic wear."
// ====================

const RunTest = async () => {
    const prompt = `create a prompt to be used in some AI image generation to generate an image of a person that resembles the person in this image. Include the following characteristics:
        - red lipstick;
        - purple eyeliner;
        - green hair;
        - sports clothes;
    `

    const img = fs.readFileSync('./public/img/Screenshot 2023-12-21 104024.png', { encoding: 'base64' });

    assistant.setInstruction(instruction);
    await assistant.chat(prompt, img);
    return assistant;
}

RunTest()
    .then((res) => console.log(res.messages))
    .catch((err) => console.log(err));