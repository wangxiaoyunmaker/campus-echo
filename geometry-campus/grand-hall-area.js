// Host correction from the owner's 2026-11-13 annotated scene + satellite reference.
// The Grand Hall is 125465023, NOT the separate 129 Hall 18788114.
// Preserve original surveyed polygon; landscaping extents/trunks are visual approximations.
export function applyGrandHallArea(features,{enabled=true}={}){
 if(!enabled)return null;
 const hall=features.find(f=>String(f.osm_id)==='125465023');if(!hall?.polys?.length)return null;
 hall.building='yes';hall.kind='building';hall.name='同济大礼堂';hall['name:en']='Grand Auditorium';
 const box=pts=>[Math.min(...pts.map(p=>p[0])),Math.min(...pts.map(p=>p[1])),Math.max(...pts.map(p=>p[0])),Math.max(...pts.map(p=>p[1]))];
 const forests=[{id:'grand-hall-west-grove',pts:[[-488,-451],[-446,-451],[-447,-352],[-489,-352]]},{id:'grand-hall-east-grove',pts:[[-353,-451],[-312,-451],[-310,-350],[-354,-350]]}];
 for(const f of forests){f.pts.push(f.pts[0]);features.push({osm_id:f.id,kind:'green',landuse:'forest',name:'',polys:[[f.pts]],coords:[],box:box(f.pts),source:'owner annotation; approximate planting envelope, not survey'});}
 // Existing southern route 183383972 ends here. Extend it to the hall entrance;
 // cross existing transverse path 191911307, retaining both original side footpaths.
 const stem=features.find(f=>String(f.osm_id)==='183383972'),south=stem?.coords?.reduce((a,b)=>a[1]<b[1]?a:b,stem.coords[0])||[-395.09,-342.73];
 const coords=[south,[-397.6,-466.54],[-399,-506.5]];
 const road={osm_id:'grand-hall-entry-asphalt',kind:'road',highway:'service',name:'',carriagewayWidth:18,sidewalkWidth:23,suppressWear:true,coords,polys:[],box:box(coords),source:'owner annotation; entrance connection approximate'};features.push(road);
 return {hallId:String(hall.osm_id),hallBox:hall.box,forestIds:forests.map(f=>f.id),roadId:road.osm_id,entry:[-399,-503],south,source:'original Grand Hall polygon + annotated southern planting/corridor'};
}
