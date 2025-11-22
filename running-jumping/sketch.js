class Platform {
    constructor(left, right, height) {
        this.left = left
        this.right = right
        this.height = height
    }

    move(speed) {//note sure if this is valid
        this.left = this.left - speed
        this.right = this.right - speed
    }
}

class Jumper {
    constructor(xPosition, yPosition, diameter) {
        this.xPosition = xPosition
        this.yPosition = yPosition
        this.diameter = diameter
    }

    moveLeft(distance) {
        this.xPosition = this.xPosition - distance
    }
    moveRight(distance) {
        this.xPosition = this.xPosition + distance
    }
}

//generate platform object which stores values, add to array
//intitialize a line with those values as variables (should update as object updates?)
//delete line after off screen do it doesn't try to keep rendering, remove object from array

let currentlyJumping = false
let gameRunning = false
let speed = 3//update based on how long the game has gone on

let platforms = [new Platform(50, 150, 760), new Platform(250, 350, 710), new Platform(450, 550, 660)]
let circleJumper = new Jumper(100, 750, 20)
let currentPlatform = 0

let instruction = 'Press "a" to go left, "d" to go right, and the spacebar to jump'

function setup() {
    createCanvas(windowWidth - 100, windowHeight - 100)
    background(75)
}

function draw() {
    background(75)
    circle(circleJumper.xPosition, circleJumper.yPosition, circleJumper.diameter)
    textSize(20)
    fill(255)
    text(instruction, 10, 10, 250, 250)

    for (let platform of platforms) {
        line(platform.left, platform.height, platform.right, platform.height)
    }

    if (keyIsDown(65) && circleJumper.xPosition - 10 > 0) {//press "a" to go left
        if (currentlyJumping || circleJumper.xPosition - 3 > platforms[currentPlatform].left) {
            circleJumper.moveLeft(3)
        }
    }
    if (keyIsDown(68) && circleJumper.xPosition + 10 < windowWidth - 100) {//press "d" to go right
        if (currentlyJumping || circleJumper.xPosition + 3 < platforms[currentPlatform].right)
            circleJumper.moveRight(3)
    }
}

function keyPressed() {
    if (keyCode === 32) {
        //startGame if game not started
        if (currentlyJumping == true) return

        currentlyJumping = true
        motionOfArc()
    }
}

//how to stop if lands on a platform
function motionOfArc() {
    let counter = 0
    let startingHeight = circleJumper.yPosition
    let motion = setInterval(() => {
        let nextHeight = Math.pow(counter / 10 - 12, 2) - 144 + startingHeight
        let stopJump = circleLands(counter, nextHeight)
        if (stopJump !== false) {
            clearInterval(motion)
            currentlyJumping = false
            circleJumper['yPosition'] = stopJump
            return
        }
        circleJumper['yPosition'] = nextHeight
        counter++
    }, 2)
}

function circleLands(counter, nextHeight) {
    for (let index = 0; index < platforms.length; index++) {
        if (counter > 121 && platforms[index].left <= circleJumper.xPosition && circleJumper.xPosition <= platforms[index].right && circleJumper.yPosition + 10 <= platforms[index].height && nextHeight + 10 > platforms[index].height) {
            currentPlatform = index
            return platforms[index].height - 10
        }
    }
    return false
}

// function startGame() {
//     //generate platforms
//     //run movePlatforms
//     //end game when ball height goes below canvas track with variable
// }

// function movePlatforms(){
//     for(let platform of platforms){
//         platform.move(speed)
//     }
// }