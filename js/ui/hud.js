import { Settings } from '../settings.js';

const hud = {
  fps: null, pcount: null, collMode: null, turbMode: null, tiltState: null, mouseG: null,
  pauseBtn: null, stepBtn: null, resetBtn: null,
};

export function initHUD({onTogglePause, onStep, onReset}){
  hud.fps = document.getElementById('fps');
  hud.pcount = document.getElementById('pcount');
  hud.collMode = document.getElementById('collMode');
  hud.turbMode = document.getElementById('turbMode');
  hud.tiltState = document.getElementById('tiltState');
  hud.mouseG = document.getElementById('mouseG');
  hud.pauseBtn = document.getElementById('pauseBtn');
  hud.stepBtn = document.getElementById('stepBtn');
  hud.resetBtn = document.getElementById('resetBtn');

  hud.pauseBtn.addEventListener('click', onTogglePause);
  hud.stepBtn.addEventListener('click', onStep);
  hud.resetBtn.addEventListener('click', onReset);
}

export function setPauseLabel(isRunning){
  hud.pauseBtn.textContent = isRunning ? 'Pause' : 'Resume';
}

export function setFPS(v){ hud.fps.textContent = v.toFixed(0); }
export function setPCount(n){ hud.pcount.textContent = n; }

export function refreshHUD({tiltEnabled}){
  hud.collMode.textContent = Settings.collisions.mode;
  hud.turbMode.textContent = Settings.forces.turbulenceMode;
  hud.tiltState.textContent = tiltEnabled ? 'on':'off';
  hud.mouseG.textContent = Settings.controls.mouseSetsGravity? 'on':'off';
}