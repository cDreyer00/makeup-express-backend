require('dotenv').config();

const assistants = require('../services/assistants');
const imgUploader = require('../services/imageUploader');
const apiKey = process.env.OPENAI_KEY;

const MIN_PROMPT_LENGTH = 500;

async function advices(req, res) {

    console.log("Getting advices...");

    try {
        let { preference, language } = req.body;
        let img = req.file;

        if (!img) return res.status(400).json({ error: "No image provided" });

        img = img.buffer.toString('base64');

        var imgUrl = await imgUploader.submit({ img, expiration: 999999 });

        if (preference == "") preference = undefined;
        preference = preference ? preference : "none";


        if (!language || language == "")
            language = "en";

        let request = {
            img: imgUrl,
            message: JSON.stringify({
                preference,
                language
            })
        };

        console.log("request:", request)

        let makeupRes = await getAssistantRes(request);
        let resLength = makeupRes.length;
        while (resLength < MIN_PROMPT_LENGTH) {
            makeupRes = await getAssistantRes(request);
            resLength = makeupRes.length;

            if (resLength < MIN_PROMPT_LENGTH) {
                console.log("*retrying*");
            }
        }

        let resData = {
            advices: makeupRes,
            imageUrl: imgUrl
        };
        console.log("advices response:", resData);
        return res.json(resData);
    } catch (err) {
        console.log("❌");
        console.log("Advices error:", err);
        return res.status(500).json({ error: err });
    }
}

async function getAssistantRes({ message, img }) {
    var chatAssistant = await assistants.createMakeupExpressAssistant(apiKey);
    let makeupRes = await chatAssistant.chat({message, img});

    return makeupRes;
}

module.exports = advices;