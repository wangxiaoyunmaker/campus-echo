const fs=require('fs'),assert=require('assert/strict');
(async()=>{
const {placeDormBikeSheds}=await import('data:text/javascript;base64,'+fs.readFileSync('geometry-campus/dorm-bike-sheds.js').toString('base64'));
const data=JSON.parse(fs.readFileSync('combined-map-data.json')),origin=data.features.find(f=>String(f.properties.osm_id)==='189478410').geometry.coordinates[0][0],angle=66.08699*Math.PI/180;
const project=([lon,lat])=>{const x=(lon-origin[0])*111319.49*Math.cos(origin[1]*Math.PI/180)*3,y=(origin[1]-lat)*111319.49*3;return[x*Math.cos(angle)-y*Math.sin(angle),x*Math.sin(angle)+y*Math.cos(angle)]};
const features=data.features.map(f=>{const g=f.geometry,polys=g.type==='Polygon'?[g.coordinates.map(r=>r.map(project))]:g.type==='MultiPolygon'?g.coordinates.map(p=>p.map(r=>r.map(project))):[],coords=g.type==='LineString'?g.coordinates.map(project):[],all=polys.flat(2).concat(coords);return {...f.properties,polys,coords,box:all.length?[Math.min(...all.map(p=>p[0])),Math.min(...all.map(p=>p[1])),Math.max(...all.map(p=>p[0])),Math.max(...all.map(p=>p[1]))]:[]}});
const inside=(x,y,r)=>{let yes=false;for(let i=0,j=r.length-1;i<r.length;j=i++){let a=r[i],b=r[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])yes=!yes}return yes};
const contains=(f,x,y)=>f.polys.some(p=>inside(x,y,p[0])&&!p.slice(1).some(r=>inside(x,y,r)));
const roads=features.filter(f=>f.highway&&f.coords.length),boundaries=features.filter(f=>['campus','east-boundary'].includes(f.kind));
const distanceToLine=(f,x,y)=>Math.min(...f.coords.slice(1).map((b,i)=>{const a=f.coords[i],dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy||1)));return Math.hypot(x-a[0]-t*dx,y-a[1]-t*dy)}));
const blocked=(x,y)=>!boundaries.some(f=>contains(f,x,y))||features.some(f=>(f.building||f.kind==='water')&&contains(f,x,y));
const before=JSON.stringify(features),items=[],placed=placeDormBikeSheds({features,roads,contains,distanceToLine,blocked,items});
assert.equal(JSON.stringify(features),before);assert.ok(placed.length>=2,'must place some shelters safely');
for(const p of placed){assert.ok(!blocked(p.x,p.y));assert.ok(roads.every(r=>distanceToLine(r,p.x,p.y)>18));}
fs.writeFileSync('assets/jlu-bike-sheds/placements-test.json',JSON.stringify(placed,null,2));console.log(JSON.stringify(placed,null,2));
})();
