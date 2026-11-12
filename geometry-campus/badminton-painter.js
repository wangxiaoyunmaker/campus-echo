import {originalCourtTexture} from '../assets/jlu-sports-complete/output/main-sports-renderer.mjs';
// New minimal badminton line adapter: JLU has no outdoor badminton surface painter.
// Dimensions: doubles 13.4x6.1m, singles width5.18m, short service1.98m, doubles back service0.76m.
const rgba=h=>{const n=parseInt(h.slice(1),16);return(0xff000000|(n&255)<<16|(n&65280)|(n>>>16))>>>0},blue=rgba('#384b7c'),white=rgba('#c8d2cf'),green=rgba('#526f63');
export function badmintonPainter(frame){const k=Math.min(1.5,(frame.len-20)/(13.4*16),(frame.wid-20)/(6.1*16)),hu=6.7*16*k,hv=3.05*16*k,single=2.59*16*k,short=1.98*16*k,back=(6.7-.76)*16*k;return{frame,pixel(u,v,x,y){const a=Math.abs(u),b=Math.abs(v);if(a>hu+12||b>hv+12)return originalCourtTexture('green',x,y);if(a<=hu+.7&&b<=hv+.7&&(Math.abs(a-hu)<1||Math.abs(b-hv)<1||Math.abs(b-single)<1||Math.abs(a-short)<1||Math.abs(a-back)<1||b<1&&a>=short))return white;return originalCourtTexture('blue',x,y)}}}
