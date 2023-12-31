const assistants = require('../services/assistants');
const imgUploader = require('../services/imageUploader');
const apiKey = process.env.OPENAI_KEY;

async function generateImage(req, res) {
    try {
        let img = req.file.buffer.toString('base64');
        let imgUrl = await imgUploader.submit({ img });

        let aditionalPrompt = req.body.prompt;
        let prompt;

        if (aditionalPrompt)
            prompt = "create a prompt to generate a person that looks like the one in the picture, following these aditional requests:\n" + aditionalPrompt;
        else
            prompt = "create a prompt to generate a person that looks like the one in the picture";

        
        const imgPrompterAssistant = assistants.createImgGenPrompter(apiKey);
        let imgPrompt = await imgPrompterAssistant.chat({
            message: prompt,
            img: imgUrl
        });

        let generatedImg = await imgPrompterAssistant.generateImage({ prompt: imgPrompt.content, imgUrl });

        let result = {
            prompt: imgPrompt.content,
            referenceImg: imgUrl,
            generatedImg
        }

        return res.json(result);
    } catch (err) {
        console.log("❌");
        return res.status(500).json({ error: err });
    }
}

module.exports = generateImage;