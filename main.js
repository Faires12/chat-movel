const socket = io.connect("https://chat-fares-movel.herokuapp.com")

var playerInfos = {
    nome: '',
    x: Math.floor(Math.random() * 1500),
    y: Math.floor(Math.random() * 700),
    color: getRandomColor()
}

function getRandomColor(){
    const hex = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F"]
    let color = "#"
    for(var i = 0; i < 6; i++){
        color += hex[Math.floor(Math.random() * 16)]
    }
    return color
}

var nome
while(true){
    nome = window.prompt("Entre com o seu nome: ")
    if(nome)
        break
}
playerInfos.nome = nome
socket.emit("login", playerInfos)

document.addEventListener("keypress", e => {
    if(document.activeElement === document.getElementById("input"))
        return

    if(e.key === "a")
        playerInfos.x -= 20
    if(e.key === "d")
        playerInfos.x += 20
    if(e.key === "w")
        playerInfos.y -= 20
    if(e.key === "s")
        playerInfos.y += 20

    if(playerInfos.x < 0)
        playerInfos.x = 0
    if(playerInfos.x + 150 > 1500)
        playerInfos.x = 1150
    if(playerInfos.y < 0)
        playerInfos.y = 0
    if(playerInfos.y + 150 > 700)
        playerInfos.y = 550
})

setInterval(() => {
    socket.emit("update", {x: playerInfos.x, y: playerInfos.y})
}, 100)

socket.on("usersPos", users => {
    cleanScreen()
    for(let i in users){
        printPlayer(users[i], i)
    }
})

function cleanScreen(){
    var divs = document.getElementsByTagName("div"), i=divs.length;
    while (i--) {
        var div2 = divs[i].childNodes
        document.body.removeChild(divs[i]);
        child = document.body.lastElementChild;
    }
}

function printPlayer(user, i){
    const div = document.createElement("div")
    div.className = "player"
    div.style.left = `${user.x}px`
    div.style.top = `${user.y}px`
    div.style.backgroundColor = user.color
    div.innerHTML = user.nome   

    if(user.message){
        const message = document.createElement("section")
        message.innerHTML = user.message
        message.style.position = "absolute"
        message.style.top = "-40%"
        message.style.padding = "10px"
        message.style.borderRadius = "10px"
        message.style.border = "1px solid black"
    
        div.appendChild(message)
    }
        
    
    document.body.appendChild(div)
}


function sendMessage(){
    let message = document.getElementById("input").value
    document.getElementById("input").value = ''

    if(message)
        socket.emit("message", message)
}



