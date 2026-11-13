// Tongji user annotated plan + satellite, 2026-11-13.
// Fountain center follows mapped circular path 189248351 (bbox midpoint); outer paving covers its full width.
// Geography retained. Individual trunks and plaza dimensions are photo estimates.
export const southwestLayout = Object.freeze({
  buildingId:'1465759871', courtyardIds:['183388131','183388130'],
  groves:[
    {id:'southwest-middle-wing-grove',ring:[[-946,-538],[-905,-536],[-908,-458],[-949,-460]]},
    {id:'southwest-supermarket-east-grove',ring:[[-1014,-406],[-978,-404],[-981,-359],[-1017,-361]]}
  ],
  plaza:{x:-948.135,y:-388.555,radius:27.5,fountainRadius:8.5},
  unmodified:'Green outlined area to east of fountain has no requested change.'
});
const inRing=(ring,x,y)=>{let hit=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){const a=ring[i],b=ring[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])hit=!hit;}return hit;};
const tree=p=>/tree|willow|pine|poplar|canopy|spruce|shrub|bush/.test(p.name)||!!p.originalKind;
export function applySouthwestCourtyards({props,features,contains,blocked,roads,distanceToLine}) {
  const lawns=southwestLayout.courtyardIds.map(id=>features.find(f=>String(f.osm_id)===id));
  if(lawns.some(f=>!f))throw Error('Southwest lawn footprints missing; refusing guessed placement');
  const inCourt=(p)=>lawns.some(f=>contains(f,p.x,p.y));
  const inGrove=p=>southwestLayout.groves.some(g=>inRing(g.ring,p.x,p.y));
  const inPlaza=p=>Math.hypot(p.x-southwestLayout.plaza.x,p.y-southwestLayout.plaza.y)<southwestLayout.plaza.radius+2;
  let removed=0;
  props.items.splice(0,props.items.length,...props.items.filter(p=>{
    const remove=(tree(p)&&inCourt(p))||inGrove(p)||inPlaza(p);if(remove)removed++;return !remove;
  }));
  const roadClear=(x,y)=>!roads.some(r=>distanceToLine(r,x,y)<(['footway','path','pedestrian','steps'].includes(r.highway)?5:11.5)+2);
  const planted=[];
  function add(x,y,zone,kind='oak',scale=2){if(blocked(x,y)||!roadClear(x,y))return false;const names={oak:'large-tree-summer-2',poplar:'poplar-summer-2',spruce:'pine-summer-1',tree:'tree-summer-2'};const p={name:zone.startsWith('courtyard')?'front-canopy':names[kind],originalKind:kind,renderScale:scale,x,y,southwestZone:zone};props.items.push(p);planted.push(p);return true;}
  for(const f of lawns){const ring=f.polys[0][0],pts=ring.slice(0,-1),x=pts.reduce((n,p)=>n+p[0],0)/pts.length,y=pts.reduce((n,p)=>n+p[1],0)/pts.length; if(!add(x,y,'courtyard-'+f.osm_id))throw Error('Central courtyard tree collides with mapped route');}
  for(const g of southwestLayout.groves){const xs=g.ring.map(p=>p[0]),ys=g.ring.map(p=>p[1]);let row=0;for(let y=Math.min(...ys)+10;y<Math.max(...ys)-4;y+=12,row++)for(let x=Math.min(...xs)+7+(row%2)*6;x<Math.max(...xs)-4;x+=13)if(inRing(g.ring,x,y)){const seed=(row*7+Math.floor(x))>>>0,kind=['oak','poplar','spruce','tree','oak'][seed%5];add(x+Math.sin(seed)*1.8,y+Math.cos(seed)*1.5,g.id,kind,kind==='spruce'?1.45:1.25+(seed%3)*.12);}}
  props.southwestStats=()=>({removed,centralTrees:planted.filter(p=>p.southwestZone.startsWith('courtyard')).length,groveTrees:planted.filter(p=>!p.southwestZone.startsWith('courtyard')).length,blocked:planted.filter(p=>blocked(p.x,p.y)).length,roadOverlap:planted.filter(p=>!roadClear(p.x,p.y)).length,layout:southwestLayout,source:'user annotated P1 + P2; JLU mixed oak / poplar / spruce / irregular deciduous sprites; photo-estimated trunk positions'});
  return props.southwestStats();
}

import {roundPlazaPixel} from '../assets/jlu-fountain/original-round-plaza.mjs';
import {waterPixel} from '../assets/jlu-fountain/main-water-grass.mjs';
import {originalFountainJetLayout} from '../assets/jlu-fountain/original-fountain.mjs';
export const southwestPlazaBlocked=(x,y)=>Math.hypot(x-southwestLayout.plaza.x,y-southwestLayout.plaza.y)<southwestLayout.plaza.fountainRadius;
export async function makeSouthwestPlaza(){
 const p=southwestLayout.plaza,n=Math.ceil(p.radius*12),r=n/2,b=p.fountainRadius*6;
 const ground=document.createElement('canvas');ground.width=ground.height=n;
 const ctx=ground.getContext('2d'),im=ctx.createImageData(n,n),pixels=new Uint32Array(im.data.buffer);
 for(let y=0;y<n;y++)for(let x=0;x<n;x++){const d=Math.hypot(x+.5-r,y+.5-r);let color=roundPlazaPixel(x,y,r,r,r);if(d<b){const up=Math.max(0,y-r+Math.sqrt(Math.max(0,b*b-(x-r)*(x-r))));color=waterPixel(x,y,b-d,up<=12?up:99,true);}pixels[y*n+x]=color;}
 ctx.putImageData(im,0,0);
 const meta=await fetch('../assets/jlu-fountain/metadata.json').then(r=>r.json()),art=new Map();
 await Promise.all(meta.map(async m=>{const image=new Image();image.src='../assets/jlu-fountain/'+m.name+'.png';await image.decode();art.set(m.name,{...m,image});}));
 const ring=Array.from({length:32},(_,i)=>[p.x*6+Math.cos(i*Math.PI/16)*b,p.y*6+Math.sin(i*Math.PI/16)*b]);
 const jets=originalFountainJetLayout({rings:[ring]});
 let time=0;
 return {update(t){time=t},drawGround(c,v){if(p.x+p.radius<v.x||p.x-p.radius>v.x+v.w||p.y+p.radius<v.y||p.y-p.radius>v.y+v.h)return;c.drawImage(ground,p.x-r/6,p.y-r/6,n/6,n/6)},objects(v){return jets.filter(j=>j.x/6>=v.x-12&&j.x/6<v.x+v.w+12&&j.y/6>=v.y-12&&j.y/6<v.y+v.h+12).map(j=>({y:j.y/6,draw(c){const a=art.get('jet-'+j.kind+'-'+(Math.floor(time/85)%4));if(a)c.drawImage(a.image,(j.x-a.ax)/6,(j.y-a.ay)/6,a.w/6,a.h/6)}}));},stats:()=>({center:p,jetCount:jets.length,jets,cachedGroundBytes:n*n*4,frameIntervalMs:85,geometry:'photo approximate',assets:'original JLU TU / PK / BM / av'})};
}
