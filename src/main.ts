import {vec3, vec4} from 'gl-matrix';
import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';
import Square from './geometry/Square';
import ScreenQuad from './geometry/ScreenQuad';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import {setGL} from './globals';
import Turtle from './Turtle';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';
import ExpansionRule from './ExpansionRule';
import Leaf from './geometry/Leaf';

// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls = {
};

let square: Square;
let screenQuad: ScreenQuad;
let leaf: Leaf;
let time: number = 0.0;

function loadScene() {
  square = new Square();
  square.create();
  screenQuad = new ScreenQuad();
  screenQuad.create();

  // Set up instanced rendering data arrays here.
  // This example creates a set of positional
  // offsets and gradiated colors for a 100x100 grid
  // of squares, even though the VBO data for just
  // one square is actually passed to the GPU
  let offsetsArray = [];
  let colorsArray = [];
  let n: number = 100.0;
  for(let i = 0; i < n; i++) {
    for(let j = 0; j < n; j++) {
      offsetsArray.push(i);
      offsetsArray.push(j);
      offsetsArray.push(0);

      colorsArray.push(i / n);
      colorsArray.push(j / n);
      colorsArray.push(1.0);
      colorsArray.push(1.0); // Alpha channel
    }
  }
  let offsets: Float32Array = new Float32Array(offsetsArray);
  let colors: Float32Array = new Float32Array(colorsArray);
  square.setInstanceVBOs(offsets, colors);
  square.setNumInstances(n * n); // grid of "particles"
}

function loadPlantComp() {
  leaf = new Leaf();
  leaf.create();

  let offsetsArray = [];
  let colorsArray = [];

  offsetsArray.push(0);
  offsetsArray.push(0);
  offsetsArray.push(0);

  colorsArray.push(1.);
  colorsArray.push(0.);
  colorsArray.push(0.0);
  colorsArray.push(1.0); // Alpha channel

  // let n: number = 100.0;
  // for(let i = 0; i < n; i++) {
  //   for(let j = 0; j < n; j++) {
  //     offsetsArray.push(i);
  //     offsetsArray.push(j);
  //     offsetsArray.push(0);

  //     colorsArray.push(i / n);
  //     colorsArray.push(j / n);
  //     colorsArray.push(1.0);
  //     colorsArray.push(1.0); // Alpha channel
  //   }
  // }

  let offsets: Float32Array = new Float32Array(offsetsArray);
  let colors: Float32Array = new Float32Array(colorsArray);
  leaf.setInstanceVBOs(offsets, colors);
  leaf.setNumInstances(1);
}

function loadLSystem() {
  // L-System setup
  const turtles: Turtle[] = [];
  var grammar: string = "F[+FX]-FX";
  const gens: number = 3;

  const alpha: Map<string, ExpansionRule> = new Map<string, ExpansionRule>();
  const draw: Map<string, DrawingRule> = new Map<string, DrawingRule>();

  // Looping through gens until final grammar
  for (var i = 0; i < gens; i++) {
    var newGrammar = '';

    // Iterating through grammar
    for (var i = 0; i < grammar.length; i++) {
      const c = grammar.charAt(i);
      switch (c) {
        case 'F':
          newGrammar.concat(alpha.get(c).getOutput());
        case 'X':
          newGrammar.concat(alpha.get(c).getOutput());
      }
    }

    grammar = newGrammar;
  }
  console.log(grammar);

  // Output drawing based on final grammar
  turtles.push(new Turtle(new vec4(0), new vec4(0), 0));

  for (var i = 0; i < grammar.length; i++) {
    var curr: Turtle = turtles[turtles.length - 1];
    const c = grammar.charAt(i);

    switch (c) {
      case '[':   // push copy of current turtle
        turtles.push(curr.copyOf());
      case ']':   // pop current turtle
        turtles.pop();
      case '+':   // shift direction 30 deg
        curr.shiftDirection(30);
      case '-':   // shift direction -30 deg
        curr.shiftDirection(-30);
      default:    // draw based on char?
        draw.get(c);
    }
  }
}

function main() {

  // Initial display for framerate
  const stats = Stats();
  stats.setMode(0);
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';
  document.body.appendChild(stats.domElement);

  // Add controls to the gui
  const gui = new DAT.GUI();

  // get canvas and webgl context
  const canvas = <HTMLCanvasElement> document.getElementById('canvas');
  const gl = <WebGL2RenderingContext> canvas.getContext('webgl2');
  if (!gl) {
    alert('WebGL 2 not supported!');
  }
  // `setGL` is a function imported above which sets the value of `gl` in the `globals.ts` module.
  // Later, we can import `gl` from `globals.ts` to access it
  setGL(gl);

  // Initial call to load scene
  loadScene();

  // Call to load plant components
  loadPlantComp();

  // const camera = new Camera(vec3.fromValues(50, 50, 10), vec3.fromValues(50, 50, 0));
  const camera = new Camera(vec3.fromValues(0, 0, 10), vec3.fromValues(0, 0, 0));

  const renderer = new OpenGLRenderer(canvas);
  renderer.setClearColor(0.2, 0.2, 0.2, 1);
  gl.enable(gl.BLEND);
  // gl.blendFunc(gl.ONE, gl.ONE); // Additive blending

  const instancedShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/instanced-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/instanced-frag.glsl')),
  ]);

  const flat = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/flat-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/flat-frag.glsl')),
  ]);

  // plant shader
  const instancedPlantShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/instancedplant-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/instancedplant-frag.glsl')),
  ]);

  // This function will be called every frame
  function tick() {
    camera.update();
    stats.begin();
    instancedShader.setTime(time);
    flat.setTime(time++);
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.clear();
    // renderer.render(camera, flat, [screenQuad]);
    // renderer.render(camera, instancedShader, [
      // square,
    // ]);

    renderer.render(camera, instancedPlantShader, [
      leaf,
    ]);
    stats.end();

    // Tell the browser to call `tick` again whenever it renders a new frame
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', function() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.setAspectRatio(window.innerWidth / window.innerHeight);
    camera.updateProjectionMatrix();
    flat.setDimensions(window.innerWidth, window.innerHeight);
  }, false);

  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.setAspectRatio(window.innerWidth / window.innerHeight);
  camera.updateProjectionMatrix();
  flat.setDimensions(window.innerWidth, window.innerHeight);

  // Start the render loop
  tick();
}

main();
