const { Client, Events, GatewayIntentBits } = require("discord.js");
const discordAlert = require("../discordMessages");
const schedule = require("node-schedule");

class DeepThought {
  constructor(players, openAI) {
    this.players = players;
    this.openAI = openAI;
    this.discordClient = new Client({
      intents: [
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildBans,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
    });
    this.memory = [
      {
        role: "system",
        content:
          "You are Deep Thought. You are assisting players in the game Neptune's Pride. You are slightly condescending.",
      },
    ];
  }

  init() {
    this.discordClient.login(process.env.CLIENT_TOKEN); // login bot using our discord bot token

    this.eventHandlers();
  }
  eventHandlers() {
    // watch for when it logins
    this.discordClient.once(Events.ClientReady, (c) => {
      console.log(
        `Logged in as ${this.discordClient.user.tag}! on ${this.discordClient.guilds.cache.size} servers`
      );

      // schedule a job to run every 5 minutes looking for attacks
      //   schedule.scheduleJob("*/5 * * * *", async () => {
      //     await this.checkForAttacks();
      //   });
    });

    //watch for when a message is sent
    this.discordClient.on(Events.MessageCreate, async (message) => {
      if (message.author.bot) {
        let botContext = {
          role: "assistant",
          content: message.content,
        };
        this.memory.push(botContext);
        return;
      }

      if (message.content.includes("Deep Thought")) {
        message.channel.sendTyping();
        // how crazy is this, we can now define functions we want chatgpt to call
        let functions = [
          {
            name: "checkForAttacks",
            description: "Check for all incoming attacks",
          },
        ];

        this.memory.push({ role: "user", content: message.content });

        let response = await this.openAI.ChatCompletion.create({
          model: "gpt-3.5-turbo",
          messages: this.memory,
          functions: functions,
          function_call: "auto",
        });

        // basically here we've sent a message to chatgpt and it has responded with if it thinks we should call a function
        let responseMessage = response["choices"][0]["message"];

        message.channel.send(responseMessage);

        if (responseMessage["function_call"]) {
          let availableFunctions = {
            checkForAttacks: this.checkForAttacks(),
          };

          let functionName = responseMessage["function_call"]["name"];
          availableFunctions[functionName];
        }
      }
    });
  }
  async checkForAttacks() {
    for (const game of this.games) {
      const channel = this.discordClient.channels.cache.get(
        game.discordChannel
      );

      await game.update();
      const attacks = game.checkForAttacks();

      for (const attack of attacks) {
        if (game.alertedAttacks.has(attack.attackId)) continue;

        //channel.send(`<@${game.discordID}>`);
        channel.send({ embeds: [discordAlert.attackMessage(attack, game)] });
        game.alertedAttacks.add(attack.attackId);
      }
    }
  }
}
module.exports = DeepThought;