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

    hunger() {
        this.food = this.food - 1
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

const gameTick = 5
let lastTime

function setup() {
    width = Math.min(windowWidth, 1200)
    height = Math.min(windowHeight, 600)
    borderWidth = width - 2 * borderStart
    borderHeight = height - 2 * borderStart

    userBacterium = new UserBacterium(100, false)

    for (let i = 0; i < 5; i++) {
        let xPos = getRandomNumberWithCut(
            circleDiameter,
            width / 2 - circleDiameter,
            width / 2 + circleDiameter,
            width - circleDiameter
        )
        let yPos = getRandomNumberWithCut(
            circleDiameter,
            height / 2 - circleDiameter,
            height / 2 + circleDiameter,
            height - circleDiameter
        )
        let speed = Math.floor(Math.random() * 5 + 1) / 10
        let direction = Math.random() * Math.PI * 2

        friendlyBacteria.push(
            new Bacterium(xPos, yPos, speed, direction, 'friendly')
        )
    }
    for (let i = 0; i < 2; i++) {
        let xPos = getRandomNumberWithCut(
            circleDiameter,
            width / 2 - circleDiameter,
            width / 2 + circleDiameter,
            width - circleDiameter
        )
        let yPos = getRandomNumberWithCut(
            circleDiameter,
            height / 2 - circleDiameter,
            height / 2 + circleDiameter,
            height - circleDiameter
        )
        let speed = Math.floor(Math.random() * 5 + 1) / 5
        let direction = Math.random() * Math.PI * 2

        hostileBacteria.push(new Bacterium(xPos, yPos, speed, direction, 'hostile'))
    }
    for (let i = 0; i < 4; i++) {
        let xPos = getRandomNumberWithCut(
            circleDiameter,
            width / 2 - circleDiameter,
            width / 2 + circleDiameter,
            width - circleDiameter
        )
        let yPos = getRandomNumberWithCut(
            circleDiameter,
            height / 2 - circleDiameter,
            height / 2 + circleDiameter,
            height - circleDiameter
        )
        let amount = Math.floor(Math.random() * 10)
        let speed = Math.floor(Math.random() * 5 + 1) / 10
        let direction = Math.random() * Math.PI * 2

        morsels.push(new Morsel(xPos, yPos, amount, speed, direction))
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

    frameRate(24)
    background(200)

    //outside border of game
    noFill()
    stroke(0)
    rect(borderStart, borderStart, borderWidth, borderHeight)

    //control panel (outside game)
    textAlign(CENTER, CENTER)
    text(userBacterium.food + ' food', width - 30, 25)
    fill('green')
    rect(width - 160, 15, 100, 30)
    fill('black')
    text('Reveal', width - 110, 30)

    // only show if user spends food to reveal
    if (userBacterium.nearby) {
        friendlyBacteria.map((friendlyBacterium) => {
            fill('blue')
            stroke(0)
            return circle(
                friendlyBacterium.xPos,
                friendlyBacterium.yPos,
                circleDiameter
            )
        })
        hostileBacteria.map((hostileBacterium) => {
            fill('red')
            stroke(0)
            return circle(
                hostileBacterium.xPos,
                hostileBacterium.yPos,
                circleDiameter
            )
        })
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
    if (
        mouseX > width - 160 &&
        mouseX < width - 60 &&
        mouseY > 15 &&
        mouseY < 45 &&
        !userBacterium.nearby
    ) {
        userBacterium.revealNearby()
    }
    // if (false) {
    //     userBacterium.createEnzyme([])
    // }
}

function handleMovement() {
    // replace out of bounds
    for (let i = 0; i < friendlyBacteria.length; i++) {
        friendlyBacteria[i].updatePosition()
        if (
            friendlyBacteria[i].xPos < borderStart ||
            friendlyBacteria[i].yPos < borderStart ||
            friendlyBacteria[i].xPos > width - borderStart ||
            friendlyBacteria[i].yPos > height - borderStart
        ) {
            let xPos = getRandomNumberWithCut(
                circleDiameter,
                width / 2 - circleDiameter,
                width / 2 + circleDiameter,
                width - circleDiameter
            )
            let yPos = getRandomNumberWithCut(
                circleDiameter,
                height / 2 - circleDiameter,
                height / 2 + circleDiameter,
                height - circleDiameter
            )
            let speed = Math.floor(Math.random() * 5 + 1) / 5
            let direction = Math.random() * Math.PI * 2

            let newFriendlyBacteria = new Bacterium(
                xPos,
                yPos,
                speed,
                direction,
                'friendly'
            )
            friendlyBacteria[i] = newFriendlyBacteria
        }
    }
    for (let i = 0; i < hostileBacteria.length; i++) {
        hostileBacteria[i].updatePosition()
        if (
            hostileBacteria[i].xPos < borderStart ||
            hostileBacteria[i].yPos < borderStart ||
            hostileBacteria[i].xPos > width - borderStart ||
            hostileBacteria[i].yPos > height - borderStart
        ) {
            let xPos = getRandomNumberWithCut(
                circleDiameter,
                width / 2 - circleDiameter,
                width / 2 + circleDiameter,
                width - circleDiameter
            )
            let yPos = getRandomNumberWithCut(
                circleDiameter,
                height / 2 - circleDiameter,
                height / 2 + circleDiameter,
                height - circleDiameter
            )
            let speed = Math.floor(Math.random() * 5 + 1) / 5
            let direction = Math.random() * Math.PI * 2

            let newHostileBacteria = new Bacterium(
                xPos,
                yPos,
                speed,
                direction,
                'hostile'
            )
            hostileBacteria[i] = newHostileBacteria
        }
    }
    for (let i = 0; i < morsels.length; i++) {
        morsels[i].updatePosition()
        if (
            morsels[i].xPos < borderStart ||
            morsels[i].yPos < borderStart ||
            morsels[i].xPos > width - borderStart ||
            morsels[i].yPos > height - borderStart
        ) {
            let xPos = getRandomNumberWithCut(
                circleDiameter,
                width / 2 - circleDiameter,
                width / 2 + circleDiameter,
                width - circleDiameter
            )
            let yPos = getRandomNumberWithCut(
                circleDiameter,
                height / 2 - circleDiameter,
                height / 2 + circleDiameter,
                height - circleDiameter
            )
            let amount = Math.floor(Math.random() * 10)
            let speed = Math.floor(Math.random() * 5 + 1) / 10
            let direction = Math.random() * Math.PI * 2
            let newMorsel = new Morsel(xPos, yPos, amount, speed, direction)
            morsels[i] = newMorsel
        }
    }
}

function gameLoop() {
    // add new hostile bacterium
    let xPos = getRandomNumberWithCut(
        circleDiameter,
        width / 2 - circleDiameter,
        width / 2 + circleDiameter,
        width - circleDiameter
    )
    let yPos = getRandomNumberWithCut(
        circleDiameter,
        height / 2 - circleDiameter,
        height / 2 + circleDiameter,
        height - circleDiameter
    )
    let speed = Math.floor(Math.random() * 5 + 1) / 5
    let direction = Math.random() * Math.PI * 2

    hostileBacteria.push(new Bacterium(xPos, yPos, speed, direction, 'hostile'))

    // add two new morsels
    for (let i = 0; i < 2; i++) {
        let xPos = getRandomNumberWithCut(
            circleDiameter,
            width / 2 - circleDiameter,
            width / 2 + circleDiameter,
            width - circleDiameter
        )
        let yPos = getRandomNumberWithCut(
            circleDiameter,
            height / 2 - circleDiameter,
            height / 2 + circleDiameter,
            height - circleDiameter
        )
        let amount = Math.floor(Math.random() * 10)
        let speed = Math.floor(Math.random() * 5 + 1) / 10
        let direction = Math.random() * Math.PI * 2

        morsels.push(new Morsel(xPos, yPos, amount, speed, direction))
    }

    // deduct user food for existing
    userBacterium.hunger()
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
