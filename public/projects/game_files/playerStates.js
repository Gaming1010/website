const states = {
    sitting: 0,
    running: 1,
    jumping: 2,
}

class State {
    constructor(state) {
        this.state = state;
    }
}

export class Sitting extends State {
    constructor(player) {
        super('sitting')
        this.player = player;
    }
    enter(){
        this.player.frameY = 0
    }
    handleInput(input){
        if(input.includes('a')||input.includes('d')||input.includes('ArrowLeft')||input.includes('ArrowRight')){
            this.player.setState(states.running);
        } else if(input.includes('w') || input.includes('ArrowUp')){
            this.player.setState(states.jumping);
        }
    }
}

export class Running extends State {
    constructor(player) {
        super('running')
        this.player = player;
    }
    enter(){
        this.player.frameY = 1
    }
    handleInput(input){
        if (this.player.vy == 0 && this.player.speed == 0) {
            this.player.setState(states.sitting);
        } else if(input.includes('w') || input.includes('ArrowUp')){
            this.player.setState(states.jumping);
        }
    }
}

export class Jumping extends State {
    constructor(player) {
        super('jumping');
        this.player = player;
    }
    enter(){
        if (this.player.onGround()) this.player.vy -=27;
        this.player.frameY = 2;
    }
    handleInput(input){
        if (this.player.)
        if (this.player.vy == 0 && this.player.speed == 0) {
            this.player.setState(states.sitting);
        }
    }
}