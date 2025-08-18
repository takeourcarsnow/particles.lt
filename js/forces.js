import { Settings } from './config.js';
import { State } from './state.js';
import { LCG } from './utils.js';

export function computeWellsPositions(t){
  const rng = LCG(Settings.forces.wellsSeed);
  const BW = State.canvas.width/State.DPR, BH = State.canvas.height/State.DPR;
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