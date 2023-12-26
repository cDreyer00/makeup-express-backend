const OpenAI = require('openai');
const imgGenerator = require('./AIImgGen');

class Assistant {
    constructor(apiKey) {
        this.openai = new OpenAI({ apiKey: apiKey });
        this.instructionPrompt = undefined;
        this.messages = [];

        this.models = {
            gpt4: "gpt-4",
            gpt4Vision: "gpt-4-vision-preview",
            dallE: "dall-e-3",
        }
    }

    setInstruction(instruction) {
        this.instructionPrompt = instruction;
        let firstMessage = this.messages[0];
        if (firstMessage && firstMessage.role === "system") {
            this.messages[0] = {
                role: "system",
                content: instruction,
            };
        }
        else {
            this.messages.unshift({
                role: "system",
                content: instruction,
            });
        }
    }

    IsImgUrl(img) {
        if (!img) return false;
        return (img.match(/\.(jpeg|jpg|gif|png)$/) != null);
    }

    async chat(message, img = undefined) {

        if (this.makingRequest) return false;
        this.makingRequest = true;

        try {
            let msg = {
                role: 'user',
                content: [{ type: "text", text: message }]
            }

            if (img) {
                if (this.IsImgUrl(img))
                    msg.content.push({ type: "image_url", image_url: img });
                else
                    msg.content.push({ type: "image", image: img });
            }

            this.messages.push(msg);

            const completionRes = await this.openai.chat.completions.create({
                model: this.models.gpt4Vision,
                messages: this.messages,
                max_tokens: 400,
            });

            const response = completionRes.choices[0].message;
            this.messages.push(response);

            this.makingRequest = false;
            return { response, messages: this.messages };
        } catch (err) {
            this.makingRequest = false;
            console.log(err);
        }
    }

    async generateImage(prompt, img = undefined) {
        // const response = await this.openai.images.generate({
        //     model: this.models.dallE,
        //     prompt: prompt,
        //     n: 1,
        //     size: "1024x1024",
        // });
        // let image_url = response.data[0].url;
        // return image_url;
        return await imgGenerator.generate(prompt, img);
    }
}

module.exports = Assistant;