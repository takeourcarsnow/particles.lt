(() => {
  // DOM helpers and element selection
  const el = id => document.getElementById(id);

  // --- DOM Element Selection ---
  const panel = el('panel');
  const tabs = Array.from(panel.querySelectorAll('.tab'));
  const panes = {
    essentials: el('tab-essentials'),
    physics: el('tab-physics'),
    collisions: el('tab-collisions'),
    turbulence: el('tab-turbulence'),
    interaction: el('tab-interaction'),
    advanced: el('tab-advanced'),
  };

  const toggleUIBtn = el('toggleUI'), uiBtn = el('uiBtn');
  const pauseBtn = el('pauseBtn'), reseedBtn = el('reseedBtn');
  const presetSel = el('presetSel');
  const count = el('count'), countNum = el('countNum');
  const uniformSize = el('uniformSize');
  const sizeVarGroup = el('sizeVar'), sizeUniGroup = el('sizeUni');
  const sizeMin = el('sizeMin'), sizeMinNum = el('sizeMinNum');
  const sizeMax = el('sizeMax'), sizeMaxNum = el('sizeMaxNum');
  const sizeUni = el('sizeUniVal'), sizeUniNum = el('sizeUniNum');
  const shapeSel = el('shape');
  const polyControls = el('polyControls');
  const polySides = el('polySides'), polySidesNum = el('polySidesNum');
  const starPoints = el('starPoints'), starPointsNum = el('starPointsNum');
  const starInner = el('starInner'), starInnerNum = el('starInnerNum');
  const colorMode = el('colorMode');
  const colorControls = el('colorControls'), heatControls = el('heatControls');
  const baseColor = el('baseColor'), colorA = el('colorA'), colorB = el('colorB');
  const bgColor = el('bgColor');
  const trail = el('trail'), trailNum = el('trailNum');
  const glow = el('glow'), glowNum = el('glowNum');
  const blendMode = el('blendMode');
  const sensitivity = el('sensitivity'), sensitivityNum = el('sensitivityNum');
  const maxSpeed = el('maxSpeed'), maxSpeedNum = el('maxSpeedNum');
  const gravity = el('gravity'), gravityNum = el('gravityNum');
  const windMag = el('windMag'), windMagNum = el('windMagNum');
  const windDir = el('windDir'), windDirNum = el('windDirNum');
  const airDrag = el('airDrag'), airDragNum = el('airDragNum');
  const containment = el('containment');
  const boundary = el('boundary'), rowBoundary = el('row-boundary');
  const bounciness = el('bounciness'), bouncinessNum = el('bouncinessNum');
  const wallFriction = el('wallFriction'), wallFrictionNum = el('wallFrictionNum');
  const massMode = el('massMode');
  const devMotion = el('devMotion');
  const tiltGain = el('tiltGain'), tiltGainNum = el('tiltGainNum');
  const tiltSmooth = el('tiltSmooth'), tiltSmoothNum = el('tiltSmoothNum');
  const rowTiltGain = el('row-tiltGain'), rowTiltSmooth = el('row-tiltSmooth'), rowTiltCal = el('row-tiltCal');
  const tiltCalBtn = el('tiltCalBtn'), tiltStatus = el('tiltStatus');
  const physMode = el('physMode');
  const iters = el('iters'), itersNum = el('itersNum');
  const rebuildGrid = el('rebuildGrid');
  const collFric = el('collFric'), collFricNum = el('collFricNum');
  const autoQuality = el('autoQuality');
  const maxSteps = el('maxSteps'), maxStepsNum = el('maxStepsNum');
  const fixedHz = el('fixedHz'), fixedHzNum = el('fixedHzNum');
  const seed = el('seed'), seedNum = el('seedNum');
  const turbMode = el('turbMode');
  const turbStr = el('turbStr'), turbStrNum = el('turbStrNum');
  const turbScale = el('turbScale'), turbScaleNum = el('turbScaleNum');
  const turbTime = el('turbTime'), turbTimeNum = el('turbTimeNum');
  const rowTurbScale = el('row-turbScale'), rowTurbTime = el('row-turbTime'), rowTurbPointer = el('row-turbPointer');
  const turbUsePointer = el('turbUsePointer');
  const pointerMode = el('pointerMode');
  const pointerStr = el('pointerStr'), pointerStrNum = el('pointerStrNum');
  const pointerRad = el('pointerRad'), pointerRadNum = el('pointerRadNum');
  const pointerExp = el('pointerExp'), pointerExpNum = el('pointerExpNum');
  const impulseMag = el('impulseMag'), impulseMagNum = el('impulseMagNum');
  const rowPointerStr = pointerStr.closest('.row'),
        rowPointerRad = pointerRad.closest('.row'),
        rowPointerExp = pointerExp.closest('.row'),
        rowImpulseMag = impulseMag.closest('.row');
  const heatGain = el('heatGain'), heatGainNum = el('heatGainNum');
  const heatDecay = el('heatDecay'), heatDecayNum = el('heatDecayNum');
  const resetBtn = el('resetBtn'), randomizeBtn = el('randomizeBtn'), saveBtn = el('saveBtn');

  // Tab activation
  function activateTab(name) {
    tabs.forEach(btn => btn.classList.toggle('active', btn.dataset.tab === name));
    Object.entries(panes).forEach(([k, elx]) => elx.style.display = (k === name ? '' : 'none'));
  }

  // Expose to a namespace
  window.UI = window.UI || {};
  Object.assign(window.UI, {
    // helpers
    el, activateTab,
    // elements
    panel, tabs, panes,
    toggleUIBtn, uiBtn, pauseBtn, reseedBtn, presetSel,
    count, countNum, uniformSize, sizeVarGroup, sizeUniGroup,
    sizeMin, sizeMinNum, sizeMax, sizeMaxNum, sizeUni, sizeUniNum,
    shapeSel, polyControls, polySides, polySidesNum, starPoints, starPointsNum, starInner, starInnerNum,
    colorMode, colorControls, heatControls, baseColor, colorA, colorB, bgColor,
    trail, trailNum, glow, glowNum, blendMode,
    sensitivity, sensitivityNum, maxSpeed, maxSpeedNum, gravity, gravityNum,
    windMag, windMagNum, windDir, windDirNum, airDrag, airDragNum,
    containment, boundary, rowBoundary,
    bounciness, bouncinessNum, wallFriction, wallFrictionNum,
    massMode, devMotion,
    tiltGain, tiltGainNum, tiltSmooth, tiltSmoothNum,
    rowTiltGain, rowTiltSmooth, rowTiltCal, tiltCalBtn, tiltStatus,
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
    resetBtn, randomizeBtn, saveBtn
  });
})();