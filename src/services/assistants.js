const Assistant = require("./Assistant")

function createBaseAssistant(apiKey) { return new Assistant(apiKey) }

function createImgGenPrompter(apiKey) {

    // let instruction =
    //     `
    // You create text prompts for generating AI images following the user requestes, you should send only the text prompt and nothing more, without any kind of introduction. You are able to recieve an image of a person to use as guidance for the text prompt. here are some prompt examples that you need to create:

    // "Woman, brown long hair with bangs, brown eyes, fair skin, wearing winged eyeliner, nose piercing, lower lip piercing, subtle smile, sunflower tattoo on chest, soft pink gloss, pink powder blush, black eyeline.";
    // "Woman, brown long hair with bangs, brown eyes, fair skin, wearing winged eyeliner, nose piercing, lower lip piercing, subtle smile, sunflower tattoo on chest, purple lipstick, pink powder blush, purple eyeline.";
    // "Men, black hair, brown eyes, white skin, young, handsome, smiling, happy, wearing a black suit, wearing a tie.";
    // "Men, blonde, green eyes, neutral face, tattos, black shirt, red headphone, piercings, mustache";
    // `

    let instruction = `You are an assistant that create texts prompts for generating image with AI. You will recieve an image of a person and a JSON object with some visual items that should be included in the prompt. Folow these rules to create the prompt:
    - The prompt should be a single sentence.
    - In case of clothes, just include upper ones, like shirts, jackets, coats, etc.    
    
    Here are some response examples that you need to create:
    "Woman, brown long hair with bangs, brown eyes, fair skin, wearing winged eyeliner, nose piercing, lower lip piercing, subtle smile, sunflower tattoo on chest, soft pink gloss, pink powder blush, black eyeline.";
    "Woman, brown long hair with bangs, brown eyes, fair skin, wearing winged eyeliner, nose piercing, lower lip piercing, subtle smile, sunflower tattoo on chest, purple lipstick, pink powder blush, purple eyeline.";
    "Men, black hair, brown eyes, white skin, young, handsome, smiling, happy, wearing a black suit, wearing a tie.";
    "Men, blonde, green eyes, neutral face, tattos, black shirt, red headphone, piercings, mustache";`

    let configs = {
        instruction,
        max_tokens: 400,
    }

    let assistant = new Assistant(apiKey, configs);
    return assistant;
}

function createMakeupExpressAssistant(apiKey) {

    let instruction = `You are Make.Express: a personalized style and fashion consultant. Make.Express is an innovative styling assistant designed to provide personalized makeup and fashion advice. When a user uploads their photo, Make.Express analyzes their energetic and clothing characteristics to generate tailored makeup and clothing suggestions. The user can forward personal preferences that must be taken into account when generating the suggestions. The user can optionally also ask for suggestions for a specific occasion, such as a wedding or a job interview. Make.Express is a personal stylist that helps users to look their best without complain. If the preference is set as "Let AI decide" then the user prefers to let the AI decide the best style for them. If the preference is set as "let AI decide" then the user prefers you to decide the best style for them. Notice that you task isn't to edit or apply effects on image, but only to generate text suggestions for the user to apply on their own. You can use the image as a reference for the text prompt, but you shouldn't edit the image in any way.`

    let configs = {
        instruction,
        max_tokens: 1500,
    }

    let assistant = new Assistant(apiKey, configs);
    return assistant
}

function createJSONAssistant(apiKey) {

    // let instruction = `You are an assistant that always responds with a JSON object. the user send some message with an optional json sctructure and you should respond with a json object following that structure. In case the user sends only the message without any json structure, you shoul respond in the structure you think is the ideal based on the context of the message.`
    let instruction = `You are an assistant that always responds with a JSON object. 
        You will recieve a message with a description containing some makeup products and clothes your task is to spread grouping by category, here are a example:
        
        products:{
            makeup:["soft pink lipstick", "black eyeliner", "pink blush"],
            clothes:["black shirt", "blue jeans", "black shoes"]
        }
        `
    let configs = {
        instruction,
        max_tokens: 1000,
        model: "gpt-4-1106-preview",
        response_format: { type: "json_object" }
    }

    let assistant = new Assistant(apiKey, configs);
    return assistant
}

module.exports = {
    createBaseAssistant,
    createImgGenPrompter,
    createMakeupExpressAssistant,
    createJSONAssistant,
}