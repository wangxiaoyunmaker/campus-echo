// Original JLU rK and Hc bodies. Export/bitmap wrapper only. Internal reuse.
const gray=["#383b4a", "#565a6b", "#7c8194", "#a3a8b6", "#cfd2db"];
const pack=s=>{let n=parseInt(s.slice(1),16);return (0xff000000|((n&255)<<16)|(n&65280)|(n>>>16))>>>0};
const jG=gray.map(pack),MG=pack("#2a1e2e"),nK=9;
function Hc(e){let t=[];for(let n=0;n+1<e.length;n++){let[r,i]=e[n],a=e[n+1][0]-r,o=e[n+1][1]-i,s=Math.hypot(a,o);t.push(s>0?{ax:r,ay:i,ux:a/s,uy:o/s,len:s}:{ax:r,ay:i,ux:1,uy:0,len:0})}return t}
const fe=Hc;
function rK(e,t,n,r){let i=(r,i,a)=>{let o=r-t,s=i-n;o>=0&&s>=0&&o<e.w&&s<e.h&&(e.px[s*e.w+o]=a)};for(let a of r){let r=0;for(let o of fe(a.pts)){let a=Math.ceil(o.len*2);for(let s=0;s<=a;s++){let c=o.len*s/a,l=Math.floor(o.ax+o.ux*c),u=Math.floor(o.ay+o.uy*c);if(l<t-2||l>t+e.w+1||u<n-2||u>n+e.h+nK+3)continue;let d=Math.floor(r+c),f=(d%48+48)%48<3;if(i(l,u+1,jG[1]),i(l,u,MG),f)for(let e=1;e<=11;e++)i(l,u-e,e===11?jG[3]:d%48==0?jG[2]:jG[0]);else if(i(l,u-nK,jG[2]),i(l,u-nK+1,MG),d%3==0)for(let e=1;e<8;e++)i(l,u-e,e===7?jG[1]:MG)}r+=o.len}}}
export {rK as drawOriginalFence};

// lines: [{pts:[[nativeX,nativeY],...]}]. Points are ground foot coords,
// not elevated rail coords. Native source lifts rail 9 and posts 11px.
export function renderOriginalFence(lines){
 const pts=lines.flatMap(l=>l.pts);if(!pts.length)throw Error('Empty fence');
 const x0=Math.floor(Math.min(...pts.map(p=>p[0])))-2;
 const y0=Math.floor(Math.min(...pts.map(p=>p[1])))-13;
 const w=Math.ceil(Math.max(...pts.map(p=>p[0])))-x0+3;
 const h=Math.ceil(Math.max(...pts.map(p=>p[1])))-y0+3;
 const bm={w,h,px:new Uint32Array(w*h)};
 rK(bm,x0,y0,lines);return {bm,x0,y0};
}
