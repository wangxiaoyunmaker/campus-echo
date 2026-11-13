import{b as F,_ as tt,p as I}from "./vendor/kit-B8QzrSg5.js";import{c as O}from "./vendor/raster-_AffYBv6.js";
const eU=O(tt.paver),$H=O(tt.herring),iU=O(F.stone);
function TU(e,t,n,r,i){let a=e+.5-n,o=t+.5-r,s=a*a+o*o;if(s>i*i)return 0;let c=Math.sqrt(s);if(c>i-1)return eU[2];if(c>i-4)return c>i-2?eU[6]:eU[5];if(c>i-5)return eU[2];if(c<9)return c>8?eU[2]:c>6?eU[5]:c<3?iU[3]:iU[4];let l=Math.floor((c-1)/8),u=(c-1)%8;if(u<1)return $H[2];if(l===Math.floor((i-1)/16))return u<2||u>=7?eU[4]:eU[5];let d=l*8+5,f=Math.max(8,Math.round(2*Math.PI*d/12)),p=(Math.atan2(o,a)+Math.PI)/(2*Math.PI)*f,m=Math.floor(p),h=l&1?4:I(l,m,57)<.2?5:6;return(p-m)*(2*Math.PI*c/f)<1?$H[2]:u===7?$H[h+1]:$H[h]}
export {TU as roundPlazaPixel};
