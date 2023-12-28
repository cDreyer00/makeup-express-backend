require('dotenv').config();
const fal = require("@fal-ai/serverless-client");
const axios = require("axios");

const falApiKey = process.env.FALAI_KEY;

async function generate({ prompt, imgUrl }) {
    try {
        const res = await axios({
            method: 'post',
            url: 'https://110602490-ip-adapter-face-id.gateway.alpha.fal.ai/',
            headers: {
                Authorization: `Key ${falApiKey}`,
                'Content-Type': 'application/json'
            },
            data: {
                prompt,
                face_image_url: imgUrl,
                seed: 1,
                num_inference_steps: 100,
                negative_prompt: "blurry, low resolution, bad, ugly, low quality, pixelated, interpolated, compression artifacts, noisey, grainy, multiple people, multiple faces"
            }
        })

        return res.data;
    }
    catch (err) {
        throw err;
    }
}

module.exports = { generate };