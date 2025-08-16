(() => {
  const UI = window.UI;

  const {
    el,
    // elements we read/write
    count, countNum, uniformSize, sizeVarGroup, sizeUniGroup,
    sizeMin, sizeMinNum, sizeMax, sizeMaxNum, sizeUni, sizeUniNum,
    shapeSel, polyControls, polySides, polySidesNum, starPoints, starPointsNum, starInner, starInnerNum,
    colorMode, colorControls, heatControls, baseColor, colorA, colorB, bgColor,
    trail, trailNum, glow, glowNum, blendMode,
    sensitivity, sensitivityNum, maxSpeed, maxSpeedNum, gravity, gravityNum,
    windMag, windMagNum, windDir, windDirNum, airDrag, airDragNum,
    containment, boundary, rowBoundary,
    bounciness, bouncinessNum, wallFriction, wallFrictionNum,
    massMode,
    tiltGain, tiltGainNum, tiltSmooth, tiltSmoothNum,
    rowTiltGain, rowTiltSmooth, rowTiltCal,
    physMode, iters, itersNum, rebuildGrid,
    collFric, collFricNum, autoQuality,
    maxSteps, maxStepsNum, fixedHz, fixedHzNum,
    seed, seedNum,
    turbMode, turbStr, turbStrNum, turbScale, turbScaleNum, turbTime, turbTimeNum,
    rowTurbScale, rowTurbTime, rowTurbPointer, turbUsePointer,
    pointerMode, pointerStr, pointerStrNum, pointerRad, pointerRadNum,
    pointerExp, pointerExpNum, impulseMag, impulseMagNum,
    rowPointerStr, rowPointerRad, rowPointerExp, rowImpulseMag,
    heatGain, heatGainNum, heatDecay, heatDecayNum,
    presetSel
  } = UI;

  // --- Initial Config (populated from UI) ---
  function populateInitialConfig() {
    Object.assign(cfg, {
      count: parseInt(count.value, 10),
      sizeMin: parseFloat(sizeMin.value), sizeMax: parseFloat(sizeMax.value), size: parseFloat(sizeUni.value), sizeMode: uniformSize.value,
      shape: shapeSel.value, polySides: parseInt(polySides.value,10), starPoints: parseInt(starPoints.value,10), starInner: parseFloat(starInner.value),
      colorMode: colorMode.value, baseColor: baseColor.value, colorA: colorA.value, colorB: colorB.value, heatGain: parseFloat(heatGain.value), heatDecay: parseFloat(heatDecay.value),
      bgColor: bgColor.value, trail: parseFloat(trail.value), glow: parseFloat(glow.value), blendMode: blendMode.value,
      boundary: boundary.value, containment: containment.value, physicsMode: physMode.value, massMode: massMode.value,
      sensitivity: parseFloat(sensitivity.value), gravity: parseFloat(gravity.value), windMag: parseFloat(windMag.value), windDir: parseFloat(windDir.value) * Math.PI/180,
      bounciness: parseFloat(bounciness.value), wallFriction: parseFloat(wallFriction.value), airDrag: parseFloat(airDrag.value), maxSpeed: parseFloat(maxSpeed.value),
      iterations: parseInt(iters.value, 10), rebuildEachIter: rebuildGrid.checked, collFriction: parseFloat(collFric.value),
      autoQuality: autoQuality.checked, maxSubsteps: parseInt(maxSteps.value,10), fixedHz: parseFloat(fixedHz.value), seed: parseInt(seed.value,10),
      turbulenceMode: turbMode.value, turbStrength: parseFloat(turbStr.value), turbScale: parseFloat(turbScale.value), turbTimeSpeed: parseFloat(turbTime.value), turbUsePointer: turbUsePointer.checked,
      pointerMode: pointerMode.value, pointerStrength: parseFloat(pointerStr.value), pointerRadius: parseFloat(pointerRad.value), pointerExp: parseFloat(pointerExp.value), impulseMag: parseFloat(impulseMag.value),
      useDeviceMotion: false, tiltGain: parseFloat(tiltGain.value), tiltSmooth: parseFloat(tiltSmooth.value),
    });
    NOISE_SEED = cfg.seed|0;
    state.bgRGB = hexToRgb(cfg.bgColor);
    state.colorARGB = { base: hexToRgb(cfg.baseColor), A: hexToRgb(cfg.colorA), B: hexToRgb(cfg.colorB) };
    state.gravityVec.y = cfg.gravity;
  }

  // --- UI Logic & Event Handlers (logic only, no wiring) ---
  function updateUIVisibility() {
    // Size mode
    const uni = (uniformSize.value === 'uniform');
    sizeVarGroup.style.display = uni ? 'none' : '';
    sizeUniGroup.style.display = uni ? '' : 'none';

    // Shape options
    polyControls.style.display = (cfg.shape === 'ngon' || cfg.shape === 'star') ? '' : 'none';
    polySides.closest('.row').style.display = (cfg.shape === 'ngon') ? '' : 'none';
    starPoints.closest('.row').style.display = (cfg.shape === 'star') ? '' : 'none';
    starInner.closest('.row').style.display = (cfg.shape === 'star') ? '' : 'none';

    // Color controls
    const showBase = cfg.colorMode === 'single';
    const showGrad = cfg.colorMode === 'gradient';
    colorControls.style.display = (showBase || showGrad) ? '' : 'none';
    baseColor.parentElement.style.display = showBase ? '' : 'none';
    colorA.parentElement.style.display = showGrad ? '' : 'none';
    colorB.parentElement.style.display = showGrad ? '' : 'none';
    heatControls.style.display = (cfg.colorMode === 'heat') ? '' : 'none';

    // Boundary vs containment
    rowBoundary.style.display = (cfg.containment === 'box') ? '' : 'none';
    if (cfg.containment === 'circle' && boundary.value === 'wrap') {
      boundary.value = 'bounce';
      cfg.boundary = 'bounce';
    }

    // Collisions pane visibility based on mode
    const collisionsDisabled = (cfg.physicsMode === 'none');
    el('collisionsDisabled').style.display = collisionsDisabled ? '' : 'none';
    el('collisionsEnabled').style.display = collisionsDisabled ? 'none' : '';

    // Turbulence contextual
    const mode = cfg.turbulenceMode;
  // Show/hide turbulence controls based on selected mode
  // Modes using scale: flow, curl, perlin, swirl, checker, ripple
  // Modes using time: flow, curl, wind, perlin, swirl, checker, ripple, pulse
  // Modes using pointer: vortex
  if (typeof window.updateTurbSliders === 'function') window.updateTurbSliders();
  const usesScale = (
    mode === 'flow' || mode === 'curl' || mode === 'perlin' || mode === 'swirl' ||
    mode === 'checker' || mode === 'ripple'
  );
  const usesTime = (
    mode === 'flow' || mode === 'curl' || mode === 'wind' || mode === 'perlin' ||
    mode === 'swirl' || mode === 'checker' || mode === 'ripple' || mode === 'pulse'
  );
  const usesPointer = (mode === 'vortex');
  rowTurbScale.style.display = usesScale ? '' : 'none';
  rowTurbTime.style.display = usesTime ? '' : 'none';
  rowTurbPointer.style.display = usesPointer ? '' : 'none';

    // Interaction contextual
    const pm = cfg.pointerMode;
    const isImpulse = (pm === 'impulse_out' || pm === 'impulse_in');
    const isOff = (pm === 'off');
    rowPointerStr.style.display = (!isOff && !isImpulse) ? '' : 'none';
    rowPointerRad.style.display = (!isOff) ? '' : 'none';
    rowPointerExp.style.display = (!isOff) ? '' : 'none';
    rowImpulseMag.style.display = isImpulse ? '' : 'none';

    // Tilt controls only when enabled
    const tiltRowsVisible = cfg.useDeviceMotion;
    rowTiltGain.style.display = tiltRowsVisible ? '' : 'none';
    rowTiltSmooth.style.display = tiltRowsVisible ? '' : 'none';
    rowTiltCal.style.display = tiltRowsVisible ? '' : 'none';
  }

  function applyUI() {
    populateInitialConfig();
    updateGlobalWind();
    ensureGrid();
    for (const p of state.particles) {
      p.shape = cfg.shape;
      if (cfg.colorMode === 'single') p.color = rgbToStr(state.colorARGB.base, 1);
      if (cfg.sizeMode === 'uniform') p.r = cfg.size; else p.r = clamp(p.r, cfg.sizeMin, cfg.sizeMax);
    }
    applyMassMode();
    spawnParticles(cfg.count);
    updateUIVisibility();
  }

  function resetSimulation() {
    state.particles.length = 0;
    spawnParticles(cfg.count);
  }

  function applyPreset(name) {
    if (!name) return;
    const setVal = (input, number, val) => { input.value = String(val); if (number) number.value = String(val); };
    switch (name) {
      case 'calmFlow':
        turbMode.value = 'flow'; setVal(turbStr, turbStrNum, 120); setVal(turbScale, turbScaleNum, 0.0035); setVal(turbTime, turbTimeNum, 0.5);
        colorMode.value = 'gradient';
        setVal(sensitivity, sensitivityNum, 1.0); setVal(airDrag, airDragNum, 0.03);
        shapeSel.value = 'circle'; uniformSize.value = 'varied'; setVal(sizeMin, sizeMinNum, 2); setVal(sizeMax, sizeMaxNum, 8);
        physMode.value = 'soft'; containment.value = 'box'; boundary.value = 'bounce';
        break;
      case 'stormCurl':
        turbMode.value = 'curl'; setVal(turbStr, turbStrNum, 400); setVal(turbScale, turbScaleNum, 0.006); setVal(turbTime, turbTimeNum, 1.2);
        colorMode.value = 'velocity'; setVal(airDrag, airDragNum, 0.01);
        physMode.value = 'elastic'; setVal(bounciness, bouncinessNum, 0.8);
        break;
      case 'vortexPointer':
        turbMode.value = 'vortex'; turbUsePointer.checked = true; setVal(turbStr, turbStrNum, 600);
        pointerMode.value = 'swirl_ccw'; setVal(pointerStr, pointerStrNum, 5000); setVal(pointerRad, pointerRadNum, 320);
        break;
      case 'fireworks':
        pointerMode.value = 'impulse_out'; setVal(impulseMag, impulseMagNum, 9000); setVal(pointerRad, pointerRadNum, 260);
        colorMode.value = 'random'; setVal(glow, glowNum, 8); blendMode.value = 'lighter';
        physMode.value = 'inelastic'; setVal(airDrag, airDragNum, 0.02); setVal(bounciness, bouncinessNum, 0.6);
        break;
      case 'brownianCloud':
        turbMode.value = 'brownian'; setVal(turbStr, turbStrNum, 250); setVal(airDrag, airDragNum, 0.04);
        colorMode.value = 'heat'; setVal(heatGain, heatGainNum, 0.2); setVal(heatDecay, heatDecayNum, 0.8);
        break;
      case 'bouncyBalls':
        colorMode.value = 'single'; shapeSel.value = 'circle'; uniformSize.value = 'uniform'; setVal(sizeUni, sizeUniNum, 10);
        physMode.value = 'elastic'; setVal(bounciness, bouncinessNum, 1.0); setVal(airDrag, airDragNum, 0.01);
        containment.value = 'box'; boundary.value = 'bounce';
        break;
      case 'spaceWrap':
        containment.value = 'box'; boundary.value = 'wrap'; physMode.value = 'none';
        colorMode.value = 'gradient'; setVal(trail, trailNum, 0.06); setVal(glow, glowNum, 6); blendMode.value = 'screen';
        turbMode.value = 'flow'; setVal(turbStr, turbStrNum, 140); setVal(turbScale, turbScaleNum, 0.0025); setVal(turbTime, turbTimeNum, 0.6);
        break;
    }
    applyUI();
    presetSel.value = '';
  }

  function randomize() {
    const rndHex = () => '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
    baseColor.value = rndHex(); colorA.value = rndHex(); colorB.value = rndHex(); bgColor.value = rndHex();
    const shapes = ['circle', 'square', 'triangle', 'ngon', 'star'];
    const phys = ['elastic', 'soft', 'inelastic', 'none'];
    const colors = ['gradient', 'single', 'random', 'velocity', 'heat'];
  const tModes = ['off','flow','curl','vortex','wind','brownian','sinwave','radial'];
    shapeSel.value = shapes[Math.floor(Math.random()*shapes.length)];
    physMode.value = phys[Math.floor(Math.random()*phys.length)];
    colorMode.value = colors[Math.floor(Math.random()*colors.length)];
    turbMode.value = tModes[Math.floor(Math.random()*tModes.length)];
    uniformSize.value = Math.random() < 0.5 ? 'uniform' : 'varied';
    sizeUni.value = Math.floor(3 + Math.random()*15); sizeUniNum.value = sizeUni.value;
    sizeMin.value = Math.floor(2 + Math.random()*6); sizeMinNum.value = sizeMin.value;
    sizeMax.value = Math.floor(10 + Math.random()*18); sizeMaxNum.value = sizeMax.value;
    sensitivity.value = (Math.random() * 3 + 0.5).toFixed(2); sensitivityNum.value = sensitivity.value;
    maxSpeed.value = Math.floor(400 + Math.random()*1600); maxSpeedNum.value = maxSpeed.value;
    gravity.value = Math.floor(-300 + Math.random()*600); gravityNum.value = gravity.value;
    windMag.value = Math.floor(Math.random()*1200); windMagNum.value = windMag.value;
    windDir.value = Math.floor(-180 + Math.random()*360); windDirNum.value = windDir.value;
    bounciness.value = (0.15 + Math.random()*0.9).toFixed(2); bouncinessNum.value = bounciness.value;
    wallFriction.value = (Math.random()*0.2).toFixed(2); wallFrictionNum.value = wallFriction.value;
    airDrag.value = (0.005 + Math.random()*0.08).toFixed(3); airDragNum.value = airDrag.value;
    iters.value = Math.floor(1 + Math.random()*5); itersNum.value = iters.value;
    rebuildGrid.checked = Math.random() < 0.7;
    collFric.value = (Math.random()*0.2).toFixed(2); collFricNum.value = collFric.value;
    fixedHz.value = Math.floor(90 + Math.random()*110); fixedHzNum.value = fixedHz.value;
    maxSteps.value = Math.floor(4 + Math.random()*8); maxStepsNum.value = maxSteps.value;
    turbStr.value = Math.floor(Math.random()*600); turbStrNum.value = turbStr.value;
    turbScale.value = (0.001 + Math.random()*0.009).toFixed(4); turbScaleNum.value = turbScale.value;
    turbTime.value = (0.2 + Math.random()*1.3).toFixed(2); turbTimeNum.value = turbTime.value;
    turbUsePointer.checked = Math.random() < 0.5;
    pointerMode.value = ['attract_lin','repel_lin','swirl_ccw','swirl_cw','drag','freeze','attract_inv','repel_inv','impulse_out','impulse_in'][Math.floor(Math.random()*10)];
    pointerStr.value = Math.floor(1000 + Math.random()*7000); pointerStrNum.value = pointerStr.value;
    pointerRad.value = Math.floor(100 + Math.random()*400); pointerRadNum.value = pointerRad.value;
    pointerExp.value = (0.5 + Math.random()*2.5).toFixed(2); pointerExpNum.value = pointerExp.value;
    impulseMag.value = Math.floor(2000 + Math.random()*7000); impulseMagNum.value = impulseMag.value;
    applyUI();
  }

  function reseed() {
    const s = Math.floor(Math.random()*100000);
    seed.value = String(s); seedNum.value = String(s); applyUI();
  }

  function savePNG() {
    const link = document.createElement('a');
    link.download = 'particle-lab.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  Object.assign(UI, {
    populateInitialConfig,
    updateUIVisibility,
    applyUI,
    resetSimulation,
    applyPreset,
    randomize,
    reseed,
    savePNG
  });
})();