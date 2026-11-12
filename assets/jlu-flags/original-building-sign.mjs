import {k as u,b as l,O as Bitmap,v as outline} from './vendor/kit-B8QzrSg5.js';
function B(e,t,n,r){let i=u(t,l.yellow[2]),a=i.w+12,o=i.h+8,s=Math.floor(n-a/2);e.rect(s,r,a,o,l.navy[1]),e.rect(s+1,r+1,a-2,o-2,l.navy[2]),e.row(r+1,s+1,s+a-2,l.navy[3]),e.row(r+o-2,s+1,s+a-2,l.navy[1]),e.draw(u(t,l.navy[0]),s+6,r+5),e.draw(i,s+6,r+4)}
export {B as drawOriginalBuildingSign};
export function renderOriginalBuildingSign(text){const t=u(text,l.yellow[2]),bm=new Bitmap(t.w+12,t.h+8); B(bm,text,bm.w/2,0);return bm.framed(outline);}
