import { Settings } from '../settings.js';
import { state } from '../state.js';

export function mapBoundaries(v){
  if(v==='bounce') return 'screen-bounce';
  if(v==='wrap') return 'screen-wrap';
  return v;
}

export function applyBoundary(p){
  const BW = state.canvas.width/state.DPR, BH = state.canvas.height/state.DPR;
  const e = Settings.physics.restitution;
  const wf = Settings.physics.wallFriction;
  const bMode = mapBoundaries(Settings.physics.boundaries);

  if(bMode==='screen-bounce'){
    if(p.x < p.r){ p.x = p.r; if(p.vx<0){ const vt = p.vy; p.vx = -p.vx*e; p.vy = vt*(1-wf); } }
    else if(p.x > BW - p.r){ p.x=BW-p.r; if(p.vx>0){ const vt = p.vy; p.vx = -p.vx*e; p.vy = vt*(1-wf);} }
    if(p.y < p.r){ p.y = p.r; if(p.vy<0){ const vt = p.vx; p.vy = -p.vy*e; p.vx = vt*(1-wf);} }
    else if(p.y > BH - p.r){ p.y=BH-p.r; if(p.vy>0){ const vt = p.vx; p.vy = -p.vy*e; p.vx = vt*(1-wf);} }
  }else if(bMode==='screen-wrap'){
    if(p.x < -p.r) p.x = BW + p.r;
    if(p.x > BW + p.r) p.x = -p.r;
    if(p.y < -p.r) p.y = BH + p.r;
    if(p.y > BH + p.r) p.y = -p.r;
  }else if(bMode==='container-circle'){
    const cx = Settings.physics.container.cx * BW;
    const cy = Settings.physics.container.cy * BH;
    const R = Settings.physics.container.radiusN * (Math.min(BW,BH)/2);
    const dx = p.x - cx, dy = p.y - cy;
    const dist = Math.hypot(dx,dy) || 1e-6;
    const allow = Math.max(2, R - p.r);
    if(dist > allow){
      const nx = dx/dist, ny = dy/dist;
      p.x = cx + nx*allow;
      p.y = cy + ny*allow;
      const vn = p.vx*nx + p.vy*ny;
      // reflect normal
      p.vx = p.vx - (1+e)*vn*nx;
      p.vy = p.vy - (1+e)*vn*ny;
      // tangential friction
      const tnx = -ny, tny = nx;
      const vt = p.vx*tnx + p.vy*tny;
      p.vx -= tnx * vt * wf;
      p.vy -= tny * vt * wf;
    }
  }else if(bMode==='container-square'){
    const cx = Settings.physics.container.cx * BW;
    const cy = Settings.physics.container.cy * BH;
    const half = Settings.physics.container.sizeN * (Math.min(BW,BH)/2);
    const minX = cx - half + p.r, maxX = cx + half - p.r;
    const minY = cy - half + p.r, maxY = cy + half - p.r;
    if(p.x < minX){ p.x = minX; if(p.vx<0){ const vt = p.vy; p.vx = -p.vx*e; p.vy = vt*(1-wf); } }
    else if(p.x > maxX){ p.x = maxX; if(p.vx>0){ const vt = p.vy; p.vx = -p.vx*e; p.vy = vt*(1-wf);} }
    if(p.y < minY){ p.y = minY; if(p.vy<0){ const vt = p.vx; p.vy = -p.vy*e; p.vx = vt*(1-wf);} }
    else if(p.y > maxY){ p.y = maxY; if(p.vy>0){ const vt = p.vx; p.vy = -p.vy*e; p.vx = vt*(1-wf);} }
  }else{
    if(p.x < -BW) p.x = BW*2;
    if(p.x > BW*2) p.x = -BW;
    if(p.y < -BH) p.y = BH*2;
    if(p.y > BH*2) p.y = -BH;
  }
}