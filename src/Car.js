import Network from './NeuralNetwork/NN';
import walls from './walls';
import cpts from './checkpoints';

class Car {
  constructor(p5, nn) {
    this.p5 = p5;

    // start position and parameters
    this.x = 500;
    this.y = 120;
    this.direction = Math.PI/2;
    this.speed = 5;
    this.steering = 0;
    this.isRunning = true;
    this.points = 0;
    this.laps = 0;
    this.frame = 0;

    // mutate ai if existing one
    if (nn instanceof Network) {
      let newnn = this.mutate(nn);
      this.nn = new Network(newnn);
    } else {
      this.nn = new Network(5, 10, 3);
    }
  }

  show() {
    this.p5.stroke(0, 0, 0);
    this.p5.strokeWeight(1);
    this.p5.fill('black');
    this.p5.ellipse(this.x, this.y, 20, 20);
  }

  // return the copy of this ai, don't change the original
  getNetwork() {
    return this.nn.copy();
  }

  // take a random input neuron and change every weight between the neuron and the hidden layer
  mutate(newnn) {

    let child;

    if (Math.random() < 0.8) {

      let mutatenn = newnn.copy();

      let rand_hidden_weight = mutatenn.weights_ih.data[Math.floor(Math.random() * mutatenn.weights_ih.data.length)];

      for (let i = 0; i < rand_hidden_weight.length; i++) {
        rand_hidden_weight[i] = Math.random() * 2 - 1;
      }
      child = mutatenn;
    } else {
      child = newnn;
    }

    return child;
  }

  // return the score based on completed laps and checkpoints
  getScore() {
    return (this.laps * cpts.length) + this.points;
  }

  // return true or false
  getIsRunning() {
    return this.isRunning;
  }

  // calculate distances to every wall and return the nearest wall
  getDistanceToWall(rad) {
    let distances = [];

    let x = Math.sin(rad);
    let y = -Math.cos(rad);

    let p1 = {x: this.x, y: this.y};
    let p2 = {x: Math.trunc(this.x + (500 * x)), y: Math.trunc(this.y + (500 * y))};

    for (let i = 0; i < walls.length; i++) {
      let d = _calculateIntersection(p1, p2, walls[i][0], walls[i][1]);
      if (d > 0) {
        distances.push(d);
      }
    }

    return Math.min(...distances);

  }

  // how far is the nearest wall on left side
  distanceLeft() {
    let rad = this.direction - Math.PI/2;
    let dist = this.getDistanceToWall(rad);
    return dist;
  }

  // how far is the nearest wall on right side
  distanceRight() {
    let rad = this.direction + Math.PI/2;
    let dist = this.getDistanceToWall(rad);
    return dist;
  }

  // how far is the nearest wall on upper left
  distanceTopLeft() {
    let rad = this.direction - Math.PI/4;
    let dist = this.getDistanceToWall(rad);
    return dist;
  }

  // how far is the nearest wall on upper right
  distanceTopRight() {
    let rad = this.direction + Math.PI/4;
    let dist = this.getDistanceToWall(rad);
    return dist;
  }

  // how far is the nearest wall on straight head
  distanceFront() {
    let rad = this.direction;
    let dist = this.getDistanceToWall(rad);
    return dist;
  }

  // turn left if ai's output is 0
  turnLeft() {
    this.steering = -1
  }

  // go straight if ai's output is 1
  goStraight() {
    this.steering = 0;
  }

  // turn right if ai's output is 2
  turnRight() {
    this.steering = 1
  }

  // update car's position, calculate car's distance from the next checkpoints
  // and stop running if ai is going to wrong direction
  updatePosition() {
    if (this.isRunning) {
      this.frame += 1
      let startX = this.x;
      let startY = this.y;
      let x = startX + Math.sin(this.direction) * this.speed;
      let y = startY + -Math.cos(this.direction) * this.speed;
      let steering = this.direction + this.steering * Math.PI/6;
      this.x = x + Math.sin(steering) * this.speed/2;
      this.y = y + -Math.cos(steering) * this.speed/2;
      this.direction = steering;

      let distanceToNextPoint = _pDistanceFromLine(
                                    this.x, this.y,
                                    cpts[this.points][0].x,
                                    cpts[this.points][0].y,
                                    cpts[this.points][1].x,
                                    cpts[this.points][1].y
                                  );
      if (distanceToNextPoint < 15) {
        this.points += 1;
        this.frame = 0;
        if (this.points >= cpts.length) {
          this.laps += 1;
          this.points = 0;
        }
      }

      if (this.frame > 50) {
        this.isRunning = false;
      }
    }
  }

  // check if car hits on the wall, set inputs for ai and execute the result
  setInputs(left, right, topleft, topright, front) {

    if (left < 15 || right < 15 || topleft < 15 || topright < 15 || front < 15 || this.x < 0 || this.x > 1000 || this.y < 0 || this.y > 1000) {
      this.isRunning = false;
      return;
    }

    const results = this.nn.predict([left, right, topleft, topright, front]);

    let largest = results[0];
    let index = 0;

    for (let i = 0; i < results.length; i++) {
      if (largest < results[i] ) {
        largest = results[i];
        index = i;
      }
    }

    switch (index) {
      case 0:
        this.turnRight();
        break;
      case 1:
        this.goStraight();
        break;
      case 2:
        this.turnLeft();
        break;
      default:
        break;
    }
  }
}

////////////////////////////////////////////////////////////////

function _calculateIntersection(p1, p2, p3, p4) {
    let c2x = p3.x - p4.x; // (x3 - x4)
  	let c3x = p1.x - p2.x; // (x1 - x2)
  	let c2y = p3.y - p4.y; // (y3 - y4)
  	let c3y = p1.y - p2.y; // (y1 - y2)

  	// down part of intersection point formula
  	let d  = c3x * c2y - c3y * c2x;

    // if number of intersection points is zero or infinity
  	if (d === 0) {
    	return 0;
    }

  	// upper part of intersection point formula
  	let u1 = p1.x * p2.y - p1.y * p2.x; // (x1 * y2 - y1 * x2)
  	let u4 = p3.x * p4.y - p3.y * p4.x; // (x3 * y4 - y3 * x4)

  	// intersection point formula
  	let px = (u1 * c2x - c3x * u4) / d;
  	let py = (u1 * c2y - c3y * u4) / d;

    if (px < Math.min(p1.x, p2.x) || px > Math.max(p1.x, p2.x) ||
      px < Math.min(p3.x, p4.x) || px > Math.max(p3.x, p4.x)) {
      return 0;
    }
    if (py < Math.min(p1.y, p2.y) || py > Math.max(p1.y, p2.y) ||
      py < Math.min(p3.y, p4.y) || py > Math.max(p3.y, p4.y)) {
      return 0;
    }

  	// distance to intersection
    let dist = Math.hypot(px - p1.x, py - p1.y);

  	return dist;
}

function _pDistanceFromLine(x, y, x1, y1, x2, y2) {

  let A = x - x1;
  let B = y - y1;
  let C = x2 - x1;
  let D = y2 - y1;

  let dot = A * C + B * D;
  let len_sq = C * C + D * D;
  let param = -1;
  if (len_sq !== 0) //in case of 0 length line
      param = dot / len_sq;

  let xx, yy;

  if (param < 0) {
    xx = x1;
    yy = y1;
  }
  else if (param > 1) {
    xx = x2;
    yy = y2;
  }
  else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  let dx = x - xx;
  let dy = y - yy;

  return Math.sqrt(dx * dx + dy * dy);
}

export default Car;
