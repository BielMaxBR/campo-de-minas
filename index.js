const canvas = document.getElementById("tela")
const ctx = canvas.getContext("2d")

const button = document.getElementById("reset")

let screen = []
const width = 20
const height = 19
const bombQuantity = 40

let flags = bombQuantity

let sizeX = canvas.width / width
let sizeY = canvas.height / height

let click = {}
let start = true
let loose = false
let win = false
let hiddenTiles = width * height

const loopCode = 0
function init() {
    console.log("iniciando...")
    createScreen()
    loop()
}

function loop() {
    win = flags == 0 && hiddenTiles == bombQuantity

    draw()
    if (!win || !loose) requestAnimationFrame(loop, 1)

}

function reset() {
    loose = false
    win = false
    click = {}
    start = true
    flags = bombQuantity
    screen = []
    hiddenTiles = width * height
    button.style.display = "none"
    init()
}

init()

function createScreen() {
    console.log("criando a tela")
    for (let x = 0; x < width; x++) {
        screen[x] = []
        for (let y = 0; y < height; y++) {
            screen[x][y] = {
                object: "none",
                hidden: true,
                flag: false,
                number: 0
            }
        }
    }
}

function setBombs(touchX, touchY) {
    for (let i = 0; i < bombQuantity; i++) {
        let randomX = Math.floor(Math.random() * width)
        let randomY = Math.floor(Math.random() * height)

        let tile = screen[randomX][randomY]

        const wait = _ => {
            let touchIsNeighbor = false
            const touchIsRandom = (touchX == randomX && touchY == randomY)
            
            getNeighbors(randomX, randomY, (_neighbor, x, y) => {
                if (x == touchX && y == touchY) {
                    touchIsNeighbor = true
                }
            })

            if (tile.object == "bomb" || touchIsNeighbor || touchIsRandom) {

                randomX = Math.floor(Math.random() * width)
                randomY = Math.floor(Math.random() * height)
                tile = screen[randomX][randomY]
                requestAnimationFrame(wait, 1)

            } else {
                tile.object = "bomb"
                tile.number = 0
                
                getNeighbors(randomX, randomY, neighbor => {
                    if (neighbor.object != "bomb") neighbor.number += 1
                })
            }
        }
        wait()
    }
}

function getNeighbors(_x, _y, callback) {
    for (let x = _x - 1; x <= _x + 1; x++) {
        for (let y = _y - 1; y <= _y + 1; y++) {
            const neighbor = screen?.[x]?.[y]
            if (neighbor === undefined) continue
            callback(neighbor, x, y)
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

            if (neighbor.hidden) {
                neighbor.hidden = false
                hiddenTiles--
            }

            if (neighbor.number == 0 || flags == 0) {
                if (neighbor.object == "bomb") {
                    console.log("perdeu!")
                    loose = true

                    return
                }
                clean(__x, __y)
            }
        })
    }
    clean(x, y)
}

function draw() {
    setCSS()
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
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

    // UI
    ctx.fillStyle = "red"
    ctx.font = "30px Arial"
    ctx.fillText(`B: ${flags}`, 18 * sizeX, (20) * sizeY)

    if (loose) {
        ctx.fillText("PERDESTE", 0 * sizeX, (20) * sizeY)
        setResetButton()
    }
    else if (win) {
        ctx.fillStyle = "green"
        ctx.fillText("GANHASTE", 0 * sizeX, (20) * sizeY)
        setResetButton()
    }
}

function setResetButton() {
    button.style = `position: absolute; left: 47%; top: ${19 * sizeY}px; display: inline-block`
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
    sizeY = canvas.height / (height + 1)
}

canvas.addEventListener("mousedown", event => {
    event.preventDefault()

    release = false
    clickEvent(event)
    const tileX = Math.floor(click.x / sizeX)
    const tileY = Math.floor(click.y / sizeY)
    const tile = screen[tileX][tileY]

    switch (click.button) {
        case 0: // left
            break
        case 2: // right
            // marca bandeira
            if (!tile) return
            if (tile.hidden) {
                tile.flag = !tile.flag
                flags--
                return
            }
    }
})

canvas.addEventListener("mouseup", event => {
    event.preventDefault()
    clickEvent(event, false)
    const tileX = Math.floor(click.x / sizeX)
    const tileY = Math.floor(click.y / sizeY)
    const tile = screen[tileX][tileY]

    if (click.button != 0) return

    if (start) {
        setBombs(tileX, tileY)
        start = false
        return
    }
    if (!tile) return

    release = true

    if (!tile.flag) {
        if (tile.hidden) {
            tile.hidden = false
            hiddenTiles--
        }
        if (tile.object == "bomb") {
            console.log("perdeu")
            loose = true

        } else if (tile.number == 0) {
            clearVarious(tileX, tileY)
        }
        return
    }
})

canvas.addEventListener("dblclick", event => {
    clickEvent(event, true, true)
    console.log("double!")

    const tileX = Math.floor(click.x / sizeX)
    const tileY = Math.floor(click.y / sizeY)
    const tile = screen[tileX][tileY]
    if (!tile) return
    if (tile.object == "bomb") {
        loose = true
        console.log("perdeu paia")
        return
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

canvas.addEventListener("contextmenu", e => e.preventDefault())

button.addEventListener("click", reset)
