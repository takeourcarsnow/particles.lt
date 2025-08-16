import { clamp } from './math.js';

export function hexWithAlpha(hex, a){
  if(!hex || hex[0]!=='#') return hex;
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${a})`;
}

export function paletteColor(t, name){
  t = clamp(t,0,1);
  switch(name){
    case 'plasma': {
      const r = Math.round(255 * clamp(Math.sin((t)*Math.PI)*0.8 + t*0.2 + 0.1,0,1));
      const g = Math.round(255 * clamp(Math.pow(t,0.5)*0.9,0,1));
      const b = Math.round(255 * clamp(1 - Math.pow(t,0.7),0,1));
      return `rgb(${r},${g},${b})`;
    }
    case 'cool': {
      const r = Math.round(255 * (1-t));
      const g = Math.round(255 * (0.5+0.5*t));
      const b = Math.round(255 * (t));
      return `rgb(${r},${g},${b})`;
    }
    case 'fire': {
      const r = Math.round(255 * clamp(1.2*t,0,1));
      const g = Math.round(255 * clamp(1.2*t-0.2,0,1));
      const b = Math.round(255 * clamp(0.8*t-0.5,0,1));
      return `rgb(${r},${g},${b})`;
    }
    case 'aurora':
    default: {
      const r = Math.round(255 * clamp(0.6*(1-t) + 0.1,0,1));
      const g = Math.round(255 * clamp(0.2 + t*0.8,0,1));
      const b = Math.round(255 * clamp(0.9 - t*0.6,0,1));
      return `rgb(${r},${g},${b})`;
    }
  }
}

export function applyOpacityToColor(col, alpha){
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