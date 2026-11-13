// Name picking is separate from rendering: unnamed geometry never acquires a guessed name.
export function createNameIndex(data, features, project) {
  const names = new Map(data.features.filter(f => f.properties.osm_id != null).map(f => [String(f.properties.osm_id), f.properties.name]));
  const items = [];
  for (const f of features) {
    const name = names.get(String(f.osm_id)) || f.name;
    if (!name || ['campus', 'east-boundary'].includes(f.kind) || f.indoor === 'yes' || f.highway === 'corridor') continue;
    if (f.polys?.length) items.push({name, type: f.building ? '建筑' : '景观', polys: f.polys, box: f.box});
    else if (f.highway && f.coords?.length) items.push({name, type: '道路', coords: f.coords, box: f.box});
  }
  for (const f of data.features) {
    const p = f.properties;
    if (f.geometry.type === 'Point' && p.name && !p.railway && !p.public_transport)
      items.push({name: p.name, type: '地点', point: project(f.geometry.coordinates)});
  }
  return items;
}
const inRing = (x, y, r) => {
  let yes = false;
  for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
    const [a,b] = r[i], [c,d] = r[j];
    if ((b > y) !== (d > y) && x < (c-a)*(y-b)/(d-b)+a) yes = !yes;
  }
  return yes;
};
const lineDistance = (x,y,coords) => {
  let best = Infinity;
  for (let i=1;i<coords.length;i++) {
    const [a,b]=coords[i-1], [c,d]=coords[i], dx=c-a,dy=d-b;
    const t=Math.max(0,Math.min(1,((x-a)*dx+(y-b)*dy)/(dx*dx+dy*dy||1)));
    best=Math.min(best,Math.hypot(x-a-t*dx,y-b-t*dy));
  }
  return best;
};
export function pickName(items, x, y, zoom) {
  let best=null, score=Infinity;
  for (const f of items) {
    let s=Infinity;
    if (f.point) {const d=Math.hypot(x-f.point[0],y-f.point[1])*zoom;if(d<=9)s=d/10;}
    else if(f.polys?.some(p=>inRing(x,y,p[0])&&!p.slice(1).some(r=>inRing(x,y,r)))) s=f.type==='建筑'?1:3;
    else if(f.coords) {const d=lineDistance(x,y,f.coords)*zoom;if(d<=6)s=2+d/10;}
    if(s<score){score=s;best=f;}
  }
  return best;
}
export function mountDigitalHover(canvas, items, state) {
  const tip=document.createElement('div');
  tip.id='digitalMapName';tip.role='status';tip.hidden=true;
  Object.assign(tip.style,{position:'fixed',zIndex:30,pointerEvents:'none',padding:'8px 12px',borderRadius:'9px',background:'rgba(30,43,37,.94)',color:'#fff',font:'13px/1.4 system-ui,sans-serif',boxShadow:'0 3px 14px #0002',maxWidth:'min(260px,80vw)',overflowWrap:'anywhere'});
  document.body.append(tip);
  let active=new Map(),touchBlocked=false,snapshot='',shown=false;
  const hide=()=>{tip.hidden=true;shown=false;};
  const show=e=>{
    const s=state();if(!s.digital)return hide();
    const r=canvas.getBoundingClientRect(),sx=canvas.width/r.width,sy=canvas.height/r.height;
    const x=s.camera.x+((e.clientX-r.left)*sx-canvas.width/2)/s.zoom;
    const y=s.camera.y+((e.clientY-r.top)*sy-canvas.height/2)/s.zoom;
    const hit=pickName(items,x,y,s.zoom/Math.max(sx,sy));
    if(!hit)return hide();
    tip.textContent=hit.name;tip.hidden=false;shown=true;
    tip.style.left=Math.max(8,Math.min(innerWidth-tip.offsetWidth-8,e.clientX+14))+'px';
    tip.style.top=Math.max(8,Math.min(innerHeight-tip.offsetHeight-8,e.clientY+18))+'px';
  };
  canvas.addEventListener('pointerdown',e=>{hide();active.set(e.pointerId,{x:e.clientX,y:e.clientY,moved:false});if(active.size>1)touchBlocked=true;});
  canvas.addEventListener('pointermove',e=>{
    const start=active.get(e.pointerId);
    if(start){if(Math.hypot(e.clientX-start.x,e.clientY-start.y)>6)start.moved=true;return hide();}
    if(e.pointerType!=='touch'&&!e.buttons)show(e);
  });
  canvas.addEventListener('pointerup',e=>{
    const start=active.get(e.pointerId);active.delete(e.pointerId);
    if(start&&!start.moved&&!touchBlocked)show(e);
    if(!active.size)touchBlocked=false;
  });
  canvas.addEventListener('pointercancel',e=>{active.delete(e.pointerId);if(!active.size)touchBlocked=false;hide();});
  canvas.addEventListener('pointerleave',e=>{if(e.pointerType!=='touch')hide();});
  canvas.addEventListener('wheel',hide,{passive:true});
  window.addEventListener('blur',()=>{active.clear();touchBlocked=false;hide();});
  window.addEventListener('keydown',e=>{if(e.key==='Escape')hide();});
  document.addEventListener('pointerdown',e=>{if(e.target!==canvas)hide();});
  return {sync(){const s=state(),next=[s.digital,s.zoom,s.camera.x,s.camera.y,canvas.width,canvas.height].join(':');if(next!==snapshot&&shown)hide();snapshot=next;},hide};
}
