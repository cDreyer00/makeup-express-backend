const Assistant = require("./Assistant")
const loadInstructions = require("./instructions/loader")

function createBaseAssistant(apiKey) { return new Assistant(apiKey) }

function converMessages(messages) {
    let newMessages = [];
    for (let message of messages) {
        newMessages.push({
            role: "user",
            content: message.request
        })

        newMessages.push({
            role: "assistant",
            content: message.response
        })
    }

    return newMessages;
}

async function createImgGenPrompter(apiKey) {
    let imgGenInstructions = await loadInstructions("imgGen");
    
    let instruction = imgGenInstructions.system;
    let messages = converMessages(imgGenInstructions.messages);    

    let configs = {
        instruction,
        messages,
        max_tokens: 400,
    }
    console.log("instruction:", instruction);
    let assistant = new Assistant(apiKey, configs);
    return assistant;
}

async function createMakeupExpressAssistant(apiKey) {
    let makeupInstructions = await loadInstructions("advices");

    let instruction = makeupInstructions.system;
    let messages = converMessages(makeupInstructions.messages);
    
    let configs = {
        instruction,
        messages,
        max_tokens: 1500,
    }

    let assistant = new Assistant(apiKey, configs);
    return assistant
}

async function createJSONAssistant(apiKey) {
    let jsonerInstructions = await loadInstructions("jsoner");
    
    let instruction = jsonerInstructions.system;
    let messages = converMessages(jsonerInstructions.messages);

    let configs = {
        instruction,
        messages,
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