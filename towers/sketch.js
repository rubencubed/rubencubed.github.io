const gameWidth = 1000
const gameHeight = 500
const blockSize = 50

class Block {
    constructor(x, y, color) {
        this.x = x
        this.y = y
        this.color = color
    }

    move(dir) {
        if (dir == 'left') {
            this.x = this.x - 5 > 0 ? this.x - 5 : 0
        }
        if (dir == 'right') {
            this.x = this.x + 5 < gameWidth - blockSize ? this.x + 5 : gameWidth - blockSize
        }
    }
}

class Game {
    constructor() {
        this.blocks = [new Block(gameWidth - blockSize, gameHeight - blockSize, 20)]
        this.activeIndex = 0
    }

    moveBlock(dir) {
        //move the last block
        const topBlock = this.blocks[this.blocks.length - 1]
        topBlock.move(dir)
    }

    addBlock() {
        const numberOfBlocks = this.blocks.length

        const newBlock = new Block(gameWidth - blockSize, gameHeight - (numberOfBlocks + 1) * blockSize, (20 + numberOfBlocks * 10) % 100)
        this.blocks.push(newBlock)
    }
}

const game = new Game()

function setup() {
    width = Math.min(windowWidth, gameWidth)
    height = Math.min(windowHeight, gameHeight)

    colorMode(HSL, 100)
    createCanvas(width, height)
    background(0, 100, 100)
}

function draw() {
    background(0, 100, 100)
    noStroke()
    game.blocks.map((block) => {
        fill(block.color, 100, 50)
        rect(block.x, block.y, blockSize, blockSize)
    })

    if (keyIsDown(LEFT_ARROW)) {
        game.moveBlock('left')
    }
    if (keyIsDown(RIGHT_ARROW)) {
        game.moveBlock('right')
    }
}

function keyPressed() {
    if (keyCode === 32) {
        game.addBlock()
        console.log(game.blocks[1])
    }
}