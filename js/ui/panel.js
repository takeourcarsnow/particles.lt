import { Settings, TABS } from '../settings.js';
import { applyUniformRadius, rebuildParticles } from '../physics/particles.js';
import { mapBoundaries } from '../physics/boundaries.js';

let tabsEl, contentEl;

function pathGet(obj, path){ return path.split('.').reduce((o,k)=>o&&o[k], obj); }
function pathSet(obj, path, val){
  const ks = path.split('.');
  const last = ks.pop();
  const parent = ks.reduce((o,k)=>o[k], obj);
  parent[last] = val;
}

function group(title){
  const g = document.createElement('div'); g.className='group'; const h = document.createElement('h3'); h.textContent=title; g.appendChild(h); return g;
}

function ctrlRange(parent, path, label, min, max, step, fmt=(v)=>v, onChange=null){
  const wrap = document.createElement('div'); wrap.className='ctrl';
  const lab = document.createElement('label'); lab.textContent = label;
  const right = document.createElement('div'); right.className='rowline';
  const input = document.createElement('input'); input.type='range'; input.min=min; input.max=max; input.step=step; input.value=pathGet(Settings,path);
  const val = document.createElement('span'); val.className='value'; val.textContent = fmt(+input.value);
  input.addEventListener('input', ()=>{
    pathSet(Settings, path, parseFloat(input.value));
    val.textContent = fmt(parseFloat(input.value));
    if(onChange) onChange(parseFloat(input.value));
  });
  right.appendChild(input); right.appendChild(val);
  wrap.appendChild(lab); wrap.appendChild(right);
  parent.appendChild(wrap);
  return input;
}
function ctrlNumber(parent, path, label, step=1, onChange=null){
  const wrap = document.createElement('div'); wrap.className='ctrl';
  const lab = document.createElement('label'); lab.textContent=label;
  const input = document.createElement('input'); input.type='number'; input.value=pathGet(Settings,path); input.step=step;
  input.addEventListener('change', ()=>{ pathSet(Settings,path, parseFloat(input.value)); if(onChange) onChange(parseFloat(input.value)); });
  wrap.appendChild(lab); wrap.appendChild(input); parent.appendChild(wrap);
  return input;
}
function ctrlSelect(parent, path, label, options, onChange=null){
  const wrap = document.createElement('div'); wrap.className='ctrl';
  const lab = document.createElement('label'); lab.textContent = label;
  const sel = document.createElement('select');
  options.forEach(o=>{
    const opt = document.createElement('option'); opt.value=o.value; opt.textContent=o.name; sel.appendChild(opt);
  });
  sel.value = pathGet(Settings,path);
  sel.addEventListener('change', ()=>{ pathSet(Settings,path, sel.value); if(onChange) onChange(sel.value); });
  wrap.appendChild(lab); wrap.appendChild(sel); parent.appendChild(wrap);
  return sel;
}
function ctrlColor(parent, path, label, onChange=null){
  const wrap = document.createElement('div'); wrap.className='ctrl';
  const lab = document.createElement('label'); lab.textContent=label;
  const input = document.createElement('input'); input.type='color'; input.value=pathGet(Settings,path);
  input.addEventListener('input', ()=>{ pathSet(Settings,path,input.value); if(onChange) onChange(input.value); });
  wrap.appendChild(lab); wrap.appendChild(input); parent.appendChild(wrap);
  return input;
}
function ctrlCheck(parent, path, label, onChange=null){
  const wrap = document.createElement('div'); wrap.className='ctrl';
  const lab = document.createElement('label'); lab.textContent=label;
  const input = document.createElement('input'); input.type='checkbox'; input.checked=pathGet(Settings,path);
  input.addEventListener('change', ()=>{ pathSet(Settings,path,input.checked); if(onChange) onChange(input.checked); });
  wrap.appendChild(lab); wrap.appendChild(input); parent.appendChild(wrap);
  return input;
}

export function makeTabs(){
  const panel = document.getElementById('panel');
  tabsEl = document.getElementById('tabs');
  contentEl = document.getElementById('content');

  tabsEl.innerHTML = '';
  TABS.forEach((t,i)=>{
    const b = document.createElement('button'); b.textContent=t.name; if(i===0) b.classList.add('active');
    b.addEventListener('click', ()=>{
      [...tabsEl.children].forEach(x=>x.classList.remove('active'));
      b.classList.add('active');
      showTab(t.id);
    });
    tabsEl.appendChild(b);
  });
  showTab('particles');
}

function showTab(id){
  contentEl.innerHTML = '';
  if(id==='particles'){
    const g1 = group('Particle Basics');

    ctrlCheck(g1, 'particles.uniformSize', 'Uniform size', (v)=>{
      if(v){ Settings.particles.radiusMin = Settings.particles.radiusMax; applyUniformRadius(); }
      rebuildParticles(true); showTab('particles');
    });

    if(Settings.particles.uniformSize){
      ctrlRange(g1, 'particles.radiusMax', 'Size', 0.5, 20, 0.5, v=>v.toFixed(1), (v)=>{
        Settings.particles.radiusMin = v; applyUniformRadius();
      });
    }else{
      ctrlRange(g1, 'particles.count', 'Count', 0, Settings.performance.maxParticles, 1, v=>v, ()=>rebuildParticles(true));
      ctrlRange(g1, 'particles.radiusMin', 'Size min', 0.5, 12, 0.5, v=>v.toFixed(1), ()=>{
        if(Settings.particles.radiusMin>Settings.particles.radiusMax){Settings.particles.radiusMax=Settings.particles.radiusMin; }
        rebuildParticles(true);
      });
      ctrlRange(g1, 'particles.radiusMax', 'Size max', 0.5, 20, 0.5, v=>v.toFixed(1), ()=>{
        if(Settings.particles.radiusMax<Settings.particles.radiusMin){Settings.particles.radiusMin=Settings.particles.radiusMax;}
        rebuildParticles(true);
      });
    }
    ctrlSelect(g1, 'particles.shape', 'Shape', [
      {value:'circle',name:'Circle'},
      {value:'square',name:'Square'},
      {value:'triangle',name:'Triangle'}
    ]);

    const g2 = group('Mass');
    ctrlSelect(g2, 'particles.massMode', 'Mass mode', [
      {value:'constant',name:'Constant'},
      {value:'byArea',name:'By area'},
      {value:'inverse',name:'Inverse of area'},
      {value:'random',name:'Random range'}
    ], ()=>{ applyUniformRadius(); rebuildParticles(true); });
    ctrlRange(g2, 'particles.mass', 'Constant mass', 0.1, 5, 0.1, v=>v.toFixed(2), ()=>{ applyUniformRadius(); rebuildParticles(true); });
    ctrlRange(g2, 'particles.randomMassMin', 'Random mass min', 0.1, 3, 0.1, v=>v.toFixed(2), ()=>rebuildParticles(true));
    ctrlRange(g2, 'particles.randomMassMax', 'Random mass max', 0.2, 4, 0.1, v=>v.toFixed(2), ()=>rebuildParticles(true));

    const g3 = group('Color & Blend');
    ctrlSelect(g3, 'particles.colorMode', 'Color mode', [
      {value:'solid',name:'Solid'},
      {value:'velocity',name:'Velocity'},
      {value:'heat',name:'Heat'}
    ]);
    ctrlColor(g3, 'particles.solidColor', 'Solid color');
    ctrlSelect(g3, 'particles.palette', 'Palette', [
      {value:'plasma',name:'Plasma'},
      {value:'cool',name:'Cool'},
      {value:'fire',name:'Fire'},
      {value:'aurora',name:'Aurora'}
    ]);
    ctrlRange(g3, 'particles.velocityColorScale', 'Velocity color scale', 40, 1200, 10, v=>v.toFixed(0));
    ctrlSelect(g3,'particles.blend','Blend mode',[
      {value:'source-over',name:'Normal'},
      {value:'lighter',name:'Additive'},
      {value:'screen',name:'Screen'},
      {value:'multiply',name:'Multiply'}
    ]);
    ctrlRange(g3,'particles.opacity','Particle opacity',0.1,1.0,0.05,v=>v.toFixed(2));

    contentEl.append(g1,g2,g3);
  }
  if(id==='physics'){
    const g = group('Forces');
    ctrlRange(g,'physics.gravity','Gravity',0,1200,10,v=>v.toFixed(0));
    ctrlRange(g,'physics.tiltSensitivity','Tilt sensitivity',0,3,0.05,v=>v.toFixed(2));
    ctrlRange(g,'physics.airDrag','Air drag',0,1.2,0.01,v=>v.toFixed(2));
    ctrlNumber(g,'physics.windX','Wind X',1);
    ctrlNumber(g,'physics.windY','Wind Y',1);

    const g2 = group('Boundaries & Materials');
    ctrlSelect(g2,'physics.boundaries','Boundaries',[
      {value:'screen-bounce',name:'Screen: Bounce'},
      {value:'screen-wrap',name:'Screen: Wrap'},
      {value:'none',name:'None'},
      {value:'container-circle',name:'Container: Circle'},
      {value:'container-square',name:'Container: Square'}
    ], ()=>{ rebuildParticles(false); showTab('physics'); });
    ctrlRange(g2,'physics.restitution','Bounciness',0,1,0.01,v=>v.toFixed(2));
    ctrlRange(g2,'physics.wallFriction','Wall friction',0,0.5,0.01,v=>v.toFixed(2));
    ctrlRange(g2,'physics.particleFriction','Particle fric.',0,0.5,0.01,v=>v.toFixed(2));

    const mode = mapBoundaries(Settings.physics.boundaries);
    if(mode==='container-circle' || mode==='container-square'){
      const gc = group('Container Settings');
      ctrlRange(gc,'physics.container.cx','Center X (norm)',0,1,0.01,v=>v.toFixed(2));
      ctrlRange(gc,'physics.container.cy','Center Y (norm)',0,1,0.01,v=>v.toFixed(2));
      if(mode==='container-circle'){
        ctrlRange(gc,'physics.container.radiusN','Radius (norm)',0.05,0.49,0.005,v=>v.toFixed(3));
      }else{
        ctrlRange(gc,'physics.container.sizeN','Half-size (norm)',0.05,0.49,0.005,v=>v.toFixed(3));
      }
      contentEl.append(gc);
    }

    contentEl.append(g,g2);
  }
  if(id==='forces'){
    const mode = Settings.forces.turbulenceMode;

    const g = group('Turbulence');
    ctrlSelect(g,'forces.turbulenceMode','Mode',[
      {value:'none',name:'None'},
      {value:'flow',name:'Flow'},
      {value:'curl',name:'Curl'},
      {value:'vortex',name:'Vortex (single)'},
      {value:'wind',name:'Wind (gusty)'},
      {value:'jets',name:'Jets (banded)'},
      {value:'swirlgrid',name:'Swirl Grid'},
      {value:'wells',name:'Wells (multi-attractor)'}
    ], ()=>showTab('forces'));
    ctrlRange(g,'forces.amplitude','Amplitude',0,1600,10,v=>v.toFixed(0));
    ctrlRange(g,'forces.scale','Scale',0.0005,0.02,0.0005,v=>v.toFixed(4));
    ctrlRange(g,'forces.timeScale','Time scale',0,2,0.01,v=>v.toFixed(2));
    contentEl.append(g);

    if(mode==='curl'){
      const g2 = group('Curl options');
      ctrlRange(g2,'forces.curlStrength','Curl strength',0,3,0.05,v=>v.toFixed(2));
      contentEl.append(g2);
    }
    if(mode==='vortex'){
      const g3 = group('Vortex options');
      ctrlRange(g3,'forces.vortexX','Center X (norm)',0,1,0.01,v=>v.toFixed(2));
      ctrlRange(g3,'forces.vortexY','Center Y (norm)',0,1,0.01,v=>v.toFixed(2));
      ctrlRange(g3,'forces.vortexStrength','Strength',0,2000,10,v=>v.toFixed(0));
      ctrlRange(g3,'forces.vortexFalloff','Falloff',0,3,0.05,v=>v.toFixed(2));
      ctrlCheck(g3,'forces.vortexCW','Clockwise');
      contentEl.append(g3);
    }
    if(mode==='wind'){
      const g4 = group('Wind options');
      ctrlRange(g4,'forces.windVar','Variability',0,200,1,v=>v.toFixed(0));
      ctrlRange(g4,'forces.windGust','Gust',0,400,1,v=>v.toFixed(0));
      contentEl.append(g4);
    }
    if(mode==='jets'){
      const g5 = group('Jets options');
      ctrlRange(g5,'forces.jetsAngle','Angle (deg)',0,360,1,v=>v.toFixed(0));
      ctrlRange(g5,'forces.jetsSpacing','Band spacing (px)',30,400,1,v=>v.toFixed(0));
      contentEl.append(g5);
    }
    if(mode==='swirlgrid'){
      const g6 = group('Swirl Grid options');
      ctrlRange(g6,'forces.swirlSpacing','Cell spacing (px)',40,400,1,v=>v.toFixed(0));
      ctrlRange(g6,'forces.swirlFalloff','Falloff',0,3,0.05,v=>v.toFixed(2));
      ctrlCheck(g6,'forces.swirlAlt','Alternate CW/CCW');
      contentEl.append(g6);
    }
    if(mode==='wells'){
      const g7 = group('Wells options');
      ctrlRange(g7,'forces.wellsCount','Count',1,8,1,v=>v.toFixed(0));
      ctrlRange(g7,'forces.wellsStrength','Strength',0,2000,10,v=>v.toFixed(0));
      ctrlRange(g7,'forces.wellsFalloff','Falloff',0.2,3,0.05,v=>v.toFixed(2));
      ctrlRange(g7,'forces.wellsSpin','Spin',0,2,0.01,v=>v.toFixed(2));
      ctrlCheck(g7,'forces.wellsMove','Move');
      ctrlCheck(g7,'forces.wellsRepel','Repel (instead of attract)');
      contentEl.append(g7);
    }
  }
  if(id==='collisions'){
    const g = group('Collisions');
    ctrlSelect(g,'collisions.mode','Mode',[
      {value:'elastic',name:'Elastic'},
      {value:'soft',name:'Soft'},
      {value:'inelastic',name:'Inelastic'},
      {value:'none',name:'None'}
    ]);
    ctrlCheck(g,'collisions.enable','Enable collisions');
    ctrlRange(g,'collisions.softness','Softness',0,1,0.01,v=>v.toFixed(2));
    ctrlRange(g,'collisions.inelasticity','Inelasticity',0,1,0.01,v=>v.toFixed(2));
    ctrlCheck(g,'collisions.adapt','Adaptive disable at low FPS');
    contentEl.append(g);
  }
  if(id==='visuals'){
    const g = group('Rendering');
    ctrlColor(g,'visuals.background','Background', (v)=>{ document.body.style.background = v; });
    ctrlRange(g,'visuals.trail','Trail persistence',0,0.9,0.01,v=>v.toFixed(2));
    ctrlCheck(g,'visuals.showContainer','Show container outline');
    ctrlCheck(g,'visuals.showHUD','Show HUD', v=>{ document.getElementById('hud').style.display = v?'block':'none'; });
    ctrlCheck(g,'visuals.wireframe','Wireframe');
    contentEl.append(g);
  }
  if(id==='interact'){
    const g = group('Pointer');
    ctrlCheck(g,'pointer.enabled','Pointer enabled');
    ctrlSelect(g,'pointer.tool','Tool',[
      {value:'none',name:'None'},
      {value:'attract',name:'Attract'},
      {value:'repel',name:'Repel'},
      {value:'push',name:'Push (drag)'},
      {value:'spin',name:'Spin'}
    ]);
    ctrlRange(g,'pointer.strength','Tool strength',0,3000,10,v=>v.toFixed(0));
    ctrlRange(g,'pointer.radius','Tool radius',20,400,1,v=>v.toFixed(0));
    const g2 = group('Gravity Control');
    ctrlCheck(g2,'controls.mouseSetsGravity','Mouse sets gravity');
    const hint = document.createElement('div'); hint.className='smallnote'; hint.textContent = 'Click anywhere to tilt toward that point (sticky).';
    g2.appendChild(hint);
    contentEl.append(g,g2);
  }
  if(id==='performance'){
    const g = group('Performance');
    ctrlRange(g,'performance.simSpeed','Simulation speed',0.1,2,0.01,v=>v.toFixed(2));
    ctrlRange(g,'performance.substeps','Substeps',1,3,1,v=>v.toFixed(0));
    ctrlCheck(g,'performance.adaptive','Adaptive mode');
    ctrlRange(g,'performance.lowFpsThreshold','Low FPS threshold',20,58,1,v=>v.toFixed(0));
    ctrlRange(g,'performance.collisionCap','Neighbor cap',4,48,1,v=>v.toFixed(0));
    const note = document.createElement('div'); note.className='smallnote';
    note.textContent = 'Tip: For 5k–8k particles, set collisions to Soft or None. Adaptive mode reduces cost if FPS drops.';
    g.appendChild(note);
    contentEl.append(g);
  }
  if(id==='about'){
    const g = group('About this playground');
    const div = document.createElement('div');
    div.innerHTML = `
      <div class="rowline" style="line-height:1.55">
        Container boundaries (circle/square), new turbulence modes (Jets, Swirl Grid, Wells), and a Uniform Size option have been added.
        <ul>
          <li>Mobile: Tap <b>Enable Tilt</b>, then roll your phone to move marbles.</li>
          <li>Desktop: Click anywhere to set the "downhill" direction.</li>
          <li>Keyboard: Space = pause, C = controls, G = toggle mouse-gravity, R = reset.</li>
        </ul>
      </div>`;
    g.appendChild(div);
    contentEl.append(g);
  }
}