// --- START OF FILE utils.js ---

// Utility
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const mix = (a, b, t) => ({ r: Math.round(lerp(a.r, b.r, t)), g: Math.round(lerp(a.g, b.g, t)), b: Math.round(lerp(a.b, b.b, t)) });
const hexToRgb = hex => {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return m ? { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) } : { r: 255, g: 255, b: 255 };
};
const rgbToStr = ({r,g,b}, a=1) => `rgba(${r},${g},${b},${a})`;
const hslToRgb = (h, s, l) => {
  s = clamp(s, 0, 1); l = clamp(l, 0, 1);
  const c = (1 - Math.abs(2*l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c/2;
  let r=0,g=0,b=0;
  if (h < 60) [r,g,b] = [c,x,0];
  else if (h < 120) [r,g,b] = [x,c,0];
  else if (h < 180) [r,g,b] = [0,c,x];
  else if (h < 240) [r,g,b] = [0,x,c];
  else if (h < 300) [r,g,b] = [x,0,c];
  else [r,g,b] = [c,0,x];
  return { r: Math.round((r+m)*255), g: Math.round((g+m)*255), b: Math.round((b+m)*255) };
};

// Seeded noise
let NOISE_SEED = 0;
function fade(t){ return t*t*(3-2*t); }
function hash3i(i,j,k){
  let n = (i * 73856093) ^ (j * 19349663) ^ (k * 83492791) ^ (NOISE_SEED * 374761393);
  n = (n << 13) ^ n;
  const x = (1.0 + (n * (n * n * 15731 + 789221) + 1376312589)) & 0x7fffffff;
  return (x / 2147483647);
}
function noise3(x,y,z){
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const xf = x - xi, yf = y - yi, zf = z - zi;
  const u = fade(xf), v = fade(yf), w = fade(zf);
  const n000 = hash3i(xi, yi, zi);
  const n100 = hash3i(xi+1, yi, zi);
  const n010 = hash3i(xi, yi+1, zi);
  const n110 = hash3i(xi+1, yi+1, zi);
  const n001 = hash3i(xi, yi, zi+1);
  const n101 = hash3i(xi+1, yi, zi+1);
  const n011 = hash3i(xi, yi+1, zi+1);
  const n111 = hash3i(xi+1, yi+1, zi+1);
  const x00 = lerp(n000, n100, u);
  const x10 = lerp(n010, n110, u);
  const x01 = lerp(n001, n101, u);
  const x11 = lerp(n011, n111, u);
  const y0 = lerp(x00, x10, v);
  const y1 = lerp(x01, x11, v);
  return lerp(y0, y1, w);
}

// Helper to bind range+number inputs together
function bindRangeNumber(range, number, onChange) {
  range.addEventListener('input', () => { number.value = range.value; onChange && onChange(); });
  function fitRange(val) {
    const v = parseFloat(val);
    if (!isFinite(v)) return;
    let mn = parseFloat(range.min), mx = parseFloat(range.max);
    if (v < mn) range.min = String(v);
    if (v > mx) range.max = String(v);
    range.value = String(v);
  }
  number.addEventListener('input', () => { fitRange(number.value); onChange && onChange(); });
  number.addEventListener('change', () => { fitRange(number.value); onChange && onChange(); });
  number.value = range.value;
}
// --- END OF FILE utils.js ---