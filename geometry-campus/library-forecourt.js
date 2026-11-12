import {surfacePixel} from '../assets/jlu-main-roads/main-road-textures.mjs';
// Display-only photo approximation. Axis from mapped entrance path, width not surveyed.
export function makeLibraryForecourt(roads){const axis=roads.find(r=>String(r.osm_id)==='191911301');if(!axis)return null;const [a,b]=[...axis.coords].sort((a,b)=>a[1]-b[1]),dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy),ux=dx/len,uy=dy/len,nx=uy,ny=-ux,halfWidth=45;
const toWorld=(u,v)=>[a[0]+ux*u+nx*v,a[1]+uy*u+ny*v];
const local=(x,y)=>[(x-a[0])*ux+(y-a[1])*uy,(x-a[0])*nx+(y-a[1])*ny];
// The entrance plaza is EMPTY. Parking belongs to separate flank strips, not its left/right interior.
const central=(u,v)=>u>=0&&u<=len-3&&Math.abs(v)<=halfWidth;
const flank=(u,v)=>u>=15&&u<=44&&Math.abs(v)>=halfWidth&&Math.abs(v)<=110;
const contains=(x,y)=>{const[u,v]=local(x,y);return central(u,v)||flank(u,v)};
// Deliberately not repeated three identical rows. Individual count is illustrative, not a survey.
const slots=[[-1,23,65],[-1,23.7,73],[-1,22.5,82],[-1,24,92],[-1,36,68],[-1,35.5,77],[-1,36.8,88],[-1,36,101],[1,23.5,66],[1,22.5,75],[1,24,86],[1,23,98],[1,36,64],[1,37,73],[1,36,84],[1,35.5,95]];
const vehicles=slots.map(([side,u,v],i)=>{const[x,y]=toWorld(u,side*v);return{x,y,name:i%4===0?'ebike-'+(i%3+1):'bike-yellow-main',parking:true}});
return{axis:axis.osm_id,widthApproximate:true,len,contains,local,central,vehicles,toWorld,draw(g,tx,ty,size,res){if(tx+size<Math.min(a[0],b[0])-112||tx>Math.max(a[0],b[0])+112||ty+size<Math.min(a[1],b[1])-112||ty>Math.max(a[1],b[1])+112)return;const w=size*res,can=document.createElement('canvas');can.width=can.height=w;const c=can.getContext('2d'),im=c.createImageData(w,w),px=new Uint32Array(im.data.buffer);let any=false;for(let y=0;y<w;y++)for(let x=0;x<w;x++){const wx=tx+x/res,wy=ty+y/res;if(contains(wx,wy)){px[y*w+x]=surfacePixel(Math.abs(local(wx,wy)[1])<=halfWidth?'slab':'sidewalk',Math.floor(wx*6),Math.floor(wy*6));any=true}}if(any){c.putImageData(im,0,0);g.drawImage(can,tx,ty,size,size)}}};}
