
var TEX_IDX = {};



async function start() {
    var canvas = document.getElementById("canvas");

    if (!canvas) {
        console.log('canvas failed');
        return;
    }
    canvas.width  = 320 * 2;
    canvas.height = 320;

    var gl;
    try {
        gl = await canvas.getContext("webgl", {antialias: false});
    } catch (e) {
        alert("WebGL doesn't work");
        return false;
    }

    HEIGHT = 320;
    WIDTH = 320 * 2;

    DEPTH = 100;

    tex_urls = [
        ["player_0", "src/img/cowboy_0.png"],
        ["player_0r", "src/img/cowboy_0r.png"],
        ["player_0j", "src/img/cowboy_0j.png"],
        ["player_0jr", "src/img/cowboy_0jr.png"],
        ["tile_0", "src/img/tile_2.png"],
        ["tile_0r", "src/img/tile_2r.png"],
        ["tile_0l", "src/img/tile_2l.png"],
        ["dust_00", "src/img/dust_00.png"],
        ["dust_01", "src/img/dust_01.png"],
        ["dust_02", "src/img/dust_02.png"],
        ["dust_03", "src/img/dust_03.png"],
        ["bush_00", "src/img/desert_bush.png"],
        ["cactus_0", "src/img/cactus_0.png"]
    ];

    urls = [];

    for (let i = 0; i < tex_urls.length; i++) {
        let elem = tex_urls[i];
        urls.push(elem[1]);
        TEX_IDX[elem[0]] = i;
    }

    res = await buildAtlas(urls);
    // imageData:
    tex_atlas = res[0];

    TEX_H = tex_atlas.height;
    TEX_W = tex_atlas.width;
    // coords: [tex_x0, tex_y0, dx, dy]
    tex_coords = res[1];

    // render_info = [
    //     [TEX_IDX.player_0, 0, 0, 0],
    //     [TEX_IDX.player_0r, 100, 100, 0],
    //     [TEX_IDX.player_0j, 200, 200, 0],
    //     [TEX_IDX.player_0jr, 300, 100, 0],
    //     [TEX_IDX.tile_0, 400, 0, 0]
    // ];

    game = new Game(WIDTH, HEIGHT);

    game.initControls();

    game.startPhysics();

    // gl, w, h, depth
    gl_ctx = new WebGLContext(gl, WIDTH, HEIGHT, DEPTH);

    // initShaders
    gl_ctx.init();

    // tex_atlas, tex_coords, TEX_W, TEX_H
    gl_ctx.setTexture(tex_atlas, tex_coords, TEX_W, TEX_H);

    animate();
}

var requestAnimFrame = (function(){
    return window.requestAnimationFrame       ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        window.oRequestAnimationFrame      ||
        window.msRequestAnimationFrame     ||
        function(callback){
            window.setTimeout(callback, 1000 / 60);
        };
})();

function animate() {
    render_info = game.getGraphicState();

    camera_info = game.getCameraState();

    gl_ctx.renderAll(render_info, camera_info);

    setTimeout(1000 / 120, requestAnimFrame(animate));
}

// function pauseGame() {

// }

/*

var VSHADER_SOURCE =
`
attribute vec3 a_Position;
attribute vec2 a_uv;

varying vec2 v_uv;

void main() {
    gl_Position = vec4(a_Position, 1.0);
    v_uv = a_uv;
}
`;

var FSHADER_SOURCE =
`
precision mediump float;

varying vec2 v_uv;
uniform sampler2D sampler;

void main() {
    gl_FragColor = texture2D(sampler, v_uv);
}
`;

function getShader(gl, id, str) {
    var shader;
    if (id == 'vs') {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else if (id == 'fs') {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else {
        return null;
    }

    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}

function initShaders(gl) {
    var VS = getShader(gl, 'vs', VSHADER_SOURCE);
    var FS = getShader(gl, 'fs', FSHADER_SOURCE);

    shaderProgram = gl.createProgram();

    gl.attachShader(shaderProgram, VS);
    gl.attachShader(shaderProgram, FS);
    gl.linkProgram(shaderProgram);
    gl.useProgram(shaderProgram);

}

function webGLStart() {
    var canvas = document.getElementById("canvas");

    if (!canvas) {
        console.log('canvas failed');
        return;
    }
    canvas.width  = 400;
    canvas.height = 400;

    var gl;
    try {
        gl = canvas.getContext("webgl", {antialias: false});
    } catch (e) {
        alert("WebGL doesn't work");
        return false;
    }

    initShaders(gl);

    var a_Position = gl.getAttribLocation(shaderProgram, 'a_Position');
    var a_uv = gl.getAttribLocation(shaderProgram, 'a_uv');

    var u_sampler = gl.getUniformLocation(shaderProgram, 'sampler');

    gl.uniform1i(u_sampler, 0);

    gl.enableVertexAttribArray(a_Position);
    gl.enableVertexAttribArray(a_uv);

    var triangle_vertex =
    [
        -1,-1,-1,    0.0,0.0,
        0.5,-1,-1,     1.0,0.0,
        0.5, 0.5,-1,     1.0,1.0,
        -1, 0.5,-1,    0.0,1.0,
    ];

    var triangle_face = [
         0,1,2,
         0,2,3
    ];

    var TRIANGLE_VERTEX = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, TRIANGLE_VERTEX);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangle_vertex), gl.STATIC_DRAW);

    var triangle_face = [0, 1, 2, 0, 2, 3];

    var TRIANGLE_FACE = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, TRIANGLE_FACE);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(triangle_face), gl.STATIC_DRAW);

    var get_texture = function (image_url) {
        var image = new Image();
        image.src = image_url;
        image.webGLtexture = false;

        image.onload = function(e) {
            var texture = gl.createTexture();
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
            gl.bindTexture(gl.TEXTURE_2D, texture);

            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);

            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

            gl.generateMipmap(gl.TEXTURE_2D);
            gl.bindTexture(gl.TEXTURE_2D, null);

            image.webGLtexture = texture;
        };
        return image;
    }

    var tex =  get_texture("src/img/smile.png");

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clearDepth(1.0);

    if (tex.webGLtexture) {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D,tex.webGLtexture);
    }

    var old_time = 0;

    var animate = function (time) {

            var dt=time-old_time;

            // mat4.rotateX(MODELMATRIX,0.0005*dt);
            // mat4.rotateZ(MODELMATRIX,0.0003*dt);
            // mat4.rotateY(MODELMATRIX,0.0007*dt);

            old_time = time;

            gl.clearColor(0.5,0.5,0.5,1.0);
            gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);

            // gl.uniformMatrix4fv(u_Pmatrix, false, PROJMATRIX);
            // gl.uniformMatrix4fv(u_Mmatrix, false, MODELMATRIX);
            // gl.uniformMatrix4fv(u_Vmatrix, false, VIEWMATRIX);

            if (tex.webGLtexture){
                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D,tex.webGLtexture);
            }


            gl.bindBuffer(gl.ARRAY_BUFFER,TRIANGLE_VERTEX);

            gl.vertexAttribPointer(a_Position,3,gl.FLOAT,false,4*(3+2),0);
            gl.vertexAttribPointer(a_uv,2,gl.FLOAT,false,4*(3+2),3*4);

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, TRIANGLE_FACE);
            gl.drawElements(gl.TRIANGLES,triangle_face.length, gl.UNSIGNED_SHORT, 0);

            gl.flush();

            window.requestAnimationFrame(animate);
    }
    animate(0);

    // gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 4 * (2 + 3), 0);
    // gl.vertexAttribPointer(a_Color,    3, gl.FLOAT, false, 4 * (2 + 3), 4 * 2);


    // gl.clearColor(0.5, 0.5, 0.5, 1.0);
    // gl.clear(gl.COLOR_BUFFER_BIT);

    // // gl.drawArrays(gl.TRIANGLES, 0, 6);
    // gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

    // gl.flush();
}

*/











