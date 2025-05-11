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
}

class UserBacterium {
    constructor(energy, nearbyFriends, nearbyEnemies, nearbyMorsels) {
        this.energy = energy
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

    hunger() {
        this.energy = this.energy - 1
    }

    createFriend(friendlyBacteria) {
        friendlyBacteria.push(randomBacterium('friendly'))
    }

    createEnzyme(morsels) {
        for (const morsel of morsels) {
            if (this.energy > 0) {
                this.energy = this.energy - 5
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

const gameTick = 10
let lastTime
let gameOver = false

function setup() {
    width = Math.min(windowWidth, 1200)
    height = Math.min(windowHeight, 600)
    borderWidth = width - 2 * borderStart
    borderHeight = height - 2 * borderStart

    userBacterium = new UserBacterium(100, false)

    // friendly bacteria initial generation
    for (let i = 0; i < 1; i++) {
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
    // hostile bacteria initial generation
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
    // morsel initial generation
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
    if (!gameOver) {
        userBacterium.hunger()
        if (userBacterium.energy <= 0) {
            gameOver = true
        }
    }

}

//utility functions
function randomBacterium(friendStatus) {
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

    return new Bacterium(xPos, yPos, speed, direction, friendStatus)
}

function randomMorsel() {
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
