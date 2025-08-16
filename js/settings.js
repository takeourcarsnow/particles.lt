export const Settings = {
  particles: {
    count: 1200,
    radiusMin: 2,
    radiusMax: 4,
    uniformSize: false,
    shape: 'circle', // circle, square, triangle
    colorMode: 'velocity', // solid, velocity, heat
    solidColor: '#66ccff',
    palette: 'plasma', // plasma, cool, fire, aurora
    blend: 'lighter', // source-over, lighter, screen, multiply
    velocityColorScale: 350, // px/s
    opacity: 1.0,
    massMode: 'byArea', // constant, byArea, inverse, random
    mass: 1,
    randomMassMin: 0.4,
    randomMassMax: 2.0,
  },
  physics: {
    gravity: 320,
    tiltSensitivity: 1.0,
    airDrag: 0.06,
    windX: 0,
    windY: 0,
    boundaries: 'screen-bounce', // screen-bounce, screen-wrap, none, container-circle, container-square
    restitution: 0.85,
    wallFriction: 0.02,
    particleFriction: 0.02,
    container: { cx: 0.5, cy: 0.5, radiusN: 0.45, sizeN: 0.45 }
  },
  collisions: {
    mode: 'elastic', // elastic, soft, inelastic, none
    softness: 0.6,
    inelasticity: 0.3,
    enable: true,
    adapt: true
  },
  forces: {
    turbulenceMode: 'none', // none, flow, curl, vortex, wind, jets, swirlgrid, wells
    amplitude: 140,
    scale: 0.0025,
    timeScale: 0.3,
    curlStrength: 1.0,
    vortexX: 0.5,
    vortexY: 0.5,
    vortexStrength: 480,
    vortexFalloff: 1.2,
    vortexCW: true,
    windVar: 0.0,
    windGust: 0.0,
    jetsAngle: 0,
    jetsSpacing: 140,
    swirlSpacing: 160,
    swirlFalloff: 1.2,
    swirlAlt: true,
    wellsCount: 4,
    wellsStrength: 800,
    wellsFalloff: 1.3,
    wellsSpin: 0.4,
    wellsMove: true,
    wellsRepel: false,
    wellsSeed: 12345
  },
  pointer: {
    enabled: true,
    tool: 'attract', // none, attract, repel, push, spin
    strength: 1100,
    radius: 140
  },
  visuals: {
    trail: 0.18,
    background: '#0b0e14',
    showHUD: true,
    wireframe: false,
    showContainer: true
  },
  performance: {
    simSpeed: 1.0,
    substeps: 1,
    adaptive: true,
    lowFpsThreshold: 45,
    maxParticles: 8000,
    collisionCap: 12
  },
  controls: {
    mouseSetsGravity: true
  }
};

export const PRESETS = {
  Marbles: () => ({
    particles: { count: 800, shape: 'circle', radiusMin: 3, radiusMax: 6, uniformSize:false, colorMode:'solid', solidColor:'#88d0ff', blend:'source-over', massMode:'byArea', opacity:1 },
    physics: { gravity: 400, tiltSensitivity:1.2, airDrag:0.02, boundaries:'screen-bounce', restitution:0.85, wallFriction:0.1, windX:0, windY:0, particleFriction:0.03 },
    collisions: { mode:'elastic', softness:0.5, inelasticity:0.2, enable:true },
    forces: { turbulenceMode:'none', amplitude:0 },
    visuals: { trail:0.0, background:'#0b0e14', showContainer:true }
  }),
  CircleBowl: () => ({
    particles: { count: 900, radiusMin:3, radiusMax:5, uniformSize:false, shape:'circle', colorMode:'velocity', palette:'cool', blend:'lighter', massMode:'byArea', opacity:0.95 },
    physics: { gravity: 300, tiltSensitivity:1.0, airDrag:0.06, boundaries:'container-circle', container:{cx:0.5,cy:0.5,radiusN:0.44,sizeN:0.45}, restitution:0.85, wallFriction:0.08 },
    collisions: { mode:'soft', softness:0.75, enable:true },
    forces: { turbulenceMode:'flow', amplitude:100, scale:0.002, timeScale:0.3 },
    visuals: { trail:0.06, background:'#0b0e14', showContainer:true }
  }),
  SwirlGrid: () => ({
    particles: { count: 1500, radiusMin:2, radiusMax:3.5, uniformSize:false, shape:'circle', colorMode:'velocity', palette:'aurora', blend:'lighter', massMode:'constant', mass:0.7, opacity:0.95 },
    physics: { gravity: 0, tiltSensitivity:0.7, airDrag:0.06, boundaries:'screen-wrap', restitution:0.5, wallFriction:0.05 },
    collisions: { mode:'none', enable:true },
    forces: { turbulenceMode:'swirlgrid', amplitude:160, swirlSpacing:160, swirlFalloff:1.2, vortexCW:true, swirlAlt:true },
    visuals: { trail:0.22, background:'#07101a' }
  }),
  WellsDance: () => ({
    particles: { count: 1200, radiusMin:2, radiusMax:4, uniformSize:false, shape:'circle', colorMode:'velocity', palette:'plasma', blend:'lighter', massMode:'random', randomMassMin:.5, randomMassMax:1.4, opacity:0.95, velocityColorScale:420 },
    physics: { gravity: 0, tiltSensitivity: 0.5, airDrag:0.05, boundaries:'screen-wrap', restitution:0.6, wallFriction:0.02 },
    collisions: { mode:'none', enable:true },
    forces: { turbulenceMode:'wells', amplitude:0, wellsCount:5, wellsStrength:900, wellsFalloff:1.2, wellsSpin:0.5, wellsMove:true, wellsRepel:false, wellsSeed:2025 },
    visuals: { trail:0.18, background:'#05070d' }
  }),
  Jelly: () => ({
    particles: { count: 1000, radiusMin:5, radiusMax:5, uniformSize:true, shape:'circle', colorMode:'solid', solidColor:'#ffd580', blend:'source-over', massMode:'byArea', opacity:1.0 },
    physics: { gravity:90, tiltSensitivity:0.9, airDrag:0.08, boundaries:'container-square', container:{cx:0.5,cy:0.5,radiusN:0.45,sizeN:0.43}, restitution:0.2, wallFriction:0.15, windX:0, windY:0 },
    collisions: { mode:'soft', softness:0.85, enable:true },
    forces: { turbulenceMode:'none' },
    visuals: { trail:0.03, background:'#0b0e14', showContainer:true }
  })
};

export const TABS = [
  {id:'particles', name:'Particles'},
  {id:'physics', name:'Physics'},
  {id:'forces', name:'Forces'},
  {id:'collisions', name:'Collisions'},
  {id:'visuals', name:'Visuals'},
  {id:'interact', name:'Interaction'},
  {id:'performance', name:'Performance'},
  {id:'about', name:'About'}
];