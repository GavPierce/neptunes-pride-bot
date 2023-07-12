const { Client, Events, GatewayIntentBits } = require("discord.js");
const Game = require("./src/Game");
require("dotenv").config();
const schedule = require("node-schedule");

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

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
const dummyMessage = {
  color: 16711680,
  title: "Attack Incoming!",
  url: "https://np.ironhelmet.com/game/5669830163955712",
  description: `Your Star Death is under attack!`,
  thumbnail: {
    url: "https://np.ironhelmet.com/images/avatars/160/34.jpg",
  },
  fields: [
    {
      name: "Attack Information",
      value: `9999 ships.`,
    },
    {
      name: `Attacker: Darth Vader`,
      value: `Weapons Level: 99`,
      inline: true,
    },
    {
      name: `Defender: Luke Skywalker`,
      value: `Weapons Level: 0  `,
      inline: true,
    },
  ],
};
client.once(Events.ClientReady, (c) => {
  console.log(`Logged in as ${client.user.tag}!`);
  const channel = client.channels.cache.get("1128142925298151505");
  const checkAllForAttacks = async () => {
    for (const game of games) {
      await game.update();
      const attacks = game.checkForAttacks();

      for (const attack of attacks) {
        console.log("Attack Found");
        //const channel = client.channels.cache.get("CHANNEL_ID");
        if (game.alertedAttacks.has(attack.attackId)) continue;
        console.log("Sending Attack Message");

        channel.send(`<@${game.discordID}>`);
        channel.send({ embeds: [discordAlert(attack, game)] });
        game.alertedAttacks.add(attack.attackId);
        console.log("Messages Sent this session:", game.alertedAttacks.size);
      }
    }
  };
  checkAllForAttacks();
  const job = schedule.scheduleJob("44 * * * *", function () {
    checkAllForAttacks();
  });
});
