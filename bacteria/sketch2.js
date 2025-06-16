class Bacterium {
    static glowTime = 3
    static glowApexTime = Bacterium.glowTime / 2

    constructor(xPos, yPos, affiliation, size) {
        this.xPos = xPos
        this.yPos = yPos
        this.affiliation = affiliation

        this.size = Math.random() * 50 + 25
        this.speed = Math.floor(Math.random() * 3 + 2) / 10
        this.direction = Math.random() * Math.PI * 2
        this.directionChangeProbability = 0

        this.destroyed = false
        this.isGlowing = false
        this.glowStartTime = 0
        this.glowSize = 0
        this.maxGlowSize = 0
        this.hasReleasedEnzyme = false
    }

    glow(otherBacteria, morsels) {
        if (this.isGlowing) {
            const currentTime = Date.now() - this.glowStartTime
            if (currentTime > Bacterium.glowTime * 1000) {
                this.isGlowing = false
            } else {
                if (currentTime >= Bacterium.glowApexTime * 1000 && !this.hasReleasedEnzyme) {
                    let nearbyFriends = 0
                    let nearbyEnemies = 0
                    let nearbyFood = 0

                    const nearbyBacteria = []
                    const nearbyMorsels = []

                    for (const otherBacterium of otherBacteria) {
                        if (
                            Math.hypot(
                                this.xPos - otherBacterium.xPos,
                                this.yPos - otherBacterium.yPos
                            ) <= this.glowSize / 2
                        ) {
                            if (otherBacterium.affiliation == this.affiliation) {
                                nearbyFriends++
                            } else {
                                nearbyEnemies++
                            }
                            nearbyBacteria.push(otherBacterium)
                        }
                    }
                    for (const morsel of morsels) {
                        if (
                            Math.hypot(
                                this.xPos - morsel.xPos,
                                this.yPos - morsel.yPos
                            ) <= this.glowSize / 2
                        ) {
                            nearbyFood += morsel.amount
                            nearbyMorsels.push(morsel)
                        }
                    }

                    if (nearbyEnemies >= nearbyFriends / 2 && Math.random() < 0.7) {
                        this.releasePoison(nearbyBacteria, this.affiliation)
                    } else if (nearbyFriends >= nearbyEnemies && nearbyFood >= this.size * 0.1) {
                        this.releaseEnzyme(nearbyBacteria, nearbyMorsels, nearbyFood)
                    }

                    this.hasReleasedEnzyme = true
                }

                const t = currentTime / 1000
                const peak = Bacterium.glowApexTime
                this.glowSize = this.maxGlowSize * (1 - Math.pow((t - peak) / peak, 2))
            }
        } else {
            this.isGlowing = true
            this.glowSize = this.size
            this.maxGlowSize = this.size * Bacterium.glowTime
            this.glowStartTime = Date.now()
            this.hasReleasedEnzyme = false
        }
    }

    split(otherBacteria) {
        this.xPos -= this.size / 2
        this.yPos -= this.size / 2
        this.size /= 2

        otherBacteria.push(new Bacterium())
        return
    }
    // area + new / area gives factor, multiply diameter by square of factor
    releaseEnzyme(nearbyBacteria, nearbyMorsels, nearbyFoodAmount) {
        //this one needs to predict not the diameter reduction but the area lost
        this.size = this.size * 0.97
        const thisBacteriumArea = Math.PI * Math.pow(this.size, 2) / 4
        const thisAreaFactor = (thisBacteriumArea + Math.floor((nearbyFoodAmount * 10) / (nearbyBacteria.length + 1))) / thisBacteriumArea
        this.size = this.size * Math.sqrt(thisAreaFactor)
        for (const nearbyMorsel of nearbyMorsels) {
            nearbyMorsel.dissolve()
        }
        for (const nearbyBacterium of nearbyBacteria) {
            const bacteriumArea = Math.PI * Math.pow(nearbyBacterium.size, 2) / 4
            const areaFactor = (bacteriumArea + Math.floor((nearbyFoodAmount * 10) / (nearbyBacteria.length + 1))) / bacteriumArea
            nearbyBacterium.size = nearbyBacterium.size * Math.sqrt(areaFactor)
            // nearbyBacterium.size += Math.floor(nearbyFoodAmount / nearbyBacteria.length)
        }
    }
    // opposite of current bacterium's affiliation
    releasePoison(nearbyBacteria, affiliation) {
        for (const nearbyBacterium of nearbyBacteria) {
            if (nearbyBacterium.affiliation !== affiliation) {
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

let bacteria = []
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
    text('Add Food', width - 450, 30)

    let c

    bacteria.map((bacterium) => {
        // continue glow if currently glowing
        if (bacterium.isGlowing) {
            bacterium.glow(bacteria, morsels)
        }

        colorMode(RGB, 255)
        c = bacterium.affiliation == 'friendly' ? color(0, 0, 255) : color(255, 0, 0)

        if (bacterium.isGlowing) {
            c.setAlpha(50)
            fill(c)
            noStroke()
            circle(
                bacterium.xPos,
                bacterium.yPos,
                bacterium.glowSize
            )
        }

        c.setAlpha(255)
        fill(c)
        stroke(0)
        circle(
            bacterium.xPos,
            bacterium.yPos,
            bacterium.size
        )
    })

    morsels.map((morsel) => {
        fill('black')
        noStroke()
        circle(morsel.xPos, morsel.yPos, morsel.amount)
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
        bacteria.push(randomBacterium('friendly'))
    }
    // Add enemy
    if (
        mouseX > width - 350 &&
        mouseX < width - 250 &&
        mouseY > 15 &&
        mouseY < 45
    ) {
        bacteria.push(randomBacterium('hostile'))
    }
    // Add morsel
    if (
        mouseX > width - 500 &&
        mouseX < width - 400 &&
        mouseY > 15 &&
        mouseY < 45
    ) {
        morsels.push(randomMorsel())
        morsels.push(randomMorsel())
        morsels.push(randomMorsel())
        morsels.push(randomMorsel())
        morsels.push(randomMorsel())
    }
}

function handleMovement() {
    // replace out of bounds
    for (let i = 0; i < bacteria.length; i++) {
        bacteria[i].updatePosition()

        // flip direction on x-axis
        if (
            bacteria[i].xPos <= borderStart ||
            bacteria[i].xPos >= width - borderStart
        ) {
            bacteria[i].setDirection(Math.PI - bacteria[i].direction)

            //in case it has gone way past the border
            if (bacteria[i].xPos <= borderStart) {
                bacteria[i].setPosition(borderStart + 1, bacteria[i].yPos)
            } else {
                bacteria[i].setPosition(width - borderStart - 1, bacteria[i].yPos)
            }
        }
        // flip direction on y-axis
        if (
            bacteria[i].yPos <= borderStart ||
            bacteria[i].yPos >= height - borderStart
        ) {
            bacteria[i].setDirection(-1 * bacteria[i].direction)

            //in case it has gone way past the border
            if (bacteria[i].yPos <= borderStart) {
                bacteria[i].setPosition(bacteria[i].xPos, borderStart + 1)
            } else {
                bacteria[i].setPosition(bacteria[i].xPos, height - borderStart - 1)
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
    for (let i = 0; i < bacteria.length; i++) {
        if (bacteria[i].destroyed || bacteria[i].size <= 10) {
            // turn bacterium into morsel(s)
            let amountOfMorselToBeMade = Math.PI * Math.pow(bacteria[i].size, 2) / 4
            console.log(amountOfMorselToBeMade)
            while (amountOfMorselToBeMade > 0) {
                const amount = Math.floor(Math.random() * 5) + 6
                const speed = Math.floor(Math.random() * 5 + 1) / 10
                const direction = Math.random() * Math.PI * 2

                morsels.push(new Morsel(bacteria[i].xPos, bacteria[i].yPos, amount, speed, direction))

                amountOfMorselToBeMade -= Math.PI * Math.pow(amount, 2) / 4
                console.log('amount subtracted: ' + amount)
                console.log('remaining amount: ' + amountOfMorselToBeMade)
            }

            bacteria.splice(i, 1)
            i--
        } else {
            bacteria[i].updateSize(bacteria[i].size - 0.3)
            if (!bacteria.isGlowing && Math.random() < 0.05) {
                bacteria[i].glow(bacteria, morsels)
            }
        }
    }

    for (let i = 0; i < morsels.length; i++) {
        if (morsels[i].dissolved) {
            morsels.splice(i, 1)
            i--
        }
    }

    // add new bacterial and morsels in
    for (let i = 0; i < 1; i++) {
        if (Math.random() < 0.2) bacteria.push(randomBacterium('friendly'))
    }
    for (let i = 0; i < 1; i++) {
        if (Math.random() < 0.2) bacteria.push(randomBacterium('hostile'))
    }
    for (let i = 0; i < 1; i++) {
        morsels.push(randomMorsel())
    }
}

//utility functions
function randomBacterium(friendStatus) {
    const xPos = Math.floor(Math.random() * (borderWidth - borderStart)) + borderStart
    const yPos = Math.floor(Math.random() * (borderHeight - borderStart)) + borderStart

    return new Bacterium(xPos, yPos, friendStatus)
}

function randomMorsel() {
    const xPos = Math.floor(Math.random() * (borderWidth - borderStart)) + borderStart
    const yPos = Math.floor(Math.random() * (borderHeight - borderStart)) + borderStart
    const amount = Math.floor(Math.random() * 5) + 6
    const speed = Math.floor(Math.random() * 5 + 1) / 10
    const direction = Math.random() * Math.PI * 2

    return new Morsel(xPos, yPos, amount, speed, direction)
}