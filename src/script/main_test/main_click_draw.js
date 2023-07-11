
var VSHADER_SOURCE =
`
attribute vec4 a_Position;
attribute float a_PointSize;
void main() {
  gl_PointSize = a_PointSize;
  // 10.0;
  gl_Position = a_Position;
  // vec4(0.0, 0.0, 0.0, 1.0);
}
`;

var FSHADER_SOURCE =
`
precision mediump float;
uniform vec4 u_FragColor;
void main() {
  // gl_FragColor = vec4(1.0, 0.5, 0.0, 1.0);
  gl_FragColor = u_FragColor;
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
  if (a_Position < 0) {
    console.log('failed a_Position');
    return;
  }
  var a_PointSize = gl.getAttribLocation(shaderProgram, 'a_PointSize');
  if (a_PointSize < 0) {
    console.log('failed a_PointSize');
    return;
  }

  gl.vertexAttrib1f(a_PointSize, 25.0);
  gl.vertexAttrib3f(a_Position, 0.5, 0.5, -0.4);

  var u_FragColor = gl.getUniformLocation(shaderProgram, 'u_FragColor');
  gl.uniform4f(u_FragColor, 1.0, 0.5, 0.5, 1.0);

  gl.clearColor(0.5, 0.5, 0.5, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // --- MOUSE ---
  canvas.onmousedown = function(ev) {click(ev, gl, canvas, a_Position)};

  var g_points = [];

  function click(ev, gl, canvas, a_Position) {
    console.log('part_1___\nev.clientX = ' + ev.clientX + 'ev.clientY = ' + ev.clientY);

    var x = ev.clientX;
    var y = ev.clientY;

    var rect = ev.target.getBoundingClientRect();

    x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);
    y = ((canvas.height / 2) - (y - rect.top)) / (canvas.height / 2);

    g_points.push(x);
    g_points.push(y);

    gl.clear(gl.COLOR_BUFFER_BIT);

    var len = g_points.length;

    for (i = 0; i < len; i += 2) {
      gl.vertexAttrib3f(a_Position, g_points[i], g_points[i + 1], 0.0);
      gl.drawArrays(gl.POINTS, 0, 1);
      // gl.vertexAttrib1f(a_PointSize, 20.0);
    }
  }

  gl.drawArrays(gl.POINTS, 0, 1);
}














