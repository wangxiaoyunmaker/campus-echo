// Original JLU furnishing on existing rendered road-edge strips. Trees/geometry unchanged.
export function planStatueGarden({features,project,contains,props}){
 const mao=project([121.5004416,31.2850676]),items=[];
 const roads=features.filter(f=>f.highway&&f.coords?.length>1);
 const axis=roads.filter(f=>['183389276','183389274'].includes(String(f.osm_id)));
 const dist=(f,x,y)=>Math.min(...f.coords.slice(1).map((b,i)=>{const a=f.coords[i],dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy||1)));return Math.hypot(x-a[0]-t*dx,y-a[1]-t*dy)}));
 const add=(name,x,y,scale=1,direction='down')=>items.push({name,x,y,scale,direction});
 for(const dx of [-7.5,-2.5,2.5,7.5])add('planter-1',mao[0]+dx,mao[1]+6.5,1.1);
 const edgeAt=(side,y)=>{const xs=axis.map(r=>{const p=[...r.coords].sort((a,b)=>a[1]-b[1]),a=p[0],b=p.at(-1);return a[0]+(b[0]-a[0])*(y-a[1])/(b[1]-a[1])});return(side<0?Math.min(...xs):Math.max(...xs))+side*17.5};
 // Replace legacy front-facing benches in this corridor; never touch trees or other props.
 for(const p of props?.items||[])if(p.name==='bench-main'&&p.y>mao[1]-22&&p.y<mao[1]+57&&[-1,1].some(side=>Math.abs(p.x-edgeAt(side,p.y))<12))p.hidden=true;
 const clear=(x,y)=>!roads.some(r=>dist(r,x,y)<(['footway','path','steps','pedestrian'].includes(r.highway)?9:15.5))&&!(props?.items||[]).some(p=>{if(p.hidden)return false;const tree=/tree|canopy|spruce|pine|poplar|willow/.test(p.name);return Math.hypot(p.x-x,p.y-y)<(tree?8:6)})&&!items.some(p=>Math.abs(p.x-x)<9&&Math.abs(p.y-y)<12);
 // Same road-edge strip as existing benches; original GeoJSON lawn bounds exclude this rendered shoulder.
 for(const side of [-1,1])for(const offset of [-8,16,40])for(const name of ['bench-main','trough-1']){
   const target=mao[1]+offset+(name==='trough-1'?12:0);let done=false;
   for(const dy of [0,3,-3,6,-6,10,-10]){const y=target+dy,x=edgeAt(side,y);if(Number.isFinite(x)&&clear(x,y)){add(name,x,y,name==='bench-main'?1.5:1,side<0?'right':'left');done=true;break}}
 }
 return{mao,items};
}
export async function makeStatueGarden(options){
 const plan=planStatueGarden(options),art=new Map();
 // Use JLU's native side-facing artwork rather than rotating a front-view bitmap.
 const {T}=await import('../assets/jlu-fountain/vendor/raster-_AffYBv6.js');
 for(const p of plan.items){
   const key=p.name+':'+p.direction;if(art.has(key))continue;
   const kind=p.name==='bench-main'?'bench-side':p.name==='trough-1'?'trough':'planter';
   const a=T[kind].draw(1,p.direction,'summer');
   art.set(key,{image:a.bm.toCanvas(),w:a.bm.w,h:a.bm.h,ax:a.ax,ay:a.ay});
 }

 return{items:plan.items,stats:()=>({objects:plan.items.length,benches:plan.items.filter(p=>p.name==='bench-main').length,flowerContainers:plan.items.filter(p=>p.name!=='bench-main').length,treesModified:0,source:'Original JLU raster.T native side-facing bench-side/trough; left benches face right, right benches face left; trees unchanged'}),objects(v){return plan.items.filter(p=>p.x>v.x-20&&p.x<v.x+v.w+20&&p.y>v.y-20&&p.y<v.y+v.h+20).map(p=>({y:p.y,draw(c){const a=art.get(p.name+':'+p.direction),s=p.scale/6;c.drawImage(a.image,p.x-a.ax*s,p.y-a.ay*s,a.w*s,a.h*s)}}))}};
}
