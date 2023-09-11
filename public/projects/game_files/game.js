let canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext('2d');
let game_bg = new Image();
game_bg.src = "/projects/game_files/sky-bg.png";
canvas.height = window.innerHeight;
canvas.width = window.innerWidth;

function drawImageProp(ctx, game_bg, x, y, w, h, offsetX, offsetY) {

    if (arguments.length === 2) {
        x = y = 0;
        w = ctx.canvas.width;
        h = ctx.canvas.height;
    }

    // default offset is center
    offsetX = typeof offsetX === "number" ? offsetX : 0.5;
    offsetY = typeof offsetY === "number" ? offsetY : 0.5;

    // keep bounds [0.0, 1.0]
    if (offsetX < 0) offsetX = 0;
    if (offsetY < 0) offsetY = 0;
    if (offsetX > 1) offsetX = 1;
    if (offsetY > 1) offsetY = 1;

    var iw = game_bg.width,
        ih = game_bg.height,
        r = Math.min(w / iw, h / ih),
        nw = iw * r,   // new prop. width
        nh = ih * r,   // new prop. height
        cx, cy, cw, ch, ar = 1;

    // decide which gap to fill    
    if (nw < w) ar = w / nw;                             
    if (Math.abs(ar - 1) < 1e-14 && nh < h) ar = h / nh;  // updated
    nw *= ar;
    nh *= ar;

    // calc source rectangle
    cw = iw / (nw / w);
    ch = ih / (nh / h);

    cx = (iw - cw) * offsetX;
    cy = (ih - ch) * offsetY;

    // make sure source rectangle is valid
    if (cx < 0) cx = 0;
    if (cy < 0) cy = 0;
    if (cw > iw) cw = iw;
    if (ch > ih) ch = ih;

    // fill image in dest. rectangle
    ctx.drawImage(game_bg, cx, cy, cw, ch,  x, y, w, h);
}

function drawImage() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    drawImageProp(ctx, game_bg, 0, 0, canvas.width, canvas.height,(offsetX/10),0);
    console.log(offsetX);
}

var offsetX = 0;
document.addEventListener('keypress', (event) => {
    let name = event.key;
    if (name == "a"){
        for (var i=0; i<10; i++) {
            console.log(i)
            setTimeout(() =>{
                offsetX = offsetX - 0.01
                drawImage();
            });
        }
        console.log(name);
    };
    if (name == "d"){
        for (let i=0; i<10; i++) {
            setTimeout(() =>{
                offsetX = offsetX + 0.1
                drawImage();
            }, 100);
        }
        console.log(name);
    }
}, false);
window.onload = function(){
    drawImage();
}