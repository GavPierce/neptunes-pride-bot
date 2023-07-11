const axios = require("axios");
const qs = require("qs");
const Fleet = require("./Fleet");
const Star = require("./Star");

class Game {
  constructor(gameId, apiKey, playerId, playerAlias, discordID) {
    this.gameId = gameId;
    this.apiKey = apiKey;
    this.playerId = playerId;
    this.playerAlias = playerAlias;
    this.discordID = discordID;
    this.alertedAttacks = new Set();
    this.stars = {};
    this.fleets = {};
  }

  async update() {
    const response = await axios.post(
      "https://np.ironhelmet.com/api",
      qs.stringify({
        game_number: this.gameId,
        code: this.apiKey,
        api_version: "0.1",
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    const data = response.data;

    for (const starId in data.scanning_data.stars) {
      const starData = data.scanning_data.stars[starId];
      this.stars[starId] = new Star(starData);
    }

    for (const fleetId in data.scanning_data.fleets) {
      const fleetData = data.scanning_data.fleets[fleetId];
      this.fleets[fleetId] = new Fleet(fleetData);
    }
  }

  checkForAttacks() {
    const attacks = [];

    for (const fleetId in this.fleets) {
      const fleet = this.fleets[fleetId];

      if (fleet.puid !== this.playerId) {
        for (const order of fleet.o) {
          const targetStarId = order[1];

          if (
            targetStarId in this.stars &&
            this.stars[targetStarId].puid === this.playerId
          ) {
            attacks.push({
              starName: this.stars[targetStarId].n,
              ships: fleet.st,
              attackId: fleetId,
              //eta: fleet.getEta(this.stars[targetStarId]),
            });
          }
        }
      }
    }

    return attacks;
  }
}

module.exports = Game;
