const Replicate = require('replicate');
const replicate = new Replicate();
// const token = process.env.REPLICATE_TOKEN;

const skins = [
   "white",
   "tan",
   "brown",
   "black"
]

const question = `between ${skins.join(", ")}, what is the skin color of the person in the picture? answer should be only the option.`;
const model = "salesforce/blip:2e1dddc8621f72155f24cf2e0adbde548458d3cab9f00c0139eea840d0ac4746";

async function run(imgUrl) {
   const input = {
      "image": imgUrl,
      "task": "visual_question_answering",
      "question": question,
   };

   try {
      let result = await replicate.run(model, { input })
      return result;
   }
   catch (err) {
      return err;
   }
}

module.exports = run;
