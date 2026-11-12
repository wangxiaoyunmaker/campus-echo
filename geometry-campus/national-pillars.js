// New Tongji-specific pixel geometry, based on the user's 182807 photo.
// NOT the JLU gate pillar or statue. Lettering omitted instead of invented glyphs.
export function makeNationalPillars({features,project}){
 const ids=['13676961269','13676961270'],points=features.filter(f=>ids.includes(String(f.properties?.osm_id))&&f.geometry.type==='Point').map(f=>({id:String(f.properties.osm_id),p:project(f.geometry.coordinates)}));
 const im=document.createElement('canvas');im.width=72;im.height=168;const c=im.getContext('2d');c.imageSmoothingEnabled=false;
 const r=(x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h)},poly=(pts,col)=>{c.fillStyle=col;c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill()};
 // Stepped stone foot with a shallow visible top, slender square shaft, capital/black plaque.
 poly([[8,158],[54,158],[65,163],[19,163]],'#cab083');r(8,163,57,4,'#aa885f');r(19,153,36,9,'#c4a171');r(18,150,36,4,'#ddc08a');r(24,145,25,6,'#d4ae75');r(28,56,15,91,'#d4aa6b');r(28,56,3,88,'#e4c38b');r(41,56,5,91,'#a78355');r(25,57,21,4,'#b58f5b');
 r(18,44,36,12,'#dabc87');r(18,54,36,4,'#a68458');r(21,47,30,6,'#4b493e');r(22,48,28,1,'#797157');r(53,44,3,14,'#8e7353');
 // Dark layered pagoda-like finial from photo, not a generic lamp or building dome.
 poly([[20,43],[24,35],[48,35],[53,43]],'#454237');r(23,36,26,4,'#5d5947');r(25,31,22,5,'#393d32');r(27,27,18,5,'#555543');r(25,25,22,3,'#343a30');r(29,20,14,6,'#4d5140');r(27,18,18,3,'#333b30');r(31,14,10,5,'#454c3c');poly([[31,5],[39,5],[43,9],[42,14],[38,17],[32,16],[29,12],[29,8]],'#3b4435');r(31,6,5,2,'#5b6149');
 for(const [x,y] of [[30,81],[36,113],[31,136],[23,153],[49,160]])r(x,y,2,1,'#bd955f');
 return{points,source:'Tongji photo-informed custom pixel geometry; no surveyed height/lettering',objects(view){return points.filter(({p:[x,y]})=>x>view.x-12&&x<view.x+view.w+12&&y>view.y&&y<view.y+view.h+30).map(({p:[x,y]})=>({y,draw(c){c.drawImage(im,x-36/6,y-162/6,72/6,168/6)}}))}};
}
