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

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const channel = message.channel;
  if (message.content.includes("Deep Thought")) {
    message.channel.sendTyping();
    try {
      const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: `Pretend to be Deep Thought from Hitchhiker's Guide to the Galaxy. ${message.content}`,
          },
        ],
      });
      channel.send(completion.data.choices[0].message);
    } catch (error) {
      console.log("Error with CHATGPT", error);
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
