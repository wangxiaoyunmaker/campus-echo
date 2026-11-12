import{applyOriginalSeasonPaint}from './original-season-ground.mjs';
// Host glue only; original oK unchanged. source pixels must be ORIGINAL base
// palette (spring), never pre-tinted summer/custom CSS green.
export function applySeasonToChunk({pixels,width,height,nativeX=0,nativeY=0,materialAt,season='autumn',turn={xx:1,xy:0,yx:0,yy:1,x0:0,y0:0}}){
 const px=Uint32Array.from(pixels),mat=new Uint8Array(width*height);
 for(let y=0;y<height;y++)for(let x=0;x<width;x++)mat[y*width+x]=materialAt(nativeX+x,nativeY+y);
 applyOriginalSeasonPaint({mat,W:width,H:height,pad:0,x0:nativeX,y0:nativeY,turn},{w:width,h:height,px},season);
 return px;
}
