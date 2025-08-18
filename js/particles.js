import { Settings } from './config.js';
import { State } from './state.js';
import { clamp, rand, mapBoundaries } from './utils.js';

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
  const BW = State.canvas.width/State.DPR, BH = State.canvas.height/State.DPR;
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
      const x = rand(cx - half + pRadius, cx + half - pRadius);
      const y = rand(cy - half + pRadius, cy + half - pRadius);
      return { x: clamp(x, pRadius, BW-pRadius), y: clamp(y, pRadius, BH-pRadius) };
    }
  }else{
    return {
      x: rand(pRadius, State.canvas.width/State.DPR - pRadius),
      y: rand(pRadius, State.canvas.height/State.DPR - pRadius)
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
    r, m,
    heat: 0,
    color: Settings.particles.solidColor
  };
}

export function rebuildParticles(keepPositions=false){
  const target = clamp(Settings.particles.count, 0, Settings.performance.maxParticles);
  const prev = State.particles.slice(0);
  State.particles.length = 0;
  for(let i=0;i<target;i++){
    let p = makeParticle();
    if(keepPositions && prev[i]){
      p.x = clamp(prev[i].x, p.r, State.canvas.width/State.DPR - p.r);
      p.y = clamp(prev[i].y, p.r, State.canvas.height/State.DPR - p.r);
      p.vx = prev[i].vx; p.vy = prev[i].vy;
      p.heat = prev[i].heat * 0.8;
    }
    State.particles.push(p);
  }
  State.gridCell = Math.max(8, (Settings.particles.radiusMax*2)|0);
}

export function applyUniformRadius(){
  if(!Settings.particles.uniformSize) return;
  const r = Settings.particles.radiusMax;
  for(const p of State.particles){
    p.r = r;
    p.m = massForRadius(r);
    p.x = clamp(p.x, r, State.canvas.width/State.DPR - r);
    p.y = clamp(p.y, r, State.canvas.height/State.DPR - r);
  }
  State.gridCell = Math.max(8, (Settings.particles.radiusMax*2)|0);
}