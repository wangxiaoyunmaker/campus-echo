import {b as F,_ as tt,A as E,p as I,h as nt} from "./vendor/kit-B8QzrSg5.js";
import {c as O} from "./vendor/raster-_AffYBv6.js";
const AU=O(F.soil);
var BU=O(tt.cover),VU=[BU[3],BU[0],BU[1],BU[3],BU[5],BU[6]],HU={".":0,s:1,d:2,m:3,l:4,L:5,q:6,p:7,h:8},UU=e=>Uint8Array.from(e.join(``),e=>HU[e]),WU=UU([`..lLLl..`,`.lLllmm.`,`lLllmmmd`,`llmmmmdd`,`mmmmmddd`,`.mddddd.`,`..ssss..`]),GU=(e,t,n,r)=>[E(e[t]),E(e[n]),E(e[r])],KU=GU(F.red,0,1,3),qU=GU(F.yellow,0,1,2),JU=GU(F.blossom,1,2,4),YU=GU(F.white,0,1,2),XU=GU(F.lilac,1,2,3),ZU=[[KU],[qU],[JU],[KU,qU],[XU,YU],[JU,YU],[qU,XU]],QU=[F.leaf,F.leaf,F.gold,F.redleaf].map(e=>[E(e[1]),E(e[2]),E(e[3]),E(e[4])]);function $U(e,t){return 1+Math.floor(I(e,t,69)*ZU.length*QU.length)}var eW=9,tW=[UU([`.l..`,`lml.`,`.d..`,`....`]),UU([`....`,`..l.`,`.lml`,`..d.`]),UU([`..l.`,`.lm.`,`.d..`,`...l`]),UU([`....`,`l...`,`mlL.`,`d.d.`])],nW=UU([`.h....`,`hqp...`,`.p....`,`.d....`,`......`]);function rW(e,t,n,r,i){let a=n-1,o=Math.floor(t/7),s=(o&1)<<2,c=e+s;if(r((c&-8)-s+4,o*7+3)<=eW){let e=WU[(t-o*7)*8+(c&7)];return e===0?AU[1]:e===1?AU[0]:QU[a%QU.length][e-2]}let l=Math.floor(t/5),u=e+(l&1)*3,d=Math.floor(u/6),f=i(d*6-(l&1)*3+1,l*5+1),p=0;if(I(d,l,71)<(f-.36)*3.2&&(p=nW[(t-l*5)*6+u-d*6]),p===0&&(p=tW[Math.floor(I(e>>2,t>>2,72)*4)][(t&3)<<2|e&3]),p<=5)return VU[p];let m=ZU[Math.floor(a/QU.length)];return m[f>.56?0:m.length-1][p-6]}
// Original rW renderer; wrapper and API below are new adapters.
export function createOriginalGroundcover({flower=0,edgeLeaf=0,edgeAt=()=>99,bloom}={}) {
 if(!Number.isInteger(flower)||flower<0||flower>6)throw Error('flower 0..6');
 if(!Number.isInteger(edgeLeaf)||edgeLeaf<0||edgeLeaf>3)throw Error('edgeLeaf 0..3');
 const tag=1+flower*4+edgeLeaf;
 const noise=bloom||nt(91,28);
 return (nativeX,nativeY)=>rW(Math.floor(nativeX),Math.floor(nativeY),tag,edgeAt,noise)>>>0;
}
export {rW as originalGroundcoverPixel};
