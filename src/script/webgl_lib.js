
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
  if(gl_FragColor.a < 0.5) discard;
}
`;

class WebGLContext {
    constructor(gl, WIDTH, HEIGHT, DEPTH) {
        this.gl = gl;
        this.WIDTH = WIDTH;
        this.HEIGHT = HEIGHT;
        this.DEPTH = DEPTH;
    }

    init() {
        this.initShaders(this.gl);
    }

    setTexture(image, tex_coords, TEX_W, TEX_H) {
        this.tex_coords = tex_coords;
        this.TEX_W = TEX_W;
        this.TEX_H = TEX_H;

        let gl = this.gl;

        var texture = gl.createTexture();
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.bindTexture(gl.TEXTURE_2D, texture);

        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D, null);

        image.webGLtexture = texture;

        var tex = image;

        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
        gl.clearDepth(1.0);

        if (tex.webGLtexture) {
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D,tex.webGLtexture);
        }
    }

    renderAll(render_info, camera_info) {
        let WIDTH, HEIGHT, DEPTH, TEX_W, TEX_H;
        let camera_x, camera_y;
        [WIDTH, HEIGHT, DEPTH, TEX_W, TEX_H] = [this.WIDTH, this.HEIGHT, this.DEPTH, this.TEX_W, this.TEX_H];
        
        [camera_x, camera_y] = camera_info;
        camera_x -= WIDTH / 2;
        camera_y -= HEIGHT / 2;

        let gl_info = [];
        let gl_idx = [];

        let cur_idx = 0;

        for (let elem of render_info) {
            let idx, x0, y0, z;
            let tex_x0, tex_y0, dx, dy, tex_dx, tex_dy, tex_w, tex_h;

            [idx, x0, y0, z] = elem;
            [tex_x0, tex_y0, tex_w, tex_h] = this.tex_coords[idx];

            x0 -= camera_x;
            y0 -= camera_y;

            x0 = (x0 - WIDTH / 2) / (WIDTH / 2);
            y0 = (- y0 + HEIGHT / 2) / (HEIGHT / 2);
            dx = tex_w / (WIDTH / 2);
            dy = - tex_h / (HEIGHT / 2);

            // console.log(tex_x0, tex_y0, tex_w, tex_h);
            // console.log(dx, dy);

            z /= DEPTH;

            tex_x0 = (tex_x0) / (TEX_W);
            tex_y0 = (tex_y0) / (TEX_H);
            tex_dx = tex_w / (TEX_W);
            tex_dy = tex_h / (TEX_H);
            let new_vertex = [
                x0,    y0,    z, tex_x0, tex_y0,
                x0,    y0+dy, z, tex_x0, tex_y0 + tex_dy,
                x0+dx, y0+dy, z, tex_x0 + tex_dx, tex_y0 + tex_dy,
                x0+dx, y0,    z, tex_x0 + tex_dx, tex_y0
            ];
            gl_info.push(...new_vertex);

            gl_idx.push(...[cur_idx, cur_idx + 1, cur_idx + 2,
                            cur_idx, cur_idx + 2, cur_idx + 3]);
            cur_idx += 4;
        }

        this.setBuffers(gl_info, gl_idx);

        var gl = this.gl;

        gl.clearColor(48/255, 48/255, 48/255, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        // if (tex.webGLtexture){
        //     gl.activeTexture(gl.TEXTURE0);
        //     gl.bindTexture(gl.TEXTURE_2D,tex.webGLtexture);
        // }

        // gl.bindBuffer(gl.ARRAY_BUFFER,TRIANGLE_VERTEX);

        // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, TRIANGLE_FACE);
        gl.drawElements(gl.TRIANGLES, gl_idx.length, gl.UNSIGNED_SHORT, 0);

        gl.flush();
    }

    setBuffers(triangle_vertex, triangle_face) {
        var gl = this.gl;
        var shaderProgram = this.shaderProgram;
        var a_Position = gl.getAttribLocation(shaderProgram, 'a_Position');
        var a_uv = gl.getAttribLocation(shaderProgram, 'a_uv');

        var u_sampler = gl.getUniformLocation(shaderProgram, 'sampler');

        gl.uniform1i(u_sampler, 0);

        gl.enableVertexAttribArray(a_Position);
        gl.enableVertexAttribArray(a_uv);

        // console.log(triangle_vertex);
        // console.log(triangle_face);
        // var triangle_vertex =
        // [
        // -1,-1,-1,    0.0,0.0,
        // 0.5,-1,-1,     1.0,0.0,
        // 0.5, 0.5,-1,     1.0,1.0,
        // -1, 0.5,-1,    0.0,1.0,
        // ];

        // var triangle_face = [
        //  0,1,2,
        //  0,2,3
        // ];

        var TRIANGLE_VERTEX = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, TRIANGLE_VERTEX);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangle_vertex), gl.STATIC_DRAW);

        // var triangle_face = [0, 1, 2, 0, 2, 3];

        var TRIANGLE_FACE = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, TRIANGLE_FACE);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(triangle_face), gl.STATIC_DRAW);

        gl.vertexAttribPointer(a_Position,3,gl.FLOAT,false,4*(3+2),0);
        gl.vertexAttribPointer(a_uv,2,gl.FLOAT,false,4*(3+2),3*4);
    }

    getShader(gl, id, str) {
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

    initShaders(gl) {
      var VS = this.getShader(gl, 'vs', VSHADER_SOURCE);
      var FS = this.getShader(gl, 'fs', FSHADER_SOURCE);

      var shaderProgram = gl.createProgram();

      gl.attachShader(shaderProgram, VS);
      gl.attachShader(shaderProgram, FS);
      gl.linkProgram(shaderProgram);
      gl.useProgram(shaderProgram);

      this.shaderProgram = shaderProgram;

    }

};



/*
function webGLStart() {
  // var canvas = document.getElementById("canvas");

  // if (!canvas) {
  //   console.log('canvas failed');
  //   return;
  // }
  // canvas.width  = 400;
  // canvas.height = 400;

  // var gl;
  // try {
  //   gl = canvas.getContext("webgl", {antialias: false});
  // } catch (e) {
  //   alert("WebGL doesn't work");
  //   return false;
  // }

  // initShaders(gl);

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












