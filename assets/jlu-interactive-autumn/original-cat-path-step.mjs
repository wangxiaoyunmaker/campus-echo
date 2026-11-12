// Original tM.walk body, method-to-export wrapper only. Not whole cat AI.
export function stepCatPath(e,t,n){let r=t*n;for(;e.path.length;){let t=e.path[0],n=t.x-e.x,i=t.y-e.y,a=Math.hypot(n,i);if(a<=r){if(e.x=t.x,e.y=t.y,r-=a,e.path.length===1)return!0;e.path.shift()}else return e.x+=n/a*r,e.y+=i/a*r,e.vx=n,e.vy=i,!1}return!0}
