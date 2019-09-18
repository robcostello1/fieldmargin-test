/**
 * TODO currently not accounting for quantity of bags in crates.
 */

function Application(feederPosition, robotStartPosition) {
  // Let's assume the feeder location stays put for each instance of the app and
  // the robot can't be moved apart from via the commands so both make sense to
  // add as initial properties. The crates have the potential to be added, moved
  // or removed I'll create a "stub" method. Also, we want to allow new streams
  // of instructions, so that'll be a method too.

  const possibleDirections = {
    N: [0, 1],
    S: [0, -1],
    E: [1, 0],
    W: [-1, 0]
  }
  const robotStatus = {
    good: 'still functioning',
    bad: 'short circuited',
  }

  // Gathered here so we can easily return this later (laziness)
  this.status = {
    bags: 0,
    // What if there could be more robots? New Robot prototype?
    robotPosition: robotStartPosition,
    robotHealth: robotStatus.good,
  }
  this.robotBags = 0;
  this.crates = [];

  this.inputCommand = str => {
    // I think a for loop is generally quickest, but realistically we could
    // probably use map or whatever here.
    for (var i = 0; i < str.length; i++) {
      if (this.robotResponding()) {
        this.status.robotPosition = this.incrementRobotPosition(str.charAt(i));
        this.bagActions(str.charAt(i));
      }
    }
    // For chaining
    return this;
  }
  this.getStatus = () => this.status;
  // We're only adding crates once currently, so this is straightforward. Other-
  // wise we'd need to check for existing etc.
  this.addCrates = positions => {
    this.crates = positions;
    // Return the object so we can chain methods
    return this;
  }
  // TODO remove crates etc.
  // ...

  // TODO test
  this.robotResponding = () => this.status.robotHealth === robotStatus.good;
  this.getRobotBags = () => this.robotBags;
  this.setRobotBags = num => {
    this.robotBags = num;
    return this;
  }
  this.robotAtCrate = () => !!this.crates.filter(position =>
    isSameLocation(position, this.status.robotPosition)
  ).length;
  this.robotAtFeeder = () =>
    isSameLocation(feederPosition, this.status.robotPosition)
  // TODO test.
  // TODO If there were limits to the area the robot can move, we'd need to
  // check here.
  this.incrementRobotPosition = direction => {
    // Lets account non-command characters
    if (possibleDirections[direction]) {
      return possibleDirections[direction]
        .map((p, i) => this.status.robotPosition[i] + p)
    }
    return this.status.robotPosition
  }
  this.bagActions = command => {
    switch (command) {
      // pick up
      case 'P':
        if (this.robotAtCrate()) {
          if (crateHasBag()) {
            pickUpBag();
          }
        }
        else {
          // If the robot tries to retrieve a bag from a position where a crate
          // doesn’t reside, it falls over and short­circuits.
          setRobotHealth(false);
        }
        break;
      // drop
      case 'D':
        if (this.robotAtFeeder()) {
          if (this.getRobotBags()) {
            dropBagOnFeeder();
          }
        }
        else {
          // If the robot tries to retrieve a bag from a position where a crate
          // doesn’t reside, it falls over and short­circuits.
          setRobotHealth(false);
        }
        break;
      // default: do nothing
    }
  }

  // Private functions
  const isSameLocation = (a, b) =>
    a[0] === b[0]
    && a[1] === b[1];
  const setRobotHealth = status => {
    this.status.robotHealth = status ? robotStatus.good : robotStatus.bad;
  }
  // TODO assuming infinite bags in crates
  const crateHasBag = crate => true;
  // TODO remove bag from crate
  // Assumes at crate as we're testing for that in bagActions()
  const pickUpBag = crate => {
    this.robotBags++;
  }
  // Assumes at feeder as we're testing for that in bagActions()
  const dropBagOnFeeder = () => {
    this.robotBags--;
    this.status.bags++;
  }
}

module.exports = Application;
