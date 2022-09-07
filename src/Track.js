class Track {

  constructor(p5) {
    this.p5 = p5
  }

  show() {
    this.p5.stroke(96, 96, 96);
    this.p5.strokeWeight(150);

    let p01 = { x: 180, y: 150};
    let p02 = { x: 830, y: 190};
    let p03 = { x: 830, y: 460};
    let p04 = { x: 430, y: 400};
    let p05 = { x: 420, y: 600};
    let p06 = { x: 850, y: 695};
    let p07 = { x: 840, y: 900};
    let p08 = { x: 430, y: 810};
    let p09 = { x: 130, y: 860};
    let p10 = { x: 180, y: 150};
    let p11 = { x: 830, y: 190};

    this.p5.curve(p01.x, p01.y, p02.x, p02.y, p03.x, p03.y, p04.x, p04.y);
    this.p5.curve(p02.x, p02.y, p03.x, p03.y, p04.x, p04.y, p05.x, p05.y);
    this.p5.curve(p03.x, p03.y, p04.x, p04.y, p05.x, p05.y, p06.x, p06.y);
    this.p5.curve(p04.x, p04.y, p05.x, p05.y, p06.x, p06.y, p07.x, p07.y);
    this.p5.curve(p05.x, p05.y, p06.x, p06.y, p07.x, p07.y, p08.x, p08.y);
    this.p5.curve(p06.x, p06.y, p07.x, p07.y, p08.x, p08.y, p09.x, p09.y);
    this.p5.curve(p07.x, p07.y, p08.x, p08.y, p09.x, p09.y, p10.x, p10.y);
    this.p5.curve(p08.x, p08.y, p09.x, p09.y, p10.x, p10.y, p11.x, p11.y);
    this.p5.curve(p09.x, p09.y, p10.x, p10.y, p11.x, p11.y, p11.x, p11.y);
  }
}

export default Track;
