// at the top of your file
const { EmbedBuilder } = require("discord.js");

// inside a command, event listener, etc.
const discordAlerts = {
  attackMessage: (attackData, playerData) => {
    const attackMessage = {
      color: parseInt(playerData.playerColor),
      title: "Attack Incoming!",
      url: "https://np.ironhelmet.com/game/5669830163955712",
      description: `Your Star ${attackData.starName} is under attack! ${attack data.defenderStarShips} ships on star`,
      thumbnail: {
        url: attackData.defenderAvatar,
      },
      fields: [
        {
          name: "Attack Information",
          value: `${attackData.ships} ships. ETA: ${attackData.eta}`,
        },
        {
          name: `Attacker: ${attackData.attackerAlias}`,
          value: `Weapons Level: ${attackData.attackerWeapons}`,
          inline: true,
        },
        {
          name: `VS`,
          value: "",
          inline: true,
        },
        {
          name: `Defender: ${attackData.defenderAlias}`,
          value: `Weapons Level: ${attackData.defenderWeapons}`,
          inline: true,
        },
      ],
      image: {
        url: attackData.attackerAvatar,
      },
    };

    return attackMessage;
  },

  outGoingAttackMessage: (attackData, playerData) => {
    const attackMessage = {
      color: parseInt(playerData.playerColor),
      title: "Attack Outgoing!",
      url: "https://np.ironhelmet.com/game/5669830163955712",
      description: `Enemy Star ${attackData.starName} is under attack!`,
      thumbnail: {
        url: attackData.defenderAvatar,
      },
      fields: [
        {
          name: "Attack Information",
          value: `${attackData.ships} ships. ETA: ${attackData.eta}`,
        },
        {
          name: `Attacker: ${attackData.attackerAlias}`,
          value: `Weapons Level: ${attackData.attackerWeapons}`,
          inline: true,
        },
        {
          name: `VS`,
          value: "",
          inline: true,
        },
        {
          name: `Defender: ${attackData.defenderAlias}`,
          value: `Weapons Level: ${attackData.defenderWeapons}`,
          inline: true,
        },
      ],
      image: {
        url: attackData.attackerAvatar,
      },
    };

    return attackMessage;
  },
};

module.exports = discordAlerts;
