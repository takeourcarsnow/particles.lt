// --- START OF FILE simulation_render_loop.js ---

function resolveCollisions() {
  // ... (resolveCollisions function code remains unchanged)
  if (cfg.physicsMode === 'none') return;

  const N = state.particles.length;
  const iterations = cfg.iterations;
  const rebuild = cfg.rebuildEachIter;

  state.grid.build(state.particles);

  for (let it = 0; it < iterations; it++) {
    for (let i = 0; i < N; i++) {
      const p = state.particles[i];
      state.grid.forEachNeighborIndices(p, (j) => {
        if (j <= i) return;
        const q = state.particles[j];

        const dx = q.x - p.x;
        const dy = q.y - p.y;
        const rsum = p.r + q.r;
        const d2 = dx*dx + dy*dy;
        if (d2 > 0 && d2 < rsum * rsum) {
          const d = Math.sqrt(d2) || 0.0001;
          const nx = dx / d, ny = dy / d;
          const overlap = rsum - d;

          // positional correction
          const totalInv = (1/p.mass) + (1/q.mass);
          const corrP = (overlap * (1/p.mass) / totalInv) * 0.9;
          const corrQ = (overlap * (1/q.mass) / totalInv) * 0.9;
          p.x -= nx * corrP; p.y -= ny * corrP;
          q.x += nx * corrQ; q.y += ny * corrQ;

          // relative normal velocity
          const rvx = q.vx - p.vx;
          const rvy = q.vy - p.vy;
          const relVelN = rvx * nx + rvy * ny;

          let e = cfg.bounciness;
          if (cfg.physicsMode === 'soft') e = Math.min(e, 0.5);
          else if (cfg.physicsMode === 'inelastic') e = Math.min(e, 0.2);

          if (relVelN < 0) {
            const jn = -(1 + e) * relVelN / ( (1/p.mass) + (1/q.mass) );
            const impX = jn * nx, impY = jn * ny;
            p.vx -= impX / p.mass; p.vy -= impY / p.mass;
            q.vx += impX / q.mass; q.vy += impY / q.mass;

            // friction
            const tx = -ny, ty = nx;
            const relVelT = rvx * tx + rvy * ty;
            const mu = cfg.collFriction;
            if (mu > 0) {
              let jt = - relVelT / ( (1/p.mass) + (1/q.mass) );
              const maxJt = jn * mu;
              jt = clamp(jt, -maxJt, maxJt);
              const fX = jt * tx, fY = jt * ty;
              p.vx -= fX / p.mass; p.vy -= fY / p.mass;
              q.vx += fX / q.mass; q.vy += fY / q.mass;
            }

            const addHeat = clamp(cfg.heatGain * Math.abs(jn) * 0.002, 0, 0.5);
            p.heat = Math.min(1, p.heat + addHeat);
            q.heat = Math.min(1, q.heat + addHeat);
          }
        }
      });
    }
    if (rebuild) state.grid.build(state.particles);
  }
}

// Rendering
function clearWithTrail() {
  const { r, g, b } = state.bgRGB;
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = `rgba(${r},${g},${b},${cfg.trail})`;
  ctx.fillRect(0, 0, state.w, state.h);
}
function drawNgon(ctx, sides, radius) {
  const step = (Math.PI * 2) / sides;
  ctx.moveTo(radius, 0);
  for (let i = 1; i < sides; i++) {
    const a = step * i;
    ctx.lineTo(Math.cos(a) * radius, Math.sin(a) * radius);
  }
  ctx.closePath();
}
function drawStar(ctx, points, outerR, innerR) {
  const step = Math.PI / points;
  ctx.moveTo(outerR, 0);
  for (let i = 1; i < points*2; i++) {
    const r = (i % 2 === 0) ? outerR : innerR;
    const a = step * i;
    ctx.lineTo(Math.cos(a)*r, Math.sin(a)*r);
  }
  ctx.closePath();
}
function draw() {
  // ... (draw function code remains unchanged)
  ctx.globalCompositeOperation = cfg.blendMode;
  ctx.shadowBlur = cfg.glow;
  for (let i = 0; i < state.particles.length; i++) {
    const p = state.particles[i];

    // Color
    let colStr = p.color;
    if (cfg.colorMode === 'gradient') {
      const t = clamp(p.x / Math.max(1, state.w), 0, 1);
      const c = mix(state.colorARGB.A, state.colorARGB.B, t);
      colStr = rgbToStr(c, 1);
    } else if (cfg.colorMode === 'velocity') {
      const sp = Math.sqrt(p.vx*p.vx + p.vy*p.vy);
      const t = clamp(sp / (cfg.maxSpeed * cfg.sensitivity), 0, 1);
      const hue = lerp(260, 20, Math.pow(t, 0.7));
      const c = hslToRgb(hue, 0.9, 0.58);
      colStr = rgbToStr(c, 1);
    } else if (cfg.colorMode === 'single') {
      colStr = rgbToStr(state.colorARGB.base, 1);
    } else if (cfg.colorMode === 'heat') {
      const t = clamp(p.heat, 0, 1);
      const hue = lerp(200, 10, t); // blue -> red
      const c = hslToRgb(hue, 0.9, lerp(0.45, 0.65, t));
      colStr = rgbToStr(c, 1);
    }
    ctx.fillStyle = colStr;
    ctx.shadowColor = colStr;

    // Shape
    ctx.beginPath();
    if (cfg.shape === 'circle') {
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    } else if (cfg.shape === 'square') {
      const s = p.r * 2;
      const angle = Math.atan2(p.vy, p.vx) + state.time * p.spin * 0.2;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(angle);
      ctx.rect(-s/2, -s/2, s, s);
      ctx.fill(); ctx.restore();
    } else if (cfg.shape === 'triangle') {
      const angle = Math.atan2(p.vy, p.vx);
      const s = p.r * 2.2;
      const h = s * Math.sqrt(3) / 2;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(angle);
      ctx.moveTo(0, -h/2);
      ctx.lineTo(-s/2, h/2);
      ctx.lineTo(s/2, h/2);
      ctx.closePath(); ctx.fill(); ctx.restore();
    } else if (cfg.shape === 'ngon') {
      const angle = Math.atan2(p.vy, p.vx) + state.time * p.spin * 0.15;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(angle);
      drawNgon(ctx, clamp(cfg.polySides|0, 3, 16), p.r * 1.6);
      ctx.fill(); ctx.restore();
    } else if (cfg.shape === 'star') {
      const angle = Math.atan2(p.vy, p.vx) + state.time * p.spin * 0.25;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(angle);
      drawStar(ctx, clamp(cfg.starPoints|0, 4, 20), p.r * 1.8, p.r * 1.8 * clamp(cfg.starInner, 0.1, 0.95));
      ctx.fill(); ctx.restore();
    }
  }
  ctx.shadowBlur = 0;
  ctx.globalCompositeOperation = 'source-over';
}

// Main loop (fixed timestep)
function stepFixed(dt) {
  integrateForces(dt);
  integratePositions(dt);
  resolveCollisions();
}
function frame(now) {
  // ... (frame function code remains unchanged)
  if (document.hidden) {
    state.lastNow = now;
    requestAnimationFrame(frame);
    return;
  }
  const dtRaw = (now - state.lastNow) / 1000;
  state.lastNow = now;
  const fps = 1 / Math.max(1e-6, dtRaw);
  state.fpsSMA = lerp(state.fpsSMA, fps, 0.12);
  fpsEl.textContent = `${state.fpsSMA.toFixed(0)}`;

  if (state.running) {
    state.accum += Math.min(dtRaw, state.maxAccum);
    let steps = 0;
    const maxStepsLocal = cfg.maxSubsteps;
    while (state.accum >= state.fixedDt && steps < maxStepsLocal) {
      stepFixed(state.fixedDt);
      state.accum -= state.fixedDt;
      steps++;
    }
    if (cfg.autoQuality) {
      if (state.autoQualityCooldown <= 0) {
        if (state.fpsSMA < 48 && cfg.iterations > 1) {
          cfg.iterations = Math.max(1, cfg.iterations - 1);
          iters.value = String(cfg.iterations); itersNum.value = String(cfg.iterations);
          state.autoQualityCooldown = 1.5;
        } else if (state.fpsSMA > 80 && cfg.iterations < Math.max(3, state.userIterations)) {
          cfg.iterations = Math.min(Math.max(3, state.userIterations), cfg.iterations + 1);
          iters.value = String(cfg.iterations); itersNum.value = String(cfg.iterations);
          state.autoQualityCooldown = 1.5;
        }
      } else {
        state.autoQualityCooldown -= dtRaw;
      }
    }
  }

  clearWithTrail();
  draw();

  // HUD
  pcountEl.textContent = `${state.particles.length}`;
  modeEl.textContent = cfg.physicsMode;
  shapeHUD.textContent = cfg.shape;
  colorHUD.textContent = cfg.colorMode;

  requestAnimationFrame(frame);
}
// --- END OF FILE simulation_render_loop.js ---