const Assistant = require('./Assistant');

async function translate(message) {
   const apiKey = process.env.OPENAI_KEY;
   const configs = {
      instruction: 'translate every message to english',
      messages: [
         {
            role: 'user',
            content: [
               {
                  type: "text",
                  text: "festa casual"
               }
            ]
         },
         {
            role: 'assistant',
            content: [
               {
                  type: "text",
                  text: "casual party"
               }
            ]
         },
         {
            role: 'user',
            content: [
               {
                  type: "text",
                  text: "rock party"
               }
            ]
         },
         {
            role: 'assistant',
            content: [
               {
                  type: "text",
                  text: "rock party"
               }
            ]
         }
      ],
      model: 'gpt-4',
      max_tokens: 400,
   }

   const assistant = new Assistant(apiKey, configs);

   const response = await assistant.chat({ message });
   return response;
}

module.exports = translate;