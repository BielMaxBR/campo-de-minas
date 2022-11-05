const canvas = document.getElementById("tela")
const ctx = canvas.getContext("2d")

const screen = []
const width = 20
const height = 20

let sizeX = canvas.width / width
let sizeY = canvas.height / height

let click = {}

function init() {
    createScreen()
    loop()
}

function loop() {
    draw()
    requestAnimationFrame(loop, 1)
}

function reset() {

}

init()

function createScreen() {
    for (var x = 0; x < width; x++) {
        screen[x] = []
        for (var y = 0; y < height; y++) {
            screen[x][y] = "grey"
        }
    }
}

function draw() {
    setCSS()
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    for (var x = 0; x < width; x++) {
        for (var y = 0; y < height; y++) {
            ctx.fillStyle = screen[x][y]
            ctx.fillRect(x * sizeX + 1, y * sizeY + 1, sizeX - 2, sizeY - 2)
        }
    }
}

function setCSS() {
    if (innerHeight < innerWidth) {
        canvas.width = innerHeight - 5
        canvas.height = innerHeight - 5
    } else {
        canvas.width = innerWidth - 5
        canvas.height = innerWidth - 5
    }

    sizeX = canvas.width / width
    sizeY = canvas.height / height
}

canvas.addEventListener("mousedown", event => {
    clickEvent(event)

    const tileX = Math.floor(click.x / sizeX)
    const tileY = Math.floor(click.y / sizeY)
    screen[tileX][tileY] = "white"
})

canvas.addEventListener("mouseup", event => {
    clickEvent(event, false)
})

canvas.addEventListener("dblclick", event => {
    clickEvent(event, true, true)
})


function clickEvent(event, isClick = true, dbclick = false) {
    const canvasPosition = canvas.getBoundingClientRect()
    click = {
        isDown: isClick,
        dbclick,
        x: event.clientX - canvasPosition.x,
        y: event.clientY - canvasPosition.y

    }
}