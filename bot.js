const { Client, Events, GatewayIntentBits } = require("discord.js");
const Game = require("./src/Game");
require("dotenv").config();
const schedule = require("node-schedule");

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const playerConfigs = JSON.parse(process.env.PLAYER_CONFIGS);

const games = playerConfigs.map(
  (config) =>
    new Game(
      config.gameId,
      config.apiKey,
      config.playerId,
      config.playerAlias,
      config.discordID
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
        //const channel = client.channels.cache.get("CHANNEL_ID");
        if (game.alertedAttacks.has(attack.attackId)) continue;

        channel.send(
          `(<@${game.discordID}>) ${game.playerAlias}'s star ${attack.starName} is under attack by ${attack.ships} ships.`
        );
        game.alertedAttacks.add(attack.attackId);
      }
    }
  };
  checkAllForAttacks();

  const job = schedule.scheduleJob("44 * * * *", function () {
    checkAllForAttacks();
  });
});
