// The map stores the two Siping Road carriageway centerlines separately.
// Fill the junction between them, then add the markings visible in the reference.
export function makeGateJunction(roads,buildings=[]) {
  const connector = roads.find(road => String(road.osm_id) === '1131988409');
  const [north, south] = connector.coords;
  const [x, y] = [(north[0] + south[0]) / 2, (north[1] + south[1]) / 2];
  const siping = roads.filter(road => road.name === '四平路' && road.highway === 'primary');

  function streetCenter(at) {
    const crossings = [];
    for (const road of siping) {
      for (let i = 1; i < road.coords.length; i++) {
        const [ax, ay] = road.coords[i - 1], [bx, by] = road.coords[i];
        if (ax !== bx && at >= Math.min(ax, bx) && at <= Math.max(ax, bx)) {
          crossings.push(ay + (by - ay) * (at - ax) / (bx - ax));
        }
      }
    }
    const westbound = crossings.filter(v => v < y && v > y - 34);
    const eastbound = crossings.filter(v => v > y && v < y + 34);
    if (!westbound.length || !eastbound.length) return y;
    return (Math.max(...westbound) + Math.min(...eastbound)) / 2;
  }

  function surface(coords, width, sidewalkWidth = 0) {
    const xs = coords.map(p => p[0]), ys = coords.map(p => p[1]);
    return {
      highway: 'primary', carriagewayWidth: width, sidewalkWidth,
      coords, box: [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)],
    };
  }

  const centerline = [-205,-128,-62,0,62,128,205].map(offset => [x + offset, streetCenter(x + offset)]);
  const roadWidth = south[1] - north[1] + 39;
  const branchWidth = 27;
  const surfaces = [
    { ...surface(centerline, roadWidth), suppressWear: true },
    // No invented dead-end extension beyond the source connector.
  ];
  const northEdge = -roadWidth / 2, southEdge = roadWidth / 2;
  const crossingOffset = 30;
  const paint = '#e0dfd7';
  const refugeIslands = [-42, 42].map(offset => ({
    x: x + offset, y: streetCenter(x + offset),
  }));

  function visible({x: vx, y: vy, w, h}) {
    return x - 214 <= vx + w && x + 214 >= vx && y + 83 >= vy && y - 40 <= vy + h;
  }

  function ground(c,resolution=2) {
    c.save();
    c.translate(x, y);
    // Narrow central divider outside the open junction. Position/width are photo-led approximations.
    c.strokeStyle='#96998c';c.lineWidth=3;c.lineCap='butt';
    for(const side of [-1,1]){c.beginPath();for(let u=55;u<=205;u+=5){const px=side*u,py=streetCenter(x+px)-y;u===55?c.moveTo(px,py):c.lineTo(px,py)}c.stroke()}
    c.fillStyle = paint;
    for (const side of [-1, 1]) {
      const crossing = side * crossingOffset;
      const delta = streetCenter(x + crossing) - y;
      for (let v = northEdge + 14/6; resolution<3 && v < southEdge - 14/6; v += 16/6) {
        if (Math.abs(v) < 3) continue;
        c.fillRect(crossing - 40/6, v + delta, 80/6, 8/6);
      }
      const stop = crossing + side * 9;
      c.fillRect(stop - .32, side > 0 ? northEdge + delta : delta + 3, .64, roadWidth / 2 - 3);
      for (const v of [-20,-10,10,20]) {
        for (let u = 42; u < 126; u += 9) {
          const local = side * u, laneY = streetCenter(x + local) - y + v;
          c.fillRect(local - 2.4, laneY, 4.8, .27);
        }
      }
      c.fillStyle = paint;
      arrow(c, side * 53, side > 0 ? -15 : 15, side);
      arrow(c, side * 53, side > 0 ? -25 : 25, side);
    }
    c.restore();
  }

  let trafficTime=0;const phase=()=>{const t=trafficTime%31;return {car:t<12?'green':t<15?'yellow':'red',pedestrian:t>=20&&t<28?'green':'red',time:t}};
  const shelters=buildings.filter(f=>['1429462001','1429462002'].includes(String(f.osm_id))).map(f=>({id:String(f.osm_id),box:f.box}));
  function islands(c){c.save();for(const s of shelters){const [l,t,r,b]=s.box,cx=(l+r)/2,cy=(t+b)/2,join=x+(cx<x?-30:30);const left=Math.min(l-4,join-7),right=Math.max(r+4,join+7);c.fillStyle='#777e7c';c.beginPath();c.roundRect(left,t-3,right-left,b-t+6,3);c.fill();c.fillStyle='#b5b8af';c.beginPath();c.roundRect(left+.6,t-2.4,right-left-1.2,b-t+4.8,2.5);c.fill();c.strokeStyle='#a0a69d';c.lineWidth=.18;for(let xx=left+2;xx<right;xx+=3){c.beginPath();c.moveTo(xx,t-2);c.lineTo(xx,b+2);c.stroke()}}c.restore()}
  function objects(view){if(!visible(view))return[];return shelters.flatMap((s,i)=>{const[l,t,r,b]=s.box,cx=(l+r)/2;return[{y:b,draw:c=>{c.save();c.translate(cx,b);c.scale((r-l)/18.5,1);shelter(c,0,0,b-t);c.restore()}},{y:b+2,draw:c=>signal(c,l-2,b+2,1,false,phase().pedestrian)},{y:y+northEdge-2,draw:c=>signal(c,x+(i===0?-30:30),streetCenter(x+(i===0?-30:30))+northEdge-2,i===0?1:-1,true,phase().car)}]})}
  function replacesProps(px, py) {
    const u = px - x, v = py - y;
    return (Math.abs(u) < 214 && Math.abs(py - streetCenter(px)) < roadWidth / 2 + 1) ||
      (Math.abs(px - south[0]) < branchWidth / 2 + 4 && v > southEdge - 3 && v < southEdge + 54);
  }

  return { update:dt=>{trafficTime+=Math.min(.1,Math.max(0,dt))}, phase, centerY:streetCenter, x, y, surfaces, visible, ground, islands, objects, replacesProps, shelterIds:shelters.map(s=>s.id), crossings:[-30,30].map(u=>({x:x+u,y:streetCenter(x+u),width:roadWidth,angle:0})) };
}

function arrow(c, x, y, side) {
  c.save();
  c.translate(x, y);
  c.scale(side, 1);
  c.fillRect(-1.4, -.18, 4.9, .36);
  c.beginPath();
  c.moveTo(-2.8, 0);
  c.lineTo(-.8, -.89);
  c.lineTo(-.8, .89);
  c.fill();
  c.restore();
}

function signal(c, x, y, direction, main,phase='red') {
  c.save();
  c.translate(x, y);
  c.scale(direction, 1);
  c.fillStyle = '#929597';
  c.fillRect(-.57, -.4, 1.14, .83);
  c.fillStyle = '#334049';
  c.fillRect(-.25, -7, .5, 7);
  c.fillRect(0, -7, main ? 5.5 : 2.7, .36);
  const arm = main ? 5.5 : 2.7;
  c.fillStyle = '#1f2830';
  c.fillRect(arm - .63, -7.15, 1.26, 2.68);
  const lights = [phase==='red'?'#ff6758':'#493936',phase==='yellow'?'#ffd35c':'#494331',phase==='green'?'#6de8a2':'#32493e'];
  for (let i = 0; i < lights.length; i++) {
    c.fillStyle = lights[i];
    c.fillRect(arm - .31, -6.9 + .76 * i, .62, .54);
  }
  c.restore();
}

// Low, open-sided rain canopy with an undulating metal roof and timber soffit.
function shelter(c, x, y, depth=2.7) {
  c.save();
  c.translate(x, y);
  function fill(points, color) {
    c.beginPath();
    points.forEach(([u,v], i) => i ? c.lineTo(u,v) : c.moveTo(u,v));
    c.closePath();
    c.fillStyle = color;
    c.fill();
  }
  function beam(points, color, width) {
    c.beginPath();
    points.forEach(([u,v], i) => i ? c.lineTo(u,v) : c.moveTo(u,v));
    c.strokeStyle = color;
    c.lineWidth = width;
    c.stroke();
  }

  c.fillStyle = '#26303938';
  c.beginPath();
  c.ellipse(.7,.55,8.8,1.27,0,0,Math.PI*2);
  c.fill();

  for (const [u,v,lean] of [[-5,-depth+1,-.53],[4.6,-depth+1,.42],[-5.8,.8,.54],[5.6,.8,-.5]]) {
    fill([[u-.34,v+.16],[u+.37,v+.16],[u+.32,v-.12],[u-.32,v-.12]], '#7d807c');
    const post = [[u,v],[u+lean,v-4.8],[u+lean-.18,v-6.25]];
    beam(post, '#8a8980', .47);
    beam(post.map(([a,b]) => [a-.11,b]), '#d5d2c4', .23);
    beam([[u+lean,v-4.8],[u+lean+1.08,v-6.45]], '#c6c4b7', .28);
  }

  const rim = [[-9.25,-7.1],[-7.5,-7.22],[-6,-7.42],[-4.5,-7.51],[-3,-7.28],
    [-1.5,-6.95],[0,-7.08],[1.5,-7.52],[3,-7.59],[4.5,-7.25],[6,-6.83],[7.5,-6.79],[9.25,-6.65]];
  const soffit = rim.map(([u,v],i) => [u, v + .62 + (i % 4 === 1 ? .16 : .02)]);
  const ridge = rim.map(([u,v]) => [u-.22,v-depth*.47]);
  const back = rim.map(([u,v]) => [u-.45,v-depth]);

  fill([...rim,...soffit.slice().reverse()], '#a46b43');
  beam(soffit, '#70492f', .14);
  fill([...back,...ridge.slice().reverse()], '#c9cac1');
  fill([...ridge,...rim.slice().reverse()], '#a8b0ad');
  for (let i = 1; i < rim.length - 1; i += 2) {
    beam([back[i],ridge[i],rim[i]], '#858f90', .10);
    const [u,v] = rim[i];
    beam([[u-.54,v+.34],[u+.34,v+.4]], '#c6905e', .12);
  }
  beam(back, '#dcdfd5', .17);
  beam(rim, '#e1ded0', .2);
  c.restore();
}
