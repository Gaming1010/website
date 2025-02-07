import { Sitting, Running, Jumping} from "./playerStates.js";

export class Player {
    constructor(game){
        this.game = game;
        this.width = 128;
        this.height = 130;
        this.x = 0;
        this.y = this.game.height - this.height;
        this.image = document.getElementById('player');
        this.frameX = 0;
        this.frameY = 0;
        this.vy = 0;
        this.weight = 1; 
        this.speed = 0;
        this.maxSpeed = 10;
        this.states = [new Sitting(this),new Running(this),new Jumping(this)];
        this.currentState = this.states[0];
        this.currentState.enter();
    }
    update(input){
        this.currentState.handleInput(input)
        //hm
        this.x += this.speed;
        if (input.includes('d')) this.speed = this.maxSpeed;
        else if (input.includes('a')) this.speed = -this.maxSpeed;
        else if (this.speed > 0 ) this.speed = this.speed-2;
        else if (this.speed < 0 ) this.speed = this.speed+2;
        if (this.x < 0 ) this.x = 0;
        else if (this.x > this.game.width - this.width) this.x = this.game.width - this.width;
        //vm
        //if (input.includes('w') && this.onGround()) this.vy -= 27;
        this.y += this.vy; 
        if (!this.onGround()) this.vy += this.weight;
        else this.vy = 0;
    }
    draw(context){
        context.drawImage(this.image,this.frameX*this.width,this.frameY*this.height,this.width,this.height,this.x,this.y,this.width,this.height);
    }
    onGround(){
        return this.y >= this.game.height - this.height;
    }
    setState(state){
        this.currentState = this.states[state];
        this.currentState.enter()
    }
}