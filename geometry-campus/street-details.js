// Original JLU main-scene raster sprites; Tongji placements below are illustrative,
// not a surveyed inventory of utilities. Does not change collision or pathfinding.
export async function createStreetDetails({roads,blocked,features,contains,distanceToLine}){
 const base='../assets/jlu-street-details/',meta=await fetch(base+'metadata.json').then(r=>r.json()),art=new Map();
 await Promise.all(meta.map(async a=>{const image=new Image();image.src=base+a.name+'.png';await image.decode();art.set(a.name,{...a,image})}));
 const items=[],counts={};
 const add=(kind,x,y,road,at)=>{const candidates=meta.filter(a=>a.kind===kind);if(!candidates.length||blocked(x,y)||items.some(p=>Math.hypot(p.x-x,p.y-y)<7))return;
  if(kind==='hydrant'&&roads.some(r=>r!==road&&distanceToLine(r,x,y)<7))return;
  const a=candidates[(items.length+at)%candidates.length];items.push({name:a.name,kind,x,y,road:String(road.osm_id)});counts[kind]=(counts[kind]||0)+1;};
 const selected=roads.filter(r=>!r.bridge&&r.tunnel!=='yes'&&r.indoor!=='yes'&&['service','residential','unclassified','living_street'].includes(r.highway)&&r.kind!=='context-road');
 for(const r of selected){const half=(Number(r.carriagewayWidth)||15)/2;let travelled=0;
  for(let i=1;i<r.coords.length;i++){const a=r.coords[i-1],b=r.coords[i],dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy);if(len<1)continue;
   for(let t=18;t<len-14;t+=38){if(items.length>=180)break;const x=a[0]+dx*t/len,y=a[1]+dy*t/len,slot=Math.floor((travelled+t)/38),side=slot%2?1:-1,nx=-dy/len*side,ny=dx/len*side;
    add(slot%3===0?'asphalt-crack':'drain',x+nx*(half-1.5),y+ny*(half-1.5),r,slot);
    if(slot%5===0&&(counts.hydrant||0)<24)add('hydrant',x+nx*(half+3)+dx/len*10,y+ny*(half+3)+dy/len*10,r,slot);
    if(slot%3===1)add('pavement-crack',x+nx*(half+2)+dx/len*14,y+ny*(half+2)+dy/len*14,r,slot);
   }travelled+=len;
  }
 }
 return{items,stats:()=>({counts,total:items.length,originalArt:true,placement:'illustrative road-edge details; not surveyed',collisionUnchanged:true}),objects:v=>items.filter(p=>p.x>v.x-8&&p.x<v.x+v.w+8&&p.y>v.y-8&&p.y<v.y+v.h+8).map(p=>({y:p.kind==='hydrant'?p.y:-Infinity,draw(c){const a=art.get(p.name);c.drawImage(a.image,p.x-a.ax/6,p.y-a.ay/6,a.w/6,a.h/6)}}))};
}
