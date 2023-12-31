require('dotenv').config();

const assistants = require('../services/assistants');
const imgUploader = require('../services/imageUploader');
const apiKey = process.env.OPENAI_KEY;

async function advices(req, res) {
    console.log('body', res.body)
    try {
        let img = req.file.buffer.toString('base64');
        let prompt = req.body.prompt;

        var imgUrl = await imgUploader.submit({ img });

        if (prompt == "") prompt = undefined;
        if (prompt) prompt = prompt.toString();

        let request = { img: imgUrl, message: prompt };

        let makeupRes = await getAssistantRes(request);
        let resLength = makeupRes.content.length;
        while (resLength < 500) {
            makeupRes = await getAssistantRes(request);
            resLength = makeupRes.content.length;

            if (resLength < 500) console.log(makeupRes.content, "*retrying*");
        }

        let resData = { recomendations: makeupRes.content };

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