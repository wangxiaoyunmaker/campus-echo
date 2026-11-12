import {addOriginalGrassGarnish} from '../assets/jlu-autumn-study/original-grass-garnish.mjs';
import {grassPixel} from '../assets/jlu-main-water-grass/main-water-grass.mjs';
import {applyOriginalSeasonPaint} from '../assets/jlu-interactive-autumn/original-season-ground.mjs';
// Host color adaptation requested by user: yellow-green ground only, retain original leaf colors.
const mutedAutumnGrass=new Map();{
 const px=new Uint32Array(4096);for(let i=0;i<px.length;i++)px[i]=grassPixel(i%64,Math.floor(i/64),false);
 applyOriginalSeasonPaint({mat:new Uint8Array(4096),W:64,pad:0,x0:0,y0:0,turn:{xx:1,xy:0,x0:0,yx:0,yy:1,y0:0}},{w:64,h:64,px},'autumn');
 for(const col of new Set(px)){const r=col&255,g=(col>>>8)&255,b=(col>>>16)&255,L=.2126*r+.7152*g+.0722*b;mutedAutumnGrass.set(col,(0xff000000|(Math.round(L*.42+20)<<16)|(Math.round(Math.min(255,L*1.02+20))<<8)|Math.round(L*.94+12))>>>0)}
}
// Shared autumn grass base across woodland edges. Original mat4 litter and tree shadows retained; summer keeps original woods base.
export function applyWoodlandAutumn(pixels,w,h,tx,ty,res,regions,contains,canPaint=null,season='autumn'){
 const mat=new Uint8Array(w*h),before=pixels.slice();let selected=0;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const wx=tx+x/res,wy=ty+y/res,wood=regions.some(f=>wx>=f.box[0]&&wx<=f.box[2]&&wy>=f.box[1]&&wy<=f.box[3]&&contains(f,wx,wy));if(canPaint?canPaint(x,y):wood){mat[y*w+x]=wood?4:3;pixels[y*w+x]=grassPixel(Math.floor(wx*6),Math.floor(wy*6),season==='autumn'?false:wood);selected++}}
 if(!selected)return 0;
 if(res===6){const x0=tx*6,y0=ty*6;addOriginalGrassGarnish({mat,W:w,H:h,pad:0,x0,y0,turn:{xx:1,xy:0,x0:0,yx:0,yy:1,y0:0},wbox:[x0,y0,x0+w-1,y0+h-1]},{w,h,px:pixels})}
 // No rotation of finished textures: host world already axis-aligned. Conversion keeps original hash in native coordinates.
 applyOriginalSeasonPaint({mat,W:w,pad:0,x0:0,y0:0,turn:{xx:6/res,xy:0,x0:tx*6,yx:0,yy:6/res,y0:ty*6}},{w,h,px:pixels},season);
 let changed=0;for(let i=0;i<pixels.length;i++){if(!mat[i])pixels[i]=before[i];else {if(season==='autumn'&&mutedAutumnGrass.has(pixels[i]))pixels[i]=mutedAutumnGrass.get(pixels[i]);if(pixels[i]!==before[i])changed++}}return changed;
}

import {renderOriginalTreeShadows} from '../assets/jlu-autumn-study/original-tree-shadows.mjs';
export function drawStudyTreeShadows(c,tx,ty,size,items,res=6){
 const trees=items.filter(p=>['oak','tree','poplar','spruce','willow'].includes(p.seasonKind||p.originalKind)&&p.x>=tx-60&&p.x<=tx+size+60&&p.y>=ty-60&&p.y<=ty+size+60).map(p=>({kind:p.seasonKind||p.originalKind,x:Math.round(p.x*6),y:Math.round(p.y*6)}));
 if(!trees.length)return;const m=renderOriginalTreeShadows({trees,chunkX:tx*6,chunkY:ty*6,size:size*6,scale:Math.max(1,6/res),sun:{x:-1,y:.65},winter:false});if(!m)return;
 const can=document.createElement('canvas');can.width=m.w;can.height=m.h;const ctx=can.getContext('2d'),im=ctx.createImageData(m.w,m.h);for(let i=0;i<m.data.length;i++){im.data[i*4]=42;im.data[i*4+1]=53;im.data[i*4+2]=36;im.data[i*4+3]=Math.round(m.data[i]*.26)}ctx.putImageData(im,0,0);c.drawImage(can,m.x/6,m.y/6,m.w*m.scale/6,m.h*m.scale/6);
}
