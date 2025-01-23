let precipitations = []
const yDisplacement = 20

function setup() {
  createCanvas(windowWidth, windowHeight)
  colorMode(HSB, 255)
  background(50)

  for (let i = 0; i < 40; i++) {
    const xPosition = windowWidth / 2 - 400 + i * 40
    const yPosition = yDisplacement + Math.floor(Math.random() * yDisplacement * 2)
    const speed = Math.ceil(Math.random() * 4) + 1
    const length = Math.ceil(Math.random() * 30) + 25

    precipitations.push(new Precipitation(xPosition, yPosition, speed, length, 200))
  }
}

function draw() {
  background(0)
  for (let precipitation of precipitations) {
    precipitation.fall()
    precipitation.display()
  }
}

class Precipitation {
  constructor(xPosition, yPosition, speed, length, color) {
    this.xPosition = xPosition
    this.yPosition = yPosition
    this.speed = speed
    this.length = length
    this.color = color
  }

  fall() {
    this.yPosition = this.yPosition + this.speed

    let hueValue = map(this.yPosition, 0, windowHeight, 0, 255)
    this.color = color(hueValue, 255, 255)

    if (this.yPosition > windowHeight) {
      this.yPosition = yDisplacement + Math.floor(Math.random() * yDisplacement * 2)
      this.speed = Math.ceil(Math.random() * 5) + 1
    }
  }

  display() {
    fill(this.color)
    noStroke()
    rect(this.xPosition, this.yPosition, 3, this.length)
  }
}
