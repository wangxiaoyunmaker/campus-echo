import {woodenDeckPixel,originalBridgeEdgePixel} from './assets/jlu-main-bridge/main-bridge-deck.mjs';
import {roadWearTag} from './assets/jlu-main-water-grass/main-water-grass.mjs';
// Network-wide passes: a segment's paving must never cut a previously drawn carriageway.
export const pedestrianRoad=f=>['footway','path','steps','pedestrian'].includes(f.highway);
export function drawRoadNetwork(c,roads,rect,textures,logicalPerWorld=6){
 const margin=16,visible=roads.filter(f=>f.tunnel!=='yes'&&f.highway!=='path'&&f.box[0]<rect.x+rect.size+margin&&f.box[2]>rect.x-margin&&f.box[1]<rect.y+rect.size+margin&&f.box[3]>rect.y-margin),motor=visible.filter(f=>!pedestrianRoad(f));
 const pattern=im=>{const p=c.createPattern(im,'repeat');p.setTransform(new DOMMatrix([1/logicalPerWorld,0,0,1/logicalPerWorld,0,0]));return p;},stone=pattern(textures.paving),asphalt=pattern(textures.asphalt);
 const stroke=(list,width,color)=>{c.save();c.beginPath();for(const f of list){f.coords.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));}c.lineWidth=width;c.lineJoin='round';c.lineCap='round';c.strokeStyle=color;c.stroke();c.restore();};
 // All ground paving first, including walking paths crossing a motor road.
 stroke(visible.filter(pedestrianRoad),10,'#a5a29c');stroke(visible.filter(pedestrianRoad),9.5,stone);
 stroke(motor,23,'#aaa8a3');stroke(motor,22.5,stone);
 // Unioned curb and carriageway passes cover all internal segment caps and crossing sidewalks.
 stroke(motor,15.6,'#bebfc5');stroke(motor,15,asphalt);
 return {segments:visible.length,motor:motor.length};
}

// Actual main-world shared JLU texture primitives, sampled in continuous world coordinates.
export async function createContinuousRoadLayer(roads,logicalPerWorld=6,crossings=[]){
 const {createLayer,rasterPath,renderNetwork,originalSegments,originalFootwayRim,originalPaverFill,paintOriginalCrossings}=await import('./assets/jlu-road-crossings/output/original-road-network-crossings.mjs');
 const cache=new Map();
 const carriage=f=>Number(f.carriagewayWidth)||15,outer=f=>Number(f.sidewalkWidth)||carriage(f)+8,margin=Math.max(16,...roads.map(f=>outer(f)/2+2));
 function draw(c,rect,resolution){if(resolution<3){
 // Low-zoom geometry LOD only: same road widths/material ordering, no native 6x raster allocation.
 const v=roads.filter(f=>f.tunnel!=='yes'&&f.highway!=='path'&&f.box[0]<rect.x+rect.size+margin&&f.box[2]>rect.x-margin&&f.box[1]<rect.y+rect.size+margin&&f.box[3]>rect.y-margin);
 const stroke=(fs,width,color)=>{c.beginPath();for(const f of fs)f.coords.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.lineWidth=width;c.strokeStyle=color;c.lineCap='round';c.lineJoin='round';c.stroke()};c.save();stroke(v.filter(f=>pedestrianRoad(f)&&f.renderMaterial==='redbrick'),10,'#a77f75');stroke(v.filter(f=>pedestrianRoad(f)&&f.renderMaterial!=='redbrick'),10,'#c9b7a0');for(const f of v.filter(f=>!pedestrianRoad(f)))stroke([f],outer(f),'#b7b4bd');for(const f of v.filter(f=>!pedestrianRoad(f)))stroke([f],carriage(f),'#42444f');c.restore();return}
 const key=[rect.x,rect.y,rect.size,resolution].join(':');let result=cache.get(key);if(!result){
 const visible=roads.filter(f=>f.tunnel!=='yes'&&f.highway!=='path'&&f.box[0]<rect.x+rect.size+margin&&f.box[2]>rect.x-margin&&f.box[1]<rect.y+rect.size+margin&&f.box[3]>rect.y-margin);if(!visible.length)return;
 const size=Math.ceil(rect.size*logicalPerWorld),L=createLayer(Math.round(rect.x*logicalPerWorld),Math.round(rect.y*logicalPerWorld),size,size,4);L.mat.fill(3);
 const points=f=>f.coords.map(([x,y])=>[x*logicalPerWorld,y*logicalPerWorld]),red=visible.filter(f=>f.renderMaterial==='redbrick'),slab=visible.filter(f=>pedestrianRoad(f)&&f.renderMaterial!=='redbrick'),motor=visible.filter(f=>!pedestrianRoad(f));
 // Host material priority: minor red branches first, continuous stone through-routes last.
 // Original geometry retained: endpoints already share road nodes; no fake new road links.
 const redSegments=red.flatMap(f=>originalSegments(points(f)));for(const seg of redSegments)originalFootwayRim(L,seg,5*logicalPerWorld);for(const seg of redSegments)originalPaverFill(L,seg,5*logicalPerWorld-2);
 for(const f of slab){const pts=points(f),ends=[pts[0],pts.at(-1)],join=ends.map(p=>red.some(r=>[r.coords[0],r.coords.at(-1)].some(q=>Math.hypot(q[0]*logicalPerWorld-p[0],q[1]*logicalPerWorld-p[1])<1)));if(!join.some(Boolean)){rasterPath(L,pts,10*logicalPerWorld,2);continue}
 // Host clipping at explicit shared material-change nodes: no capsule extends past a bridge end.
 const temp=createLayer(Math.round(rect.x*logicalPerWorld),Math.round(rect.y*logicalPerWorld),size,size,4);rasterPath(temp,pts,10*logicalPerWorld,2);
 for(let y=0;y<L.H;y++)for(let x=0;x<L.W;x++){const id=y*L.W+x;if(temp.mat[id]!==2)continue;const px=L.x0+x+.5,py=L.y0+y+.5;let clip=false;for(let e=0;e<2;e++){if(!join[e])continue;const a=ends[e],b=e?pts.at(-2):pts[1];if((px-a[0])*(b[0]-a[0])+(py-a[1])*(b[1]-a[1])<0)clip=true}if(!clip){L.mat[id]=2;L.col[id]=L.tag[id]=0}}}
 for(const f of motor)rasterPath(L,points(f),outer(f)*logicalPerWorld,['primary','secondary','tertiary','residential'].includes(f.highway)?1:2);
 for(const f of motor)rasterPath(L,points(f),carriage(f)*logicalPerWorld,10);
 // Original IG wear tags are attached to final asphalt material only.
 for(let y=4;y<L.H-4;y++)for(let x=4;x<L.W-4;x++){const id=y*L.W+x;if(L.mat[id]!==10)continue;const px=(L.x0+x+.5)/logicalPerWorld,py=(L.y0+y+.5)/logicalPerWorld;let best=Infinity,tag=0;for(const f of motor){if(f.suppressWear||px<f.box[0]-carriage(f)/2||px>f.box[2]+carriage(f)/2||py<f.box[1]-carriage(f)/2||py>f.box[3]+carriage(f)/2)continue;let arc=0;for(let j=1;j<f.coords.length;j++){const a=f.coords[j-1],b=f.coords[j],dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy),u=((px-a[0])*dx+(py-a[1])*dy)/(len||1),v=((px-a[0])*-dy+(py-a[1])*dx)/(len||1);if(u>=0&&u<=len&&Math.abs(v)<best){best=Math.abs(v);tag=roadWearTag(u*logicalPerWorld,v*logicalPerWorld,carriage(f)*logicalPerWorld,Number(f.lanes)||(f.highway==='service'?1:2),arc*logicalPerWorld)}arc+=len}}L.tag[id]=tag}
 paintOriginalCrossings(L,crossings.map(p=>({...p,x:Math.round(p.x*logicalPerWorld),y:Math.round(p.y*logicalPerWorld),width:Math.round(p.width*logicalPerWorld)})));
 const pixels=renderNetwork(L);const userWood=visible.filter(f=>String(f.osm_id)==='189478404');
 // User screenshot confirms ONLY this bridge is wooden. Original KG planks / QG edge, original footprint and end clipping.
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){const mat=L.mat[(y+4)*L.W+x+4];if(mat===3){pixels[y*size+x]=0;continue}if(mat!==2||!userWood.length)continue;const px=rect.x+(x+.5)/logicalPerWorld,py=rect.y+(y+.5)/logicalPerWorld;for(const f of userWood){let arc=0;for(let j=1;j<f.coords.length;j++){const a=f.coords[j-1],b=f.coords[j],dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy),u=((px-a[0])*dx+(py-a[1])*dy)/len,v=((px-a[0])*-dy+(py-a[1])*dx)/len;if(u>=0&&u<=len&&Math.abs(v)<=5){const U=(arc+u)*logicalPerWorld,V=v*logicalPerWorld;pixels[y*size+x]=Math.abs(v)>4.6?originalBridgeEdgePixel(U,V,10*logicalPerWorld):woodenDeckPixel(U,V,10*logicalPerWorld)}arc+=len}}}
 result=document.createElement('canvas');result.width=result.height=size;const out=result.getContext('2d'),im=out.createImageData(size,size);new Uint32Array(im.data.buffer).set(pixels);out.putImageData(im,0,0);cache.set(key,result);let bytes=0;for(const t of cache.values())bytes+=t.width*t.height*4;while(bytes>64*1024*1024&&cache.size>1){const k=cache.keys().next().value,t=cache.get(k);bytes-=t.width*t.height*4;cache.delete(k)}
 }c.drawImage(result,rect.x,rect.y,rect.size,rect.size)}
 return{draw,cache};
}
