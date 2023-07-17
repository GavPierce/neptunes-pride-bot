const { Client, Events, GatewayIntentBits } = require("discord.js");
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: process.env.CHATGPT_KEY,
});
const openai = new OpenAIApi(configuration);

const Game = require("./src/Game");
require("dotenv").config();
const schedule = require("node-schedule");

const client = new Client({
  intents: [
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildBans,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});
const playerConfigs = require("./players.json");

const discordAlert = require("./discordMessages");

const games = playerConfigs.map(
  (config) =>
    new Game(
      config.gameId,
      config.apiKey,
      config.playerId,
      config.playerAlias,
      config.discordID,
      config.playerImg,
      config.playerColor
    )
);
client.login(process.env.CLIENT_TOKEN); //login bot using token

client.once(Events.ClientReady, (c) => {
  console.log(`Logged in as ${client.user.tag}!`);
  const channel = client.channels.cache.get("1128142925298151505");

  const checkAllForAttacks = async () => {
    for (const game of games) {
      await game.update();
      const attacks = game.checkForAttacks();

      for (const attack of attacks) {
        console.log("Attack Found");

        if (game.alertedAttacks.has(attack.attackId)) continue;

        console.log("Sending Attack Message");

        channel.send(`<@${game.discordID}>`);
        channel.send({ embeds: [discordAlert.attackMessage(attack, game)] });
        game.alertedAttacks.add(attack.attackId);
        console.log("Messages Sent this session:", game.alertedAttacks.size);
      }
    }
  };

  const job = schedule.scheduleJob("* * * * *", function () {
    checkAllForAttacks();
  });
});
// keep track of memory for the last 10 messages from user and add it to chat gpt context
const chatGPTContext = [];

client.on("messageCreate", async (message) => {
  if (message.author.bot) {
    let botContext = {
      role: "assistant",
      content: message.content,
    };
    chatGPTContext.push(botContext);
    return;
  }

  const channel = message.channel;
  if (message.content.includes("Deep Thought")) {
    message.channel.sendTyping();
    try {
      // add the last 10 messages to the context
      let userContext = {
        role: "user",
        content: message.content,
      };
      chatGPTContext.push(userContext);

      if (chatGPTContext.length > 10) {
        chatGPTContext.shift();
      }
      const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `Keep it short. Pretend to be Deep Thought from Hitchhiker's Guide to the Galaxy. Be slightly condescending.`,
          },
          ...chatGPTContext,
        ],
      });

      // make sure the message is less then 2000 characters and if it is more split it into multiple messages
      if (completion.data.choices[0].message.length > 2000) {
        const messages =
          completion.data.choices[0].message.match(/[\s\S]{1,2000}/g);
        for (const message of messages) {
          channel.send(message);
        }
      } else {
        channel.send(completion.data.choices[0].message);
      }
    } catch (error) {
      console.log("Error with CHATGPT", error);
    }
  }

  if (message.content.startsWith("!report")) {
    const discordID = message.content
      .replace("!report", "")
      .replace("<@", "")
      .replace(">", "")
      .trim();
    const game = games.find((game) => game.discordID === discordID);
    channel.sendTyping();

    if (!game) {
      channel.send("No user found for that name");
      return;
    } else {
      // convert this game instance to JSON
      let stars = game.stars;
      // filter the Object stars to only the ones that have the puid matches the game.playerId
      let filteredStars = Object.keys(stars)
        .filter((key) => stars[key].puid === game.playerId)
        .reduce((obj, key) => {
          obj[key] = stars[key];
          return obj;
        }, {});

      // convert the visableStars to JSON
      visableStars = JSON.stringify(filteredStars);
      // make sure the gameJSON is less then 2000 characters and if it is more split it into multiple messages
      if (visableStars.length > 5000) {
        channel.send(
          "The report info for this player is too big my by computer mind." +
            visableStars.length
        );
        return;
      }
      const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `Keep it short. Pretend to be Deep Thought from Hitchhiker's Guide to the Galaxy. Be slightly condescending. `,
          },
          {
            role: "user",
            content: `Here is a JSON of all the Stars owned by the player ${game.playerAlias}. Listing in bullet points all the stars they own and their levels, including their ship strength. Give the stars an emoji ranking depending on total value. Value is derived from the sum of Science, Industry and Economy. List them highest to lowest. Give the highest a diamond emoji and the lowest a poop emoji. e means the level of economy on the star. i is industry. st is ships on the star. and s is the level of science. ${visableStars} `,
          },
        ],
      });

      let chatGPTMessage = completion.data.choices[0].message.content;

      console.log(typeof chatGPTMessage, chatGPTMessage.length);

      if (chatGPTMessage.length > 1800) {
        let chunkedMessage = splitString(chatGPTMessage);
        chunkedMessage.forEach((chunk) => {
          console.log(chunk.length);
          channel.send(chunk);
        });
      } else {
        console.log("Not greater then 1800");
        channel.send(chatGPTMessage);
      }
    }
  }
  if (message.content.startsWith("!outgoing")) {
    channel.send(`Ok I am getting all of our outgoing attacks!`);
    for (const game of games) {
      await game.update();
      const outGoingAttacks = game.checkForOutgoingAttacks();

      for (const attack of outGoingAttacks) {
        console.log("Outgoing Attack Found");

        if (game.alertedAttacks.has(attack.attackId)) continue;

        console.log("Sending Outgoing Attack Message");

        channel.send({
          embeds: [discordAlert.outGoingAttackMessage(attack, game)],
        });
        game.alertedAttacks.add(attack.attackId);
        console.log("Messages Sent this session:", game.alertedAttacks.size);
      }
    }
  }
});
function splitString(string) {
  const chunks = [];

  if (string.length > 1900) {
    let start = 0;

    while (start < string.length) {
      chunks.push(string.substring(start, start + 1900));
      start += 1900;
    }
  } else {
    chunks.push(string);
  }

  return chunks;
}
