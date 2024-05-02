const OpenAI = require('openai');
const imgGenerator = require('./AIImgGen');

class Assistant {
    constructor(apiKey, configs = undefined) {
        let { instruction, messages, model, max_tokens, response_format } = configs;

        this.openai = new OpenAI({ apiKey: apiKey });

        this.response_format = response_format;
        this.instruction = instruction;
        this.messages = messages || [];
        this.model = model || models.gpt4Vision;
        this.max_tokens = max_tokens || 400;
    }

    set instructionPrompt(instruction) {
        this.instruction = instruction;
    }

    IsImgUrl(img) {
        if (!img) return false;
        return (img.match(/\.(jpeg|jpg|gif|png)$/) != null);
    }

    async chat({ message = undefined, img = undefined }) {
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
                model: this.model,
                response_format: this.response_format,
                max_tokens: this.max_tokens,
                messages: msgs,
            });

            const response = completionRes.choices[0].message;
            this.messages.push(response);

            this.makingRequest = false;
            return response.content;
        } catch (err) {
            this.makingRequest = false;
            throw err;
        }
    }

    async generateImage({ prompt, imgUrl }) {
        return await imgGenerator.generate({ prompt, imgUrl });
    }
}

const models = {
    gpt4: "gpt-4",
    gpt4Vision: "gpt-4-vision-preview",
    dallE: "dall-e-3",
}

module.exports = Assistant;