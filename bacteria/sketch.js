class Bacterium {
    initialize(xPos, yPos) {
        this.xPos = xPos
        this.yPos = yPos
    }
}

function setup() {
    createCanvas(windowWidth, windowHeight)
    colorMode(HSB, 255)
    background(150)
}

function draw() {
    fill(25)
    noStroke()
    circle(200, 200, 100)
}