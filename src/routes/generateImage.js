const { json } = require('express');
const assistants = require('../services/assistants');
const imgUploader = require('../services/imageUploader');
const imgClassificator = require('../services/ImgClassificator');
const apiKey = process.env.OPENAI_KEY;

async function generateImage(req, res) {

    console.log("Generating image...");
    console.log(req.body);
    try {
        // get requests data
        let img = req.file;
        if (!img) throw new Error("No image provided");

        img = img.buffer.toString('base64');
        let imgUrl = await imgUploader.submit({ img });

        let prompt = req.body.prompt;
        if (!prompt) throw new Error("No prompt provided");
        
        // extract information about skin color
        const extractInfos = await imgClassificator(imgUrl);
        
        // generate prompt
        const imgPrompterAssistant = await assistants.createImgGenPrompter(apiKey);
        let imgPromptRes = await imgPrompterAssistant.chat({
            message: prompt,
        });
        
        // check if response is the expected
        if(imgPromptRes.includes("sorry" || "Sorry")){
            console.log(imgPromptRes)
            throw new Error("Prompt not accepted by AI");
        }
        
        let generatedImg = await imgPrompterAssistant.generateImage({ prompt: imgPromptRes, imgUrl });
        let result = {
            prompt: imgPromptRes,
            referenceImgUrl: imgUrl,
            generatedImgUrl: generatedImg.image.url
        }

        console.log("img gen response: ", result)
        return res.json(result);
    } catch (err) {
        console.log("❌");
        console.log("Generate Image error:", err);
        return res.status(500).json({ error: err });
    }
}



module.exports = generateImage;