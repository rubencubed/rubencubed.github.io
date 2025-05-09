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
        this.xPos += Math.cos(this.direction) * this.speed
        this.yPos += Math.sin(this.direction) * this.speed
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
    constructor(food, nearby) {
        this.food = food
        this.nearby = nearby
    }

    revealNearby() {
        if (this.food > 0) {
            this.food = this.food - 1
            this.nearby = true

            setTimeout(() => {
                this.hideNearby()
            }, 3000)
        }
    }

    hideNearby() {
        this.nearby = false
    }

    createEnzyme(morsels) {
        for (const morsel of morsels) {
            if (this.food > 0) {
                this.food = this.food - 5
            }
        }
    }
}

let userBacterium
let friendlyBacteria = []
let hostileBacteria = []
let morsels = []

let width
let height
let circleDiameter = 50
let borderStart = 75
let borderWidth
let borderHeight

function setup() {
    width = Math.min(windowWidth, 1200)
    height = Math.min(windowHeight, 600)
    borderWidth = width - 2 * borderStart
    borderHeight = height - 2 * borderStart

    userBacterium = new UserBacterium(100, false)
    for (let i = 0; i < 5; i++) {
        let xPos = getRandomNumberWithCut(circleDiameter, width / 2 - circleDiameter, width / 2 + circleDiameter, width - circleDiameter)
        let yPos = getRandomNumberWithCut(circleDiameter, height / 2 - circleDiameter, height / 2 + circleDiameter, height - circleDiameter)
        let speed = Math.floor(Math.random() * 5 + 1) / 10
        let direction = Math.random() * Math.PI * 2

        friendlyBacteria.push(new Bacterium(xPos, yPos, speed, direction))
    }
    for (let i = 0; i < 5; i++) {
        let xPos = getRandomNumberWithCut(circleDiameter, width / 2 - circleDiameter, width / 2 + circleDiameter, width - circleDiameter)
        let yPos = getRandomNumberWithCut(circleDiameter, height / 2 - circleDiameter, height / 2 + circleDiameter, height - circleDiameter)
        let speed = Math.floor(Math.random() * 5 + 1) / 5
        let direction = Math.random() * Math.PI * 2

        hostileBacteria.push(new Bacterium(xPos, yPos, speed, direction))
    }

    createCanvas(width, height)
    colorMode(HSB, 255)
}

function draw() {
    frameRate(24)
    background(200)

    //outside border of game
    noFill()
    stroke(0)
    rect(borderStart, borderStart, borderWidth, borderHeight)

    //control panel (outside game)
    textAlign(CENTER, CENTER)
    text(userBacterium.food + " food", width - 30, 25)
    fill('green')
    rect(width - 160, 15, 100, 30)
    fill('black')
    text('Reveal', width - 110, 30)

    // only show if user spends food to reveal
    if (userBacterium.nearby) {
        friendlyBacteria.map((friendlyBacterium) => {
            fill('blue')
            stroke(0)
            return circle(friendlyBacterium.xPos, friendlyBacterium.yPos, circleDiameter)
        })
        hostileBacteria.map((hostileBacterium) => {
            fill('red')
            stroke(0)
            return circle(hostileBacterium.xPos, hostileBacterium.yPos, circleDiameter)
        })
    }

    //userBacterium
    fill('white')
    noStroke()
    circle(width / 2, height / 2, circleDiameter)
    fill('black')
    text('You', width / 2, height / 2)

    gameLoop()
}

function mousePressed() {
    if (
        mouseX > width - 160
        && mouseX < width - 60
        && mouseY > 15
        && mouseY < 45
        && !userBacterium.nearby
    ) {
        userBacterium.revealNearby()
    }
    if (false) {
        userBacterium.createEnzyme([])
    }
}

function gameLoop() {
    while (friendlyBacteria.length < 5) {
        let xPos = getRandomNumberWithCut(circleDiameter, width / 2 - (2 * circleDiameter), width / 2 + (2 * circleDiameter), width - circleDiameter)
        let yPos = getRandomNumberWithCut(circleDiameter, height / 2 - (2 * circleDiameter), height / 2 + (2 * circleDiameter), height - circleDiameter)
        let speed = Math.floor(Math.random() * 5 + 1) / 10
        let direction = Math.random() * Math.PI * 2

        friendlyBacteria.push(new Bacterium(xPos, yPos, speed, direction))
    }
    while (hostileBacteria.length < 5) {
        let xPos = getRandomNumberWithCut(circleDiameter, width / 2 - (2 * circleDiameter), width / 2 + (2 * circleDiameter), width - circleDiameter)
        let yPos = getRandomNumberWithCut(circleDiameter, height / 2 - (2 * circleDiameter), height / 2 + (2 * circleDiameter), height - circleDiameter)
        let speed = Math.floor(Math.random() * 5 + 1) / 10
        let direction = Math.random() * Math.PI * 2

        hostileBacteria.push(new Bacterium(xPos, yPos, speed, direction))
    }

    for (let i = 0; i < friendlyBacteria.length; i++) {
        friendlyBacteria[i].updatePosition()
        if (friendlyBacteria[i].xPos < borderStart
            || friendlyBacteria[i].yPos < borderStart
            || friendlyBacteria[i].xPos > width - borderStart
            || friendlyBacteria[i].yPos > height - borderStart) {
            friendlyBacteria.splice(i, 1)
            i--
        }
    }
    for (let i = 0; i < hostileBacteria.length; i++) {
        hostileBacteria[i].updatePosition()
        if (hostileBacteria[i].xPos < borderStart
            || hostileBacteria[i].yPos < borderStart
            || hostileBacteria[i].xPos > width - borderStart
            || hostileBacteria[i].yPos > height - borderStart) {
            hostileBacteria.splice(i, 1)
            i--
        }
    }
}

function getRandomNumberWithCut(min1, max1, min2, max2) {
    const useFirstRange = Math.random() < (max1 - min1 + 1) / ((max1 - min1 + 1) + (max2 - min2 + 1))

    if (useFirstRange) {
        return Math.floor(Math.random() * (max1 - min1 + 1)) + min1
    } else {
        return Math.floor(Math.random() * (max2 - min2 + 1)) + min2
    }
}
