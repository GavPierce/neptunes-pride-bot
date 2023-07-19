class Star {
  constructor(data) {
    // Assign all fields from `data` to `this`
    Object.assign(this, data);
    this.totalShips = 0;
  }
 
  calcTotalShips(fleets) {
    let totalShips = this.st;
    for (let fleet of fleets){
      if (fleets[fleet].x === this.x 
          && fleets[fleet].y == this.y) {
           totalShips += fleets[fleet].st;
         }
    }
    this.totalShips = totalShips;

  }
}

module.exports = Star;
