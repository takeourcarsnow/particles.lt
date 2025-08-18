import { State } from './state.js';

export function buildGrid(){
  State.grid.clear();
  const cell = State.gridCell;
  for(let i=0;i<State.particles.length;i++){
    const p = State.particles[i];
    const cx = (p.x/cell)|0, cy=(p.y/cell)|0;
    const key = (cx<<16) ^ cy;
    let list = State.grid.get(key);
    if(!list){ list = []; State.grid.set(key,list); }
    list.push(i);
  }
}

export function neighbors(i){
  const res = [];
  const cell = State.gridCell;
  const p = State.particles[i];
  const cx = (p.x/cell)|0, cy = (p.y/cell)|0;
  for(let ox=-1; ox<=1; ox++){
    for(let oy=-1; oy<=1; oy++){
      const key = ((cx+ox)<<16) ^ (cy+oy);
      const list = State.grid.get(key);
      if(list) for(let j of list){ if(j!==i) res.push(j); }
    }
  }
  return res;
}