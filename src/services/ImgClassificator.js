const Replicate = require('replicate');
const replicate = new Replicate();
// const token = process.env.REPLICATE_TOKEN;

const model = "salesforce/blip:2e1dddc8621f72155f24cf2e0adbde548458d3cab9f00c0139eea840d0ac4746";

async function run(imgUrl) {
   let genderPromise = getGender(imgUrl);
   let skinColorPromise = getSkinColor(imgUrl);

   let results = await Promise.all([genderPromise, skinColorPromise]);
   return results;
}

async function getGender(imgUrl) {
   const question = `what the gender person in the image?`;

   const input = {
      "image": imgUrl,
      "task": "visual_question_answering",
      "question": question,
   };

   try {
      let result = await replicate.run(model, { input })
      result = result.replace("Answer:", "").trim();
      return result;
   }
   catch (err) {
      return false;
   }
}

async function getSkinColor(imgUrl) {
   const question = `skin color of the person in the image?`;

   const input = {
      "image": imgUrl,
      "task": "visual_question_answering",
      "question": question,
   };

   try {
      let result = await replicate.run(model, { input })
      result = result.replace("Answer:", "").trim();
      return result;
   }
   catch (err) {
      return false;
   }
}

// run("https://i.ibb.co/NWNkLMG/64bfa5e47ece.jpg")
//    .then(console.log)
//    .catch(console.error);

module.exports = run;
