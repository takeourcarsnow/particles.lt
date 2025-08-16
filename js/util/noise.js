import { lerp } from './math.js';

export function hash(n){ n = (n<<13)^n; return 1.0 - ((n*(n*n*15731 + 789221) + 1376312589) & 0x7fffffff)/1073741824.0; }

export function noise2D(x,y){
  const xi = Math.floor(x), yi = Math.floor(y);
  let xf = x - xi, yf = y - yi;
  const s = (t)=>t*t*(3-2*t);
  const h = (ix,iy)=>hash(ix*374761393 + iy*668265263);
  const v00 = h(xi,yi), v10 = h(xi+1,yi), v01 = h(xi,yi+1), v11 = h(xi+1,yi+1);
  const u = s(xf), v = s(yf);
  return lerp(lerp(v00,v10,u), lerp(v01,v11,u), v)*0.5+0.5;
}

export function curlNoise(x,y,t,scale=0.003, amp=1.0){
  const eps = 1.5;
  const n1 = noise2D(x*scale, y*scale + t);
  const nx1 = noise2D((x+eps)*scale, y*scale + t);
  const nx2 = noise2D((x-eps)*scale, y*scale + t);
  const ny1 = noise2D(x*scale, (y+eps)*scale + t);
  const ny2 = noise2D(x*scale, (y-eps)*scale + t);
  const dx = (nx1 - nx2)/(2*eps);
  const dy = (ny1 - ny2)/(2*eps);
  return {x: amp * (dy), y: amp * (-dx)};
}

export function flowNoiseVec(x,y,t,scale=0.002, amp=1.0){
  const theta = noise2D(x*scale + t*0.31, y*scale - t*0.17) * Math.PI*2*2;
  return {x: Math.cos(theta)*amp, y: Math.sin(theta)*amp};
}

export function LCG(seed){
  let s = (seed>>>0) || 1;
  return ()=>{ s = (1664525*s + 1013904223)>>>0; return s/4294967296; };
}