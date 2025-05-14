class Bacterium {
    constructor(xPos, yPos, speed, direction, affiliation) {
        this.xPos = xPos
        this.yPos = yPos
        this.speed = speed
        this.direction = direction
        //affiliation is 'hostile' or 'friendly'
        this.affiliation = affiliation
    }

    updatePosition() {
        this.xPos += Math.cos(this.direction) * this.speed
        this.yPos += Math.sin(this.direction) * this.speed
    }

    setDirection(newDirection) {
        this.direction = newDirection
    }
}

class Morsel {
    constructor(xPos, yPos, amount, speed, direction) {
        this.xPos = xPos
        this.yPos = yPos
        this.amount = amount
        this.speed = speed
        this.direction = direction
    }

    updatePosition() {
        this.xPos += Math.cos(this.direction) * this.speed
        this.yPos += Math.sin(this.direction) * this.speed
    }

    setDirection(newDirection) {
        this.direction = newDirection
    }
}

class UserBacterium {
    constructor(energy, createFoodEnzyme, nearbyFriends, nearbyEnemies, nearbyMorsels) {
        this.energy = energy
        this.createFoodEnzyme = this.createFoodEnzyme
        this.nearbyFriends = nearbyFriends
        this.nearbyEnemies = nearbyEnemies
        this.nearbyMorsels = nearbyMorsels
    }

    revealNearby(revealType) {
        if (this.energy > 0) {
            if (revealType == 'friendlyBacteria') {
                this.energy = this.energy - 2
                this.nearbyFriends = true

                setTimeout(() => {
                    this.hideNearby('friendlyBacteria')
                }, 3000)
            } else if (revealType == 'hostileBacteria') {
                this.energy = this.energy - 4
                this.nearbyEnemies = true

                setTimeout(() => {
                    this.hideNearby('hostileBacteria')
                }, 3000)
            } else if (revealType == 'morsels') {
                this.energy = this.energy - 1
                this.nearbyMorsels = true

                setTimeout(() => {
                    this.hideNearby('morsels')
                }, 2000)
            }
        }
    }

    hideNearby(hideType) {
        if (hideType == 'friendlyBacteria') {
            this.nearbyFriends = false
        } else if (hideType == 'hostileBacteria') {
            this.nearbyEnemies = false
        } else if (hideType == 'morsels') {
            this.nearbyMorsels = false
        }
    }

    turnOnFoodEnzyme() {
        if (this.energy > 0) {
            this.createFoodEnzyme = true
            setTimeout(() => {
                this.createFoodEnzyme = false
            }, 3000)
        }
    }

    hunger() {
        this.energy = this.energy - 1
    }

    createFriend(friendlyBacteria) {
        friendlyBacteria.push(randomBacterium('friendly'))
    }

    eatFood(morsels, friendlyBacteria, hostileBacteria, radiusOfInfluence, xCenter, yCenter) {
        if (this.energy > 0) {
            morselLoop: for (let i = 0; i < morsels.length; i++) {
                //if within distance of main bacterium
                if (
                    Math.hypot(morsels[1].xPos - xCenter, morsels[1].yPos - yCenter) <=
                    radiusOfInfluence
                ) {
                    this.energy = this.energy + morsels[1].amount
                    morsels.splice(i, 1)
                    i--
                    continue morselLoop
                } else {
                    for (let j = 0; j < friendlyBacteria.length; j++) {
                        if (
                            Math.hypot(
                                morsels[1].xPos - friendlyBacteria[i].xPos,
                                morsels[1].yPos - friendlyBacteria[i].yPos
                            ) <= radiusOfInfluence
                        ) {
                            this.energy = this.energy + morsels[1].amount
                            morsels.splice(i, 1)
                            i--
                            continue morselLoop
                        }
                    }
                }
            }

            this.energy = this.energy - 5
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

const gameTick = 30
let lastTime
let gameOver = false

function setup() {
    width = Math.min(windowWidth, 1200)
    height = Math.min(windowHeight, 600)
    borderWidth = width - 2 * borderStart
    borderHeight = height - 2 * borderStart

    userBacterium = new UserBacterium(100, false, true, true, true)

    // friendly bacteria initial generation
    for (let i = 0; i < 1; i++) {
        friendlyBacteria.push(randomBacterium('friendly'))
    }
    // hostile bacteria initial generation
    for (let i = 0; i < 2; i++) {
        hostileBacteria.push(randomBacterium('hostile'))
    }
    // morsel initial generation
    for (let i = 0; i < 4; i++) {
        morsels.push(randomMorsel())
    }

    createCanvas(width, height)
    colorMode(HSB, 255)
}

function draw() {
    if (!lastTime) {
        lastTime = Date.now()
    } else {
        if (Date.now() - lastTime >= gameTick * 1000) {
            lastTime = Date.now()
            gameLoop()
        }
    }

    frameRate(40)
    background(200)

    //outside border of game
    noFill()
    stroke(0)
    rect(borderStart, borderStart, borderWidth, borderHeight)

    //control panel (outside game)
    // energy
    textAlign(CENTER, CENTER)
    text(userBacterium.energy + ' energy', width - 50, 25)
    // Reveal Friendly Bacteria
    fill('blue')
    rect(width - 200, 15, 100, 30)
    fill('white')
    text('Reveal Friends', width - 150, 30)
    // Reveal Hostile bacteria
    fill('red')
    rect(width - 350, 15, 100, 30)
    fill('white')
    text('Reveal Enemies', width - 300, 30)
    // Reveal Morsels
    fill('black')
    rect(width - 500, 15, 100, 30)
    fill('white')
    text('Reveal Morsels', width - 450, 30)
    // Eat Food
    fill('yellow')
    rect(width - 650, 15, 100, 30)
    fill('black')
    text('Eat Food', width - 600, 30)

    // only show if user spends food to reveal
    if (userBacterium.nearbyFriends) {
        friendlyBacteria.map((friendlyBacterium) => {
            fill('blue')
            stroke(0)
            return circle(
                friendlyBacterium.xPos,
                friendlyBacterium.yPos,
                circleDiameter
            )
        })
    }
    if (userBacterium.nearbyEnemies) {
        hostileBacteria.map((hostileBacterium) => {
            fill('red')
            stroke(0)
            return circle(
                hostileBacterium.xPos,
                hostileBacterium.yPos,
                circleDiameter
            )
        })
    }
    if (userBacterium.nearbyMorsels) {
        morsels.map((morsel) => {
            fill('black')
            noStroke()
            return circle(morsel.xPos, morsel.yPos, 2 * morsel.amount)
        })
    }

    //userBacterium
    fill('white')
    noStroke()
    circle(width / 2, height / 2, circleDiameter)
    fill('black')
    text('You', width / 2, height / 2)

    handleMovement()
}

function mousePressed() {
    // reveal nearby friends
    if (
        mouseX > width - 200 &&
        mouseX < width - 100 &&
        mouseY > 15 &&
        mouseY < 45 &&
        !userBacterium.nearbyFriends
    ) {
        userBacterium.revealNearby('friendlyBacteria')
    }
    // reveal nearby enemies
    if (
        mouseX > width - 350 &&
        mouseX < width - 250 &&
        mouseY > 15 &&
        mouseY < 45 &&
        !userBacterium.nearbyEnemies
    ) {
        userBacterium.revealNearby('hostileBacteria')
    }
    // reveal nearby morsels
    if (
        mouseX > width - 500 &&
        mouseX < width - 400 &&
        mouseY > 15 &&
        mouseY < 45 &&
        !userBacterium.nearbyMorsels
    ) {
        userBacterium.revealNearby('morsels')
    }
    // create enzynme to eat morsels
    if (
        mouseX > width - 650 &&
        mouseX < width - 550 &&
        mouseY > 15 &&
        mouseY < 45 &&
        !userBacterium.createFoodEnzyme
    ) {
        userBacterium.turnOnFoodEnzyme()
    }
    // if (false) {
    //     userBacterium.createEnzyme([])
    // }
}

function handleMovement() {
    // replace out of bounds
    for (let i = 0; i < friendlyBacteria.length; i++) {
        friendlyBacteria[i].updatePosition()

        // flip direction on y-axis
        if (
            friendlyBacteria[i].xPos < borderStart ||
            friendlyBacteria[i].xPos > width - borderStart
        ) {
            friendlyBacteria[i].setDirection(Math.PI - friendlyBacteria[i].direction)
        }
        if (
            friendlyBacteria[i].yPos < borderStart ||
            friendlyBacteria[i].yPos > height - borderStart
        ) {
            friendlyBacteria[i].setDirection(-1 * friendlyBacteria[i].direction)
        }
    }
    for (let i = 0; i < hostileBacteria.length; i++) {
        hostileBacteria[i].updatePosition()

        if (
            hostileBacteria[i].xPos < borderStart ||
            hostileBacteria[i].xPos > width - borderStart
        ) {
            hostileBacteria[i].setDirection(Math.PI - hostileBacteria[i].direction)
        }
        if (
            hostileBacteria[i].yPos < borderStart ||
            hostileBacteria[i].yPos > height - borderStart
        ) {
            hostileBacteria[i].setDirection(-1 * hostileBacteria[i].direction)
        }
    }
    for (let i = 0; i < morsels.length; i++) {
        morsels[i].updatePosition()

        if (
            morsels[i].xPos < borderStart ||
            morsels[i].xPos > width - borderStart
        ) {
            morsels[i].setDirection(Math.PI - morsels[i].direction)
        }
        if (
            morsels[i].yPos < borderStart ||
            morsels[i].yPos > height - borderStart
        ) {
            morsels[i].setDirection(-1 * morsels[i].direction)
        }
    }

    // handle if movement overlaps with enzymes are on
    if (userBacterium.createFoodEnzyme) {
        userBacterium.eatFood(morsels, friendlyBacteria, hostileBacteria, circleDiameter, width / 2, height / 2)
    }
}

function gameLoop() {
    // add new hostile bacterium
    hostileBacteria.push(randomBacterium('hostile'))

    // add two new morsels
    morsels.push(randomMorsel())
    morsels.push(randomMorsel())

    // deduct user food for existing
    // if (!gameOver) {
    //     userBacterium.hunger()
    //     if (userBacterium.energy <= 0) {
    //         gameOver = true
    //     }
    // }
}

//utility functions
function randomBacterium(friendStatus) {
    let xPos = getRandomNumberWithCut(
        borderStart + 1,
        width / 2 - circleDiameter,
        width / 2 + circleDiameter,
        width - borderStart - 1
    )
    let yPos = getRandomNumberWithCut(
        borderStart + 1,
        height / 2 - circleDiameter,
        height / 2 + circleDiameter,
        height - borderStart - 1
    )
    let speed = Math.floor(Math.random() * 5 + 1) / 5
    let direction = Math.random() * Math.PI * 2

    return new Bacterium(xPos, yPos, speed, direction, friendStatus)
}

function randomMorsel() {
    let xPos = getRandomNumberWithCut(
        borderStart + 1,
        width / 2 - circleDiameter,
        width / 2 + circleDiameter,
        width - borderStart - 1
    )
    let yPos = getRandomNumberWithCut(
        borderStart + 1,
        height / 2 - circleDiameter,
        height / 2 + circleDiameter,
        height - borderStart - 1
    )
    let amount = Math.floor(Math.random() * 10)
    let speed = Math.floor(Math.random() * 5 + 1) / 10
    let direction = Math.random() * Math.PI * 2

    return new Morsel(xPos, yPos, amount, speed, direction)
}

function getRandomNumberWithCut(min1, max1, min2, max2) {
    const useFirstRange =
        Math.random() < (max1 - min1 + 1) / (max1 - min1 + 1 + (max2 - min2 + 1))

    if (useFirstRange) {
        return Math.floor(Math.random() * (max1 - min1 + 1)) + min1
    } else {
        return Math.floor(Math.random() * (max2 - min2 + 1)) + min2
    }
}
