const { json } = require('express');
const assistants = require('../services/assistants');
const imgUploader = require('../services/imageUploader');
const apiKey = process.env.OPENAI_KEY;

async function generateImage(req, res) {

    console.log("Generating image...");
    console.log(req.body);
    try {
        let img = req.file;
        if (!img) throw new Error("No image provided");

        img = img.buffer.toString('base64');
        let imgUrl = await imgUploader.submit({ img });

        let prompt = req.body.prompt;
        if (!prompt) throw new Error("No prompt provided");

        prompt = "create a prompt to generate a person with these aditional details:\n" + prompt;

        const imgPrompterAssistant = await assistants.createImgGenPrompter(apiKey);
        let imgPromptRes = await imgPrompterAssistant.chat({
            message: prompt,
            img: imgUrl
        });

        let generatedImg = await imgPrompterAssistant.generateImage({ prompt: imgPromptRes, imgUrl });

        let result = {
            prompt: imgPromptRes,
            referenceImgUrl: imgUrl,
            generatedImgUrl: generatedImg.image.url
        }

        console.log("image generated ✅");
        return res.json(result);
    } catch (err) {
        console.log("❌");
        console.log("Generate Image error:", err);
        return res.status(500).json({ error: err });
    }
}



module.exports = generateImage;