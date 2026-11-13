// JLU main-scene bikeshed art. Tongji positions are illustrative, not surveyed.
// Reversible with ?bikesheds=off. Never changes source geometry or existing roads.
export function placeDormBikeSheds({features,roads,contains,distanceToLine,blocked,items}) {
 const verifiedCandidates=[
 ['183383459',-253.9298561540914,-362.96557071608066],
 ['183388117',-1519.659060526782,-531.9953352920982],
 ['183388118',-1515.8857951327232,-746.6327785095089],
 ['406761637',160.11804452597184,240.34891696628637]
 ];
 const placed=[];
 const hard=features.filter(f=>f.building||['water','green','sport'].includes(f.kind));
 const roadWidth=r=>Number(r.sidewalkWidth||r.carriagewayWidth||(['footway','path','steps','pedestrian'].includes(r.highway)?10:26))/2+3;
 const safe=(x,y)=>!blocked(x,y)&&!hard.some(f=>f.polys?.length&&contains(f,x,y))&&!roads.some(r=>distanceToLine(r,x,y)<roadWidth(r));
 for(const [id,cx,cy] of verifiedCandidates){
  const f=features.find(f=>String(f.osm_id)===id);if(!f)continue;
  // Preflight-tested side court positions; a small full-footprint check is rerun
  // against current geometry. Skip if a future map revision occupies this space.
  const candidates=[[cx,cy]];
  const q=candidates.find(([x,y])=>{
   if(placed.some(p=>Math.hypot(p.x-x,p.y-y)<65))return false;
   for(let dx=-15;dx<=15;dx+=2.5)for(let dy=-14;dy<=7;dy+=2.1)if(!safe(x+dx,y+dy))return false;
   // The apron must be near an existing route rather than isolated in a field.
   return Math.min(...roads.map(r=>distanceToLine(r,x,y)))<38;
  });
  if(!q)continue;
  const [x,y]=q;
  // Remove only procedural decorative props intersecting the reserved parking bay.
  for(let i=items.length-1;i>=0;i--){const p=items[i];if(!p.water&&!p.path&&!p.parking&&Math.abs(p.x-x)<20&&p.y>y-17&&p.y<y+10)items.splice(i,1)}
  const p={name:'bikeshed-'+(placed.length%3+1),x,y,dormId:id,dormName:f.name,illustrative:true,bikeShelter:true};items.push(p);placed.push(p);
 }
 return placed;
}
