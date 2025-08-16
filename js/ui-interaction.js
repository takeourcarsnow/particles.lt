// --- START OF FILE ui-interaction.js ---

(() => {
  // Helper for DOM selection
  const el = id => document.getElementById(id);

  // Pointer
  function setupPointer() {
    const set = (x,y) => { state.pointer.x = x; state.pointer.y = y; };
    window.addEventListener('pointerdown', (e)=> {
      state.pointer.active = true; set(e.clientX, e.clientY);
      if (cfg.pointerMode === 'impulse_out' || cfg.pointerMode === 'impulse_in') {
        applyPointerImpulse(cfg.pointerMode === 'impulse_out' ? 1 : -1);
      }
    });
    window.addEventListener('pointermove', (e)=> {
      const t = performance.now()/1000;
      const dt = Math.max(1e-3, t - state.pointer.lastT);
      const vx = (e.clientX - state.pointer.lastX) / dt;
      const vy = (e.clientY - state.pointer.lastY) / dt;
      state.pointer.vx = lerp(state.pointer.vx, vx, 0.35);
      state.pointer.vy = lerp(state.pointer.vy, vy, 0.35);
      state.pointer.lastX = e.clientX; state.pointer.lastY = e.clientY; state.pointer.lastT = t;
      set(e.clientX, e.clientY);
    });
    window.addEventListener('pointerup', ()=> { state.pointer.active = false; });
    window.addEventListener('pointercancel', ()=> { state.pointer.active = false; });
    window.addEventListener('blur', ()=> { state.pointer.active = false; });
  }
  function applyPointerImpulse(sign=1) {
    const r = cfg.pointerRadius, r2 = r*r;
    const str = cfg.impulseMag;
    for (const p of state.particles) {
      const dx = p.x - state.pointer.x, dy = p.y - state.pointer.y;
      const d2 = dx*dx + dy*dy;
      if (d2 <= r2 && d2 > 1e-6) {
        const d = Math.sqrt(d2);
        const nx = dx / d, ny = dy / d;
        const falloff = Math.pow(1 - d/r, cfg.pointerExp);
        const imp = str * falloff / p.mass;
        p.vx += nx * imp * sign;
        p.vy += ny * imp * sign;
        p.heat = Math.min(1, p.heat + cfg.heatGain * 0.25);
      }
    }
  }

  // Device motion (tilt gravity)
  let orientationHandler = null;
  let screenAngle = 0;
  function getScreenAngle() {
    const a = (screen.orientation && typeof screen.orientation.angle === 'number')
      ? screen.orientation.angle
      : (typeof window.orientation === 'number' ? window.orientation : 0);
    let ang = ((a % 360) + 360) % 360;
    return ang; // 0, 90, 180, 270
  }
  function mapTiltToScreen(gx, gy) {
    // rotate gx,gy by current screenAngle to align with screen axes
    const a = getScreenAngle();
    if (a === 0) return { x: gx, y: gy };
    if (a === 90) return { x: gy, y: -gx };
    if (a === 180) return { x: -gx, y: -gy };
    if (a === 270) return { x: -gy, y: gx };
    return { x: gx, y: gy };
  }
  function updateTiltUIStatus(msg) {
    tiltStatus.textContent = msg;
  }
  async function enableDeviceMotion() {
    // Ask permission on iOS if needed
    try {
      if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
        const res = await DeviceMotionEvent.requestPermission();
        if (res !== 'granted') throw new Error('permission denied');
      } else if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        const res = await DeviceOrientationEvent.requestPermission();
        if (res !== 'granted') throw new Error('permission denied');
      }
      if (!orientationHandler) {
        orientationHandler = (ev) => {
          const beta = (ev.beta ?? 0);   // front/back tilt in degrees
          const gamma = (ev.gamma ?? 0); // left/right tilt in degrees
          // Normalize to [-1,1]
          const gxRaw = Math.sin(gamma * Math.PI/180);
          const gyRaw = Math.sin(beta * Math.PI/180);
          const scr = mapTiltToScreen(gxRaw, gyRaw);
          // Smooth
          state.tilt.curX = lerp(state.tilt.curX, scr.x, cfg.tiltSmooth);
          state.tilt.curY = lerp(state.tilt.curY, scr.y, cfg.tiltSmooth);
          const mag = cfg.gravity * cfg.tiltGain;
          state.gravityVec.x = (state.tilt.curX - state.tilt.offsetX) * mag;
          state.gravityVec.y = (state.tilt.curY - state.tilt.offsetY) * mag;
          state.deviceMotionOK = true;
          cfg.useDeviceMotion = true;
          updateTiltUIStatus(`tilt x:${state.tilt.curX.toFixed(2)} y:${state.tilt.curY.toFixed(2)}`);
        };
      }
      window.addEventListener('deviceorientation', orientationHandler, { passive: true });
      if (screen.orientation && screen.orientation.addEventListener) {
        screen.orientation.addEventListener('change', () => { screenAngle = getScreenAngle(); });
      } else {
        window.addEventListener('orientationchange', () => { screenAngle = getScreenAngle(); });
      }
      screenAngle = getScreenAngle();
      state.deviceMotionOK = true;
      cfg.useDeviceMotion = true;
      updateTiltUIStatus('Active (allow tilt)');
    } catch (e) {
      console.warn('Device motion not available or permission denied:', e);
      state.deviceMotionOK = false;
      cfg.useDeviceMotion = false;
      devMotion.checked = false;
      updateTiltUIStatus('Unavailable or denied');
    }
  }
  function disableDeviceMotion() {
    if (orientationHandler) {
      window.removeEventListener('deviceorientation', orientationHandler);
    }
    state.deviceMotionOK = false;
    cfg.useDeviceMotion = false;
    updateTiltUIStatus('Off');
  }

  // Export or attach to global if needed, or call setupPointer/enableDeviceMotion from ui-core.js
  // For now, auto-initialize pointer interaction
  setupPointer();
})();

// --- END OF FILE ui-interaction.js ---