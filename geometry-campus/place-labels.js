// Host UI overlay, not JLU artwork. Names and positions derive from existing data only.
export function createPlaceLabels(data,features,project){
 const places=[];
 for(let i=0;i<data.features.length;i++){
  const raw=data.features[i],p=raw.properties,f=features[i]; if(!p.name||p.railway||p.public_transport)continue;
  let point,type;
  if(raw.geometry.type==='Point'){point=project(raw.geometry.coordinates);type='place'}
  else if(p.building&&f.polys.length){point=[(f.box[0]+f.box[2])/2,f.box[3]];type='building'}
  else if(p.highway&&f.coords.length){const seg=f.coords.slice(1).map((b,i)=>({a:f.coords[i],b,d:Math.hypot(b[0]-f.coords[i][0],b[1]-f.coords[i][1])})).sort((a,b)=>b.d-a.d)[0];point=[(seg.a[0]+seg.b[0])/2,(seg.a[1]+seg.b[1])/2];type='road'}
  else continue;
  places.push({id:String(p.osm_id),name:String(p.osm_id)==='183383477'?'同创楼（原校史馆）':p.name,point,type,priority:p.memorial||p.artwork_type?0:p.building?1:2});
 }
 places.unshift({id:'south-gate-existing',name:'同济大学南门 · 爱校路',point:project([121.4957979,31.2825946]),type:'entry',priority:-1});
 places.unshift({id:'library-entry-photo',name:'图书馆入口',point:project([121.4998169,31.2853143]),type:'entry',priority:-1});
 let enabled=true,last=[];
 return {places,get enabled(){return enabled},toggle(){enabled=!enabled},get visible(){return last},draw(c,camera,zoom,w,h){last=[];if(!enabled)return;c.save();c.setTransform(1,0,0,1,0,0);c.font='12px -apple-system, sans-serif';c.textAlign='center';c.textBaseline='middle';const used=[],names=new Set();
 for(const p of [...places].sort((a,b)=>a.priority-b.priority)){
 if(zoom<1&&['2625540206','1937615020','13676961269','13676961270'].includes(p.id))continue;if(p.type==='entry'&&zoom<4)continue;if(zoom<.45&&p.priority>0)continue;if(zoom<1&&p.type==='place'&&p.priority>0)continue;
 const x=(p.point[0]-camera.x)*zoom+w/2,y=(p.point[1]-camera.y)*zoom+h/2;
 if(x<10||x>w-10||y<95||y>h-32||names.has(p.name))continue;
 const text=p.name.length>20?p.name.slice(0,19)+'…':p.name,tw=c.measureText(text).width+12,b=[x-tw/2,y-11,x+tw/2,y+11];
 if(used.some(a=>b[0]<a[2]+8&&b[2]>a[0]-8&&b[1]<a[3]+7&&b[3]>a[1]-7))continue;
 c.fillStyle=p.type==='road'?'#f2eddfc9':'#243a35df';c.fillRect(b[0],b[1],tw,22);c.fillStyle=p.type==='road'?'#3b5148':'#fff4d6';c.fillText(text,x,y);used.push(b);names.add(p.name);last.push(p.id);
 }c.restore();}
 };
}
