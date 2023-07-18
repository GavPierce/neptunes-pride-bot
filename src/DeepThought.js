const { Client, Events, GatewayIntentBits } = require("discord.js");
const discordAlert = require("../discordMessages");
const schedule = require("node-schedule");

class DeepThought {
  constructor(players, openAI) {
    this.players = players;
    console.log("players", players.length, this.players.length);
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

  async init() {
    this.discordClient.login(process.env.CLIENT_TOKEN); // login bot using our discord bot token
    console.log("init, ", this.players.length);
    await this.eventHandlers();
  }
  async eventHandlers() {
    // watch for when it logins
    console.log("event, ", this.players.length);

    this.discordClient.once(Events.ClientReady, (c) => {
      console.log(this.players.length);
      console.log(
        `Logged in as ${this.discordClient.user.tag}! on ${this.discordClient.guilds.cache.size} servers`
      );
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
            parameters: {
              type: "object",
              properties: {},
            },
          },
        ];

        this.memory.push({ role: "user", content: message.content });

        try {
          let response = await this.openAI.createChatCompletion({
            model: "gpt-3.5-turbo-0613",
            messages: this.memory,
            functions: functions,
            // function_call: "auto",
          });

          // basically here we've sent a message to chatgpt and it has responded with if it thinks we should call a function
          let responseMessage = response.data.choices[0].message;
          let finishReason = response.data.choices[0].finish_reason;

          if (responseMessage.content) {
            message.channel.send(responseMessage.content);
          }

          if (finishReason === "function_call") {
            let availableFunctions = {
              checkForAttacks: this.checkForAttacks,
            };
            const fnName = responseMessage.function_call.name;
            const functionToCall = availableFunctions[fnName];

            functionToCall();
          }
        } catch (error) {
          console.log("Error", error.message);
        }
      }
    });
  }
  checkForAttacks() {
    // console log the players array length
    console.log(this.players.length);
    // for (const player of this.players) {
    //   const channel = this.discordClient.channels.cache.get(
    //     player.discordChannel
    //   );

    //   await player.update();
    //   const attacks = player.checkForAttacks();

    //   for (const attack of attacks) {
    //     if (player.alertedAttacks.has(attack.attackId)) continue;

    //     //channel.send(`<@${game.discordID}>`);
    //     channel.send({ embeds: [discordAlert.attackMessage(attack, player)] });
    //     player.alertedAttacks.add(attack.attackId);
    //   }
    // }
  }
}
module.exports = DeepThought;
