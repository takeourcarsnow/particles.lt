export const clamp = (x,a,b)=>x<a?a:(x>b?b:x);
export const lerp = (a,b,t)=>a+(b-a)*t;
export const rand = (a=0,b=1)=>a + Math.random()*(b-a);
export const randInt=(a,b)=>Math.floor(rand(a,b+1));
export const TAU = Math.PI*2;
export const DEG = Math.PI/180;