class Bacterium {
    constructor(xPos, yPos, affiliation, size) {
        this.xPos = xPos
        this.yPos = yPos
        // affiliation is 'hostile' or 'friendly'
        this.affiliation = affiliation

        this.size = Math.random() * 50 + 25
        // should speed be dependent on size?
        this.speed = size ? size : Math.floor(Math.random() * 5 + 1) / 5
        this.direction = Math.random() * Math.PI * 2
        this.directionChangeProbability = 0
        this.radiusOfEffect = Math.random() * 50 + 50

        this.destroyed = false
    }

    glow(otherBacteria, morsels) {
        let nearbyFriends = 0
        let nearbyEnemies = 0
        let nearbyFood = 0

        const nearbyBacteria = []
        const nearbyMorsels = []

        //find what bacteria and morsels are nearby
        for (const otherBacterium of otherBacteria) {
            // if another bacterium is within radiusOfEffect, update relevant count
            if (
                Math.hypot(
                    this.xPos - otherBacterium.xPos,
                    this.yPos - otherBacterium.yPos
                ) <= this.radiusOfEffect
            ) {
                if (otherBacterium.affiliation == 'friendly') {
                    nearbyFriends++
                } else {
                    nearbyEnemies++
                }
                nearbyBacteria.push({ ...otherBacterium })
            }
        }
        for (const morsel of morsels) {
            if (
                Math.hypot(
                    this.xPos - morsel.xPos,
                    this.yPos - morsel.yPos
                ) <= this.radiusOfEffect
            ) {
                nearbyFood += morsel.amount
                nearbyMorsels.push({ ...morsel })
            }
        }

        // use learned information to make a decision
        if (nearbyEnemies >= nearbyFriends) {
            this.releasePoison(nearbyBacteria)
        } else if (nearbyFriends >= nearbyEnemies && nearbyFood >= nearbyFriends * 10) {
            this.releaseEnzyme(nearbyBacteria, nearbyMorsels, nearbyFood)
        }
    }

    split(otherBacteria) {
        this.xPos = this.xPos - (this.size / 2)
        this.yPos = this.yPos - (this.size / 2)
        this.size = this.size / 2

        otherBacteria.push(new Bacterium())
        return
    }

    releaseEnzyme(nearbyBacteria, nearbyMorsels, nearbyFoodAmount) {
        for (const nearbyMorsel of nearbyMorsels) {
            nearbyMorsel.dissolve()
        }
        for (const nearbyBacterium of nearbyBacteria) {
            nearbyBacterium.size = nearbyBacterium.size + Math.floor(nearbyFoodAmount / nearbyBacteria.length)
        }
    }

    releasePoison(nearbyBacteria) {
        for (const nearbyBacterium of nearbyBacteria) {
            if (nearbyBacterium.affiliation == 'hostile') {
                nearbyBacterium.destroyed = true
            }
        }
    }

    updatePosition() {
        if (Math.random() < this.directionChangeProbability) {
            const newDirection = Math.random() * Math.PI - Math.PI / 2
            this.setDirection(newDirection)
        }
        this.xPos += Math.cos(this.direction) * this.speed
        this.yPos += Math.sin(this.direction) * this.speed
    }

    updateSize(newSize) {
        this.size = newSize
    }

    setDirection(newDirection) {
        this.direction = newDirection
        this.directionChangeProbability = 0
    }

    setPosition(newX, newY) {
        this.xPos = newX
        this.yPos = newY
    }
}

class Morsel {
    constructor(xPos, yPos, amount, speed, direction) {
        this.xPos = xPos
        this.yPos = yPos
        this.amount = amount
        this.speed = speed
        this.direction = direction
        this.dissolved = false
        this.directionChangeProbability = 0
    }

    updatePosition() {
        if (Math.random() < this.directionChangeProbability) {
            const newDirection = Math.random() * Math.PI - Math.PI / 2
            this.setDirection(newDirection)
        }
        this.xPos += Math.cos(this.direction) * this.speed
        this.yPos += Math.sin(this.direction) * this.speed
    }

    setDirection(newDirection) {
        this.direction = newDirection
        this.directionChangeProbability = 0
    }

    //this will get cleaned up by the next game loop
    dissolve() {
        this.dissolved = true
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

const gameTick = 1
let lastTime
let gameOver = false

function setup() {
    width = Math.min(windowWidth, 1200)
    height = Math.min(windowHeight, 600)
    borderWidth = width - 2 * borderStart
    borderHeight = height - 2 * borderStart

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
    textAlign(CENTER, CENTER)
    // Add Friendly Bacteria
    fill('blue')
    rect(width - 200, 15, 100, 30)
    fill('white')
    text('Add Friend', width - 150, 30)
    // Add Hostile bacteria
    fill('red')
    rect(width - 350, 15, 100, 30)
    fill('white')
    text('Add Enemy', width - 300, 30)
    // Add Morsels
    fill('black')
    rect(width - 500, 15, 100, 30)
    fill('white')
    text('Add Morsel', width - 450, 30)

    // only show if user spends food to reveal
    friendlyBacteria.map((friendlyBacterium) => {
        fill('blue')
        stroke(0)
        return circle(
            friendlyBacterium.xPos,
            friendlyBacterium.yPos,
            friendlyBacterium.size
        )
    })

    hostileBacteria.map((hostileBacterium) => {
        fill('red')
        stroke(0)
        return circle(
            hostileBacterium.xPos,
            hostileBacterium.yPos,
            hostileBacterium.size
        )
    })

    morsels.map((morsel) => {
        fill('black')
        noStroke()
        return circle(morsel.xPos, morsel.yPos, 2 * morsel.amount)
    })

    handleMovement()
}

function mousePressed() {
    // Add friend
    if (
        mouseX > width - 200 &&
        mouseX < width - 100 &&
        mouseY > 15 &&
        mouseY < 45
    ) {
        friendlyBacteria.push(randomBacterium('friendly'))
    }
    // Add enemy
    if (
        mouseX > width - 350 &&
        mouseX < width - 250 &&
        mouseY > 15 &&
        mouseY < 45
    ) {
        hostileBacteria.push(randomBacterium('hostile'))
    }
    // Add morsel
    if (
        mouseX > width - 500 &&
        mouseX < width - 400 &&
        mouseY > 15 &&
        mouseY < 45
    ) {
        morsels.push(randomMorsel())
    }
}

function handleMovement() {
    // replace out of bounds
    for (let i = 0; i < friendlyBacteria.length; i++) {
        friendlyBacteria[i].updatePosition()

        // flip direction on x-axis
        if (
            friendlyBacteria[i].xPos <= borderStart ||
            friendlyBacteria[i].xPos >= width - borderStart
        ) {
            friendlyBacteria[i].setDirection(Math.PI - friendlyBacteria[i].direction)

            //in case it has gone way past the border
            if (friendlyBacteria[i].xPos <= borderStart) {
                friendlyBacteria[i].setPosition(borderStart + 1, friendlyBacteria[i].yPos)
            } else {
                friendlyBacteria[i].setPosition(width - borderStart - 1, friendlyBacteria[i].yPos)
            }
        }
        // flip direction on y-axis
        if (
            friendlyBacteria[i].yPos <= borderStart ||
            friendlyBacteria[i].yPos >= height - borderStart
        ) {
            friendlyBacteria[i].setDirection(-1 * friendlyBacteria[i].direction)

            //in case it has gone way past the border
            if (friendlyBacteria[i].yPos <= borderStart) {
                friendlyBacteria[i].setPosition(friendlyBacteria[i].xPos, borderStart + 1)
            } else {
                friendlyBacteria[i].setPosition(friendlyBacteria[i].xPos, height - borderStart - 1)
            }
        }
    }

    for (let i = 0; i < hostileBacteria.length; i++) {
        hostileBacteria[i].updatePosition()

        if (
            hostileBacteria[i].xPos < borderStart ||
            hostileBacteria[i].xPos > width - borderStart
        ) {
            hostileBacteria[i].setDirection(Math.PI - hostileBacteria[i].direction)

            if (hostileBacteria[i].xPos <= borderStart) {
                hostileBacteria[i].setPosition(borderStart + 1, hostileBacteria[i].yPos)
            } else {
                hostileBacteria[i].setPosition(width - borderStart - 1, hostileBacteria[i].yPos)
            }
        }
        if (
            hostileBacteria[i].yPos < borderStart ||
            hostileBacteria[i].yPos > height - borderStart
        ) {
            hostileBacteria[i].setDirection(-1 * hostileBacteria[i].direction)

            if (hostileBacteria[i].yPos <= borderStart) {
                hostileBacteria[i].setPosition(hostileBacteria[i].xPos, borderStart + 1)
            } else {
                hostileBacteria[i].setPosition(hostileBacteria[i].xPos, height - borderStart - 1)
            }
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
}

function gameLoop() {
    // deduct user food for existing
    for (let i = 0; i < friendlyBacteria.length; i++) {
        if (friendlyBacteria[i].destroyed || friendlyBacteria[i].size <= 10) {
            friendlyBacteria.splice(i, 1)
            i--
        } else {
            friendlyBacteria[i].updateSize(friendlyBacteria[i].size - 0.3)
        }
    }
    // do the same for hostile bacteria
    for (let i = 0; i < hostileBacteria.length; i++) {
        if (hostileBacteria[i].destroyed || hostileBacteria[i].size <= 10) {
            hostileBacteria.splice(i, 1)
            i--
        } else {
            hostileBacteria[i].updateSize(hostileBacteria[i].size - 0.3)
        }
    }
}

//utility functions
function randomBacterium(friendStatus) {
    let xPos = Math.floor(Math.random() * (borderWidth - borderStart)) + borderStart
    let yPos = Math.floor(Math.random() * (borderHeight - borderStart)) + borderStart

    return new Bacterium(xPos, yPos, friendStatus)
}

function randomMorsel() {
    let xPos = Math.floor(Math.random() * (borderWidth - borderStart)) + borderStart
    let yPos = Math.floor(Math.random() * (borderHeight - borderStart)) + borderStart
    let amount = Math.floor(Math.random() * 10)
    let speed = Math.floor(Math.random() * 5 + 1) / 10
    let direction = Math.random() * Math.PI * 2

    return new Morsel(xPos, yPos, amount, speed, direction)
}