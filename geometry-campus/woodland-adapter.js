// Host geography/clearance adapter. Xl/Yl and hash are the original JLU functions.
import {createOriginalWoodlandLayout} from '../assets/jlu-wood/original-woodland.mjs';
import {p as originalHash} from '../assets/jlu-pavilion/vendor/kit-B8QzrSg5.js';
export function plantWoodlands({features,items,blocked,contains,roadClear}){
 const regions=features.filter(f=>f.polys.length&&(f.landuse==='forest'||f.name==='水杉林'));
 const sports=features.filter(f=>f.kind==='sport'&&f.polys.length);
 const bounds=[Math.min(...regions.map(f=>f.box[0])),Math.min(...regions.map(f=>f.box[1])),Math.max(...regions.map(f=>f.box[2])),Math.max(...regions.map(f=>f.box[3]))];
 // 16 native pixels/tile; current world coordinates use 6 native pixels/unit.
 const ox=Math.floor(bounds[0]*6/160)*160,oy=Math.floor(bounds[1]*6/160)*160;
 const xy=(x,y)=>[(ox+(x+.5)*16)/6,(oy+(y+1)*16-3)/6];
 const regionAt=(x,y)=>regions.find(f=>x>=f.box[0]&&x<=f.box[2]&&y>=f.box[1]&&y<=f.box[3]&&contains(f,x,y));
 const legal=(x,y)=>!blocked(x,y)&&roadClear(x,y,2)&&!sports.some(f=>contains(f,x,y));
 const marks=new Set();for(const p of items){if(p.water||p.path)continue;marks.add(`${Math.floor((p.x*6-ox)/16)},${Math.floor((p.y*6-oy)/16)}`)}
 const areaClear=(l,t,r,b)=>{for(let y=t;y<=b;y++)for(let x=l;x<=r;x++){if(!legal(...xy(x,y)))return false}return true};
 const mapping={oak:'large-tree-summer-2',spruce:'pine-summer-1',poplar:'poplar-summer-2',bush:'bush-main'};
 const plant=createOriginalWoodlandLayout(originalHash,{TREE:1,ROAD:2});
 plant({w:Math.ceil((bounds[2]*6-ox)/16)+2,h:Math.ceil((bounds[3]*6-oy)/16)+2,
 inMap:(x,y)=>!!regionAt(...xy(x,y)),surfaceAt:(x,y)=>regionAt(...xy(x,y))?'wood':'grass',
 open:(x,y)=>legal(...xy(x,y)),clear:areaClear,free:(l,t,r,b)=>areaClear(l,t,r,b),
 near:(_,x,y,r)=>{for(let j=Math.floor(y-r);j<=y+r;j++)for(let i=Math.floor(x-r);i<=x+r;i++)if(marks.has(`${i},${j}`))return true;return false},
 tree:(spec,x,y,jitter)=>{const p=xy(x,y);p[0]+=Math.round(jitter*4)/6;const f=regionAt(...p);if(!f||!legal(...p))return;items.push({name:mapping[spec.kind],x:p[0],y:p[1],woodland:String(f.osm_id),originalKind:spec.kind});marks.add(`${x},${y}`)}
 });
 return regions.map(f=>({id:String(f.osm_id),name:f.name||'石榴树标注林区',basis:f.landuse||f.leisure,count:items.filter(p=>p.woodland===String(f.osm_id)).length,box:f.box}));
}
