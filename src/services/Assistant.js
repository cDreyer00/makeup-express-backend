const OpenAI = require('openai');
const imgGenerator = require('./AIImgGen');

class Assistant {
    constructor(apiKey) {
        this.openai = new OpenAI({ apiKey: apiKey });
        this.instruction = undefined;
        this.messages = [];

        this.models = {
            gpt4: "gpt-4",
            gpt4Vision: "gpt-4-vision-preview",
            dallE: "dall-e-3",
        }
    }

    set instructionPrompt(instruction) {
        this.instruction = instruction;
    }

    IsImgUrl(img) {
        if (!img) return false;
        return (img.match(/\.(jpeg|jpg|gif|png)$/) != null);
    }

    async chat({ message = undefined, img = undefined, max_tokens = 400 }) {

        if (this.makingRequest) return false;
        this.makingRequest = true;

        try {
            let msg = { role: "user", content: [] };

            if (message)
                msg.content.push({ type: "text", text: message });

            if (img) {
                if (this.IsImgUrl(img))
                    msg.content.push({ type: "image_url", image_url: img });
                else
                    msg.content.push({ type: "image", image: img });
            }

            this.messages.push(msg);

            let msgs = this.messages.slice();

            if (this.instruction)
                msgs.unshift({ role: 'system', content: this.instruction });

            const completionRes = await this.openai.chat.completions.create({
                model: this.models.gpt4Vision,
                messages: msgs,
                max_tokens
            });

            const response = completionRes.choices[0].message;
            this.messages.push(response);

            this.makingRequest = false;
            return response;
        } catch (err) {
            this.makingRequest = false;
            throw err;
        }
    }

    async generateImage({ prompt, imgUrl }) {
        return await imgGenerator.generate({ prompt, imgUrl });
    }
}

module.exports = Assistant;