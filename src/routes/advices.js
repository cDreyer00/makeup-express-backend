require('dotenv').config();

const assistants = require('../services/assistants');
const imgUploader = require('../services/imageUploader');
const apiKey = process.env.OPENAI_KEY;

let base64Regex = /^data:image\/(png|jpg|jpeg);base64,/;

const MIN_PROMPT_LENGTH = 500;

async function advices(req, res) {

    console.log("Getting advices...");

    try {
        let prompt = req.body.prompt;
        let img = req.file;
        let language = req.body.language;

        if (!img) return res.status(400).json({ error: "No image provided" });

        img = img.buffer.toString('base64');

        var imgUrl = await imgUploader.submit({ img });
        
        if (prompt == "") prompt = undefined;
        if (prompt) prompt = "preference: " + prompt;
        else prompt = "preference: let AI decide";
        
        console.log({ prompt, imgUrl, language })

        if (!language || language == "") language = "English";
        prompt = prompt + "\nlanguage: " + language;

        let request = { img: imgUrl, message: prompt };

        let makeupRes = await getAssistantRes(request);
        let resLength = makeupRes.length;
        while (resLength < MIN_PROMPT_LENGTH) {
            makeupRes = await getAssistantRes(request);
            resLength = makeupRes.length;

            if (resLength < MIN_PROMPT_LENGTH) console.log(makeupRes, "*retrying*");
        }

        let resData = {
            advices: makeupRes,
            imageUrl: imgUrl
        };

        return res.json(resData);
    } catch (err) {
        console.log("❌");
        console.log(err);
        return res.status(500).json({ error: err });
    }
}

async function getAssistantRes(request) {
    var chatAssistant = assistants.createMakeupExpressAssistant(apiKey);
    let makeupRes = await chatAssistant.chat(request);
    return makeupRes;
}

module.exports = advices;