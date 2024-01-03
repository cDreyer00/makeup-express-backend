require('dotenv').config();

const assistants = require('../services/assistants');
const apiKey = process.env.OPENAI_KEY;

async function extractItems(req, res){
    console.log("Extracting items...");

    try {
        let prompt = req.body.prompt;
        console.log(prompt);

        if (prompt == "" || prompt == undefined) return res.status(400).json({ error: "No prompt provided" });

        let r = await getAssistantRes(prompt);
        let resData = { 
            items: JSON.parse(r.content),
        };

        console.log("items ✅");
        console.log(resData);
        return res.json(resData);
    } catch (err) {
        console.log("❌");
        console.log(err);
        return res.status(500).json({ error: err });
    }
}

async function getAssistantRes(message) {
    let assistant = assistants.createJSONAssistant(apiKey);
    let res = await assistant.chat({
        message
    });
    return res;
}

module.exports = extractItems;