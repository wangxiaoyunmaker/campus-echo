// Photo-informed architectural details on the existing projected footprints.
// Uses the map's own vertical extrusion / pixel scale, not the library artwork.
export const EAST_BUILDINGS = [
  {id:'20314138',key:'street',name:'临街 1、2 号楼',reference:'用户补充的临街楼鸟瞰图',height:132},
  {id:'1361623739',key:'c',name:'东校区 C 楼',reference:'用户补充的 C 楼正面图',height:108},
  {id:'20314136',key:'tjad',name:'同济大学建筑设计研究院',reference:'P4',height:34},
  {id:'527987473',key:'design',name:'同济大学设计创意学院',reference:'圆拱主楼与创意工坊照片',height:30}
];
const SCALE=2;
const stone={wall:'#c6c4b7',shade:'#9da499',roof:'#d9d6c7',trim:'#ebe7d8',glass:'#506670',kind:'grid'};
const tower={wall:'#d9ddd7',shade:'#b7c0bb',roof:'#d3d7d0',trim:'#ecede4',glass:'#536b75',kind:'tower'};
const institute={wall:'#c4bdab',shade:'#9e9d90',roof:'#c9c8b9',trim:'#e4decb',glass:'#40545b',kind:'bands'};
const brick={wall:'#a55b4d',shade:'#844a40',roof:'#c5beb0',trim:'#e4d9bf',glass:'#3d5158',kind:'brick'};
const rect=(x,y,w,h)=>[[[x,y],[x+w,y],[x+w,y+h],[x,y+h],[x,y]]];
function inside(polys,x,y){let yes=false;for(const ring of polys){let hit=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){const a=ring[i],b=ring[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])hit=!hit}if(hit)yes=!yes}return yes}
function outline(c,rings,z){c.beginPath();for(const ring of rings){ring.forEach(([x,y],i)=>i?c.lineTo(x,y-z):c.moveTo(x,y-z));c.closePath()}}
function wall(c,a,b,h,style,seed){
  if(Math.abs(a[0]-b[0])<.15)return;
  const mid=[(a[0]+b[0])/2,(a[1]+b[1])/2];
  c.save();c.beginPath();c.moveTo(...a);c.lineTo(...b);c.lineTo(b[0],b[1]-h);c.lineTo(a[0],a[1]-h);c.closePath();c.clip();
  c.fillStyle=style.wall;c.fillRect(Math.min(a[0],b[0])-1,Math.min(a[1],b[1])-h-1,Math.abs(a[0]-b[0])+2,h+Math.abs(a[1]-b[1])+2);
  const l=Math.min(a[0],b[0]),r=Math.max(a[0],b[0]),ground=x=>a[1]+(x-a[0])*(b[1]-a[1])/(b[0]-a[0]);
  const pitch=style.kind==='street'?3:style.kind==='tower'||style.kind==='c-tall'?5:6;
  for(let x=Math.ceil(l/pitch)*pitch;x<r;x+=pitch){
    const y=ground(x);
    for(let level=0;level<h/4-1;level++){
      const top=y-3.5-level*4;
      c.fillStyle=style.trim;c.fillRect(x-.35,top-.3,pitch-1.1,3);
      c.fillStyle=(Math.floor(x/pitch)+level+seed)%9===0?'#738a8c':style.glass;
      c.fillRect(x,top,style.kind==='bands'?pitch-.9:style.kind==='c-tall'?1.5:pitch-2,style.kind==='c-tall'?3:2.2);
      if(style.kind==='tower'){c.fillStyle='#91a5a5';c.fillRect(x,top,.5,2.2)}
    }
  }
  if(style.kind==='bands'){
    c.strokeStyle='#7f857e';c.lineWidth=.8;
    for(let z=4;z<h;z+=4){c.beginPath();c.moveTo(a[0],a[1]-z);c.lineTo(b[0],b[1]-z);c.stroke()}
  }
  if(style.kind==='street'){
    // Tall narrow window strips and staggered multi-storey recesses in the new photos.
    const span=r-l;
    for(const [u,z] of [[.30,.23],[.52,.48],[.33,.73]]){
      const x=l+span*u,y=ground(x)-h*z;
      c.fillStyle='#b1b8b0';c.fillRect(x,y-6,span*.19,9);
      c.fillStyle='#667a7d';for(let xx=x+.7;xx<x+span*.18;xx+=1.3)c.fillRect(xx,y-5.5,.5,8);
      c.fillStyle=style.trim;c.fillRect(x-1,y-7,span*.2,1.1);
    }
  }
  if(style.kind==='c-tall'){
    const x=l+(r-l)*.10,y=ground(x)-h+8;
    c.fillStyle='#3e5056';c.fillRect(x,y,(r-l)*.17,13);c.fillStyle='#738181';c.fillRect(x+1,y+1,(r-l)*.11,2);
  }
  if(style.kind==='brick'){
    c.fillStyle='#c0a48b';for(let y=Math.floor(mid[1]-h);y<mid[1];y+=1.3)for(let x=Math.floor(l);x<r;x+=3)c.fillRect(x+(Math.round(y)%2)*1.5,y,2.5,.18);
    c.strokeStyle=style.trim;c.lineWidth=1.6;
    for(let z=0;z<=h;z+=5){c.beginPath();c.moveTo(a[0],a[1]-z);c.lineTo(b[0],b[1]-z);c.stroke()}
  }
  c.restore();
  c.strokeStyle=style.shade;c.lineWidth=.6;c.beginPath();c.moveTo(...a);c.lineTo(...b);c.stroke();
}
function volume(c,rings,h,style,seed=0,decorate){
  const edges=[];for(const ring of rings)for(let i=1;i<ring.length;i++){const a=ring[i-1],b=ring[i];const x=(a[0]+b[0])/2,y=(a[1]+b[1])/2;if(!inside(rings,x,y+.3))edges.push([a,b])}
  edges.sort((a,b)=>(a[0][1]+a[1][1])-(b[0][1]+b[1][1]));
  for(const [a,b] of edges)wall(c,a,b,h,style,seed);
  c.save();outline(c,rings,h);c.fillStyle=style.roof;c.fill('evenodd');c.clip('evenodd');
  const pts=rings.flat(),l=Math.min(...pts.map(p=>p[0])),r=Math.max(...pts.map(p=>p[0])),t=Math.min(...pts.map(p=>p[1]))-h,b=Math.max(...pts.map(p=>p[1]))-h;
  c.fillStyle='#ffffff12';for(let y=Math.floor(t);y<b;y+=4)for(let x=Math.floor(l);x<r;x+=7)if((x*13+y*7+seed)%11<4)c.fillRect(x,y,2,.5);
  c.strokeStyle=style.shade;c.lineWidth=.6;for(let y=Math.ceil(t/12)*12;y<b;y+=12){c.beginPath();c.moveTo(l,y);c.lineTo(r,y);c.stroke()}
  if(decorate)decorate({c,l,r,t,b,h});
  c.restore();outline(c,rings,h);c.strokeStyle=style.trim;c.lineWidth=1.3;c.stroke();outline(c,rings,h-.8);c.strokeStyle=style.shade;c.lineWidth=.45;c.stroke();
}
function hvac(c,x,y,w=7,h=4){c.fillStyle='#8d9188';c.fillRect(x+.5,y+.6,w,h);c.fillStyle='#c9ccc2';c.fillRect(x,y,w,h);c.fillStyle='#6f7b77';for(let n=1;n<w-1;n+=1.2)c.fillRect(x+n,y+.7,.45,h-1.4)}
function garden({c,l,r,t,b}){c.fillStyle='#788868';for(let x=l+4;x<r-4;x+=12)for(let y=t+5;y<b-4;y+=11)if((Math.floor(x)+Math.floor(y))%3){c.fillRect(x,y,7,5);c.fillStyle='#9ba47b';c.fillRect(x+.8,y,5,1.2);c.fillStyle='#788868'}}
function lattice(c,f,h){
  const [l,t,r,b]=f.box;c.save();outline(c,f.polys[0],0);c.clip('evenodd');
  c.beginPath();c.rect(l,b-h,r-l,h);c.clip();c.fillStyle='#c4bba0';c.fillRect(l,b-h,r-l,h);
  c.strokeStyle='#736f5e';c.lineWidth=.6;
  for(let x=l-h;x<r+h;x+=5){c.beginPath();c.moveTo(x,b);c.lineTo(x+h,b-h);c.moveTo(x,b-h);c.lineTo(x+h,b);c.stroke()}
  c.restore();
}
function barrelRoof(c,rings,wallHeight,rise){
  volume(c,rings,wallHeight,brick,3);
  const pts=rings.flat(),l=Math.min(...pts.map(p=>p[0])),r=Math.max(...pts.map(p=>p[0])),t=Math.min(...pts.map(p=>p[1])),b=Math.max(...pts.map(p=>p[1]));
  const z=x=>wallHeight+rise*Math.sqrt(Math.max(0,1-Math.pow((x-l)/(r-l)*2-1,2)));
  // The long axis follows the east–west wing (vertical on this rotated map).
  // Elevation varies ACROSS that wing: an actual arched end, not a flat shaded slab.
  for(let x=l;x<r;x+=.5){const q=(x-l)/(r-l);c.fillStyle=q<.17?'#becac2':q<.36?'#d6dfd4':q<.74?'#f0eee1':'#dce3d6';c.fillRect(x,t-z(x),.55,b-t)}
  c.beginPath();c.moveTo(l,b-wallHeight);for(let x=l;x<=r;x+=.5)c.lineTo(x,b-z(x));c.lineTo(r,b-wallHeight);c.closePath();c.fillStyle='#e8e9dc';c.fill();c.strokeStyle='#adbcb3';c.lineWidth=.65;c.stroke();
  for(let y=t+9;y<b-3;y+=12){c.beginPath();for(let x=l;x<=r;x+=.5){if(x===l)c.moveTo(x,y-z(x));else c.lineTo(x,y-z(x))}c.stroke()}
  c.strokeStyle='#f5f1e3';c.lineWidth=.8;for(const x of [l,r]){c.beginPath();c.moveTo(x,t-z(x));c.lineTo(x,b-z(x));c.stroke()}
}
function paint(c,f,def){
  const [l,t,r,b]=f.box,w=r-l,d=b-t;
  if(def.key==='street'||def.key==='c'){
    for(const rings of f.polys)volume(c,rings,13,stone,1,garden);
    if(def.key==='c')lattice(c,f,13);
    const parts=def.key==='street'?[[.055,.10,.36,.34,128],[.66,.50,.285,.34,76]]:[[.08,.06,.63,.26,66],[.08,.72,.82,.22,104]];
    for(const [x,y,a,z,h] of parts){const ring=rect(l+x*w,t+y*d,w*a,d*z),kind=def.key==='street'?'street':h>80?'c-tall':'grid';volume(c,ring,h,{...tower,kind},3,({c,l,r,t,b})=>{hvac(c,l+3,t+3,Math.min(10,r-l-6),5);c.fillStyle='#bfc7bd';c.fillRect(l+2,b-3,r-l-4,1);c.strokeStyle='#e7e8db';c.lineWidth=1;for(let y=t+9;y<b-4;y+=14){c.beginPath();c.moveTo(l+2,y);c.lineTo(r-2,y);c.stroke()}});
      c.fillStyle='#4e5d62';c.fillRect(l+x*w+w*a*.14,t+y*d+d*z-h+2,w*a*.18,7);
    }
  }else if(def.key==='tjad'){
    for(const rings of f.polys)volume(c,rings,17,institute,4,({c,l,r,t,b})=>{for(let y=t+9;y<b-8;y+=36)hvac(c,l+6,y,8,5)});
    // Narrow raised upper bar along the long eastern wing, retaining both courtyards.
    volume(c,rect(l+w*.70,t+d*.045,w*.27,d*.91),31,{...institute,wall:'#66736f',roof:'#63736e',trim:'#d6d3c3',kind:'tower'},6,({c,l,r,t,b})=>{c.fillStyle='#bfc4b6';for(let y=t+3;y<b-2;y+=8)c.fillRect(l+1,y,r-l-2,1.1);c.fillStyle='#495d5b';c.fillRect(l+2,t+2,1,b-t-4)});
    // Photo's curved copper entrance, drawn on the footprint's southern edge.
    c.save();outline(c,f.polys[0],0);c.clip('evenodd');c.fillStyle='#b47d57';c.beginPath();c.ellipse(l+w*.61,b-4,w*.35,8,0,0,Math.PI*2);c.fill();c.fillStyle='#946847';for(let x=l+w*.3;x<r;x+=4)c.fillRect(x,b-8,1,11);c.restore();
  }else{
    for(const rings of f.polys)volume(c,rings,11,brick,2);
    // North–south wing: the square, grey, flat-roof Innovation Field workshop.
    volume(c,rect(l+w*.015,t+d*.72,w*.97,d*.23),15,{...stone,wall:'#b8bcb1',roof:'#bbc5bb',glass:'#3f555c',kind:'bands'},2,({c,l,r,t,b})=>{hvac(c,l+8,t+5,10,4);c.strokeStyle='#89998e';c.lineWidth=.65;for(let x=l+18;x<r;x+=22){c.beginPath();c.moveTo(x,t+1);c.lineTo(x,b-1);c.stroke()}});
    // East–west wing: white arched-roof hall, swapped to the correct arm.
    barrelRoof(c,rect(l+w*.065,t+d*.05,w*.29,d*.69),14,13);
    // Glazed connection between the two factory wings.
    volume(c,rect(l+w*.36,t+d*.70,w*.12,d*.18),21,{...stone,wall:'#52686d',roof:'#9caeac',trim:'#d8dcca',glass:'#3a555e',kind:'bands'},4);
  }
}
function gatewayFor(f,features){
  const route=features.find(f=>f.tunnel==='building_passage'&&String(f.osm_id)==='1510454775')?.coords;
  const y=f.box[3];let x=-1176;
  if(route)for(let i=1;i<route.length;i++){const a=route[i-1],b=route[i];if(y>=Math.min(a[1],b[1])&&y<=Math.max(a[1],b[1])){x=a[0]+(b[0]-a[0])*(y-a[1])/(b[1]-a[1]);break}}
  return{x,y,width:18,roofStart:y-84,route};
}
function paintGateway(c,g){
  const{x,y,width,roofStart}=g,left=x-width/2,right=x+width/2;
  // Actual transparent cut through the architectural image: actors remain visible
  // beneath it. The road layer supplies the pavement, not an opaque painted floor.
  c.save();c.globalCompositeOperation='destination-out';c.fillRect(left,roofStart,width,y-roofStart+3);c.restore();
  c.fillStyle='#a9c5bb30';c.fillRect(left,roofStart,width,y-roofStart-15);
  c.strokeStyle='#40585499';c.lineWidth=.65;
  for(let yy=roofStart;yy<y-15;yy+=9){c.beginPath();c.moveTo(left,yy);c.lineTo(right,yy);c.moveTo(left,yy);c.lineTo(right,yy+9);c.stroke()}
  for(const xx of [left-.7,right+.7]){c.fillStyle='#a9664c';c.fillRect(xx-.7,y-16,1.4,16);c.fillStyle='#d7d6c4';c.fillRect(xx-1,y-17,2,1.3)}
  c.fillStyle='#596a64';c.fillRect(left-2,y-18,width+4,2.4);c.fillStyle='#d1d7ca';c.fillRect(left-2,y-19,width+4,1);
}
export function createEastBuildings(features){
  const items=EAST_BUILDINGS.map(def=>{
    const f=features.find(f=>String(f.osm_id)===def.id);if(!f)return null;
    const pad=3,x0=Math.floor(f.box[0]-pad),y0=Math.floor(f.box[1]-def.height-pad),w=Math.ceil(f.box[2]-x0+pad),h=Math.ceil(f.box[3]-y0+pad);
    const canvas=document.createElement('canvas');canvas.width=w*SCALE;canvas.height=h*SCALE;const c=canvas.getContext('2d');c.scale(SCALE,SCALE);c.translate(-x0,-y0);paint(c,f,def);
    const gateway=def.key==='design'?gatewayFor(f,features):null;if(gateway)paintGateway(c,gateway);
    return{...def,f,canvas,x0,y0,w,h,gateway,depth:f.box[3],box:[x0,y0,x0+w,y0+h]};
  }).filter(Boolean);
  let enabled=true;
  return{items,has:id=>enabled&&items.some(b=>b.id===String(id)),setEnabled:value=>enabled=value,get enabled(){return enabled},
    stats:()=>({enabled,count:items.length,style:'existing footprint extrusion',collision:'existing footprints; Fuxin passage is traversable',buildings:items.map(({id,name,reference,box,gateway})=>({id,name,reference,box,gateway}))}),
    objects(view){if(!enabled)return[];const visible=items.filter(b=>b.box[0]<view.x+view.w&&b.box[2]>view.x&&b.box[1]<view.y+view.h&&b.box[3]>view.y);return[...visible.filter(b=>b.gateway).map(b=>({y:-Infinity,draw(c){const g=b.gateway;c.save();c.strokeStyle='#c9ad58';c.lineWidth=.45;c.setLineDash([3,3]);c.beginPath();c.moveTo(g.x,g.roofStart);c.lineTo(g.x,g.y+12);c.stroke();c.restore()}})),...visible.map(b=>({y:b.depth,draw(c){c.drawImage(b.canvas,b.x0,b.y0,b.w,b.h)}}))]}
  };
}
