import {ZH} from './teaching-adapted-core.mjs';
// Adapter only. Core geometry, facade, roof, props and atlas layout are original.
export function prepareBuilding({id,kind='teaching',rings,floors=4,height,entrances=[]}){
 if(!rings?.[0]?.length)throw Error('Building requires footprint rings');
 let ps=rings.flat();const bbox=[Math.min(...ps.map(p=>p[0])),Math.min(...ps.map(p=>p[1])),Math.max(...ps.map(p=>p[0])),Math.max(...ps.map(p=>p[1]))];
 return {id:'external-'+id,kind,rings,bbox,floors,height:height??(Math.max(1,floors)-1)*24+36,entrances};
}
export function renderBuildingChunk(buildings,cx,cy,season='summer'){
 const world={buildings,query:([x0,y0,x1,y1])=>({buildings:buildings.filter(b=>b.bbox[2]>=x0&&b.bbox[0]<=x1&&b.bbox[3]>=y0&&b.bbox[1]-b.height<=y1)})};
 return ZH(world,cx,cy,season);
}
export function renderBuildingRegion(buildings,season='summer'){
 if(!buildings.length)return [];
 const x0=Math.floor(Math.min(...buildings.map(b=>b.bbox[0]))/512),x1=Math.floor(Math.max(...buildings.map(b=>b.bbox[2]))/512);
 const y0=Math.floor(Math.min(...buildings.map(b=>b.bbox[1]-b.height-120))/512),y1=Math.floor((Math.max(...buildings.map(b=>b.bbox[3]))+12)/512);
 const chunks=[];for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const r=renderBuildingChunk(buildings,x,y,season);if(r)chunks.push({cx:x,cy:y,...r})}return chunks;
}
