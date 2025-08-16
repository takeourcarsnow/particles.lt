import { Settings } from '../settings.js';
import { state } from '../state.js';
import { clamp, rand } from '../util/math.js';
import { mapBoundaries } from './boundaries.js';
import { setGridCell } from './spatialHash.js';

function massForRadius(r){
  switch(Settings.particles.massMode){
    case 'constant': return Settings.particles.mass;
    case 'byArea': return Math.PI*r*r*0.02;
    case 'inverse': return 1/(Math.PI*r*r*0.02 + 0.1);
    case 'random': return rand(Settings.particles.randomMassMin, Settings.particles.randomMassMax);
  }
  return 1;
}

function spawnPosFor(pRadius){
  const bMode = mapBoundaries(Settings.physics.boundaries);
  const BW = state.canvas.width/state.DPR, BH = state.canvas.height/state.DPR;
  if(bMode==='container-circle' || bMode==='container-square'){
    const cx = Settings.physics.container.cx * BW;
    const cy = Settings.physics.container.cy * BH;
    const minDim = Math.min(BW,BH);
    if(bMode==='container-circle'){
      const R = Settings.physics.container.radiusN * (minDim/2);
      const allowed = Math.max(4, R - pRadius);
      const a = Math.random() * Math.PI*2;
      const rr = Math.sqrt(Math.random()) * Math.max(2, allowed);
      return { x: cx + Math.cos(a)*rr, y: cy + Math.sin(a)*rr };
    }else{
      const half = Settings.physics.container.sizeN * (minDim/2);
      const x = clamp(rand(cx - half + pRadius, cx + half - pRadius), pRadius, BW-pRadius);
      const y = clamp(rand(cy - half + pRadius, cy + half - pRadius), pRadius, BH-pRadius);
      return { x, y };
    }
  }else{
    return {
      x: rand(pRadius, BW - pRadius),
      y: rand(pRadius, BH - pRadius)
    };
  }
}

function makeParticle(){
  const uniform = Settings.particles.uniformSize;
  const r = uniform ? Settings.particles.radiusMax : rand(Settings.particles.radiusMin, Settings.particles.radiusMax);
  const m = massForRadius(r);
  const pos = spawnPosFor(r);
  return {
    x: pos.x, y: pos.y, vx: rand(-40,40), vy: rand(-40,40),
    r, m, heat: 0, color: Settings.particles.solidColor
  };
}

export function rebuildParticles(keepPositions=false){
  const target = clamp(Settings.particles.count, 0, Settings.performance.maxParticles);
  const prev = state.particles.slice(0);
  state.particles.length = 0;
  for(let i=0;i<target;i++){
    let p = makeParticle();
    if(keepPositions && prev[i]){
      p.x = clamp(prev[i].x, p.r, state.canvas.width/state.DPR - p.r);
      p.y = clamp(prev[i].y, p.r, state.canvas.height/state.DPR - p.r);
      p.vx = prev[i].vx; p.vy = prev[i].vy;
      p.heat = prev[i].heat * 0.8;
    }
    state.particles.push(p);
  }
  setGridCell(Math.max(8, (Settings.particles.radiusMax*2)|0));
}

export function applyUniformRadius(){
  if(!Settings.particles.uniformSize) return;
  const r = Settings.particles.radiusMax;
  for(const p of state.particles){
    p.r = r;
    p.m = Math.max(0.001, (Settings.particles.massMode==='byArea') ? Math.PI*r*r*0.02 :
      (Settings.particles.massMode==='constant' ? Settings.particles.mass :
       (Settings.particles.massMode==='inverse' ? 1/(Math.PI*r*r*0.02 + 0.1) : p.m)));
    p.x = Math.max(r, Math.min(state.canvas.width/state.DPR - r, p.x));
    p.y = Math.max(r, Math.min(state.canvas.height/state.DPR - r, p.y));
  }
  setGridCell(Math.max(8, (Settings.particles.radiusMax*2)|0));
}