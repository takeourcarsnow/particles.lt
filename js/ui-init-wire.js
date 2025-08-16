(() => {
  const UI = window.UI;
  const {
    // elements
    panel, tabs, toggleUIBtn, uiBtn, pauseBtn, reseedBtn, presetSel, devMotion,
    resetBtn, randomizeBtn, saveBtn,
    uniformSize, shapeSel, colorMode, baseColor, colorA, colorB, blendMode,
    containment, boundary, massMode, physMode, turbMode, turbUsePointer, pointerMode, rebuildGrid, autoQuality,
    // number/range pairs and other inputs referenced in wiring
    count, countNum,
    sizeMin, sizeMinNum, sizeMax, sizeMaxNum, sizeUni, sizeUniNum,
    sensitivity, sensitivityNum, maxSpeed, maxSpeedNum, gravity, gravityNum,
    windMag, windMagNum, windDir, windDirNum, bounciness, bouncinessNum, wallFriction, wallFrictionNum,
    airDrag, airDragNum, iters, itersNum, collFric, collFricNum, maxSteps, maxStepsNum,
    fixedHz, fixedHzNum, seed, seedNum, turbStr, turbStrNum, turbScale, turbScaleNum,
    turbTime, turbTimeNum, polySides, polySidesNum, starPoints, starPointsNum, starInner, starInnerNum,
    heatGain, heatGainNum, heatDecay, heatDecayNum, trail, trailNum, glow, glowNum,
    pointerStr, pointerStrNum, pointerRad, pointerRadNum, pointerExp, pointerExpNum, impulseMag, impulseMagNum,
    tiltGain, tiltGainNum, tiltSmooth, tiltSmoothNum,
    tiltCalBtn
  } = UI;

  const {
    activateTab,
    populateInitialConfig,
    applyUI,
    resetSimulation,
    applyPreset,
    randomize,
    reseed,
    savePNG
  } = UI;

  function wire() {
    // Tabs
    tabs.forEach(btn => btn.addEventListener('click', () => activateTab(btn.dataset.tab)));

    // Bind ranges <-> numbers
    [
      [count, countNum],[sizeMin, sizeMinNum],[sizeMax, sizeMaxNum],[sizeUni, sizeUniNum],
      [sensitivity, sensitivityNum],[maxSpeed, maxSpeedNum],[gravity, gravityNum],
      [windMag, windMagNum],[windDir, windDirNum],[bounciness, bouncinessNum],[wallFriction, wallFrictionNum],
      [airDrag, airDragNum],[iters, itersNum],[collFric, collFricNum],[maxSteps, maxStepsNum],
      [fixedHz, fixedHzNum],[seed, seedNum],[turbStr, turbStrNum],[turbScale, turbScaleNum],
      [turbTime, turbTimeNum],[polySides, polySidesNum],[starPoints, starPointsNum],[starInner, starInnerNum],
      [heatGain, heatGainNum],[heatDecay, heatDecayNum],[trail, trailNum],[glow, glowNum],
      [pointerStr, pointerStrNum],[pointerRad, pointerRadNum],[pointerExp, pointerExpNum],[impulseMag, impulseMagNum],
      [tiltGain, tiltGainNum],[tiltSmooth, tiltSmoothNum],
    ].forEach(([r, n]) => bindRangeNumber(r, n, () => applyUI()));


    // Simple inputs
    [
      uniformSize, shapeSel, colorMode, baseColor, colorA, colorB, blendMode,
      containment, boundary, massMode, physMode, turbMode, turbUsePointer, pointerMode, rebuildGrid, autoQuality
    ].forEach(inp => { inp.addEventListener('input', applyUI); inp.addEventListener('change', applyUI); });

    // Turbulence mode: update sliders for each mode
    function updateTurbSliders() {
      const opt = turbMode.options[turbMode.selectedIndex];
      // Strength
      turbStr.min = opt.dataset.strMin || 0;
      turbStr.max = opt.dataset.strMax || 2000;
      turbStr.step = 1;
      turbStr.value = opt.dataset.strDef || 100;
      turbStrNum.min = turbStr.min;
      turbStrNum.max = turbStr.max;
      turbStrNum.step = 1;
      turbStrNum.value = turbStr.value;
      // Scale
      turbScale.min = opt.dataset.scaleMin || 0.0001;
      turbScale.max = opt.dataset.scaleMax || 0.05;
      turbScale.step = 0.0001;
      turbScale.value = opt.dataset.scaleDef || 0.004;
      turbScaleNum.min = turbScale.min;
      turbScaleNum.max = turbScale.max;
      turbScaleNum.step = 0.0001;
      turbScaleNum.value = turbScale.value;
      // Time
      turbTime.min = opt.dataset.timeMin || 0;
      turbTime.max = opt.dataset.timeMax || 4;
      turbTime.step = 0.01;
      turbTime.value = opt.dataset.timeDef || 0.6;
      turbTimeNum.min = turbTime.min;
      turbTimeNum.max = turbTime.max;
      turbTimeNum.step = 0.01;
      turbTimeNum.value = turbTime.value;
      // Show/hide relevant sliders (handled in updateUIVisibility)
    }
    turbMode.addEventListener('change', updateTurbSliders);
    // Also update on page load
    updateTurbSliders();

    // Show/hide UI
    const toggleUI = () => { panel.classList.toggle('hidden'); state.showUI = !panel.classList.contains('hidden'); };
    toggleUIBtn.addEventListener('click', toggleUI);
    uiBtn.addEventListener('click', toggleUI);

    // Pause / resume
    pauseBtn.addEventListener('click', () => {
      state.running = !state.running;
      pauseBtn.textContent = state.running ? '⏸ Pause' : '▶️ Resume';
      if (state.running) state.lastNow = performance.now();
    });

    // Actions
    resetBtn.addEventListener('click', resetSimulation);
    randomizeBtn.addEventListener('click', randomize);
    reseedBtn.addEventListener('click', reseed);
    saveBtn.addEventListener('click', savePNG);

    // Presets
    presetSel.addEventListener('change', () => applyPreset(presetSel.value));

    // Device motion
    devMotion.addEventListener('change', async () => {
      if (devMotion.checked) {
        await enableDeviceMotion();
        cfg.useDeviceMotion = state.deviceMotionOK;
        if (!state.deviceMotionOK) alert('Device motion not available or permission denied. Using normal gravity.');
      } else {
        disableDeviceMotion();
      }
      applyUI();
    });

    // Tilt calibration
    tiltCalBtn.addEventListener('click', () => {
      state.tilt.offsetX = state.tilt.curX;
      state.tilt.offsetY = state.tilt.curY;
      updateTiltUIStatus('Calibrated');
    });

    // Keyboard
    window.addEventListener('keydown', (e) => {
      if (e.key === ' ') { e.preventDefault(); pauseBtn.click(); }
      else if (e.key === 'r' || e.key === 'R') { resetSimulation(); }
      else if (e.key === 'u' || e.key === 'U') { panel.classList.toggle('hidden'); state.showUI = !panel.classList.contains('hidden'); }
      // ... other key events
    });

    // App lifecycle
    document.addEventListener('visibilitychange', () => { if (!document.hidden) state.lastNow = performance.now(); });
    window.addEventListener('resize', resize);
  }

  function init() {
    activateTab('essentials');
    populateInitialConfig();
    resize();
    updateGlobalWind();
    ensureGrid();
    spawnParticles(cfg.count);
    applyUI();
    wire();

    ctx.fillStyle = rgbToStr(state.bgRGB, 1);
    ctx.fillRect(0,0,state.w,state.h);
    requestAnimationFrame(frame);
  }

  // Expose and kick off
  Object.assign(UI, { wire, init });
  init();
})();