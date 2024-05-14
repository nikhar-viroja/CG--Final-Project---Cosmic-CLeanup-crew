
let _canvas;
let _lastFrameTime;
let _hasInited = false;

const _input = {
  keys: new Set(),
};


const loop = (time) => {
  if (!_lastFrameTime) {
    _lastFrameTime = time;
  }


  const dt = time - _lastFrameTime;
  _lastFrameTime = time;

  
  if (_canvas) {
    _canvas.width = _canvas.clientWidth;
    _canvas.height = _canvas.clientHeight;
  }

  
  if (!_hasInited) {
    if (window.init) {
      _hasInited = true;

      window.init(_canvas);
    }
  }

  
  if (window.loop) {
    window.loop(dt, _canvas, _input);
  }

  window.requestAnimationFrame(loop);
};


const attachScript = () => {
  const url = `./src/solution.js`;
  const scriptTag = document.createElement("script");
  scriptTag.src = url;
  scriptTag.type = "module";
  document.head.appendChild(scriptTag);
};

window.loadShader = async ({ gl, name, type }) => {
  const res = await fetch(`./src/${name}.glsl`);
  const source = await res.text();
  const shader = gl.createShader(type);

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
    return null;
  }

  return shader;
};

window.onload = () => {
  // get the <canvas /> DOM element
  _canvas = document.getElementById("canvas");

  // add handlers
  document.addEventListener("keydown", (event) => {
    const key = event.key;
    _input.keys.add(key);
  });
  document.addEventListener("keyup", (event) => {
    const key = event.key;
    _input.keys.delete(key);
  });

  attachScript();
  window.requestAnimationFrame(loop);
};
