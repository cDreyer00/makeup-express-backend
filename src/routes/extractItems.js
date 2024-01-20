require('dotenv').config();

const assistants = require('../services/assistants');
const openaiKey = process.env.OPENAI_KEY;

const WebSearch = require('../services/webSearchService');
const serperKey = process.env.SERPER_KEY;
const webSearch = new WebSearch(serperKey, "www.amazon.com");

async function extractItems(req, res) {

    console.log("Extracting items...");
    console.log(req.body);

    try {
        let prompt = req.body.prompt;

        if (prompt == "" || prompt == undefined) return res.status(400).json({ error: "No prompt provided" });

        let makeups = await getAssistantRes(prompt);
        if (!makeups) return res.status(500).json({ error: "Internal server error" });

        let products = await findProducts(makeups);
        makeups = products;

        return res.json(makeups);
    } catch (err) {
        console.log("❌");
        console.log("extract items error:", err);

        return res.status(500).json({ error: err });
    }
}

async function findProducts(products) {
    let results = [];
    for (let product of products) {
        let res = await webSearch.search(product);
        let firstResult = res[0];
        if (!firstResult) {
            console.log("No results found for: ", product);
            continue;
        }

        results.push({
            title: firstResult.title,
            url: firstResult.link,
        });

        console.log("Found: ", firstResult.title);
    }

    return results;
}

async function getAssistantRes(message) {
    let assistant = await assistants.createJSONAssistant(openaiKey);
    let res = await assistant.chat({
        message
    });

    console.log("res: ", res);
    let obj = JSON.parse(res);
    let makeups = obj.makeups;
    return makeups;
}

module.exports = extractItems;