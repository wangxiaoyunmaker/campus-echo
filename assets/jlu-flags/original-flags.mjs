import {T} from './vendor/raster-_AffYBv6.js';
// Original scene-pose seed encoding. No renderer/image edits.
export function renderOriginalFlags({angle=0,facing='down'}={}){
 const degrees=((Math.round(angle)%360)+360)%360;
 const seed=(degrees*4000+2000)*4000+2000;
 return T['dingxin-flags'].draw(seed,facing,'summer');
}

import {singleNationalFlagGeometry} from './vendor/raster-_AffYBv6.js';
export function renderSingleNationalFlag({angle=0,facing='down'}={}){const degrees=((Math.round(angle)%360)+360)%360;const pose=(degrees*4000+2000)*4000+2000;const r=singleNationalFlagGeometry(pose).render(facing,true);return {bm:r.bm,ax:r.ax,ay:r.ay+5};}
