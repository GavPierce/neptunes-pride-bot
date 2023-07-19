const axios = require("axios");
const qs = require("qs");
const Fleet = require("./Fleet");
const Star = require("./Star");
const Player = require("./Player");

class Game {
  constructor(
    gameId,
    apiKey,
    playerId,
    playerAlias,
    discordID,
    discordChannel,
    playerImg,
    playerColor
  ) {
    this.gameId = gameId;
    this.apiKey = apiKey;
    this.playerId = playerId;
    this.playerAlias = playerAlias;
    this.discordID = discordID;
    this.discordChannel = discordChannel;
    this.playerImg = playerImg;
    this.playerColor = playerColor;
    this.alertedAttacks = new Set();
    this.stars = {};
    this.fleets = {};
    this.players = {};
  }

  async update() {
    try {
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

      

      for (const fleetId in data.scanning_data.fleets) {
        const fleetData = data.scanning_data.fleets[fleetId];
        fleetData.fleetSpeed = data.scanning_data.fleet_speed;

        this.fleets[fleetId] = new Fleet(fleetData);
      }
    for (const starId in data.scanning_data.stars) {
        const starData = data.scanning_data.stars[starId];
        this.stars[starId] = new Star(starData);
//set stars total ships. 
this.stars[starId].calcTotalShips(this.fleets);
      }
      for (const playerId in data.scanning_data.players) {
        const playerData = data.scanning_data.players[playerId];
        this.players[playerId] = new Player(playerData);
      }
    } catch (error) {
      console.log("Error get API data", error);
    }
  }

  checkForAttacks() {
    const attacks = [];

    for (const fleetId in this.fleets) {
      const fleet = this.fleets[fleetId];

      if (fleet.puid !== this.playerId) {
        for (const order of fleet.o) {
          const targetStarId = order[1];
          const starOwner = this.stars[targetStarId].puid;

          if (
            targetStarId in this.stars &&
            this.stars[targetStarId].puid === this.playerId
          ) {
            attacks.push({
              starName: this.stars[targetStarId].n,
              ships: fleet.st,
              attackId: fleetId,
              attackerAlias: this.players[fleet.puid].alias,
              attackerAvatar: `https://np.ironhelmet.com/images/avatars/160/${
                this.players[fleet.puid].avatar
              }.jpg`,
              attackerWeapons: this.players[fleet.puid].tech.weapons.level,
              attackShips: this.players[fleet.puid].total_strength,
              defenderAlias: this.players[starOwner].alias,
              defenderAvatar: `https://np.ironhelmet.com/images/avatars/160/${this.players[starOwner].avatar}.jpg`,
              defenderWeapons: this.players[starOwner].tech.weapons.level,
              defenderShips: this.players[starOwner].total_strength,
              eta: fleet.getEta(this.stars[targetStarId]),
            });
          }
        }
      }
    }

    return attacks;
  }

  checkForOutgoingAttacks() {
    const attacks = [];

    for (const fleetId in this.fleets) {
      const fleet = this.fleets[fleetId];

      if (fleet.puid === this.playerId) {
        for (const order of fleet.o) {
          const targetStarId = order[1];

          const starOwner = this.stars[targetStarId].puid;

          if (
            targetStarId in this.stars &&
            this.stars[targetStarId].puid !== this.playerId
          ) {
            attacks.push({
              starName: this.stars[targetStarId].n,
              ships: fleet.st,
              attackId: fleetId,
              attackerAlias: this.players[fleet.puid].alias,
              attackerAvatar: `https://np.ironhelmet.com/images/avatars/160/${
                this.players[fleet.puid].avatar
              }.jpg`,
              attackerWeapons: this.players[fleet.puid].tech.weapons.level,
              attackShips: this.players[fleet.puid].total_strength,
              defenderAlias: this.players[starOwner].alias,
              defenderAvatar: `https://np.ironhelmet.com/images/avatars/160/${this.players[starOwner].avatar}.jpg`,
              defenderWeapons: this.players[starOwner].tech.weapons.level,
              defenderShips: this.players[starOwner].total_strength,
              eta: fleet.getEta(this.stars[targetStarId]),
            });
          }
        }
      }
    }

    return attacks;
  }
}

module.exports = Game;
