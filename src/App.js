import React from 'react';
import Sketch from 'react-p5';
import Car from './Car';
import track from './assets/rata2.jpg';


const App = () => {

  let bg;
  let population = 20;
  let cars = [];
  let crashedCars = [];
  let carScore = [];
  let allTimeBest = 0;
  let currentNN;

  let setup = (p5) => {

    p5.createCanvas(1000, 1000, 'p2d');
    bg = p5.loadImage(track);
    for (let i = 0; i < population; i++) {
      let car = new Car(p5);
      cars[i] = car;
    }

    p5.frameRate(20);
  };

  let draw = (p5) => {

    // show the background in every frame
    p5.background(bg);

    // set inputs for ai, update cars position and draw it
    for (let i = 0; i < cars.length; i++) {
      cars[i].setInputs(
        cars[i].distanceLeft(),
        cars[i].distanceRight(),
        cars[i].distanceTopLeft(),
        cars[i].distanceTopRight(),
        cars[i].distanceFront()
      );
      cars[i].updatePosition();
      cars[i].show();

      // loop every car, if crashed push it to the crashed list
      // and remove it from the car list
      if (!cars[i].getIsRunning()) {
        carScore.push(cars[i].getScore());
        crashedCars.push(cars[i]);
        cars.splice(i, 1);
      }
    }

    // when no running cars, pick the best car...
    if (cars.length === 0) {
      let bestScore = carScore[0];
      let index = 0;
      for (let i = 0; i < population; i++) {
        if (bestScore < carScore[i] ) {
          bestScore = carScore[i];
          index = i;
        }
      }

      // ...and compare it to the all time best car
      if (bestScore > allTimeBest) {
        currentNN = crashedCars[index].getNetwork();
        allTimeBest = bestScore;
      }

      // create new population using ai of the best car
      for (let i = 0; i < population; i++) {
        cars[i] = new Car(p5, currentNN);
        crashedCars = [];
        carScore = [];
      }
    }
  };

  return (
    <div className="App">
      <Sketch setup={setup} draw={draw} />
    </div>
  );
}

export default App;
