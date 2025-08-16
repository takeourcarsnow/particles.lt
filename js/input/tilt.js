import { DEG } from '../util/math.js';
import { state } from '../state.js';

export function attachTilt(){
  window.addEventListener('deviceorientation', onDeviceOrientation, true);
}

function onDeviceOrientation(e){
  if(!state.tiltEnabled) return;
  const beta = (e.beta||0)*DEG;
  const gamma = (e.gamma||0)*DEG;
  let gx = Math.sin(gamma);
  let gy = Math.sin(beta);
  const orient = (screen.orientation && screen.orientation.angle) || window.orientation || 0;
  const a = (orient||0)*DEG;
  const rx = gx*Math.cos(-a) - gy*Math.sin(-a);
  const ry = gx*Math.sin(-a) + gy*Math.cos(-a);
  const len = Math.hypot(rx,ry) || 1;
  state.gDir.x = rx/len; state.gDir.y = ry/len;
}

export async function enableTiltRequest(){
  function grant(){
    state.tiltEnabled = true;
    return true;
  }
  try{
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function'){
      const res = await DeviceMotionEvent.requestPermission();
      if(res==='granted'){ return grant(); }
      return false;
    }
    return grant();
  }catch(e){
    console.warn('Motion permission request failed.', e);
    return false;
  }
}