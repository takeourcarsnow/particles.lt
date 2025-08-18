import { Settings } from './config.js';
import { State } from './state.js';
import { TAU, clamp, paletteColor } from './utils.js';

function applyOpacityToColor(col, alpha){
  if(col.startsWith('#')){
    const r = parseInt(col.slice(1,3),16);
    const g = parseInt(col.slice(3,5),16);
    const b = parseInt(col.slice(5,7),16);
    return `rgba(${r},${g},${b},${alpha})`;
  }
  if(col.startsWith('rgb')){
    return col.replace('rgb','rgba').replace(')',`,`+alpha+`)`);
  }
  return col;
}

export function drawParticle(ctx, p){
  const opacity = Settings.particles.opacity;
  const cm = Settings.particles.colorMode;
  if(cm==='solid'){
    ctx.fillStyle = applyOpacityToColor(Settings.particles.solidColor, opacity);
  }else if(cm==='velocity'){
    const spd = Math.hypot(p.vx,p.vy);
    const t = clamp(spd / Settings.particles.velocityColorScale, 0,1);
    ctx.fillStyle = applyOpacityToColor(paletteColor(t, Settings.particles.palette), opacity);
  }else if(cm==='heat'){
    const t = clamp(p.heat,0,1);
    ctx.fillStyle = applyOpacityToColor(paletteColor(t, 'fire'), opacity);
  }
  const r = p.r;
  if(Settings.particles.shape==='circle'){
    ctx.beginPath();
    ctx.arc(p.x, p.y, r, 0, TAU);
    ctx.fill();
  }else if(Settings.particles.shape==='square'){
    ctx.fillRect(p.x-r, p.y-r, r*2, r*2);
  }else{
    ctx.beginPath();
    ctx.moveTo(p.x, p.y - r);
    ctx.lineTo(p.x + r, p.y + r);
    ctx.lineTo(p.x - r, p.y + r);
    ctx.closePath();
    ctx.fill();
  }
  if(Settings.visuals.wireframe){
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.stroke();
  }
}

export function drawContainerOutline(ctx){
  if(!Settings.visuals.showContainer) return;
  const b = Settings.physics.boundaries;
  if(b!=='container-circle' && b!=='container-square') return;
  const BW = State.canvas.width/State.DPR, BH = State.canvas.height/State.DPR;
  ctx.globalCompositeOperation = 'source-over';
  ctx.strokeStyle = 'rgba(255,255,255,0.18)';
  ctx.lineWidth = 2;
  const cx = Settings.physics.container.cx * BW;
  const cy = Settings.physics.container.cy * BH;
  const minDim = Math.min(BW,BH);
  if(b==='container-circle'){
    const R = Settings.physics.container.radiusN * (minDim/2);
    ctx.beginPath(); ctx.arc(cx,cy,R,0,TAU); ctx.stroke();
  }else{
    const half = Settings.physics.container.sizeN * (minDim/2);
    ctx.strokeRect(cx-half, cy-half, half*2, half*2);
  }
}