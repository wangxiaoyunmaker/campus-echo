// Hold-to-walk controls. Every physical press owns one source; interruptions stop it.
export function mountTouchWalk(pad, walk, win=window, doc=document) {
  const active=new Map(), keyboard=new Map(), held=new Set();
  function sync(){
    const next=new Set([...active.values()].map(x=>x.key).concat([...keyboard.values()]));
    for(const key of held)if(!next.has(key))walk(key,false);
    for(const key of next)if(!held.has(key))walk(key,true);
    held.clear();for(const key of next)held.add(key);
    for(const b of pad.children)b.classList.toggle('held',next.has(b.dataset.key));
  }
  function release(id){const press=active.get(id);if(!press)return;active.delete(id);sync();try{if(press.button.hasPointerCapture(id))press.button.releasePointerCapture(id)}catch{}}
  function stop(){const ids=[...active.keys()];keyboard.clear();for(const id of ids)release(id);sync()}
  const inside=(b,e)=>{const r=b.getBoundingClientRect();return e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom};
  for(const b of pad.children){
    b.addEventListener('pointerdown',e=>{
      if(e.pointerType==='mouse'&&e.button!==0)return;
      e.preventDefault();release(e.pointerId);active.set(e.pointerId,{key:b.dataset.key,button:b});
      try{b.setPointerCapture(e.pointerId)}catch{} // Window listeners guarantee release even if capture fails.
      sync();
    });
    b.addEventListener('pointermove',e=>{if(active.has(e.pointerId)&&(!inside(b,e)||(e.pointerType==='mouse'&&!e.buttons)))release(e.pointerId)});
    b.addEventListener('pointerleave',e=>release(e.pointerId));
    b.addEventListener('lostpointercapture',e=>release(e.pointerId));
    b.addEventListener('keydown',e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();e.stopPropagation();keyboard.set(b,b.dataset.key);sync()}});
    b.addEventListener('keyup',e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();e.stopPropagation();keyboard.delete(b);sync()}});
    b.addEventListener('blur',()=>{keyboard.delete(b);sync()});
  }
  for(const type of ['pointerup','pointercancel'])win.addEventListener(type,e=>release(e.pointerId),true);
  win.addEventListener('touchend',e=>{if(!e.touches.length)stop()},true);
  win.addEventListener('touchcancel',stop,true);
  win.addEventListener('blur',stop);
  win.addEventListener('pagehide',stop);
  doc.addEventListener('visibilitychange',()=>{if(doc.hidden)stop()});
  pad.addEventListener('contextmenu',e=>{e.preventDefault();stop()});
  pad.addEventListener('selectstart',e=>e.preventDefault());
  pad.addEventListener('dragstart',e=>e.preventDefault());
  return {stop};
}
