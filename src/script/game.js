
const CELL_SZ = 16;

function getDictValues(dict) {
    let values = [];
    for (const [key, value] of Object.entries(dict)) {
        values.push(value);
    }
    return values;
}

var PLAYER_TEX_IDX;

class SimpleAnimatedObject {
    immortal = false;

    alive = true;

    x;
    y;
    dx;
    dy;

    step_cnt = 0;
    anim_step = 4;

    anim_tex_idx = [];

    last_tex_idx = -1;

    constructor(immortal, tex_idx, x0, y0, adx=0, ady=0, anim_cnt = 4) {
        // console.log("Dust create");
        this.immortal = immortal;

        this.x = x0;
        this.y = y0;
        this.dx = adx;
        this.dy = ady;
        this.anim_tex_idx.push(...tex_idx);
        this.anim_step = anim_cnt;
    }

    step() {
        // console.log("Dust step");
        this.x += this.dx;
        this.y += this.dy;

        this.step_cnt += 1;

        return this.alive;

        // if (this.last_tex_idx == this.anim_tex_idx.length - 1) {
        //     return false;
        //     // console.log("Dust die");
        // }
        // return true;
    }

    getTexIdx() {
        // if ((this.anim_tex_idx.length) * this.anim_step <= this.step_cnt) {
        //     this.dead = true;
        // }

        if (this.step_cnt >= this.anim_tex_idx.length * this.anim_step) {
            if (this.immortal) {
                this.step_cnt = 0;
                this.last_tex_idx = 0;
            } else {
                this.alive = false;
                this.last_tex_idx = this.anim_tex_idx.length - 1;
            }
        } else {
            this.last_tex_idx = Math.floor(this.step_cnt / this.anim_step);
        }

        // console.log(this.last_tex_idx, this.anim_tex_idx[this.last_tex_idx]);
        return this.anim_tex_idx[this.last_tex_idx];
    }

    getCoords() {
        return [this.x, this.y];
    }
}

function createDustAnim(x0, y0) {
    tex_idx = [TEX_IDX.dust_00, TEX_IDX.dust_01, TEX_IDX.dust_02, TEX_IDX.dust_03];
    let dust_anim = new SimpleAnimatedObject(false, tex_idx, x0, y0);
    return dust_anim;
}

function createBush(x0, y0) {
    tex_idx = [TEX_IDX.bush_00];
    let dust_anim = new SimpleAnimatedObject(true, tex_idx, x0, y0);
    return dust_anim;
}

function createCactus(x0, y0) {
    tex_idx = [TEX_IDX.cactus_0];
    let dust_anim = new SimpleAnimatedObject(true, tex_idx, x0, y0);
    return dust_anim;
}

class Player {
    x;
    y;

    air_x;
    air_y;

    hp;
    name;
    // velocity
    vx = 0;
    vy = 0;
    // jump count
    jump_count = 0;
    jump_cd = 0;

    direction = 1;
    jumping = 0;
    constructor(name="player", x0=0, y0=0) {
        this.x = x0;
        this.y = y0;

        this.hp = 100;

        this.name = name;
    }
};

class Camera {
    x = 8;
    y = -16;
    vx = 0;
    vy = 0;

    constuctor(x0=0, y0=0) {
        x = x0+8;
        y = y0-16;
    }
}

// const KEY = {
//     left: 37,
//     up: 38,
//     right: 39,
//     down: 40,
//     w: 87,
//     a: 65,
//     s: 83,
//     d: 68
// };

const KEY = {
    37: "left",
    38: "up",
    39: "right",
    40: "down",
    87: "w",
    65: "a",
    83: "s",
    68: "d"
};

var KEY_VALUES = Object.keys(KEY);

const KEY_TO_CONTROL = {
    left: "left",
    right: "right",
    up: "up",
    down: "down",
    w: "up",
    a: "left",
    s: "down",
    d: "right"
};

const CONTROL = {
    left: 0,
    up: 1,
    right: 2,
    down: 3
};

// const KEY_IDX = {left: 0, up: 1, right: 2, down: 3};

let key_state = {};

let control_state = {};

function keyHandler(event, state) {
    // console.log("KEY_EVENT");
    let kcode = event.keyCode.toString();
    if (KEY_VALUES.includes(kcode)) {
        key_state[event.keyCode] = state;
        control_state[CONTROL[KEY_TO_CONTROL[KEY[kcode]]]] = state;
        // console.log(event.keyCode);
        // console.log(key_state[event.keyCode]);
    }
}

function keyDownHandler(event) {
    if (event.repeat) return;
    // console.log(event.keyCode);
    // console.log(KEY_VALUES);
    keyHandler(event, true);
    // console.log(key_state);
}

function keyUpHandler(event) {
    keyHandler(event, false);
}

function refreshControls() {
    for (const value of KEY_VALUES) {
        key_state[value] = false;
        // console.log(value);
    }

    for (const value of getDictValues(CONTROL)) {
        control_state[value] = false;
    }
}

class Game {
    W;
    H;
    step_dt;

    T0;
    step_cnt;

    blocks = [];

    animated = [];

    static_details = [];

    constructor(W, H) {
        this.W = W;
        this.H = H;

        this.step_dt = 1000 / 40;

        this.init();
    }

    init() {
        PLAYER_TEX_IDX = [[TEX_IDX.player_0, TEX_IDX.player_0r],
                        [TEX_IDX.player_0j, TEX_IDX.player_0jr]];

        this.player = new Player("player", -8, -32);

        this.blocks = [
            [-4, 0, 4, 1],
            [-2, -5, 2, -4],
            [-15, -7, -10, -6],
            [10, -7, 15, -6],
            [-4, -12, 4, -11]
        ];

        for (let block of this.blocks) {
            let bx0, bx1, by0, by1;
            [bx0, by0, bx1, by1] = block;
            let len = bx1 - bx0 - 3;
            let cur_dx = (91 * Math.abs(bx0 + 5 * by1)) % len;
            if (cur_dx >= len / 2) {
                cur_dx += 1;
            }

            let bush_flag = false;

            if (((bx1 * 61 + by1 * 52) % 13) % 2 != 1) {
                bush_flag = true;
                this.static_details.push(createBush((bx0 + cur_dx) * CELL_SZ, by0 * CELL_SZ - CELL_SZ));
            }

            if (((bx1 * 61 + by1 * 52) % 17) % 3 == 1) {
                let cur_dx2 = (57 * Math.abs(6 * bx1 + 5 * by0)) % len;
                if (cur_dx2 >= len / 2) {
                    cur_dx2 += 1;
                }

                if (!bush_flag || Math.abs(cur_dx2 - cur_dx) >= 2) {
                    this.static_details.push(createCactus((bx0 + cur_dx2) * CELL_SZ, by0 * CELL_SZ - 2 * CELL_SZ));
                }
            }
        }

        this.camera = new Camera();
    }

    initControls() {
        document.addEventListener("keydown", keyDownHandler, false);
        document.addEventListener("keyup", keyUpHandler, false);

        refreshControls();

        document.getElementById("canvas").addEventListener("focusout", (event) => {
            refreshControls();
        });

        document.addEventListener('visibilitychange' , function() {
            refreshControls();
        }, false);
    }

    startPhysics() {
        this.T0 = Date.now();
        this.step_cnt = 0;

        this.calcPhysics();
    }

    addDust(x0, y0) {
        // console.log(x0, y0);
        let dust_anim = createDustAnim(x0, y0);
        this.animated.push(dust_anim);
    }

    stepPlayer() {
        let x0 = this.player.x;
        let y0 = this.player.y;

        let dx = this.player.vx;
        let dy = this.player.vy;

        let dy0 = dy;
        
        if (this.player.jump_cd) {
            this.player.jump_cd -= 1;
        }

        if (control_state[CONTROL.left]) {
            this.player.direction = 1;
            dx = -3;
        } else if (control_state[CONTROL.right]) {
            this.player.direction = 0;
            dx = 3;
        } else {
            if (dx >= 1) {
                dx -= 1;
            }
            if (dx <= -1) {
                dx += 1;
            }

            if (Math.abs(dx) < 1) {
                dx = 0;
            }
        }
        if (control_state[CONTROL.up]) {
            control_state[CONTROL.up] = false;
            // TODO: JUMP
            if (this.player.jump_cd <= 0 && this.player.jump_count > 0) {
                // console.log(this.player.jump_cd, this.player.jump_count);
                dy = -6;
                this.player.jump_count -= 1;
                if (this.player.jump_count == 0) {
                    this.player.air_y = this.player.y;
                }
                this.player.jump_cd = 0;

                play_audio("jump_swoosh");
                this.addDust(x0, y0 + 16);
            }
        }
        // if (key_state[KEY.down]) {
        //     TODO: go through platform downwards
        //     dy += 1;
        // }

        // gravity
        dy += 0.3;

        let max_vx = 5;
        let max_vy = 5;
        let min_vy = 8;
        if (dx >= max_vx) {
            dx = max_vx - 1;
        }
        if (dx <= -max_vx) {
            dx = -max_vx + 1;
        }
        if (dy >= max_vy) {
            dy = max_vy - 1;
        }
        if (dy <= -min_vy) {
            dy = -min_vy + 1;
        }

        // console.log("Physics");

        let P_W = 16;
        let P_H = 32;

        let px0 = x0, px1 = x0 + P_W, py0 = y0, py1 = y0 + P_H;

        let x1 = x0, y1 = y0;

        x1 += dx;
        y1 += dy;

        let p1x0 = x1, p1x1 = x1 + P_W, p1y0 = y1, p1y1 = y1 + P_H;

        this.player.jumping = 1;

        for (let block of this.blocks) {
            let bx0, by0, bx1, by1;
            [bx0, by0, bx1, by1] = block;
            bx0 *= CELL_SZ;
            by0 *= CELL_SZ;
            bx1 *= CELL_SZ;
            by1 *= CELL_SZ;
            // console.log(bx0, by0, x0, y0);
            if (Math.max(bx0, p1x0) < Math.min(bx1, p1x1) &&
                Math.max(by0, p1y0) <= Math.min(by1, p1y1)) {
                if (py1 <= by0 && px1 >= bx0 && px0 <= bx1) {
                    y1 = Math.min(y1, by0 - P_H);
                    this.player.jump_count = 2;
                    this.player.jumping = 0;
                    if (dy0 >= max_vy * (2 / 3)) {
                        play_audio("landing_swoosh");
                        this.addDust(x0, by0 - 16);
                    }
                    dy = 0;
                } else {
                    if (px1 <= bx0) {
                    x1 = Math.min(x1, bx0 - P_W);
                    dx = 0;
                    }
                    if (px0 >= bx1) {
                        x1 = Math.max(x1, bx1);
                        dx = 0;
                    }
                }
                if (py0 >= by1) {
                    y1 = Math.max(y1, by1);
                    dy = 0;
                }
            }
        }

        this.player.x = x1;
        this.player.y = y1;

        if (this.player.y > 80) {
            this.player = new Player("player", -8, -32);
            this.camera = new Camera();
        }

        this.player.vx = dx;
        this.player.vy = dy;
    }

    stepCamera() {
        let camera = this.camera;
        let x, y, vx, vy;
        [x, y, vx, vy] = [camera.x, camera.y, camera.vx, camera.vy];

        let px = this.player.x;
        let py = this.player.y;
        if (this.player.jump_count == 0) {
            py = this.player.air_y;
        }

        let tx = px + 8, ty = py + 16;

        let dx = tx - x;
        let dy = ty - y;

        let min_dx = 192;
        let min_dx2 = min_dx + 48;
        let min_dy = 80;
        let min_dy2 = min_dy + 48;

        // let max_vx = 1.5;
        // let max_vy = 1.5;

        let max_vx = 5;
        let max_vy = 5;

        let x1, y1;

        if (Math.abs(dx) < min_dx2) {
            max_vx = 1;
        }

        if (dy > -min_dy2 && dy < min_dy2) {
            max_vy = 1;
        } 

        // if (Math.abs(dx) > 1.5 * min_dx) {
        //     max_vx = 2;
        // }
        // if (Math.abs(dy) > 1.5 * min_dy) {
        //     max_vy = 2;
        // }

        if (Math.abs(dx) > min_dx) {
            dx /= 5;
        } else {
            dx = 0;
        }

        // dy < -min_dy || dy > 0
        if (Math.abs(dy) > min_dy) {
            dy /= 5;
        } else {
            dy = 0;
        }

        if (dx > max_vx) {
            dx = max_vx;
        }
        if (dx < -max_vx) {
            dx = -max_vx;
        }

        if (dy > max_vy) {
            dy = max_vy;
        }
        if (dy < -max_vy) {
            dy = -max_vy;
        }

        dx = (dx + 10 * vx) / 11;
        dy = (dy + 10 * vy) / 11;

        this.camera.x = x + dx;
        this.camera.y = y + dy;

        this.camera.vx = dx;
        this.camera.vy = dy;
    }

    stepPhysics() {
        this.stepPlayer();
        this.stepCamera();

        let animated1 = [];
        for (let anim_obj of this.animated) {
            let res = anim_obj.step();
            if (res) {
                animated1.push(anim_obj);
            }
        }
        this.animated = animated1;
    }

    calcPhysics() {
        //console.log(this.step_cnt);
        try {

            let cur_time = Date.now();

            while ((cur_time - this.T0) / this.step_dt > this.step_cnt) {
                this.step_cnt++;
                this.stepPhysics();
            }
            let a = this;
            requestAnimFrame(function() { a.calcPhysics();});
        } catch(e) {
            console.log(e);
        }
        // try {
        //     console.log("physics");
        //     let cur_time = Date.now();
        //     console.log(this.step_cnt);
        //     while ((cur_time - this.T0) / this.step_dt > this.step_cnt) {
        //         this.step_cnt++;
        //         this.stepPhysics();
        //     }
        //     requestAnimFrame(this.calcPhysics);
        // } catch(e) {
        //     console.log(e.toString());
        //     console.log(e.stack);
        // }
    }

    getGraphicState() {
        // render_info = [
        //     [TEX_IDX.bear, 0, 0, 0]
        // ];

        let render_info = [];

        let player = this.player;

        let p_x = Math.round(player.x * 2) / 2;
        let p_y = Math.round(player.y * 2) / 2;

        // console.log("Player: " + p_x + " " + p_y);

        render_info.push([PLAYER_TEX_IDX[this.player.jumping][this.player.direction], p_x, p_y, 0]);

        for (let block of this.blocks) {
            let bx0, by0, bx1, by1;
            [bx0, by0, bx1, by1] = block;
            // TODO: check if on screen
            for (let i = bx0; i < bx1; i++) {
                for (let j = by0; j < by1; j++) {
                    render_info.push([TEX_IDX.tile_0, i * CELL_SZ, j * CELL_SZ, 0]);
                }
            }
            render_info.push([TEX_IDX.tile_0r, bx1 * CELL_SZ, by0 * CELL_SZ, 0]);
            render_info.push([TEX_IDX.tile_0l, (bx0 - 1) * CELL_SZ, by0 * CELL_SZ, 0]);
        }

        for (let anim of this.animated) {
            let ax, ay;
            // console.log(anim);
            // console.log(anim.getCoords());
            [ax, ay] = anim.getCoords();
            let tex_id = anim.getTexIdx();

            render_info.push([tex_id, ax, ay, -1]);
        }

        for (let anim of this.static_details) {
            let ax, ay;
            // console.log(anim);
            // console.log(anim.getCoords());
            [ax, ay] = anim.getCoords();
            let tex_id = anim.getTexIdx();

            render_info.push([tex_id, ax, ay, 1]);
        }

        // console.log(render_info);

        return render_info;
    }

    getCameraState() {
        return [Math.round(this.camera.x * 2) / 2, Math.round(this.camera.y * 2) / 2];
    }
};
