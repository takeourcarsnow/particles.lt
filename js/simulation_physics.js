// --- START OF FILE simulation_physics.js ---

function applyMassMode() {
  for (const p of state.particles) {
    if (cfg.massMode === 'area') p.mass = Math.max(0.5, p.r*p.r);
    else if (cfg.massMode === 'linear') p.mass = Math.max(0.5, p.r);
    else p.mass = 1;
  }
}

function updateGlobalWind() {
  state.windVec.x = Math.cos(cfg.windDir) * cfg.windMag;
  state.windVec.y = Math.sin(cfg.windDir) * cfg.windMag;
}

function turbulenceAccel(p, dt, out) {
  // ... (turbulenceAccel function code remains unchanged)
  let ax = 0, ay = 0;
  const t = state.time * cfg.turbTimeSpeed;
  const s = cfg.turbScale;
  const strength = cfg.turbStrength * cfg.sensitivity;

  if (cfg.turbulenceMode === 'off' || strength <= 0) {
    out.x = 0; out.y = 0; return;
  }
  if (cfg.turbulenceMode === 'flow') {
    const angle = noise3(p.x * s, p.y * s, t) * Math.PI * 2;
    ax = Math.cos(angle) * strength;
    ay = Math.sin(angle) * strength;
  } else if (cfg.turbulenceMode === 'curl') {
    const e = 1.0;
    const nx1 = noise3((p.x+e)*s, p.y*s, t), nx2 = noise3((p.x-e)*s, p.y*s, t);
    const ny1 = noise3((p.x)*s, (p.y+e)*s, t), ny2 = noise3((p.x)*s, (p.y-e)*s, t);
    const dx = (nx1 - nx2) / (2*e);
    const dy = (ny1 - ny2) / (2*e);
    ax = dy * strength * 2.0;
    ay = -dx * strength * 2.0;
  } else if (cfg.turbulenceMode === 'vortex') {
    const cx = cfg.turbUsePointer && state.pointer.active ? state.pointer.x : state.w * 0.5;
    const cy = cfg.turbUsePointer && state.pointer.active ? state.pointer.y : state.h * 0.5;
    const dx = p.x - cx, dy = p.y - cy;
    const d = Math.hypot(dx, dy) + 1e-6;
    const nx = dx / d, ny = dy / d;
    const tx = -ny, ty = nx;
    const fall = 1 / Math.max(1, d*0.02);
    ax = tx * strength * fall;
    ay = ty * strength * fall;
  } else if (cfg.turbulenceMode === 'wind') {
    const gust = noise3(0.3 * t, p.x * s * 0.2, p.y * s * 0.2) * 2 - 1;
    const baseAng = cfg.windDir;
    const dirx = Math.cos(baseAng), diry = Math.sin(baseAng);
    const perpx = -diry, perpy = dirx;
    ax = (dirx + 0.6 * gust * perpx) * strength;
    ay = (diry + 0.6 * gust * perpy) * strength;
  } else if (cfg.turbulenceMode === 'brownian') {
    const angle = Math.random() * Math.PI * 2;
    ax = Math.cos(angle) * strength;
    ay = Math.sin(angle) * strength;
  } else if (cfg.turbulenceMode === 'sinwave') {
    // Sinusoidal field: direction oscillates in a wave pattern
    const freq = 0.005 + 0.02 * s;
    const angle = Math.sin(p.x * freq + t) * Math.PI + Math.cos(p.y * freq - t) * Math.PI * 0.5;
    ax = Math.cos(angle) * strength;
    ay = Math.sin(angle) * strength;
  } else if (cfg.turbulenceMode === 'radial') {
    // Radial field: pushes outward/inward from center
    const cx = state.w * 0.5, cy = state.h * 0.5;
    const dx = p.x - cx, dy = p.y - cy;
    const d = Math.hypot(dx, dy) + 1e-6;
    const nx = dx / d, ny = dy / d;
    // Oscillate between outward/inward with time
    const dir = Math.sin(t * 0.7) > 0 ? 1 : -1;
    ax = nx * strength * dir;
    ay = ny * strength * dir;
  } else if (cfg.turbulenceMode === 'perlin') {
    // Perlin-like organic field: use the curl (rotational) of the noise field for truly organic motion
    // This avoids any directional drift and creates local swirls
    // Boost the effect so it works with normal slider values
    const e = 2.0;
    const nx1 = noise3((p.x+e)*s, p.y*s, t), nx2 = noise3((p.x-e)*s, p.y*s, t);
    const ny1 = noise3((p.x)*s, (p.y+e)*s, t), ny2 = noise3((p.x)*s, (p.y-e)*s, t);
    const dx = (nx1 - nx2) / (2*e);
    const dy = (ny1 - ny2) / (2*e);
    // Perpendicular to gradient for curl/swirl
    ax = dy * strength * 20.0;
    ay = -dx * strength * 20.0;
  } else if (cfg.turbulenceMode === 'swirl') {
    // Swirl field: particles swirl around local noise centers, but field is centered and organic
    // Use noise to define a local center, but center it in the viewport
    const cx = state.w * 0.5 + (noise3(p.x * s, p.y * s, t) - 0.5) * state.w * 0.4;
    const cy = state.h * 0.5 + (noise3((p.x + 500) * s, (p.y + 500) * s, t + 50) - 0.5) * state.h * 0.4;
    const dx = p.x - cx, dy = p.y - cy;
    const d = Math.hypot(dx, dy) + 1e-6;
    const tx = -dy / d, ty = dx / d;
    ax = tx * strength * 0.7;
    ay = ty * strength * 0.7;
  } else if (cfg.turbulenceMode === 'pulse') {
    // Pulse field: particles are pushed/pulled in waves
    const freq = 0.01 + 0.03 * s;
    const amp = Math.sin(t * 2 + p.x * freq + p.y * freq);
    ax = Math.cos(amp * Math.PI * 2) * strength * 0.5;
    ay = Math.sin(amp * Math.PI * 2) * strength * 0.5;
  } else if (cfg.turbulenceMode === 'spiral') {
    // Spiral field: particles swirl in/out in a spiral pattern
    const cx = state.w * 0.5, cy = state.h * 0.5;
    const dx = p.x - cx, dy = p.y - cy;
    const d = Math.hypot(dx, dy) + 1e-6;
    const angle = Math.atan2(dy, dx) + Math.sin(t + d * 0.01) * 2.0;
    ax = Math.cos(angle) * strength * 0.7;
    ay = Math.sin(angle) * strength * 0.7;
  } else if (cfg.turbulenceMode === 'checker') {
    // Checkerboard field: alternating push/pull in a grid pattern
    const freq = 0.02 + 0.04 * s;
    const check = (Math.floor(p.x * freq) + Math.floor(p.y * freq) + Math.floor(t * 2)) % 2;
    const dir = check ? 1 : -1;
    ax = Math.cos(t + p.x * freq) * strength * 0.6 * dir;
    ay = Math.sin(t + p.y * freq) * strength * 0.6 * dir;
  } else if (cfg.turbulenceMode === 'ripple') {
    // Ripple field: concentric waves from center
    const cx = state.w * 0.5, cy = state.h * 0.5;
    const dx = p.x - cx, dy = p.y - cy;
    const d = Math.hypot(dx, dy) + 1e-6;
    const freq = 0.02 + 0.04 * s;
    const amp = Math.sin(d * freq - t * 2);
    ax = dx / d * amp * strength * 0.7;
    ay = dy / d * amp * strength * 0.7;
  }
  out.x = ax; out.y = ay;
}

function integrateForces(dt) {
  // ... (integrateForces function code remains unchanged)
  const N = state.particles.length;
  const sens = cfg.sensitivity;
  const maxSpeed = cfg.maxSpeed * sens;

  state.time += dt;

  const usePointer = state.pointer.active && cfg.pointerMode !== 'off' && cfg.pointerStrength > 0;
  const windx = state.windVec.x, windy = state.windVec.y;
  const drag = cfg.airDrag;
  const tb = {x:0,y:0};

  for (let i = 0; i < N; i++) {
    const p = state.particles[i];

    // Drag
    p.vx *= (1 - drag);
    p.vy *= (1 - drag);

    // Gravity: tilt or static
    if (cfg.useDeviceMotion && state.deviceMotionOK) {
      p.vx += state.gravityVec.x * dt;
      p.vy += state.gravityVec.y * dt;
    } else {
      p.vy += cfg.gravity * dt; // downwards
    }

    // Global wind
    p.vx += windx * dt;
    p.vy += windy * dt;

    // Turbulence
    turbulenceAccel(p, dt, tb);
    p.vx += tb.x * dt;
    p.vy += tb.y * dt;

    // Pointer forces
    if (usePointer) {
      const dx = state.pointer.x - p.x;
      const dy = state.pointer.y - p.y;
      let d2 = dx*dx + dy*dy;
      const r = cfg.pointerRadius;
      const r2 = r*r;
      if (d2 < r2 && d2 > 1e-6) {
        const d = Math.sqrt(d2);
        const nx = dx / d, ny = dy / d;
        const fall = Math.pow(1 - d / r, cfg.pointerExp);
        const base = (cfg.pointerStrength * fall * dt) / p.mass;

        switch (cfg.pointerMode) {
          case 'attract_lin': p.vx += nx * base; p.vy += ny * base; break;
          case 'repel_lin': p.vx -= nx * base; p.vy -= ny * base; break;
          case 'attract_inv': {
            const inv = 1 / Math.max(25, d*d); const f = base * inv * r2;
            p.vx += nx * f; p.vy += ny * f;
          } break;
          case 'repel_inv': {
            const inv = 1 / Math.max(25, d*d); const f = base * inv * r2;
            p.vx -= nx * f; p.vy -= ny * f;
          } break;
          case 'swirl_cw': { const tx = ny, ty = -nx; p.vx += tx * base; p.vy += ty * base; } break;
          case 'swirl_ccw': { const tx = -ny, ty = nx; p.vx += tx * base; p.vy += ty * base; } break;
          case 'drag': { p.vx += state.pointer.vx * base * 0.02; p.vy += state.pointer.vy * base * 0.02; } break;
          case 'freeze': { p.vx *= (1 - clamp(base*0.8, 0, 1)); p.vy *= (1 - clamp(base*0.8, 0, 1)); } break;
          default: break;
        }
      }
    }

    // Clamp speed
    const sp2 = p.vx*p.vx + p.vy*p.vy;
    if (sp2 > maxSpeed*maxSpeed) {
      const s = maxSpeed / Math.sqrt(sp2);
      p.vx *= s; p.vy *= s;
    }

    // Heat decay
    if (cfg.heatDecay > 0) p.heat = Math.max(0, p.heat - cfg.heatDecay * dt);
  }
}

function integratePositions(dt) {
  // ... (integratePositions function code remains unchanged)
  const N = state.particles.length;
  const bnc = cfg.bounciness;
  const wf = cfg.wallFriction;

  const cx = state.w * 0.5, cy = state.h * 0.5;
  const CR = Math.max(10, Math.min(state.w, state.h) * 0.5 - 4);

  for (let i = 0; i < N; i++) {
    const p = state.particles[i];
    p.x += p.vx * dt;
    p.y += p.vy * dt;

    if (cfg.containment === 'box') {
      if (cfg.boundary === 'wrap') {
        if (p.x < -p.r) p.x = state.w + p.r;
        if (p.x > state.w + p.r) p.x = -p.r;
        if (p.y < -p.r) p.y = state.h + p.r;
        if (p.y > state.h + p.r) p.y = -p.r;
      } else {
        if (p.x - p.r < 0) { p.x = p.r; p.vx = Math.abs(p.vx) * bnc; p.vy *= (1 - wf); }
        if (p.x + p.r > state.w) { p.x = state.w - p.r; p.vx = -Math.abs(p.vx) * bnc; p.vy *= (1 - wf); }
        if (p.y - p.r < 0) { p.y = p.r; p.vy = Math.abs(p.vy) * bnc; p.vx *= (1 - wf); }
        if (p.y + p.r > state.h) { p.y = state.h - p.r; p.vy = -Math.abs(p.vy) * bnc; p.vx *= (1 - wf); }
      }
    } else {
      // circle containment
      const dx = p.x - cx, dy = p.y - cy;
      const d = Math.hypot(dx, dy);
      const maxd = CR - p.r;
      if (d > maxd) {
        const nx = dx / (d || 1), ny = dy / (d || 1);
        p.x = cx + nx * maxd;
        p.y = cy + ny * maxd;
        const vn = p.vx * nx + p.vy * ny;
        const tx = -ny, ty = nx;
        const vt = p.vx * tx + p.vy * ty;
        const rvn = -vn * bnc;
        const rvt = vt * (1 - wf);
        p.vx = rvn * nx + rvt * tx;
        p.vy = rvn * ny + rvt * ty;
      }
    }
  }
}
// --- END OF FILE simulation_physics.js ---