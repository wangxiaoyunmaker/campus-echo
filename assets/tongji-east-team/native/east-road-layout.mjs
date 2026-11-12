// Local refinements traced from the user's satellite image. Labels on that image
// are intentionally ignored. Coordinates use the existing rotated campus frame.
const bounds=coords=>[Math.min(...coords.map(p=>p[0])),Math.min(...coords.map(p=>p[1])),Math.max(...coords.map(p=>p[0])),Math.max(...coords.map(p=>p[1]))];
export function applyEastRoadLayout(features){
  if(features.some(f=>f.osm_id==='east-ref-loop'))return;
  const spine=features.find(f=>String(f.osm_id)==='1106846544');
  const atY=(coords,y)=>{for(let i=1;i<coords.length;i++){const a=coords[i-1],b=coords[i];if(y>=Math.min(a[1],b[1])&&y<=Math.max(a[1],b[1])&&Math.abs(a[1]-b[1])>.1)return[a[0]+(b[0]-a[0])*(y-a[1])/(b[1]-a[1]),y]}return[-1167,y]};
  const cross=spine?atY(spine.coords,1854):[-1167,1854],upper=spine?atY(spine.coords,1500):[-1232,1500];
  const definitions=[
    {id:'east-ref-loop',name:'东校区楼群环路',highway:'service',coords:[upper,[-1642,1500],[-1674,1524],[-1674,1985],[-1630,1995],[-1630,2160],[-1608,2182],[-1400,2182],[-1400,1854]]},
    {id:'east-ref-cross',name:'东校区楼间连接路',highway:'service',coords:[[-1674,1854],[-1400,1854],cross]},
    {id:'east-ref-siping-entry',name:'四平路侧连接通道',highway:'footway',coords:[[-1500,1447],[-1500,1500]]},
    {id:'east-ref-design-cross',name:'设计创意学院北侧连接路',highway:'service',coords:[[-1400,1970],spine?atY(spine.coords,1970):[-1168,1970]]},
    {id:'east-ref-1230-link',name:'四平路1230号入口连接路',highway:'service',coords:[[-1280,1854],[-1280,1520],[-1260,1496],[-1232.7,1496],[-1232.7,1451.4]]}
  ];
  for(const d of definitions)features.push({osm_id:d.id,name:d.name,scope:'east',kind:'road',highway:d.highway,source:'user satellite reference; geometry approximation',coords:d.coords,polys:[],box:bounds(d.coords)});
  const passage=features.find(f=>String(f.osm_id)==='1510454775');
  if(passage){
    // Keep the surveyed building passage, explicitly join the existing Fuxin road node.
    passage.coords=[...passage.coords.slice(0,-1),[-1178.6,2230.4]];passage.box=bounds(passage.coords);
    passage.name='阜新路穿楼门洞';passage.tunnel='building_passage';passage.width='5';passage.userConfirmed=true;
  }
}
