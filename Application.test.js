const expect = require('chai').expect;
const Application = require('./index.js');

describe('Application', () => {
  it('instantiates', () => {
    expect(new Application()).to.be.an('object');
  });

  it('responds with the 0 bags on the feeder, and the initial position and health of the robot as "still functioning"', () => {
    const app = new Application([0, 0], [0, 0]);
    expect(app.getStatus()).to.deep.equal({
      bags: 0,
      robotPosition: [0, 0],
      robotHealth: 'still functioning',
    });
  });
});

describe('Application.robotAtCrate()', () => {
  it('correctly determines it\'s at a crate', () => {
    const app = new Application([0, 0], [1, 5]);
    expect(
      app
        .addCrates([[1, 5]])
        .robotAtCrate()
    ).to.equal(true)
  });

  it('correctly determines it\'s not at a crate', () => {
    const app = new Application([0, 0], [1, 5]);
    expect(
      app
        .addCrates([[3, 5]])
        .robotAtCrate()
    ).to.equal(false)
  });
});

describe('Application.inputCommand()', () => {
  it('moves to a crate, picks up, moves to feeder, drops', () => {
    const app = new Application([3, 3], [0, 0]);
    expect(
      app
        .addCrates([[1, 2]])
        .inputCommand('NNEPEEND')
        .getStatus()
    ).to.deep.equal({
      bags: 1,
      robotPosition: [3, 3],
      robotHealth: 'still functioning',
    });
  });

  it('moves to a crate, picks up, moves to feeder, drops (other direction)', () => {
    const app = new Application([-2, -3], [0, 0]);
    expect(
      app
        .addCrates([[-1, 1]])
        .inputCommand('NWPSSSSWD')
        .getStatus()
    ).to.deep.equal({
      bags: 1,
      robotPosition: [-2, -3],
      robotHealth: 'still functioning',
    });
  });

  it('handles batches of commands', () => {
    const app = new Application([3, 3], [0, 0]);
    expect(
      app
        .addCrates([[1, 2]])
        .inputCommand('N')
        .inputCommand('NEPEE')
        .inputCommand('ND')
        .getStatus()
    ).to.deep.equal({
      bags: 1,
      robotPosition: [3, 3],
      robotHealth: 'still functioning',
    });
  });

  it('picks up a bag', () => {
    const app = new Application([0, 0], [1, 5]);
    expect(
      app
        .addCrates([[1, 5]])
        .inputCommand('P')
        .getRobotBags()
    ).to.equal(1)
  });

  it('breaks if it tries to pick up a bag away from a crate', () => {
    const app = new Application([0, 0], [1, 5]);
    expect(
      app
        .addCrates([[8, 0]])
        .inputCommand('P')
        .getStatus()
    ).to.deep.include({
      robotHealth: 'short circuited',
    });
  });

  it('is down a bag once it drops a bag on the feeder', () => {
    const app = new Application([10, 3], [10, 3]);
    expect(
      app
        .setRobotBags(2)
        .inputCommand('D')
        .getRobotBags()
    ).to.equal(1)
  });

  it('breaks if it tries to drip a bag away from the feeder', () => {
    const app = new Application([0, 0], [1, 5]);
    expect(
      app
        .setRobotBags(1)
        .inputCommand('P')
        .getStatus()
    ).to.deep.include({
      robotHealth: 'short circuited',
    });
  });

  it('moves one North', () => {
    const app = new Application([0, 0], [0, 0]);
    expect(app.inputCommand('N').getStatus()).to.deep.include({
      robotPosition: [0, 1],
    });
  });

  it('moves three North', () => {
    const app = new Application([0, 0], [0, 0]);
    expect(app.inputCommand('NNN').getStatus()).to.deep.include({
      robotPosition: [0, 3],
    });
  });

  it('moves one South', () => {
    const app = new Application([0, 0], [0, 0]);
    expect(app.inputCommand('S').getStatus()).to.deep.include({
      robotPosition: [0, -1],
    });
  });

  it('moves one East', () => {
    const app = new Application([0, 0], [0, 0]);
    expect(app.inputCommand('E').getStatus()).to.deep.include({
      robotPosition: [1, 0],
    });
  });

  it('moves one West', () => {
    const app = new Application([0, 0], [0, 0]);
    expect(app.inputCommand('W').getStatus()).to.deep.include({
      robotPosition: [-1, 0],
    });
  });

  it('moves three North then one West', () => {
    const app = new Application([0, 0], [0, 0]);
    expect(app.inputCommand('NNNW').getStatus()).to.deep.include({
      robotPosition: [-1, 3],
    });
  });

})
