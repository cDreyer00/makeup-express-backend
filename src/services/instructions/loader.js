const fs = require('fs');
const path = require('path');

async function loadInstructions(title = undefined) {
   const files = await fs.promises.readdir(__dirname, { withFileTypes: true });
   const instructionsTitle = files.filter(file => file.isDirectory()).map(file => file.name);

   if (title) {
      if (!instructionsTitle.includes(title)) {
         throw new Error(`Instruction ${title} not found`);
      }

      let system = await getSystem(title);
      let messages = await getMessages(title);

      return {
         system,
         messages
      };
   }

   let instructions = []
   for (let title of instructionsTitle) {
      let system = await getSystem(title);
      let messages = await getMessages(title);
      instructions.push({
         title,
         system,
         messages
      });
   }

   return instructions;
}

async function getSystem(instructionTitle) {
   let sPath = path.join(__dirname, instructionTitle, '_system.txt');
   let system = await fs.promises.readFile(sPath);
   return system.toString('utf-8');
}

/*
*   @returns {request: string, response: string} - The message of the instruction
*/
async function getMessages(instruction) {

   let messagesFiles = await fs.promises.readdir(path.join(__dirname, instruction));

   messagesFiles = messagesFiles.filter(file => !file.includes('system') && file[0] != '-' && file.includes('.txt'));

   let messages = []
   for (let file of messagesFiles) {
      let message = await fs.promises.readFile(path.join(__dirname, instruction, file));
      message = message.toString();
      console.log(message);
      message = splitMessage(message);
      if (!message) {
         throw new Error(`Instruction message from ${instruction}/${file} is not valid`);
      }

      messages.push(message);
   }

   return messages;
}

function splitMessage(message) {
   let request = message.split('[request]\r\n');
   if (!request || request.length < 2) return false;
   request = request[1].split('\r\n[response]')[0];

   let response = message.split('[response]\r\n');
   if (!response || response.length < 2) return false;
   response = response[1];

   return { request, response };
}

module.exports = loadInstructions;