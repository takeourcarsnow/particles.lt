import { Settings } from '../settings.js';
import { state } from '../state.js';
import { TAU } from '../util/math.js';
import { applyOpacityToColor, paletteColor, hexWithAlpha } from '../util/color.js';

export function clearFrame(){
  const ctx = state.ctx;
  const W = state.canvas.width/state.DPR, H = state.canvas.height/state.DPR;
  if(Settings.visuals.trail<=0.001){
    ctx.fillStyle = Settings.visuals.background;
    ctx.fillRect(0,0,W,H);
  }else{
    ctx.fillStyle = hexWithAlpha(Settings.visuals.background, 1-Settings.visuals.trail);
    ctx.fillRect(0,0,W,H);
  }
}

export function drawParticle(p){
  const ctx = state.ctx;
  const cm = Settings.particles.colorMode;
  const opacity = Settings.particles.opacity;

  if(cm==='solid'){
    ctx.fillStyle = applyOpacityToColor(Settings.particles.solidColor, opacity);
  }else if(cm==='velocity'){
    const spd = Math.hypot(p.vx,p.vy);
    const t = Math.max(0, Math.min(1, spd / Settings.particles.velocityColorScale));
    ctx.fillStyle = applyOpacityToColor(paletteColor(t, Settings.particles.palette), opacity);
  }else if(cm==='heat'){
    const t = Math.max(0, Math.min(1, p.heat));
    ctx.fillStyle = applyOpacityToColor(paletteColor(t, 'fire'), opacity);
  }

  const r = p.r;
  if(Settings.particles.shape==='circle'){
    state.ctx.beginPath();
    state.ctx.arc(p.x, p.y, r, 0, TAU);
    state.ctx.fill();
  }else if(Settings.particles.shape==='square'){
    state.ctx.fillRect(p.x-r, p.y-r, r*2, r*2);
  }else{
    state.ctx.beginPath();
    state.ctx.moveTo(p.x, p.y - r);
    state.ctx.lineTo(p.x + r, p.y + r);
    state.ctx.lineTo(p.x - r, p.y + r);
    state.ctx.closePath();
    state.ctx.fill();
  }
  if(Settings.visuals.wireframe){
    state.ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    state.ctx.stroke();
  }
}

export function drawContainerOutline(bMode){
  if(!Settings.visuals.showContainer) return;
  if(!(bMode==='container-circle' || bMode==='container-square')) return;
  const ctx = state.ctx;
  const BW = state.canvas.width/state.DPR, BH = state.canvas.height/state.DPR;
  ctx.globalCompositeOperation = 'source-over';
  ctx.strokeStyle = 'rgba(255,255,255,0.18)';
  ctx.lineWidth = 2;
  const cx = Settings.physics.container.cx * BW;
  const cy = Settings.physics.container.cy * BH;
  const minDim = Math.min(BW,BH);
  if(bMode==='container-circle'){
    const R = Settings.physics.container.radiusN * (minDim/2);
    ctx.beginPath(); ctx.arc(cx,cy,R,0,TAU); ctx.stroke();
  }else{
    const half = Settings.physics.container.sizeN * (minDim/2);
    ctx.strokeRect(cx-half, cy-half, half*2, half*2);
  }
}

export function drawGravityVector(gv){
  const ctx = state.ctx;
  const BW = state.canvas.width/state.DPR, BH = state.canvas.height/state.DPR;
  ctx.globalCompositeOperation = 'source-over';
  ctx.strokeStyle = 'rgba(106,227,255,0.6)';
  ctx.lineWidth = 2;
  const cxv = BW/2, cyv = BH/2;
  ctx.beginPath();
  ctx.moveTo(cxv,cyv);
  ctx.lineTo(cxv + gv.x*40, cyv + gv.y*40);
  ctx.stroke();
}