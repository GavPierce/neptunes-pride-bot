class Fleet {
  constructor(data) {
    // Assign all fields from `data` to `this`
    Object.assign(this, data);
  }

  getEta(targetStar) {
    // Calculate the distance between the fleet coordinates, x y, and the target star coordinates, x y
    const distance = Math.sqrt(
      Math.pow(this.x - targetStar.x, 2) + Math.pow(this.y - targetStar.y, 2)
    );

    // Return the distance divided by the fleet speed but converted to minutes and hours

    return `${Math.floor(distance / this.fleetSpeed)}h ${Math.floor(
      distance / this.fleetSpeed / 60
    )}m `;
  }
}
module.exports = Fleet;
