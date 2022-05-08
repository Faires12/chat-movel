const socket = io.connect("http://localhost:3000")

const video = document.createElement("video")
const canvas = document.createElement("canvas")
canvas.width = 150
canvas.height = 150
const ctx = canvas.getContext("2d")
let permitiuVideo = false

navigator.mediaDevices.getUserMedia({video: {
    width: 150,
    height: 150
}}).then(frame => {
    permitiuVideo = true
    video.srcObject = frame
    video.play()
}).catch(() => permitiuVideo = false)

var permitiuAudio = false
var audio = ""
const audioTag = document.createElement("audio")
navigator.mediaDevices.getUserMedia({audio: true}).then( function(stream) {
    function record_and_send() {
        const recorder = new MediaRecorder(stream);
        const chunks = [];
        recorder.ondataavailable = e => chunks.push(e.data);
        recorder.onstop = async (e) => {
            socket.emit("getAudio", chunks)
        }
        recorder.start();
        setTimeout(()=> recorder.stop(), 400);    
    }

    setInterval(record_and_send, 400);
}).catch(() => permitiuAudio = false);

var playerInfos = {
    nome: '',
    x: Math.floor(Math.random() * 100),
    y: Math.floor(Math.random() * 100),
    color: getRandomColor(),
    video: undefined
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
    if(document.activeElement === document.getElementById("input") && e.key !== "Enter")
        return

    if(e.key === "a" || e.key === "A")
        playerInfos.x -= 2
    if(e.key === "d" || e.key === "D")
        playerInfos.x += 2
    if(e.key === "w" || e.key === "W")
        playerInfos.y -= 2
    if(e.key === "s" || e.key === "S")
        playerInfos.y += 2
    if(e.key === "Enter")
        sendMessage()

    let porcPlayerX = (250/screen.width) * 50
    let porcPlayerY = (250/screen.height) * 50
    let porcInputY = (50/screen.height) * 100

    if(playerInfos.x - porcPlayerX  < 0)
        playerInfos.x = porcPlayerX
    if(playerInfos.x + porcPlayerX > 100){
        playerInfos.x = 100 - porcPlayerX
    }    
    if(playerInfos.y - porcPlayerY < 0)
        playerInfos.y = porcPlayerY
    if(playerInfos.y + porcPlayerY + porcInputY > 100)
        playerInfos.y = 100 - porcPlayerY - porcInputY
})

function blobToBase64(blob) {
    return new Promise((resolve, _) => {
    const reader = new FileReader();
    reader.onloadend = () => {resolve(reader.result);};
    reader.readAsDataURL(blob);
    });
}

setInterval(() => {
    let imgEnviada = ""
    if(permitiuVideo){
        ctx.drawImage(video, 0, 0)
        imgEnviada = canvas.toDataURL("image/jpeg")
    }
    socket.emit("update", {x: playerInfos.x, y: playerInfos.y, video: imgEnviada})
}, 50)

socket.on("usersPos", users => {
    cleanScreen()
    for(let i in users){
        printPlayer(users[i], i)
    }
})

socket.on("audio", async (audio) => {
    console.log(audio)

    const audioPlay = new Audio(await blobToBase64(new Blob(audio, {type: 'audio/ogg'})))
    audioPlay.play()
})

function cleanScreen(){
    var divs = document.getElementsByTagName("div"), i=divs.length;
    while (i--) {
        document.body.removeChild(divs[i]);
        child = document.body.lastElementChild;
    }
}


function printPlayer(user, i){
    const div = document.createElement("div")
    div.className = "player"
    div.style.left = `${user.x}%`
    div.style.top = `${user.y}%`

    if(user.message){
        const message = document.createElement("section")
        message.innerHTML = user.message
        message.className = "message"
        div.appendChild(message)
    }
        
    const img = document.createElement("img")
    img.width = 250
    img.height = 250
    
    img.src = user.video
    div.appendChild(img)

    const nome = document.createElement("section")
    nome.innerHTML = user.nome
    nome.style.marginTop = "10px"
    nome.style.color = "white"
    div.appendChild(nome)

    document.body.appendChild(div)
}


function sendMessage(){
    let message = document.getElementById("input").value
    document.getElementById("input").value = ''

    if(message)
        socket.emit("message", message)
}



