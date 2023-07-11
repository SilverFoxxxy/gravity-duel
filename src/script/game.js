
function getDictValues(dict) {
    let values = [];
    for (const [key, value] of Object.entries(dict)) {
        values.push(value);
    }
    return values;
}

var PLAYER_TEX_IDX;

class SimpleAnimatedObject {
    x;
    y;
    dx;
    dy;

    step_cnt = 0;
    anim_step = 5;

    anim_tex_idx = [];

    last_tex_idx = -1;

    constructor(tex_idx, x0, y0, adx=0, ady=0, anim_cnt = 5) {
        // console.log("Dust create");
        this.x = x0;
        this.y = y0;
        this.dx = adx;
        this.dy = ady;
        this.anim_tex_idx.push(...tex_idx);
        this.anim_step = anim_cnt;
    }

    step() {
        // console.log("Dust step");
        this.x += dx;
        this.y += dy;

        this.step_cnt += 1;

        if (this.last_tex_idx == this.anim_tex_idx.length - 1) {
            return false;
            // console.log("Dust die");
        }
        return true;
    }

    getTexIdx() {
        this.last_tex_idx = Math.floor(this.step_cnt / this.anim_step);
        if (this.last_tex_idx >= this.anim_tex_idx.length) {
            this.last_tex_idx = this.anim_tex_idx.length - 1;
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
    let dust_anim = new SimpleAnimatedObject(tex_idx, x0, y0);
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

const KEY = { left: 37, up: 38, right: 39, down: 40 };

// const KEY_IDX = {left: 0, up: 1, right: 2, down: 3};

let key_state = {};

function keyHandler(event, state) {
    // console.log("KEY_EVENT");
    if (getDictValues(KEY).includes(event.keyCode)) {
        key_state[event.keyCode] = state;
    }
}

function keyDownHandler(event) {
    keyHandler(event, true);
}

function keyUpHandler(event) {
    keyHandler(event, false);
}

class Game {
    W;
    H;
    step_dt;

    T0;
    step_cnt;

    blocks = [];

    animated = [];
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
            [-15, -7, -10, -6]
        ];

        this.camera = new Camera();
    }

    initControls() {
        document.addEventListener("keydown", keyDownHandler, false);
        document.addEventListener("keyup", keyUpHandler, false);

        for (const value of getDictValues(KEY)) {
            key_state[value] = false;
            // console.log(value);
        }

        document.getElementById("canvas").addEventListener("focusout", (event) => {
            for (let key in key_state) {
                key_state[key] = false;
            }
            console.log(key_state);
        });

        document.addEventListener( 'visibilitychange' , function() {
            if (document.hidden) {
                for (let key in key_state) {
                    key_state[key] = false;
                }
            } else {
                // console.log('well back');
            }
        }, false )
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

        if (key_state[KEY.left]) {
            this.player.direction = 1;
            dx = -3;
        } else if (key_state[KEY.right]) {
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
        if (key_state[KEY.up]) {
            // TODO: JUMP
            if (this.player.jump_cd <= 0 && this.player.jump_count > 0) {
                // console.log(this.player.jump_cd, this.player.jump_count);
                dy = -6;
                this.player.jump_count -= 1;
                if (this.player.jump_count == 0) {
                    this.player.air_y = this.player.y;
                }
                this.player.jump_cd = 20;
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

        let CELL_SZ = 16;

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
                if (px1 <= bx0) {
                    x1 = Math.min(x1, bx0 - P_W);
                    dx = 0;
                }
                if (py1 <= by0) {
                    y1 = Math.min(y1, by0 - P_H);
                    this.player.jump_count = 2;
                    this.player.jumping = 0;
                    if (dy0 >= max_vy * (2 / 3)) {
                        this.addDust(x0, by0 - 16);
                    }
                    dy = 0;
                }
                if (px0 >= bx1) {
                    x1 = Math.max(x1, bx1);
                    dx = 0;
                }
                if (py0 >= by1) {
                    y1 = Math.max(y1, by1);
                    dy = 0;
                }
            }
        }

        this.player.x = x1;
        this.player.y = y1;
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

        let min_dx = 112;
        let min_dy = 64;

        // let max_vx = 1.5;
        // let max_vy = 1.5;

        let max_vx = 1;
        let max_vy = 1;

        let x1, y1;

        if (Math.abs(dx) > 1.5 * min_dx) {
            max_vx = 2;
        }
        if (Math.abs(dy) > 1.5 * min_dy) {
            max_vy = 2;
        }

        if (Math.abs(dx) > min_dx) {
            dx = dx / 5;
        } else {
            dx = 0;
        }

        if (dy < -min_dy || dy > 0) {
            dy = dy / 5;
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

        this.camera.x = x + dx;
        this.camera.y = y + dy;
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
        let CELL_SZ = 16;

        let render_info = [];

        let player = this.player;

        let p_x = Math.round(player.x);
        let p_y = Math.round(player.y);

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

        // console.log(render_info);

        return render_info;
    }

    getCameraState() {
        return [Math.round(this.camera.x), Math.round(this.camera.y)];
    }
};
