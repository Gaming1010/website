let canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext('2d');
let img = new Image();
img.src = "/projects/game_files/sky-bg.png";
canvas.height = window.innerHeight
canvas.width = window.innerWidth


window.onload = function() {
    function loop() {
        ctx.drawImage(img,0,0,can,canvas.height);
    }
    loop();
 
}