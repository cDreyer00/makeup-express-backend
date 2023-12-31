require('dotenv').config();

const Assistant = require('./Assistant');
const assistant = new Assistant(process.env.OPENAI_KEY);
const fs = require('fs');
const path = require('path');

const imgPath = path.join(__dirname, '..', 'public', 'img', 'Screenshot 2023-12-29 215548.png');

const RunTest = async () => {
    let img = fs.readFileSync(imgPath);
    img = img.toString('base64');

    let prompt = `
        encaminhei uma imagem de uma screenshot de um botão que desenvolvi em nextjs com tailwind, ele serve pra fazer submissão de arquivos, porem quando eu coloquei o tipo file ele ficou com um design indesejado apesar de o código indicar que o desing não é assim, como arrumar?
        aqui esta o código:

        <input className='
        transition-all duration-200
        absolute top-1/2 left-1/4 -translate-y-1/2
        h-28 w-56 bg-secondary 
        outline outline-black outline-1 rounded-button
        text-black text-center

        hover:h-32 hover:w-60
        '
        value={'Click Here'}
        type='file'
        accept='image/*'
        onClick={onClick}
      />
    `

    let request = { img, message: prompt };
    return await assistant.chat(request);
}

RunTest()
    .then((res) => console.log(res.content))
    .catch((err) => console.log(err));