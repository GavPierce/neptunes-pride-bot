// at the top of your file
const { EmbedBuilder } = require("discord.js");

// inside a command, event listener, etc.
function discordAlert(attackData, playerData) {
  const attackMessage = {
    color: parseInt(playerData.playerColor),
    title: "Attack Incoming!",
    url: "https://np.ironhelmet.com/game/5669830163955712",
    description: `Your Star ${attackData.starName} is under attack!`,
    thumbnail: {
      url: playerData.playerImg,
    },
    fields: [
      {
        name: "Attack Information",
        value: `${attackData.ships} ships.`,
      },
      {
        name: `Attacker: ${attackData.attackerAlias}`,
        value: `Weapons Level: ${attackData.attackerWeapons}`,
        inline: true,
      },
      {
        name: `Defender: ${playerData.playerAlias}`,
        value: `Weapons Level: ${attackData.defenderWeapons}`,
        inline: true,
      },
    ],
  };

  return attackMessage;
}

module.exports = discordAlert;
