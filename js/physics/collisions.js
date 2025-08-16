import { Settings } from '../settings.js';
import { neighbors } from './spatialHash.js';
import { clamp } from '../util/math.js';

export function handleCollisions(particles){
  if(!Settings.collisions.enable || Settings.collisions.mode==='none') return;
  const mode = Settings.collisions.mode;
  const cap = Settings.performance.collisionCap|0;
  const baseRest = Settings.physics.restitution * (mode==='inelastic' ? (1-Settings.collisions.inelasticity) : 1);

  for(let i=0;i<particles.length;i++){
    const p = particles[i];
    const neigh = neighbors(i, particles);
    let handled = 0;
    for(let idx=0; idx<neigh.length; idx++){
      const j = neigh[idx];
      if(j<=i) continue;
      const q = particles[j];
      const dx = q.x - p.x, dy = q.y - p.y;
      const sr = p.r + q.r;
      if(dx*dx + dy*dy <= sr*sr){
        const d = Math.sqrt(dx*dx + dy*dy) || 1e-4;
        const nx = dx/d, ny = dy/d;
        const overlap = sr - d;

        if(mode==='soft'){
          const k = Settings.collisions.softness;
          const push = overlap*0.5*k;
          p.x -= nx*push; p.y -= ny*push;
          q.x += nx*push; q.y += ny*push;
          const rvx = q.vx - p.vx, rvy = q.vy - p.vy;
          const vn = rvx*nx + rvy*ny;
          const damp = (1 + baseRest)*0.5 * vn;
          p.vx += nx * damp * (1/(p.m+q.m)) * q.m;
          p.vy += ny * damp * (1/(p.m+q.m)) * q.m;
          q.vx -= nx * damp * (1/(p.m+q.m)) * p.m;
          q.vy -= ny * damp * (1/(p.m+q.m)) * p.m;
        }else{
          const correction = overlap*0.5;
          p.x -= nx*correction; p.y -= ny*correction;
          q.x += nx*correction; q.y += ny*correction;

          const rvx = q.vx - p.vx, rvy = q.vy - p.vy;
          const vn = rvx*nx + rvy*ny;
          if(vn < 0){
            const e = baseRest;
            const invMassSum = 1/p.m + 1/q.m;
            const jimp = -(1+e)*vn / invMassSum;
            const ix = nx*jimp, iy = ny*jimp;
            p.vx -= ix/p.m; p.vy -= iy/p.m;
            q.vx += ix/q.m; q.vy += iy/q.m;

            const fr = Settings.physics.particleFriction;
            const tvx = rvx - vn*nx, tvy = rvy - vn*ny;
            const tlen = Math.hypot(tvx,tvy)||1e-6;
            const tx = tvx/tlen, ty = tvy/tlen;
            const jt = -fr * jimp;
            p.vx -= tx*jt/p.m; p.vy -= ty*jt/p.m;
            q.vx += tx*jt/q.m; q.vy += ty*jt/q.m;

            if(Settings.particles.colorMode==='heat'){
              const loss = (1-baseRest)*Math.abs(vn)*0.02;
              p.heat = clamp(p.heat + loss, 0, 1.2);
              q.heat = clamp(q.heat + loss, 0, 1.2);
            }
          }
        }
        handled++; if(handled>cap) break;
      }
    }
  }
}