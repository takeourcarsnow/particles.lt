// --- START OF FILE simulation_core.js ---

const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
const DPR = Math.min(window.devicePixelRatio || 1, 2);

// HUD Elements (for updating from the loop)
const fpsEl = document.getElementById('fps');
const pcountEl = document.getElementById('pcount');
const modeEl = document.getElementById('mode');
const shapeHUD = document.getElementById('shapeHUD');
const colorHUD = document.getElementById('colorHUD');

// Config and State are managed here
const cfg = {};
const state = {
  running: true,
  w: 0, h: 0,
  time: 0,
  particles: [],
  grid: null,
  bgRGB: {},
  colorARGB: {},
  pointer: { x: 0, y: 0, active: false, vx: 0, vy: 0, lastX: 0, lastY: 0, lastT: performance.now()/1000 },
  gravityVec: { x: 0, y: 0 },
  windVec: { x: 0, y: 0 },
  fpsSMA: 60,
  fixedDt: 1/120,
  accum: 0,
  maxAccum: 0.08,
  lastNow: performance.now(),
  userIterations: 4,
  autoQualityCooldown: 0,
  showUI: true,
  deviceMotionOK: false,
  tilt: { curX: 0, curY: 0, offsetX: 0, offsetY: 0 },
};

// Linked-list spatial grid
class LLGrid {
  // ... (LLGrid class code remains unchanged)
  constructor(cellSize, width, height, capacity) { this.set(cellSize, width, height, capacity); }
  set(cellSize, width, height, capacity) {
    this.cellSize = Math.max(8, cellSize|0);
    this.resizeSpace(width, height);
    this.ensureCapacity(capacity);
  }
  resizeSpace(w, h) {
    this.width = w|0; this.height = h|0;
    this.cols = Math.max(1, Math.floor(this.width / this.cellSize));
    this.rows = Math.max(1, Math.floor(this.height / this.cellSize));
    this.numCells = this.cols * this.rows;
    this.head = new Int32Array(this.numCells);
    this.head.fill(-1);
  }
  ensureCapacity(capacity) {
    const cap = Math.max(1, capacity|0);
    if (!this.next || this.next.length < cap) this.next = new Int32Array(cap);
  }
  cellIndex(x, y) {
    const cx = clamp((x / this.cellSize)|0, 0, this.cols - 1);
    const cy = clamp((y / this.cellSize)|0, 0, this.rows - 1);
    return cy * this.cols + cx;
  }
  build(particles) {
    this.head.fill(-1);
    this.ensureCapacity(particles.length);
    const head = this.head, next = this.next, ci = this.cellIndex.bind(this);
    for (let i=0;i<particles.length;i++) {
      const p = particles[i];
      const idx = ci(p.x, p.y);
      next[i] = head[idx];
      head[idx] = i;
    }
  }
  forEachNeighborIndices(p, cb) {
    const cellSize = this.cellSize;
    let cx = (p.x / cellSize)|0, cy = (p.y / cellSize)|0;
    cx = clamp(cx, 0, this.cols-1);
    cy = clamp(cy, 0, this.rows-1);
    const cols = this.cols, head = this.head, next = this.next;
    for (let oy=-1; oy<=1; oy++) {
      const yy = cy + oy; if (yy < 0 || yy >= this.rows) continue;
      const rowBase = yy * cols;
      for (let ox=-1; ox<=1; ox++) {
        const xx = cx + ox; if (xx < 0 || xx >= this.cols) continue;
        let h = head[rowBase + xx];
        while (h !== -1) { cb(h); h = next[h]; }
      }
    }
  }
}

// Particle
class Particle {
  // ... (Particle class code remains unchanged)
  constructor(id, x, y, r, color, shape) {
    this.id = id;
    this.x = x; this.y = y;
    this.vx = 0; this.vy = 0;
    this.r = r;
    this.mass = Math.max(0.5, r*r);
    this.color = color;
    this.shape = shape;
    this.spin = (Math.random() - 0.5) * 2;
    this.heat = 0;
  }
}

function resize() {
  const w = canvas.clientWidth = window.innerWidth;
  const h = canvas.clientHeight = window.innerHeight;
  canvas.width = Math.round(w * DPR);
  canvas.height = Math.round(h * DPR);
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  state.w = w; state.h = h;
  ensureGrid();
}

function ensureGrid() {
  const maxR = (cfg.sizeMode === 'uniform') ? cfg.size : cfg.sizeMax;
  const cellSize = Math.max(16, (maxR * 2 + 2)|0);
  if (!state.grid) state.grid = new LLGrid(cellSize, state.w, state.h, cfg.count + 16);
  else state.grid.set(cellSize, state.w, state.h, Math.max(cfg.count + 16, state.particles.length));
}

function spawnParticles(n) {
  // ... (spawnParticles function code remains unchanged)
  const arr = state.particles;
  const target = n|0;
  const base = state.colorARGB.base, colA = state.colorARGB.A, colB = state.colorARGB.B;
  const makeColor = (xNorm) => {
    if (cfg.colorMode === 'single') return rgbToStr(base, 1);
    if (cfg.colorMode === 'random') {
      const h = Math.random() * 360;
      const c = hslToRgb(h, 0.7, 0.55);
      return rgbToStr(c, 1);
    }
    if (cfg.colorMode === 'gradient') return rgbToStr(mix(colA, colB, xNorm), 1);
    if (cfg.colorMode === 'velocity') return rgbToStr(hslToRgb(210, 0.7, 0.6), 1);
    if (cfg.colorMode === 'heat') return rgbToStr(hslToRgb(200, 0.6, 0.55), 1);
    return '#fff';
  };
  const rnd = (a,b)=> a + Math.random()*(b-a);
  const makeRadius = () => cfg.sizeMode === 'uniform' ? cfg.size : rnd(cfg.sizeMin, cfg.sizeMax);

  if (arr.length < target) {
    const add = target - arr.length;
    for (let i = 0; i < add; i++) {
      const margin = 8;
      const x = rnd(margin, state.w - margin);
      const y = rnd(margin, state.h - margin);
      const r = makeRadius();
      const col = makeColor(x / Math.max(1, state.w));
      const p = new Particle(arr.length, x, y, r, col, cfg.shape);
      p.vx = (Math.random() - 0.5) * 80;
      p.vy = (Math.random() - 0.5) * 80;
      arr.push(p);
    }
  } else if (arr.length > target) {
    arr.length = target;
    arr.forEach((p, i) => (p.id = i));
  }
  applyMassMode();
  deoverlapWarmStart(3);
}

function deoverlapWarmStart(iterations=3) {
  // ... (deoverlapWarmStart function code remains unchanged)
  ensureGrid();
  for (let it = 0; it < iterations; it++) {
    state.grid.build(state.particles);
    const N = state.particles.length;
    for (let i = 0; i < N; i++) {
      const p = state.particles[i];
      state.grid.forEachNeighborIndices(p, (j) => {
        if (j <= i) return;
        const q = state.particles[j];
        const dx = q.x - p.x, dy = q.y - p.y;
        const rsum = p.r + q.r;
        const d2 = dx*dx + dy*dy;
        if (d2 > 0 && d2 < rsum * rsum) {
          const d = Math.sqrt(d2) || 0.0001;
          const nx = dx / d, ny = dy / d;
          const overlap = rsum - d;
          const totalInv = (1/p.mass) + (1/q.mass);
          const corrP = (overlap * (1/p.mass) / totalInv) * 0.5;
          const corrQ = (overlap * (1/q.mass) / totalInv) * 0.5;
          p.x -= nx * corrP; p.y -= ny * corrP;
          q.x += nx * corrQ; q.y += ny * corrQ;
        }
      });
    }
  }
}
// --- END OF FILE simulation_core.js ---