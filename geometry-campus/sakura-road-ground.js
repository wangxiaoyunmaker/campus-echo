// Photo-grounded material adaptation, not a surveyed reconstruction.
// Tongji official article 2026-04-07: https://news.tongji.edu.cn/info/1006/94037.htm
// High view: https://images.shobserver.com/img/2026/04/04/l_CB20260404190159471080.jpeg
// Only existing main route. No road widening, new trees or season change.
export const SAKURA_ROAD_ID='183383510';
export function applySakuraRoadGround(roads){
 const r=roads.find(r=>String(r.osm_id)===SAKURA_ROAD_ID);
 if(!r)return null;r.sidewalkMaterial='lightbrick';r.photoMarkings='sakura';
 return {id:SAKURA_ROAD_ID,source:'Tongji/Shanghai Observer April 2026 photo',approximate:true,scope:'existing main route only; original coordinates/widths preserved'};
}
const segments=r=>r.coords.slice(1).map((b,i)=>{const a=r.coords[i],dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy);return {a,b,dx,dy,len}});
function nearest(segs,x,y){let best=null,arc=0;for(const s of segs){const t=((x-s.a[0])*s.dx+(y-s.a[1])*s.dy)/(s.len*s.len||1),q=Math.max(0,Math.min(1,t)),d=Math.hypot(x-s.a[0]-q*s.dx,y-s.a[1]-q*s.dy);if(!best||d<best.d)best={d,v:((x-s.a[0])*-s.dy+(y-s.a[1])*s.dx)/(s.len||1),arc:arc+q*s.len,t};arc+=s.len}return best}
// Mutates only existing asphalt pixels. Junctions and route endpoints are left clean.
// Line spacing is a visual interpretation of photo, not precise surveyed positions.
export function paintSakuraRoadMarkings(L,roads,scale=6){
 const routes=roads.filter(r=>r.photoMarkings==='sakura');if(!routes.length)return;
 const white=0xffd4d9d8;
 for(const r of routes){const segs=segments(r),length=segs.reduce((n,s)=>n+s.len,0),half=(Number(r.carriagewayWidth)||15)/2;
 const crossings=roads.filter(q=>q!==r&&!['footway','path','steps','pedestrian','corridor'].includes(q.highway)&&q.tunnel!=='yes').map(q=>({segs:segments(q),radius:(Number(q.carriagewayWidth)||15)/2+2}));
 for(let y=0;y<L.H;y++)for(let x=0;x<L.W;x++){const i=y*L.W+x;if(L.mat[i]!==10)continue;const wx=(L.x0+x+.5)/scale,wy=(L.y0+y+.5)/scale,p=nearest(segs,wx,wy);if(!p||p.d>half||p.arc<10||p.arc>length-10)continue;
 const edge=Math.abs(Math.abs(p.v)-(half-.65))<.14;
 const middle=Math.abs(p.v-.23)<.11||(Math.abs(p.v+.23)<.11&&p.arc%10<5);
 if(!(edge||middle)||crossings.some(q=>nearest(q.segs,wx,wy)?.d<q.radius))continue;
 L.col[i]=white;L.tag[i]=0;
 }
 }
}
