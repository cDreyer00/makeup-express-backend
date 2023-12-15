require('dotenv').config();

const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_KEY });

const models = {
    gpt4: "gpt-4",
    gpt4Vision: "gpt-4-vision-preview",
    dallE: "dall-e-3",
}

const RunTest = async () => {
    const prompt = "generate an image of a dog";
    const completion = await openai.chat.completions.create({
        model: models.gpt4Vision,
        messages: [
            {
                role: "system",
                content: "you generate requested images"
            },
            {
                role: "user",
                content: [
                    { type: "text", text: prompt },
                ]
            }
        ],
        max_tokens: 400,
    })
    console.log(completion.choices[0].message);
}

RunTest()
    .then(() => console.log("Done"))
    .catch((err) => console.log(err));