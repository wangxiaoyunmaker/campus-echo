// Scope: user street-view/JLU paving references 2026-11-13, plus teaching
// south/north block screenshot. Material-only adaptation of EXISTING paths.
// Never replaces motor carriageways, shore paths or indoor corridors.
export const teachingBrickPathIds = ['183383500','1536414901','1536414902','1518534122','1364939700'];
export const libraryBrickSidewalkIds = ['183389276','183389274'];
export function applyLibraryBrickPaths(roads){
 const paths=new Set(teachingBrickPathIds),sides=new Set(libraryBrickSidewalkIds),changed=[];
 for(const r of roads){
  const id=String(r.osm_id);
  if(paths.has(id)&&r.highway==='footway'&&r.indoor!=='yes'&&r.bridge!=='yes'&&Number(r.layer||0)>=0){
   r.renderMaterial='redbrick';r.footwayWidth=12;changed.push(id);
  }
  if(sides.has(id))r.sidewalkMaterial='redbrick';
 }
 return {paths:changed,sidewalks:roads.filter(r=>sides.has(String(r.osm_id))).map(r=>String(r.osm_id)),source:'JLU original qG/PG/bU paver, original centerlines unchanged',width:'pedestrian 10→12 world units; motor widths unchanged'};
}
