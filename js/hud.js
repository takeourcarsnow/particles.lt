import { Settings } from './config.js';
import { State } from './state.js';
import { rebuildParticles } from './particles.js';

export function updateHUD(){
  State.hud.collMode.textContent = Settings.collisions.mode;
  State.hud.turbMode.textContent = Settings.forces.turbulenceMode;
  State.hud.tiltState.textContent = State.tiltEnabled? 'on':'off';
  State.hud.mouseG.textContent = Settings.controls.mouseSetsGravity? 'on':'off';
  State.hud.gravityVal.textContent = Settings.physics.gravity;
  State.hud.countVal.textContent = Settings.particles.count;
  State.hud.shapeMode.textContent = Settings.particles.shape;
  State.hud.colorMode.textContent = Settings.particles.colorMode;
  State.hud.boundMode.textContent = Settings.physics.boundaries;
}

function cycleSetting(el, keyPathArray, options, onChange){
  el.addEventListener('click', function() {
    if(keyPathArray.length){
      let val = keyPathArray.reduce((a,k)=>a[k], Settings);
      let idx = options.indexOf(val);
      let next = options[(idx + 1) % options.length];
      let target = Settings;
      for (let i = 0; i < keyPathArray.length - 1; i++) target = target[keyPathArray[i]];
      target[keyPathArray[keyPathArray.length - 1]] = next;
      if (onChange) onChange(next);
    }else{
      if(onChange) onChange();
    }
    updateHUD();
    if (keyPathArray[0] === 'particles') rebuildParticles(false);
    if (keyPathArray[0] === 'physics' && keyPathArray[1] === 'boundaries') rebuildParticles(false);
  });
  el.title = 'Click to cycle';
  el.style.cursor = 'pointer';
}

// Fullscreen helpers
function isFullscreen() {
  return !!(document.fullscreenElement || document.webkitFullscreenElement);
}
function requestFullscreen(elem) {
  if (elem.requestFullscreen) return elem.requestFullscreen();
  if (elem.webkitRequestFullscreen) return elem.webkitRequestFullscreen();
  if (elem.msRequestFullscreen) return elem.msRequestFullscreen();
}
function exitFullscreen() {
  if (document.exitFullscreen) return document.exitFullscreen();
  if (document.webkitExitFullscreen) return document.webkitExitFullscreen();
  if (document.msExitFullscreen) return document.msExitFullscreen();
}
function updateFullscreenBtn() {
  const btn = State.hud.fullscreenBtn;
  if (!btn) return;
  btn.textContent = isFullscreen() ? 'Exit Fullscreen' : 'Fullscreen';
}

export function initHUD(){
  // Pause/step/reset
  State.hud.pauseBtn.addEventListener('click', ()=>{ State.running=!State.running; State.hud.pauseBtn.textContent = State.running?'Pause':'Resume'; });
  State.hud.stepBtn.addEventListener('click', ()=>{ State.stepOnce = true; State.running=false; State.hud.pauseBtn.textContent = 'Resume'; });
  State.hud.resetBtn.addEventListener('click', ()=>{ rebuildParticles(false); });

  // Fullscreen button
  State.hud.fullscreenBtn.addEventListener('click', function() {
    if (!isFullscreen()) {
      requestFullscreen(document.documentElement);
    } else {
      exitFullscreen();
    }
  });
  document.addEventListener('fullscreenchange', updateFullscreenBtn);
  document.addEventListener('webkitfullscreenchange', updateFullscreenBtn);
  updateFullscreenBtn();

  // Clickable gravity and count
  State.hud.gravityVal.title = 'Click to set gravity';
  State.hud.gravityVal.style.cursor = 'pointer';
  State.hud.gravityVal.addEventListener('click', function() {
    let val = prompt('Set gravity (0-1200):', Settings.physics.gravity);
    if(val!==null){
      let g = Math.max(0, Math.min(1200, parseFloat(val)));
      Settings.physics.gravity = g;
      updateHUD();
    }
  });
  State.hud.countVal.title = 'Click to set particle count';
  State.hud.countVal.style.cursor = 'pointer';
  State.hud.countVal.addEventListener('click', function() {
    let val = prompt('Set particle count (1-'+Settings.performance.maxParticles+'):', Settings.particles.count);
    if(val!==null){
      let c = Math.max(1, Math.min(Settings.performance.maxParticles, parseInt(val)));
      Settings.particles.count = c;
      rebuildParticles(true);
      updateHUD();
    }
  });

  // Cycle-able tags
  cycleSetting(State.hud.collMode, ['collisions','mode'], ['elastic','soft','inelastic','none'], null);
  cycleSetting(State.hud.turbMode, ['forces','turbulenceMode'], ['none','flow','curl','vortex','wind','jets','swirlgrid','wells'], null);
  cycleSetting(State.hud.tiltState, [], [], function(){
    State.tiltEnabled = !State.tiltEnabled;
    updateHUD();
  });
  cycleSetting(State.hud.mouseG, ['controls','mouseSetsGravity'], [true,false], null);
  cycleSetting(State.hud.shapeMode, ['particles','shape'], ['circle','square','triangle'], function(){ rebuildParticles(false); });
  cycleSetting(State.hud.colorMode, ['particles','colorMode'], ['solid','velocity','heat'], null);
  cycleSetting(State.hud.boundMode, ['physics','boundaries'], ['screen-bounce','screen-wrap','none','container-circle','container-square'], function(){ rebuildParticles(false); });

  // Show/hide HUD
  State.hud.root.style.display = Settings.visuals.showHUD ? 'block' : 'none';

  updateHUD();
  setInterval(updateHUD, 400);
}