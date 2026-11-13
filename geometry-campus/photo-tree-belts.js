// Planting envelopes traced conservatively from the owner's saved Google aerial references 1–4.
// Building/road geometry is unchanged. Individual trunks and species are illustrative, not surveyed.
export const photoTreeBelts=[
 {id:'northwest-one-rear',label:'西北一楼后侧林带',box:[-119,-805,-57,-420],step:17,source:'google-reference/reference-2.png; reference-4.png'},
 {id:'northwest-dorm-gaps',label:'西北四、五楼间绿带',box:[-115,-1070,141,-790],step:18,source:'google-reference/reference-4.png'},
 {id:'northwest-three-edge',label:'西北三楼外围树群',box:[-380,-1108,-100,-1068],step:17,source:'google-reference/reference-2.png; reference-4.png'},
 {id:'west-field-north',label:'西侧球场北缘树带',box:[-1132,-360,-842,-299],step:17,source:'google-reference/reference-1.png; reference-3.png'},
 {id:'west-field-east',label:'西侧球场东缘树带',box:[-817,-296,-768,-55],step:17,source:'google-reference/reference-1.png; reference-3.png'},
 {id:'southwest-seven-edge',label:'西南七楼外侧树带',box:[-1488,-280,-1467,-60],step:19,source:'google-reference/reference-1.png'}
];
const isTree=p=>!!p.originalKind&&p.originalKind!=='bush'||/tree|pine|spruce|poplar|canopy/.test(p.name);
export function addPhotoTreeBelts({features,items,blocked,contains,roadClear}){
 const sports=features.filter(f=>f.kind==='sport'&&f.polys.length),greens=features.filter(f=>f.kind==='green'&&f.polys.length);
 const courtyardIds=['183388130','183388131','183383484','183383485','1536414898'];
 const excluded=greens.filter(f=>courtyardIds.includes(String(f.osm_id))||f.landuse==='forest'||f.name==='水杉林');
 const buildings=features.filter(f=>f.building&&f.polys.length);
 const awayFromBuilding=(x,y)=>!buildings.some(f=>x>f.box[0]-5&&x<f.box[2]+5&&y>f.box[1]-5&&y<f.box[3]+5&&[[0,0],[-5,0],[5,0],[0,-5],[0,5]].some(([a,b])=>contains(f,x+a,y+b)));
 const reserved=(x,y)=>Math.hypot(x+948.135,y+388.555)<30||(x>-1020&&x<-975&&y>-410&&y<-355)||(x>-952&&x<-902&&y>-541&&y<-455);
 const legal=(x,y)=>!reserved(x,y)&&!blocked(x,y)&&roadClear(x,y,3)&&awayFromBuilding(x,y)&&!sports.some(f=>contains(f,x,y))&&!excluded.some(f=>contains(f,x,y));
 let newTrees=0;
 for(let z=0;z<photoTreeBelts.length;z++){
  const belt=photoTreeBelts[z],[l,t,r,b]=belt.box;
  for(let row=0,y=t+6;y<b-5;row++,y+=belt.step)for(let col=0,x=l+6+(row%2)*belt.step/2;x<r-5;col++,x+=belt.step){
   const seed=z*131+row*29+col*17,xx=x+Math.sin(seed)*2.4,yy=y+Math.cos(seed)*2.4;
   if(!legal(xx,yy)||items.some(p=>!p.water&&!p.hidden&&Math.hypot(p.x-xx,p.y-yy)<(isTree(p)?13:7)))continue;
   const kind=['oak','oak','poplar','tree','spruce','oak'][seed%6],name={oak:'large-tree-summer-2',poplar:'poplar-summer-2',tree:'tree-summer-2',spruce:'pine-summer-1'}[kind];
   const scale=kind==='tree'?2.2+(seed%3)*.15:kind==='spruce'?1.8+(seed%3)*.1:1.45+(seed%4)*.12;
   items.push({name,x:xx,y:yy,originalKind:kind,renderScale:scale,photoBelt:belt.id});newTrees++;
  }
 }
 // Match the requested mature roadside scale. Existing hero/shore/courtyard trees retain their scale.
 let enlarged=0,pits=0;
 for(const p of items){if(!p.roadsideTree||p.shoreTree||p.libraryFront||p.woodland||p.photoBelt)continue;
  const kind=p.originalKind||(/poplar/.test(p.name)?'poplar':'oak');
  p.renderScale=kind==='poplar'?1.55:1.65;p.originalKind=kind;p.treePit=true;enlarged++;pits++;
 }
 return {newTrees,enlargedRoadsideTrees:enlarged,treePits:pits,regions:photoTreeBelts.map(b=>({id:b.id,label:b.label,count:items.filter(p=>p.photoBelt===b.id).length,source:b.source})),invalid:items.filter(p=>p.photoBelt&&!legal(p.x,p.y)).length,source:'Saved owner Google aerial refs 1–4; illustrative trunks; JLU original main-scene treepit and mixed tree sprites'};
}
