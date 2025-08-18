import { Settings } from './config.js';
import { State } from './state.js';
import { DEG } from './utils.js';
import { rebuildParticles } from './particles.js';
import { updateHUD } from './hud.js';

export function setMouseGravityFromPoint(px,py){
  const cx = State.canvas.clientWidth/2, cy = State.canvas.clientHeight/2;
  let dx = (px - cx), dy = (py - cy);
  const len = Math.hypot(dx,dy) || 1;
  State.mouseGravity.x = dx/len; State.mouseGravity.y = dy/len;
}

function enableTiltRequest(){
  function onGranted(){
    State.tiltEnabled = true;
    updateHUD();
    if (State.els.tiltPrompt) State.els.tiltPrompt.hidden = true;
  }
  if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function'){
    DeviceMotionEvent.requestPermission().then(res=>{
      if(res==='granted'){
        onGranted();
      }else{
        alert('Motion permission denied.');
      }
    }).catch(()=>alert('Motion permission request failed.'));
  }else{
    State.tiltEnabled = true;
    updateHUD();
    if (State.els.tiltPrompt) State.els.tiltPrompt.hidden = true;
  }
}

function onDeviceOrientation(e){
  if(!State.tiltEnabled) return;
  const beta = (e.beta||0)*DEG;
  const gamma = (e.gamma||0)*DEG;
  let gx = Math.sin(gamma);
  let gy = Math.sin(beta);
  const orient = (screen.orientation && screen.orientation.angle) || window.orientation || 0;
  const a = (orient||0)*DEG;
  const rx = gx*Math.cos(-a) - gy*Math.sin(-a);
  const ry = gx*Math.sin(-a) + gy*Math.cos(-a);
  const len = Math.hypot(rx,ry) || 1;
  State.gDir.x = rx/len; State.gDir.y = ry/len;
}

function initPointer(){
  const pointerEl = State.canvas;
  function setPointer(e, type){
    const rect = State.canvas.getBoundingClientRect();
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
    State.pointer.dx = x - State.pointer.lastX;
    State.pointer.dy = y - State.pointer.lastY;
    State.pointer.lastX = State.pointer.x = x;
    State.pointer.lastY = State.pointer.y = y;
    if(type==='down'){
      State.pointer.down = true; State.pointer.active = true; State.pointer.id = id;
      if(Settings.controls.mouseSetsGravity){ setMouseGravityFromPoint(x,y); }
    } else if(type==='up'){ State.pointer.down=false; State.pointer.id=null; State.pointer.dx=0; State.pointer.dy=0; }
  }
  pointerEl.addEventListener('pointerdown', e=>{ State.canvas.setPointerCapture(e.pointerId); setPointer(e,'down'); });
  pointerEl.addEventListener('pointermove', e=>{ setPointer(e,'move'); });
  pointerEl.addEventListener('pointerup', e=>{ setPointer(e,'up'); });
  pointerEl.addEventListener('pointercancel', e=>{ setPointer(e,'up'); });

  // Sticky mouse gravity on click
  State.canvas.addEventListener('click', (e)=>{
    if(Settings.controls.mouseSetsGravity){
      setMouseGravityFromPoint(e.clientX, e.clientY);
    }
  });
}

function initKeyboard(){
  window.addEventListener('keydown', (e)=>{
    if(e.key===' '){ State.running=!State.running; State.hud.pauseBtn.textContent = State.running?'Pause':'Resume'; e.preventDefault(); }
    if(e.key==='c' || e.key==='C'){ State.els.panel.classList.toggle('hidden'); }
    if(e.key==='g' || e.key==='G'){ Settings.controls.mouseSetsGravity = !Settings.controls.mouseSetsGravity; updateHUD(); }
    if(e.key==='r' || e.key==='R'){ rebuildParticles(false); }
    if(e.key==='f' || e.key==='F'){ Settings.visuals.showHUD = !Settings.visuals.showHUD; State.hud.root.style.display = Settings.visuals.showHUD?'block':'none';}
  });
}

export function initInput(){
  // Tilt prompt and buttons
  if(State.haveDeviceOrientation && State.els.tiltPrompt){
    setTimeout(()=>{ State.els.tiltPrompt.hidden = false; }, 600);
  }
  if(State.els.tiltBtn) State.els.tiltBtn.addEventListener('click', enableTiltRequest);
  if(State.els.tiltBtnTop) State.els.tiltBtnTop.addEventListener('click', enableTiltRequest);
  if(State.els.dismissTilt) State.els.dismissTilt.addEventListener('click', ()=>{ State.els.tiltPrompt.hidden = true; });

  // Orientation
  window.addEventListener('deviceorientation', onDeviceOrientation, true);

  // Pointer + keyboard
  initPointer();
  initKeyboard();

  // Initial mouse gravity center
  setMouseGravityFromPoint(State.canvas.clientWidth/2, State.canvas.clientHeight/2);
}