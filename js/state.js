export const state = {
  canvas: null,
  ctx: null,
  DPR: 1,
  W: 0, H: 0,
  particles: [],
  running: true,
  stepOnce: false,
  gDir: {x:0, y:1},
  tiltEnabled: false,
  lastT: performance.now(),
  fpsSmooth: 60,
  frameCount: 0,
  recentFps: [],
  pointer: { x:0,y:0, dx:0,dy:0, down:false, id:null, lastX:0,lastY:0, active:false },
  mouseGravity: {x:0, y:1},
  haveDeviceOrientation: ('DeviceOrientationEvent' in window) || ('DeviceMotionEvent' in window),
};

export function initCanvas(){
  state.canvas = document.getElementById('c');
  state.ctx = state.canvas.getContext('2d', {alpha:false});
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas, {passive:true});
}

export function resizeCanvas(){
  const DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  state.DPR = DPR;
  const w = window.innerWidth, h = window.innerHeight;
  state.canvas.width = Math.floor(w*DPR);
  state.canvas.height = Math.floor(h*DPR);
  state.canvas.style.width = w+'px';
  state.canvas.style.height = h+'px';
  state.W = state.canvas.width;
  state.H = state.canvas.height;
  state.ctx.setTransform(DPR,0,0,DPR,0,0);
  state.ctx.imageSmoothingEnabled = false;
}