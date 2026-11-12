// Original JLU car artwork; lane driving, stop-line queues and phase coupling are host adaptations.
export async function makeStreetTraffic(junction){
 const images=new Map();await Promise.all(Array.from({length:5},(_,color)=>['left','right'].map(async facing=>{const im=new Image();im.src=`../assets/jlu-cars/output/car-${color}-${facing}.png`;await im.decode();images.set(`${color}-${facing}`,im)})).flat());
 const cars=[];for(const dir of [-1,1])for(let lane=0;lane<2;lane++)for(let i=0;i<2;i++)cars.push({dir,lane,u:dir*(-170+i*95),color:(cars.length)%5,speed:22+lane*2});
 function update(dt){dt=Math.min(.1,Math.max(0,dt));const green=junction.phase().car==='green';for(const dir of [-1,1])for(let lane=0;lane<2;lane++){
 const group=cars.filter(a=>a.dir===dir&&a.lane===lane).sort((a,b)=>b.u*dir-a.u*dir);let front=Infinity;
 for(const a of group){let travel=a.u*dir,next=travel+a.speed*dt;if(!green&&travel<=-46)next=Math.min(next,-46);next=Math.min(next,front-20);if(next>215)next=-215;a.u=next*dir;front=next===-215?Infinity:next;}
 }}
 function objects(view){return cars.map(a=>{const px=junction.x+a.u,cy=junction.centerY(px)+(a.dir===1?1:-1)*(27+a.lane*9),scale=1.125/6,footY=cy+14*scale;return {a,px,cy,footY,scale}}).filter(p=>p.px>view.x-15&&p.px<view.x+view.w+15&&p.cy>view.y-15&&p.cy<view.y+view.h+15).map(p=>({y:p.footY,draw:c=>{const im=images.get(`${p.a.color}-${p.a.dir===1?'right':'left'}`);c.drawImage(im,p.px-33*p.scale,p.footY-44*p.scale,im.width*p.scale,im.height*p.scale)}}))}
 return {update,objects,stats:()=>({cars:cars.map(a=>({...a})),source:'JLU original parked-car art; local lane/stop-line animation',phase:junction.phase()})};
}
