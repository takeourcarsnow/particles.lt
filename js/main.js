import { Settings, PRESETS } from './settings.js';
import { state, initCanvas } from './state.js';
import { makeTabs } from './ui/panel.js';
import { initHUD, setFPS, setPCount, refreshHUD, setPauseLabel } from './ui/hud.js';
import { attachPointer, setMouseGravityFromPoint } from './input/pointer.js';
import { attachTilt, enableTiltRequest } from './input/tilt.js';
import { rebuildParticles, applyUniformRadius } from './physics/particles.js';
import { mapBoundaries } from './physics/boundaries.js';
import { buildGrid, setGridCell } from './physics/spatialHash.js';
import { handleCollisions } from './physics/collisions.js';
import { getTurbulenceAccel } from './forces/fields.js';
import { clearFrame, drawParticle, drawContainerOutline, drawGravityVector } from './render/draw.js';
import { hexWithAlpha } from './util/color.js';
import { clamp } from './util/math.js';

// Initialize
initCanvas();
document.body.style.background = Settings.visuals.background;
attachPointer();
attachTilt();

// HUD
initHUD({
  onTogglePause: ()=>{ running = !running; setPauseLabel(running); },
  onStep: ()=>{ stepOnce = true; running=false; setPauseLabel(false); },
  onReset: ()=>{ rebuildParticles(false); PCOUNT_DIRTY = true; }
});

// Panel Toggle
document.getElementById('togglePanel').addEventListener('click', ()=> {
  document.getElementById('panel').classList.toggle('hidden');
});

// Tilt prompt
const tiltPrompt = document.getElementById('tiltPrompt');
const tiltBtn = document.getElementById('enableTilt');
const tiltBtnTop = document.getElementById('enableTiltTop');
const dismissTilt = document.getElementById('dismissTilt');
tiltBtn.addEventListener('click', async ()=>{
  const ok = await enableTiltRequest();
  state.tiltEnabled = ok;
  if(ok) tiltPrompt.hidden = true;
  refreshHUD({tiltEnabled: state.tiltEnabled});
});
tiltBtnTop.addEventListener('click', async ()=>{
  const ok = await enableTiltRequest();
  state.tiltEnabled = ok;
  if(ok) tiltPrompt.hidden = true;
  refreshHUD({tiltEnabled: state.tiltEnabled});
});
dismissTilt.addEventListener('click', ()=> tiltPrompt.hidden = true);
if(state.haveDeviceOrientation){
  setTimeout(()=>{ tiltPrompt.hidden = false; }, 600);
}

// Randomize & Presets
document.getElementById('randomize').addEventListener('click', ()=>{
  Settings.particles.count = Math.round(Math.random()*(2800-300)+300);
  Settings.particles.uniformSize = Math.random()<0.35;
  if(Settings.particles.uniformSize){
    Settings.particles.radiusMax = 1.5 + Math.random()*4.5;
    Settings.particles.radiusMin = Settings.particles.radiusMax;
  }else{
    Settings.particles.radiusMin = 1 + Math.random()*3;
    Settings.particles.radiusMax = Settings.particles.radiusMin + (1 + Math.random()*4);
  }
  const pick = arr=>arr[(Math.random()*arr.length)|0];
  Settings.particles.shape = pick(['circle','square','triangle']);
  Settings.particles.colorMode = pick(['solid','velocity','heat']);
  Settings.particles.palette = pick(['plasma','cool','fire','aurora']);
  Settings.particles.blend = pick(['source-over','lighter','screen','multiply']);
  Settings.physics.gravity = Math.random()*800;
  Settings.physics.airDrag = 0.01 + Math.random()*0.39;
  Settings.physics.restitution = 0.1 + Math.random()*0.8;
  Settings.collisions.mode = pick(['elastic','soft','inelastic','none']);
  Settings.forces.turbulenceMode = pick(['none','flow','curl','vortex','wind','jets','swirlgrid','wells']);
  Settings.forces.amplitude = Math.random()*800;
  Settings.forces.scale = 0.001 + Math.random()*0.007;
  Settings.forces.timeScale = Math.random()*1.2;
  Settings.physics.boundaries = pick(['screen-bounce','screen-wrap','none','container-circle','container-square']);

  rebuildParticles(false);
  makeTabs();
  PCOUNT_DIRTY = true;
  refreshHUD({tiltEnabled: state.tiltEnabled});
});
document.getElementById('presetMenu').addEventListener('click', ()=>{
  const names = Object.keys(PRESETS);
  const choice = prompt('Load preset: ' + names.join(', '), 'Marbles');
  if(!choice) return;
  const presetFn = PRESETS[choice.trim()];
  if(presetFn){
    const p = presetFn();
    Object.keys(p).forEach(section=>{
      Object.assign(Settings[section], p[section]);
    });
    if(Settings.particles.uniformSize){ Settings.particles.radiusMin = Settings.particles.radiusMax; }
    rebuildParticles(false);
    makeTabs();
    document.body.style.background = Settings.visuals.background;
    PCOUNT_DIRTY = true;
    refreshHUD({tiltEnabled: state.tiltEnabled});
  }else{
    alert('Preset not found.');
  }
});

// Keyboard
window.addEventListener('keydown', (e)=>{
  if(e.key===' '){ running=!running; setPauseLabel(running); e.preventDefault(); }
  if(e.key==='c' || e.key==='C'){ document.getElementById('panel').classList.toggle('hidden'); }
  if(e.key==='g' || e.key==='G'){ Settings.controls.mouseSetsGravity = !Settings.controls.mouseSetsGravity; refreshHUD({tiltEnabled: state.tiltEnabled}); }
  if(e.key==='r' || e.key==='R'){ rebuildParticles(false); PCOUNT_DIRTY = true; }
  if(e.key==='f' || e.key==='F'){ Settings.visuals.showHUD = !Settings.visuals.showHUD; document.getElementById('hud').style.display = Settings.visuals.showHUD?'block':'none';}
});

// Build UI
makeTabs();

// Initial particles
rebuildParticles(false);

// Initial mouse gravity center (canvas center)
setMouseGravityFromPoint(state.canvas.clientWidth/2, state.canvas.clientHeight/2);

// HUD periodic refresh
setInterval(()=> refreshHUD({tiltEnabled: state.tiltEnabled}), 400);

// Main loop
let running = true;
let stepOnce = false;
let PCOUNT_DIRTY = true;

function frame(t){
  const dtRaw = Math.min(1/20, (t-state.lastT)/1000) * Settings.performance.simSpeed;
  state.lastT = t;
  const fps = 1/Math.max(1e-6, dtRaw);
  state.fpsSmooth = state.fpsSmooth*0.9 + fps*0.1;
  setFPS(state.fpsSmooth);
  state.recentFps.push(fps); if(state.recentFps.length>30) state.recentFps.shift();

  // Adaptive collisions
  if(Settings.performance.adaptive && (state.frameCount%30===0)){
    const avgFps = state.recentFps.reduce((a,b)=>a+b,0)/Math.max(1,state.recentFps.length);
    Settings.collisions.enable = avgFps >= Settings.performance.lowFpsThreshold;
    refreshHUD({tiltEnabled: state.tiltEnabled});
  }

  if(running || stepOnce){
    const dt = dtRaw;
    let sub = Settings.performance.substeps|0; if(sub<1) sub=1;
    const h = dt/sub;

    const gmag = Settings.physics.gravity;
    const sourceG = Settings.controls.mouseSetsGravity ? state.mouseGravity : state.gDir;
    const gxBase = sourceG.x * gmag * Settings.physics.tiltSensitivity;
    const gyBase = sourceG.y * gmag * Settings.physics.tiltSensitivity;

    clearFrame();

    // Pre-collisions grid
    if(Settings.collisions.enable && Settings.collisions.mode!=='none'){
      buildGrid(state.particles);
    }

    for(let s=0; s<sub; s++){
      const time = (t/1000);
      const bMode = mapBoundaries(Settings.physics.boundaries);

      const ptrActive = Settings.pointer.enabled && state.pointer.active;

      for(let i=0;i<state.particles.length;i++){
        const p = state.particles[i];

        // Base accel
        let ax = gxBase/p.m + Settings.physics.windX/p.m;
        let ay = gyBase/p.m + Settings.physics.windY/p.m;

        // Turbulence
        const turb = getTurbulenceAccel(p, time);
        ax += turb.ax; ay += turb.ay;

        // Pointer tool
        if(ptrActive && Settings.pointer.tool!=='none'){
          const dx = p.x - state.pointer.x;
          const dy = p.y - state.pointer.y;
          const d2 = dx*dx + dy*dy;
          const rr = Settings.pointer.radius;
          if(d2 < rr*rr){
            const d = Math.sqrt(d2) + 1e-4;
            const nx = dx/d, ny = dy/d;
            const fall = 1 - d/rr;
            const F = Settings.pointer.strength * fall * fall / p.m;
            if(Settings.pointer.tool==='attract'){
              ax += -nx * F; ay += -ny * F;
            }else if(Settings.pointer.tool==='repel'){
              ax += nx * F; ay += ny * F;
            }else if(Settings.pointer.tool==='push'){
              ax += (state.pointer.dx*60) * fall / p.m;
              ay += (state.pointer.dy*60) * fall / p.m;
            }else if(Settings.pointer.tool==='spin'){
              ax += (-ny) * F * 0.8;
              ay += ( nx) * F * 0.8;
            }
          }
        }

        // Air drag
        const drag = Settings.physics.airDrag;
        p.vx += (ax - p.vx*drag)*h;
        p.vy += (ay - p.vy*drag)*h;

        // Integrate
        p.x += p.vx * h;
        p.y += p.vy * h;

        // Heat from drag
        if(Settings.particles.colorMode==='heat'){
          const speed2 = p.vx*p.vx + p.vy*p.vy;
          p.heat = p.heat*0.97 + clamp(speed2*0.000001, 0, 0.05);
        }

        // Boundaries
        // Applied in-place
        import('./physics/boundaries.js').then(m=> m.applyBoundary(p));
      }
      // Collisions (per substep)
      handleCollisions(state.particles);
    }

    // Draw
    state.ctx.globalCompositeOperation = Settings.particles.blend;
    for(const p of state.particles){ drawParticle(p); }

    const bMode = mapBoundaries(Settings.physics.boundaries);
    drawContainerOutline(bMode);

    const gv = Settings.controls.mouseSetsGravity ? state.mouseGravity : state.gDir;
    drawGravityVector(gv);

    stepOnce=false;
  }

  if(PCOUNT_DIRTY){ setPCount(state.particles.length); PCOUNT_DIRTY=false; }

  state.frameCount++;
  requestAnimationFrame(frame);
}

// Start
requestAnimationFrame(frame);

// Show HUD or not
document.getElementById('hud').style.display = Settings.visuals.showHUD?'block':'none';

// Pause label
setPauseLabel(true);

// Keep HUD static labels updated on start
refreshHUD({tiltEnabled: state.tiltEnabled});