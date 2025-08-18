import { Settings } from './config.js';

export const State = {
  canvas: null,
  ctx: null,
  W: 0,
  H: 0,
  DPR: 1,

  particles: [],
  heatDecay: 0.97,
  running: true,
  stepOnce: false,

  gDir: { x: 0, y: 1 },
  mouseGravity: { x: 0, y: 1 },
  tiltEnabled: false,

  lastT: performance.now(),
  fpsSmooth: 60,
  substeps: Settings.performance.substeps,

  grid: new Map(),
  gridCell: 16,
  frameCount: 0,
  recentFps: [],

  pointer: { x:0,y:0,dx:0,dy:0,down:false,id:null,lastX:0,lastY:0,active:false },

  hud: {
    root: null,
    fps: null,
    collMode: null,
    turbMode: null,
    tiltState: null,
    mouseG: null,
    gravityVal: null,
    countVal: null,
    shapeMode: null,
    colorMode: null,
    boundMode: null,
    pauseBtn: null,
    stepBtn: null,
    resetBtn: null,
    fullscreenBtn: null,
  },

  els: {
    panel: null,
    tabsEl: null,
    contentEl: null,
    togglePanel: null,
    randomizeBtn: null,
    presetMenuBtn: null,
    tiltPrompt: null,
    tiltBtn: null,
    tiltBtnTop: null,
    dismissTilt: null,
  },

  haveDeviceOrientation: ('DeviceOrientationEvent' in window) || ('DeviceMotionEvent' in window),
};