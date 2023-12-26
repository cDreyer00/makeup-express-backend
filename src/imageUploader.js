require('dotenv').config();
const axios = require('axios');

const key = process.env.IMGBB_KEY;

//curl --location --request POST "https://api.imgbb.com/1/upload?expiration=600&key=YOUR_CLIENT_API_KEY" --form "image=R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"

async function submit(img, expiration = 3600) {
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
        throw err;
    }
}

// function test() {
//     const fs = require('fs');
//     const path = require('path');

//     let img = fs.readFileSync(path.join(__dirname, '..', 'public', 'img', 'eu.png'));
//     submit(img.toString('base64'))
//         .then((res) => console.log(res))
//         .catch((err) => console.log(err));
// }

// test();

module.exports = { submit };