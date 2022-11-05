const canvas = document.getElementById("tela")
const ctx = canvas.getContext("2d")

const screen = []
const width = 20
const height = 20
const bombQuantity = 30

let sizeX = canvas.width / width
let sizeY = canvas.height / height

let click = {}
let start = true

function init() {
    createScreen()
    setBombs()
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
            screen[x][y] = {
                object: "none",
                hidden: true,
                flag: false,
                number: 0
            }
        }
    }
}

function setBombs() {
    for (let i = 0; i < bombQuantity; i++) {
        let randomX = Math.floor(Math.random() * width)
        let randomY = Math.floor(Math.random() * height)

        let tile = screen[randomX][randomY]
        while (tile.object == "bomb") {
            randomX = Math.floor(Math.random() * width)
            randomY = Math.floor(Math.random() * height)
            tile = screen[randomX][randomY]
        }

        tile.object = "bomb"
        getNeighbors(randomX, randomY, (neighbor, x, y) => {
            if (neighbor.object != "bomb") neighbor.number += 1
        })
    }
}

function getNeighbors(_x, _y, callback) {
    for (let x = _x - 1; x <= _x + 1; x++) {
        for (let y = _y - 1; y <= _y + 1; y++) {
            if (screen[x] != undefined) {
                if (screen[x][y] != undefined) {
                    if (screen[x][y] != screen[_x][_y]) {
                        const neighbor = screen[x][y]
                        callback(neighbor, x, y)
                    }

                }
            }
        }
    }
}

function clearVarious(x, y) {
    const stack = []
    const clean = (_x, _y) => {
        getNeighbors(_x, _y, (neighbor, __x, __y) => {
            if (stack.includes(neighbor)) return
            if (neighbor.flag) return
            stack.push(neighbor)
            neighbor.hidden = false
            if (neighbor.number == 0) {
                clean(__x, __y)
            }
        })
    }
    clean(x, y)
}

function draw() {
    setCSS()
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    for (var x = 0; x < width; x++) {
        for (var y = 0; y < height; y++) {
            const tile = screen[x][y]
            if (!tile.hidden) {

                if (tile.object == "bomb") {
                    ctx.fillStyle = "yellow"
                } else {
                    ctx.fillStyle = "white"
                }

                ctx.fillRect(x * sizeX + 1, y * sizeY + 1, sizeX - 2, sizeY - 2)

                if (tile.number > 0) {
                    ctx.fillStyle = `rgb(${Math.cos(tile.number) * 255},${Math.sin(tile.number) * 255},${Math.tan(tile.number) * 255})`
                    ctx.font = "30px Arial";
                    ctx.fillText(tile.number, x * sizeX, (y + 1) * sizeY);
                }
            } else {
                ctx.fillStyle = "grey"
                ctx.fillRect(x * sizeX + 1, y * sizeY + 1, sizeX - 2, sizeY - 2)

                if (tile.flag) {
                    ctx.fillStyle = "red"
                    ctx.font = "30px Arial";
                    ctx.fillText(" B", x * sizeX, (y + 1) * sizeY);
                }

            }
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
    event.preventDefault()


    clickEvent(event)
    const tileX = Math.floor(click.x / sizeX)
    const tileY = Math.floor(click.y / sizeY)
    const tile = screen[tileX][tileY]
    while (tile.object == "bomb" || tile.number != 0) {
        createScreen()
        setBombs()
    }
    switch (click.button) {
        case 0: // left
            if (!tile.flag) {
                tile.hidden = false
                if (tile.object == "bomb") {
                    console.log("perdeu")
                } else if (tile.number == 0){
                    clearVarious(tileX, tileY)
                }
                return
            }
            break
        case 2: // right
            // marca bandeira
            if (tile.hidden) {
                tile.flag = !tile.flag
                return
            }
    }
})

canvas.addEventListener("mouseup", event => {
    event.preventDefault()
    clickEvent(event, false)
})

canvas.addEventListener("dblclick", event => {
    clickEvent(event, true, true)
    console.log("double!")

    const tileX = Math.floor(click.x / sizeX)
    const tileY = Math.floor(click.y / sizeY)
    const tile = screen[tileX][tileY]
    //tile.hidden = false
    if (tile.object == "bomb") {
        // perdeu
    }
    else if (!tile.flag) {
        let counter = 0
        getNeighbors(tileX, tileY, neighbor => {
            if (neighbor.flag) counter++
        })

        if (counter == tile.number) {
            clearVarious(tileX, tileY)
        }
    }
})

function clickEvent(event, isClick = true, dbclick = false) {
    const canvasPosition = canvas.getBoundingClientRect()
    click = {
        button: event.button,
        isDown: isClick,
        dbclick,
        x: event.clientX - canvasPosition.x,
        y: event.clientY - canvasPosition.y

    }
}

canvas.addEventListener("contextmenu", e => e.preventDefault());