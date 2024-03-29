require('dotenv').config();
const axios = require('axios');

const key = process.env.IMGBB_KEY;

async function submit({img, expiration = 3600}) {
    try {
        let formData = new FormData();
        formData.append('image', img);

        let response = await axios({
            method: 'post',
            url: `https://api.imgbb.com/1/upload?expiration=${expiration}&key=${key}`,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: formData
        });

        return response.data.data.url;
    }
    catch (err) {
        throw err.response.data.error;
    }
}

module.exports = { submit };