import { Settings } from '../settings.js';
import { state } from '../state.js';
import { DEG } from '../util/math.js';
import { flowNoiseVec, curlNoise, LCG } from '../util/noise.js';

export function getTurbulenceAccel(p, time){
  const amp = Settings.forces.amplitude;
  const sca = Settings.forces.scale;
  const tscale = Settings.forces.timeScale;
  const tt = time * tscale;
  const BW = state.canvas.width/state.DPR, BH = state.canvas.height/state.DPR;

  const mode = Settings.forces.turbulenceMode;
  let ax=0, ay=0;

  if(mode==='flow'){
    const v = flowNoiseVec(p.x, p.y, tt, sca, amp/p.m);
    ax += v.x; ay += v.y;
  }else if(mode==='curl'){
    const v = curlNoise(p.x, p.y, tt, sca, amp*Settings.forces.curlStrength/p.m);
    ax += v.x; ay += v.y;
  }else if(mode==='vortex'){
    const cx = Settings.forces.vortexX * BW;
    const cy = Settings.forces.vortexY * BH;
    let dx = p.x - cx, dy = p.y - cy;
    let r2 = dx*dx + dy*dy;
    let r = Math.sqrt(r2) + 1e-4;
    let strength = Settings.forces.vortexStrength / Math.pow(r, Settings.forces.vortexFalloff);
    let tx = -dy/r, ty = dx/r;
    if(!Settings.forces.vortexCW){ tx = -tx; ty = -ty; }
    ax += tx * strength / p.m;
    ay += ty * strength / p.m;
    const cent = amp*0.1 / p.m;
    ax += -dx/r * cent; ay += -dy/r * cent;
  }else if(mode==='wind'){
    const v = flowNoiseVec(p.x*0.7, p.y*0.7, tt, sca*0.6, (Settings.forces.windVar||0));
    const gust = flowNoiseVec(p.x*0.3, p.y*0.3, tt*1.7, sca*0.4, (Settings.forces.windGust||0));
    ax += (v.x + gust.x)/p.m;
    ay += (v.y + gust.y)/p.m;
  }else if(mode==='jets'){
    const ang = Settings.forces.jetsAngle*DEG;
    const ux = Math.cos(ang), uy = Math.sin(ang);
    const phi = ((p.x*ux + p.y*uy) / Math.max(10,Settings.forces.jetsSpacing)) * Math.PI*2 + tt*2.0;
    const band = Math.sin(phi);
    const F = amp * band / p.m;
    ax += ux * F; ay += uy * F;
  }else if(mode==='swirlgrid'){
    const spacing = Math.max(20, Settings.forces.swirlSpacing);
    const cxg = Math.floor(p.x/spacing)*spacing + spacing*0.5;
    const cyg = Math.floor(p.y/spacing)*spacing + spacing*0.5;
    const dx = p.x - cxg, dy = p.y - cyg;
    const r = Math.hypot(dx,dy) + 1e-3;
    let cw = Settings.forces.vortexCW ? 1 : -1;
    if(Settings.forces.swirlAlt){
      const px = Math.floor(p.x/spacing), py = Math.floor(p.y/spacing);
      if(((px+py)&1)===1) cw = -cw;
    }
    const tx = (-dy/r)*cw, ty = (dx/r)*cw;
    const fall = 1/Math.pow(1 + (r/spacing), Settings.forces.swirlFalloff);
    const F = amp * fall / p.m;
    ax += tx * F; ay += ty * F;
  }else if(mode==='wells'){
    const wells = computeWellsPositions(time);
    const falloff = Settings.forces.wellsFalloff;
    const k = Settings.forces.wellsStrength;
    for(let w=0; w<wells.length; w++){
      const wx = wells[w].x, wy = wells[w].y;
      const dx = wx - p.x, dy = wy - p.y;
      const r = Math.hypot(dx,dy) + 1e-3;
      const nx = dx/r, ny = dy/r;
      const sgn = Settings.forces.wellsRepel ? -1 : 1;
      const base = k / Math.pow(r, falloff);
      // radial
      ax += nx * base * sgn / p.m;
      ay += ny * base * sgn / p.m;
      // swirl
      const cw = (w%2===0?1:-1);
      const tx = -ny*cw, ty = nx*cw;
      const spin = Settings.forces.wellsSpin * base / p.m;
      ax += tx * spin; ay += ty * spin;
    }
  }

  return {ax, ay};
}

export function computeWellsPositions(t){
  const rng = LCG(Settings.forces.wellsSeed);
  const BW = state.canvas.width/state.DPR, BH = state.canvas.height/state.DPR;
  const n = Math.max(1, Math.min(8, Math.round(Settings.forces.wellsCount)));
  const res = [];
  for(let i=0;i<n;i++){
    const bx = 0.15 + 0.7 * rng();
    const by = 0.15 + 0.7 * rng();
    let x = bx*BW, y = by*BH;
    if(Settings.forces.wellsMove){
      const phase = i*1.7;
      x += Math.sin(t*0.6 + phase) * 0.12 * Math.min(BW,BH);
      y += Math.cos(t*0.5 + phase*1.3) * 0.10 * Math.min(BW,BH);
    }
    res.push({x,y, sign: (i%2===0?1:-1)});
  }
  return res;
}