require('dotenv').config();

const assistants = require('../services/assistants');
const imgUploader = require('../services/imageUploader');
const apiKey = process.env.OPENAI_KEY;

let base64Regex = /^data:image\/(png|jpg|jpeg);base64,/;

async function advices(req, res) {

    console.log("Getting advices...");

    try {
        let prompt = req.body.prompt;
        let img = req.file;

        if (!img) return res.status(400).json({ error: "No image provided" });

        img = img.buffer.toString('base64');

        var imgUrl = await imgUploader.submit({ img });

        if (prompt == "") prompt = undefined;
        let request = { img: imgUrl, message: prompt, max_tokens: 1500};

        let makeupRes = await getAssistantRes(request);
        let resLength = makeupRes.content.length;
        while (resLength < 500) {
            makeupRes = await getAssistantRes(request);
            resLength = makeupRes.content.length;

            if (resLength < 500) console.log(makeupRes.content, "*retrying*");
        }

        let resData = { 
            advices: makeupRes.content,
            imageUrl: imgUrl
        };

        console.log("advices ✅");
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