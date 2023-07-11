
var VSHADER_SOURCE =
`
attribute vec2 a_Position;
attribute vec3 a_Color;

varying vec3 v_Color;

void main() {
  gl_Position = vec4(a_Position, 0.0, 1.0);
  v_Color = a_Color;
}
`;

var FSHADER_SOURCE =
`
precision mediump float;

varying vec3 v_Color;

void main() {
  gl_FragColor = vec4(v_Color, 1.0);
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
  var a_Color = gl.getAttribLocation(shaderProgram, 'a_Color');

  gl.enableVertexAttribArray(a_Position);
  gl.enableVertexAttribArray(a_Color);

  var triangle_vertex = [
    -0.5, -0.5,
    0.9, 0.3, 0.3,
    -0.5, 0.5,
    0.3, 0.9, 0.3,
    0.5, 0.5,
    0.9, 0.3, 0.3,
    0.5, -0.5,
    0.3, 0.3, 0.9
  ];

  var TRIANGLE_VERTEX = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, TRIANGLE_VERTEX);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangle_vertex), gl.STATIC_DRAW);

  var triangle_face = [0, 1, 2, 0, 2, 3];

  var TRIANGLE_FACE = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, TRIANGLE_FACE);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(triangle_face), gl.STATIC_DRAW);

  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 4 * (2 + 3), 0);
  gl.vertexAttribPointer(a_Color,    3, gl.FLOAT, false, 4 * (2 + 3), 4 * 2);


  gl.clearColor(0.5, 0.5, 0.5, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // gl.drawArrays(gl.TRIANGLES, 0, 6);
  gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

  gl.flush();
}














