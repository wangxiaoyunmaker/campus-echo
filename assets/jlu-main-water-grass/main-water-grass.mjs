const sK=[-5742269, -4820667, -3964345, -3108278, -2710701, -2378913, -1981585];
const cK=[-9015437, -8619392, -8157554, -7695716, -7233622, -6771784, -5982012, -5126704];
const lK=[-11912392, -9741738, -7044740, -4806493, -2370865];
const uK=[-10265761, -9935252, -9539206, -9142904, -8746602, -8350300, -7626065, -6770757];
const dK=[-12899287, -10794683, -8097942, -5925488, -3620933];
const fK=-1182746;
const pK=-2499154;
const mK=-5939906;
const hK=-6255093;
const gK=-4677879;
const _K=[-7041905, -6645861, -6315352, -5919308, -5523264, -5127219, -4403496, -3745053];
const Q=[-11832058, -11829230, -11826904, -11824326, -11952822, -12146853, -12472212, -12077183, -11551084, -10959451, -10367562];
const EU=[-13081561, -12882641, -12749000, -12681151, -12744373, -12807339, -12215706, -11623818, -10966394, -10308972];
function I(e,t,n){let r=Math.imul(e,374761393)+Math.imul(t,668265263)+Math.imul(n,1442695041)|0;r=Math.imul(r^r>>>13,1274126177);return ((r^r>>>16)>>>0)/4294967296}
function noise(seed,scale){const smooth=e=>e*e*(3-2*e);return(x,y)=>{let u=x/scale,v=y/scale,a=Math.floor(u),b=Math.floor(v),s=smooth(u-a),t=smooth(v-b);return (I(a,b,seed)*(1-s)+I(a+1,b,seed)*s)*(1-t)+(I(a,b+1,seed)*(1-s)+I(a+1,b+1,seed)*s)*t}}
const aU=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5].map(e=>(e+.5)/16),oU=(e,t)=>aU[(t&3)<<2|e&3];
var yK=NaN,bK=0,xK=0,SK=0,CK=NaN,wK=NaN,TK=1,EK=0,DK=0,OK=0,kK=0;function AK(e,t,n){t!==yK&&(yK=t,bK=Math.floor(t/6),xK=t-bK*6,SK=(bK&1)*8);let r=e+SK,i=r>>4;if(i!==CK||bK!==wK){CK=i,wK=bK,TK=I(i,bK,83);let e=TK*16777216|0;EK=3+(e&3),DK=(e>>2&15)%(16-EK),OK=e>>6&3,kK=e>>8&1}if(TK>=n)return 0;let a=xK-OK;if(a!==0&&a!==1)return 0;let o=(r&15)-DK;return o<0||o>=EK?0:a===0?o===1&&EK>4?2:1:kK&&o>0&&o<EK-1?-1:0}var jK=NaN,MK=NaN,NK=0;function PK(e,t,n,r,i,a,o,s){if(a){if(e===0)return _K[2];if(e===1)return _K[7];if(e===2)return _K[6];if(t===3)return _K[3];if(t===4)return mK;if(e===3)return pK;let i=AK(n,r,.3),a=e<=6?5:4;return sK[i>0?Math.min(6,a+1):i<0?a-1:a]}if(e>=20){if(r%3==0){let e=i(o,s);if(e>.5&&I(n>>3,r,76)<(e-.5)*1.6&&(n&7)<6+(r*7>>2&3))return sK[2]}return sK[3+AK(n,r,.12)]}(o>>3!==jK||s>>3!==MK)&&(jK=o>>3,MK=s>>3,NK=6+Math.floor(I(jK,MK,77)*4));let c=NK;if(e>=c+3&&t>c+7)return FK(e-c,e,n,r,i,o,s);if(e<c||t<=c+2){let i=r>>2,a=n+(i&1)*2,o=Math.floor(a/5),s=a-o*5,l=r&3;if(t>c&&t<=c+2)return l===3||s===4?cK[1]:cK[3];if(e===c-1||s===4||l===3)return e>=c-2?uK[1]:cK[1];let u=I(o,i,78),d=e>=c-3,f=u<.5?d?uK:cK:d?dK:lK;return f===cK||f===uK?f[l===0?7:l===2?4:u<.25?5:6]:f[l===0?4:l===2?2:3]}if(t===c+3)return mK;if(t===c+4)return sK[1];if(t>=c+5&&t<=c+7)return I(n>>2,t,81)<.75?t===c+7?gK:hK:sK[2];let l=e-c;return l===0?I(n>>1,r>>1,79)<.72?fK:sK[6]:l===1?sK[6]:l===2?I(n>>1,r,80)<.4?pK:sK[5]:FK(l,e,n,r,i,o,s)}function FK(e,t,n,r,i,a,o){let s=t>=20?3:e<6?5:e<9||e<13&&I(n>>2,r,75)<(13-e)/4?4:3;if(s===3&&r%3==0){let e=i(a,o);if(e>.5&&I(n>>3,r,76)<(e-.5)*1.6&&(n&7)<6+(r*7>>2&3))return sK[2]}let c=AK(n,r,s>=5?.34:s===4?.22:.12);return sK[c?Math.min(6,s+c):s]}function PU(e,t,n,r){let i=n*.8+(r-.5)*.4+(oU(e,t)-.5)*.12;return i>.56?Q[7]:i<.18?Q[5]:Q[6]}function FU(e,t,n){let r=n+(oU(e,t)-.5)*.12;return r>.62?EU[6]:r<.36?EU[4]:EU[5]}
const sunny=noise(31,40), big=noise(92,384), blotty=noise(91,28);
export function grassPixel(x,y,woods=false){return woods?FU(x,y,sunny(x,y)):PU(x,y,sunny(x,y),big(x,y))}
export function waterPixel(x,y,distance,frontDistance=99,fountain=false){return PK(Math.max(0,Math.round(distance)),frontDistance,x,y,blotty,fountain,x,y)}
// Input mask: 1 inside water, 0 outside. Boundary distance0; chamfer3/4 as original.
export function waterDistances(mask,w,h){const d=new Uint8Array(w*h).fill(250);for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++){let p=y*w+x;if(mask[p]&&(!mask[p-1]||!mask[p+1]||!mask[p-w]||!mask[p+w]))d[p]=0;}
for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++){let p=y*w+x;if(mask[p])d[p]=Math.min(d[p],d[p-1]+3,d[p-w]+3,d[p-w-1]+4,d[p-w+1]+4);}
for(let y=h-2;y>=1;y--)for(let x=w-2;x>=1;x--){let p=y*w+x;if(mask[p])d[p]=Math.min(d[p],d[p+1]+3,d[p+w]+3,d[p+w+1]+4,d[p+w-1]+4);}return d;}
export function renderTerrain(mask,w,h,x0=0,y0=0){const ds=waterDistances(mask,w,h),out=new Uint32Array(w*h);for(let y=0;y<h;y++)for(let x=0;x<w;x++){let p=y*w+x;if(!mask[p]){out[p]=grassPixel(x0+x,y0+y);continue;}let d=Math.round(ds[p]/3),front=99;if(d<=12){for(let k=1;k<=12;k++)if(y-k<0||!mask[p-w*k]){front=k;break;}}out[p]=waterPixel(x0+x,y0+y,d,front);}return out;}
// Original IG tags for an unrotated centerline segment. width native pixels.
export function roadWearTag(u,v,width,lanes=2,arcStart=0){const half=width/2;if(half<20||Math.abs(v)>half)return 0;if(Math.abs(v)>half-14)return 202;const lane=width/lanes,a=Math.min(15,lane*.27);for(let s=0;s<lanes*2;s++){const center=((s>>1)+.5)*lane+(s&1?a:-a)-half;if(Math.abs(v-center)<=3.99&&I(Math.floor((arcStart+u)/48),s,78)<.8)return 201;}return 0;}
