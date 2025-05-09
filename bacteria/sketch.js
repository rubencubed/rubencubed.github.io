class Bacterium {
    constructor(xPos, yPos, speed, direction, affiliation) {
        this.xPos = xPos
        this.yPos = yPos
        this.speed = speed
        this.direction = direction
        //affiliation is 'foe' or 'friend'
        this.affiliation = affiliation
    }

    updatePosition() {
        this.xPos = 2
    }
}

class Morsel {
    constructor(xPos, yPos, amount) {
        this.xPos = xPos
        this.yPos = yPos
        this.amount = amount
    }
}

class UserBacterium {
    constructor(food) {
        this.food = food
    }
}

let userBacterium = new UserBacterium(30)

function setup() {
    let width = Math.min(windowWidth, 1200)
    let height = Math.min(windowHeight, 600)
    createCanvas(width, height)
    colorMode(HSB, 255)
    background(150)
    circle(width / 2, height / 2, 150)
    textAlign(CENTER, CENTER)
    text('You', width / 2, height / 2)
}

function draw() {
    text(userBacterium.food + " food", 50, 50)
}