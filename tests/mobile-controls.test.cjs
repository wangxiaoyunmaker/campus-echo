const assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
const source=fs.readFileSync('geometry-campus/touch-walk.js','utf8');
const {mountTouchWalk}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const target=()=>({events:{},addEventListener(n,f){(this.events[n]??=[]).push(f)},emit(n,extra={}){let prevented=false;const e={pointerId:1,pointerType:'touch',button:0,buttons:1,clientX:10,clientY:10,preventDefault(){prevented=true},stopPropagation(){},...extra};for(const f of this.events[n]||[])f(e);return prevented}});
const win=target(),doc=target(),pad=target();const held=new Set();
pad.children=['w','a','s','d'].map(key=>Object.assign(target(),{dataset:{key},classList:{toggle(){}},getBoundingClientRect:()=>({left:0,right:44,top:0,bottom:44}),setPointerCapture(){},hasPointerCapture:()=>false,releasePointerCapture(){}}));
const ctl=mountTouchWalk(pad,(key,on)=>on?held.add(key):held.delete(key),win,doc),b=pad.children[0];
for(const name of ['pointerup','pointercancel']){b.emit('pointerdown');assert(held.has('w'));win.emit(name);assert.equal(held.size,0,name)}
for(const name of ['lostpointercapture','pointerleave']){b.emit('pointerdown');b.emit(name);assert.equal(held.size,0,name)}
b.emit('pointerdown');b.emit('pointermove',{clientX:50});assert.equal(held.size,0,'slide outside');
b.emit('pointerdown',{pointerType:'mouse',button:2});assert.equal(held.size,0,'right click ignored');
b.emit('pointerdown',{pointerType:'mouse'});b.emit('pointermove',{pointerType:'mouse',buttons:0});assert.equal(held.size,0,'lost mouse button');
// Two fingers on the same direction: one release must not cancel the other.
b.emit('pointerdown',{pointerId:1});b.emit('pointerdown',{pointerId:2});win.emit('pointerup',{pointerId:1});assert(held.has('w'));win.emit('pointercancel',{pointerId:2});assert.equal(held.size,0);
b.emit('pointerdown',{pointerId:1});pad.children[3].emit('pointerdown',{pointerId:2});assert.equal(held.size,2);win.emit('pointerup',{pointerId:1});assert.deepEqual([...held],['d']);ctl.stop();assert.equal(held.size,0);
for(const name of ['blur','pagehide','touchcancel']){b.emit('pointerdown');win.emit(name);assert.equal(held.size,0,name)}
b.emit('pointerdown');win.emit('touchend',{touches:[]});assert.equal(held.size,0);
b.emit('pointerdown');doc.hidden=true;doc.emit('visibilitychange');assert.equal(held.size,0);doc.hidden=false;
b.emit('pointerdown');assert(pad.emit('contextmenu'));assert.equal(held.size,0);assert(pad.emit('selectstart'));assert(pad.emit('dragstart'));
b.emit('keydown',{key:' '});assert(held.has('w'));b.emit('keyup',{key:' '});assert.equal(held.size,0);b.emit('keydown',{key:'Enter'});b.emit('blur');assert.equal(held.size,0);
b.setPointerCapture=()=>{throw Error('capture unavailable')};b.emit('pointerdown');assert(held.has('w'));win.emit('pointerup');assert.equal(held.size,0,'release without capture');
console.log('mobile-controls: lifecycle, multiple pointers, capture fallback, native-callout guard and keyboard activation passed');
})().catch(e=>{console.error(e);process.exitCode=1});
