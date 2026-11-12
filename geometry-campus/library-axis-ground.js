import {createOriginalGroundcover} from '../assets/jlu-groundcover/output/original-groundcover.mjs';
import {surfacePixel} from '../assets/jlu-main-roads/main-road-textures.mjs';
// User annotated 203954 photo: two CENTRAL islands, not the two large lateral lawns.
// Render-only bounds between existing parallel road centerlines. Island lengths are visual estimates.
export function makeLibraryAxisGround(roads,project){
 const l=roads.find(r=>String(r.osm_id)==='183389276'),r=roads.find(r=>String(r.osm_id)==='183389274');if(!l||!r)return null;
 const left=[...l.coords].sort((a,b)=>a[1]-b[1]),right=[...r.coords].sort((a,b)=>a[1]-b[1]);
 const start=(left[0][1]+right[0][1])/2,end=(left.at(-1)[1]+right.at(-1)[1])/2;
 const mao=project([121.5004416,31.2850676]),entry=project([121.4998169,31.2853143]),flag=entry.map((v,i)=>v+(mao[i]-v)*.45);
 const edge=(p,y)=>p[0][0]+(p.at(-1)[0]-p[0][0])*(y-p[0][1])/(p.at(-1)[1]-p[0][1]);
 const bounds=(x,y)=>y>=start&&y<=end&&x>=edge(left,y)&&x<=edge(right,y);
 const center=y=>(edge(left,y)+edge(right,y))/2;
 const islands=[{name:'旗像间绿岛（照片约束）',y0:flag[1]+3,y1:mao[1]-6,halfWidth:9},{name:'中轴南段花带（照片估计）',y0:start+(end-start)*.77,y1:end-8,halfWidth:6}];
 const green=(x,y)=>islands.some(a=>y>=a.y0&&y<=a.y1&&Math.abs(x-center(y))<=a.halfWidth);
 const paving=(x,y)=>bounds(x,y)&&!green(x,y);
 const material=(x,y)=>Math.abs(x-mao[0])<=11&&y>=mao[1]-6&&y<=mao[1]+8?'slab':'asphalt';
 const flowerIsland=islands[1],flowerInside=(x,y)=>y>=flowerIsland.y0&&y<=flowerIsland.y1&&Math.abs(x-center(y))<=flowerIsland.halfWidth;
 const cover=createOriginalGroundcover({flower:0,edgeLeaf:3,edgeAt:(nx,ny)=>{const x=nx/6,y=ny/6;return 6*Math.min(y-flowerIsland.y0,flowerIsland.y1-y,flowerIsland.halfWidth-Math.abs(x-center(y)))}});
 let removedTrees=0,flowerCount=0;
 const dressSouthIsland=props=>{const a=islands[1],within=p=>p.y>=a.y0&&p.y<=a.y1&&Math.abs(p.x-center(p.y))<=a.halfWidth;const tree=p=>/tree|canopy|spruce|pine|poplar|willow/.test(p.name);const removed=props.items.filter(p=>within(p)&&tree(p));removedTrees=removed.length;props.items.splice(0,props.items.length,...props.items.filter(p=>!removed.includes(p)));};
 return{bounds,green,paving,dressSouthIsland,stats:()=>({removedTrees,flowerCount,groundcover:'original JLU mat5/rW continuous red flower/red leaf edge',basis:'user red-box photo 203954; original parallel road bounds retained',islands,scope:'central corridor only; two large side lawns unchanged',approximate:true}),draw(g,tx,ty,size,res){if(ty+size<start||ty>end||tx+size<Math.min(left[0][0],left.at(-1)[0])||tx>Math.max(right[0][0],right.at(-1)[0]))return;
 const w=Math.round(size*res),can=document.createElement('canvas');can.width=can.height=w;const c=can.getContext('2d'),im=c.createImageData(w,w),px=new Uint32Array(im.data.buffer);let any=false;
 for(let y=0;y<w;y++)for(let x=0;x<w;x++){const wx=tx+x/res,wy=ty+y/res;if(flowerInside(wx,wy)){px[y*w+x]=cover(Math.floor(wx*6),Math.floor(wy*6));any=true}else if(paving(wx,wy)){px[y*w+x]=surfacePixel(material(wx,wy),Math.floor(wx*6),Math.floor(wy*6));any=true}}
 if(any){c.putImageData(im,0,0);g.drawImage(can,tx,ty,size,size)}}};
}
