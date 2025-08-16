let grid = new Map();
let gridCell = 16;

export function setGridCell(size){ gridCell = Math.max(8, size|0); }
export function getGridCell(){ return gridCell; }

export function buildGrid(particles){
  grid.clear();
  const cell = gridCell;
  for(let i=0;i<particles.length;i++){
    const p = particles[i];
    const cx = (p.x/cell)|0, cy=(p.y/cell)|0;
    const key = (cx<<16) ^ cy;
    let list = grid.get(key);
    if(!list){ list = []; grid.set(key,list); }
    list.push(i);
  }
}

export function neighbors(i, particles){
  const res = [];
  const cell = gridCell;
  const p = particles[i];
  const cx = (p.x/cell)|0, cy=(p.y/cell)|0;
  for(let ox=-1; ox<=1; ox++){
    for(let oy=-1; oy<=1; oy++){
      const key = ((cx+ox)<<16) ^ (cy+oy);
      const list = grid.get(key);
      if(list) for(let j of list){ if(j!==i) res.push(j); }
    }
  }
  return res;
}