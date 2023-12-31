const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: process.env.CHATGPT_KEY,
});
const openai = new OpenAIApi(configuration);
const Game = require("./src/Game");
const DeepThought = require("./src/DeepThought");
const playerConfigs = require("./players.json");
require("dotenv").config();

const games = playerConfigs.map(
  (config) =>
    new Game(
      config.gameId,
      config.apiKey,
      config.playerId,
      config.playerAlias,
      config.discordID,
      config.discordChannel,
      config.playerImg,
      config.playerColor
    )
);
async function initializeDeepThought() {
  const deepThought = new DeepThought(games, openai);
  await deepThought.init();
}

initializeDeepThought();
// client.on("messageCreate", async (message) => {

//   const channel = message.channel;
//   if (message.content.includes("Deep Thought")) {
//     message.channel.sendTyping();
//     try {
//       // add the last 10 messages to the context
//       let userContext = {
//         role: "user",
//         content: message.content,
//       };
//       chatGPTContext.push(userContext);

//       if (chatGPTContext.length > 10) {
//         chatGPTContext.shift();
//       }
//       const completion = await openai.createChatCompletion({
//         model: "gpt-3.5-turbo",
//         messages: [
//           {
//             role: "system",
//             content: `Keep it short. Pretend to be Deep Thought from Hitchhiker's Guide to the Galaxy. Be slightly condescending.`,
//           },
//           ...chatGPTContext,
//         ],
//       });

//       // make sure the message is less then 2000 characters and if it is more split it into multiple messages
//       if (completion.data.choices[0].message.length > 2000) {
//         const messages =
//           completion.data.choices[0].message.match(/[\s\S]{1,2000}/g);
//         for (const message of messages) {
//           channel.send(message);
//         }
//       } else {
//         channel.send(completion.data.choices[0].message);
//       }
//     } catch (error) {
//       console.log("Error with CHATGPT", error);
//     }
//   }

//   if (message.content.startsWith("!report")) {
//     const discordID = message.content
//       .replace("!report", "")
//       .replace("<@", "")
//       .replace(">", "")
//       .trim();
//     const game = games.find((game) => game.discordID === discordID);
//     channel.sendTyping();

//     if (!game) {
//       channel.send("No user found for that name");
//       return;
//     } else {
//       // convert this game instance to JSON
//       let stars = game.stars;
//       // filter the Object stars to only the ones that have the puid matches the game.playerId
//       let filteredStars = Object.keys(stars)
//         .filter((key) => stars[key].puid === game.playerId)
//         .reduce((obj, key) => {
//           obj[key] = stars[key];
//           return obj;
//         }, {});

//       // convert the visableStars to JSON
//       visableStars = JSON.stringify(filteredStars);
//       // make sure the gameJSON is less then 2000 characters and if it is more split it into multiple messages
//       if (visableStars.length > 5000) {
//         channel.send(
//           "The report info for this player is too big my by computer mind." +
//             visableStars.length
//         );
//         return;
//       }
//       const completion = await openai.createChatCompletion({
//         model: "gpt-3.5-turbo",
//         messages: [
//           {
//             role: "system",
//             content: `Keep it short. Pretend to be Deep Thought from Hitchhiker's Guide to the Galaxy. Be slightly condescending. `,
//           },
//           {
//             role: "user",
//             content: `Here is a JSON of all the Stars owned by the player ${game.playerAlias}.
//             This is what each star object keys mean: e = economy level. ga = the presence of a warpgate, 0 no gate 1 gate. i = industry level. n = name. st= Ship Count. p = position. r = resources. s = science level. x = x coordinate. y = y coordinate.
//             List each star in a bullet point. List by resources, highest to lowest. And show the resources. Science, economy and industry and ships on each bullet point.
//             If the resources are greater then 50, give diamond emoji. If they are less then 50 and greater then 30 give gold emoji. If they are less then 30 and greater then 15 give wood emoji. If they are less then 15 give poop emoji.  Do not say anything else other then the bullet points. Bold the star name.
//              here is the JSON file. ${visableStars}`,
//           },
//         ],
//       });

//       let chatGPTMessage = completion.data.choices[0].message.content;

//       console.log(typeof chatGPTMessage, chatGPTMessage.length);

//       if (chatGPTMessage.length > 1800) {
//         let chunkedMessage = splitString(chatGPTMessage);
//         chunkedMessage.forEach((chunk) => {
//           console.log(chunk.length);
//           channel.send(chunk);
//         });
//       } else {
//         console.log("Not greater then 1800");
//         channel.send(chatGPTMessage);
//       }
//     }
//   }
//   if (message.content.startsWith("!outgoing")) {
//     channel.send(`Ok I am getting all of our outgoing attacks!`);
//     for (const game of games) {
//       await game.update();
//       const outGoingAttacks = game.checkForOutgoingAttacks();

//       for (const attack of outGoingAttacks) {
//         console.log("Outgoing Attack Found");

//         if (game.alertedAttacks.has(attack.attackId)) continue;

//         console.log("Sending Outgoing Attack Message");

//         channel.send({
//           embeds: [discordAlert.outGoingAttackMessage(attack, game)],
//         });
//         game.alertedAttacks.add(attack.attackId);
//         console.log("Messages Sent this session:", game.alertedAttacks.size);
//       }
//     }
//   }
// });
// function splitString(string) {
//   const chunks = [];

//   if (string.length > 1900) {
//     let start = 0;

//     while (start < string.length) {
//       chunks.push(string.substring(start, start + 1900));
//       start += 1900;
//     }
//   } else {
//     chunks.push(string);
//   }

//   return chunks;
// }
