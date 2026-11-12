export function makeGateCheckpoints(world, center) {
  const objects = [-1, 1].flatMap(side => [
    { u: center + side * 19, v: -45, w: 8.4, d: 6, draw: drawBooth },
    ...[7, 10, 13].map(offset => ({
      u: center + side * offset, v: -46, w: .8, d: 3.1, draw: drawTurnstile,
    })),
  ].map(item => ({ ...item, ...world(item.u, item.v) })));

  const railPath = [[7,-44.2],[7.8,-40.4],[9.8,-36.8],[13.2,-32.5],[16.8,-28.3]];
  const rails = [-1, 1].flatMap(side => {
    const posts = railPath.map(([offset, v]) => ({u: center + side * offset, v}));
    return posts.slice(1).map((end, i) => {
      const start = posts[i];
      const a = world(start.u, start.v), b = world(end.u, end.v);
      return { start, end, a, b, last: i === posts.length - 2 };
    });
  });

  function blocked(u, v) {
    return objects.some(item =>
      Math.abs(u - item.u) <= item.w / 2 && Math.abs(v - item.v) <= item.d / 2) ||
      rails.some(({start,end}) => {
        const du = end.u - start.u, dv = end.v - start.v;
        const fraction = Math.max(0, Math.min(1,
          ((u - start.u) * du + (v - start.v) * dv) / (du * du + dv * dv)));
        return Math.hypot(u - start.u - fraction * du, v - start.v - fraction * dv) <= .34;
      });
  }

  function visible(view) {
    const boothsAndGates = objects.filter(({x,y}) =>
      x + 6 >= view.x && x - 6 <= view.x + view.w &&
      y + 4 >= view.y && y - 16 <= view.y + view.h
    ).map(item => ({
      y: world(item.u, item.v + item.d / 2).y,
      draw(c) {
        c.save();
        c.translate(item.x, item.y);
        item.draw(c);
        c.restore();
      },
    }));
    const visibleRails = rails.filter(({a,b}) =>
      Math.max(a.x,b.x) + 1 >= view.x && Math.min(a.x,b.x) - 1 <= view.x + view.w &&
      Math.max(a.y,b.y) + 1 >= view.y && Math.min(a.y,b.y) - 2.5 <= view.y + view.h
    ).map(({a,b,last}) => ({
      y: (a.y + b.y) / 2,
      draw: c => drawRail(c, a, b, last),
    }));
    return [...boothsAndGates, ...visibleRails];
  }

  return { blocked, objects: visible };
}

function rect(c, x, y, w, h, color) {
  c.fillStyle = color;
  c.fillRect(x, y, w, h);
}

function polygon(c, points, color) {
  c.beginPath();
  for (const [i, [x, y]] of points.entries()) {
    if (i === 0) c.moveTo(x, y);
    else c.lineTo(x, y);
  }
  c.closePath();
  c.fillStyle = color;
  c.fill();
}

function drawBooth(c) {
  rect(c, -5, -3.6, 10, 7.3, '#aaa89a');
  rect(c, -4.3, -4, 8.6, 7.2, '#3f4d51');
  rect(c, -4, -3.7, 8, 6.7, '#7d9298');
  rect(c, -4, -3.7, 8, 4.7, '#263d44');

  // Glazed door and windows in aluminum frames over solid lower panels.
  for (const x of [-4, -1.4, 1.35, 3.7]) rect(c, x, -3.7, .3, 6.5, '#a8b4b4');
  rect(c, -4, .75, 8, .26, '#b3c0be');
  rect(c, -4, 2.4, 8, .28, '#a7b5b5');
  rect(c, -.95, .1, .54, .19, '#c8ceca');
  polygon(c, [[-3.7,-3.5],[-2.5,-3.5],[-3.6,.5],[-3.7,.5]], '#4d666c');
  polygon(c, [[1.65,-3.5],[2.7,-3.5],[1.73,.5],[1.65,.5]], '#4d666c');

  // The roof rises to a flat metal cap above a band of sloped blue-gray glass.
  polygon(c, [[-4.8,-3.1],[4.8,-3.1],[3.15,-7.2],[-3.15,-7.2]], '#42585f');
  polygon(c, [[-4.5,-3.42],[4.5,-3.42],[3.02,-6.94],[-3.02,-6.94]], '#638592');
  polygon(c, [[-3.96,-3.45],[-2.8,-3.45],[-1.88,-6.9],[-2.62,-6.9]], '#8eafb7');
  polygon(c, [[.38,-3.45],[1.4,-3.45],[1.02,-6.9],[.48,-6.9]], '#a0bac0');
  for (const x of [-2.5, 0, 2.5]) {
    polygon(c, [[x-.11,-3.35],[x+.12,-3.35],[x*.68+.12,-7],[x*.68-.12,-7]], '#476470');
  }
  rect(c, -4.8, -3.6, 9.6, .28, '#b4c3c4');
  polygon(c, [[-3.3,-7], [3.3,-7], [3.3,-10.9], [-3.3,-10.9]], '#899da1');
  rect(c, -3.5, -11.2, 7, .45, '#c2ccca');
  rect(c, -3.3, -7.35, 6.6, .28, '#50686e');
  rect(c, -3.14, -10.72, .3, 3.28, '#aab9ba');
}

function drawTurnstile(c) {
  rect(c, -.53, -1.65, 1.12, 3.5, '#8b8e86');
  rect(c, -.39, -3.15, .83, 4.5, '#617177');
  rect(c, -.39, -3.15, .83, 2.5, '#a3b1b1');
  rect(c, -.39, -3.16, .83, .22, '#d0dbd6');
  rect(c, -.27, -2.7, .51, .4, '#304348');
  rect(c, -.21, -2.62, .25, .14, '#6eb985');
  polygon(c, [[.37,-2.12],[1.27,-1.94],[1.27,-.92],[.37,-1.14]], '#7ba4aa');
  rect(c, 1.17, -1.92, .1, 1.01, '#bf796e');
  rect(c, -.23, -.64, .48, 1.64, '#45575d');
}

function drawRail(c, a, b, last) {
  for (const height of [.88, 1.85]) {
    const beam = shift => [[a.x, a.y-height+shift], [b.x, b.y-height+shift],
      [b.x, b.y-height+shift+.26], [a.x, a.y-height+shift+.26]];
    polygon(c, beam(.12), '#647173');
    polygon(c, beam(-.05), '#b9c4c3');
  }
  for (const post of last ? [a,b] : [a]) {
    rect(c, post.x-.35, post.y-.12, .74, .48, '#817e74');
    rect(c, post.x-.18, post.y-2, .36, 2, '#6d7b7e');
    rect(c, post.x-.17, post.y-2, .16, 1.93, '#ccd4d0');
    rect(c, post.x-.17, post.y-.65, .33, .19, '#c7a34b');
  }
}
