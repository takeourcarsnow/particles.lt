import { Settings } from '../settings.js';
import { state } from '../state.js';

export function attachPointer(){
  const canvas = state.canvas;
  function setPointer(e, type){
    const rect = canvas.getBoundingClientRect();
    let x,y,id=null;
    if(e.touches && e.touches[0]){
      const t = e.touches[0];
      id = t.identifier;
      x = t.clientX - rect.left;
      y = t.clientY - rect.top;
    }else{
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }
    state.pointer.dx = x - state.pointer.lastX;
    state.pointer.dy = y - state.pointer.lastY;
    state.pointer.lastX = state.pointer.x = x;
    state.pointer.lastY = state.pointer.y = y;
    if(type==='down'){
      state.pointer.down = true; state.pointer.active = true; state.pointer.id = id;
      if(Settings.controls.mouseSetsGravity){ setMouseGravityFromPoint(x,y); }
    }else if(type==='up'){
      state.pointer.down=false; state.pointer.id=null; state.pointer.dx=0; state.pointer.dy=0;
    }
  }

  canvas.addEventListener('pointerdown', e=>{ canvas.setPointerCapture(e.pointerId); setPointer(e,'down'); });
  canvas.addEventListener('pointermove', e=>{ setPointer(e,'move'); });
  canvas.addEventListener('pointerup', e=>{ setPointer(e,'up'); });
  canvas.addEventListener('pointercancel', e=>{ setPointer(e,'up'); });

  canvas.addEventListener('click', (e)=>{
    if(Settings.controls.mouseSetsGravity){
      setMouseGravityFromPoint(e.clientX, e.clientY);
    }
  });
}

export function setMouseGravityFromPoint(px,py){
  const rect = state.canvas.getBoundingClientRect();
  const cx = rect.width/2, cy = rect.height/2;
  let dx = (px - rect.left - cx), dy = (py - rect.top - cy);
  const len = Math.hypot(dx,dy) || 1;
  state.mouseGravity.x = dx/len; state.mouseGravity.y = dy/len;
}