// Local coordinates are measured from the center of the gate's front edge.
// The two arcs follow the aerial reference, leaving the approach open at both ends.
export const gateWallProfile = [[61, 25], [73, -12], [59, -35], [24, -48]];
const bayCount = 10;
const height = 9.5;
const thickness = 2.1;

export function makeGateWalls(world, center) {
  function point(side, t) {
    const s = 1 - t;
    const weights = [s ** 3, 3 * s ** 2 * t, 3 * s * t ** 2, t ** 3];
    const u = gateWallProfile.reduce((sum, p, i) => sum + p[0] * weights[i], 0);
    const v = gateWallProfile.reduce((sum, p, i) => sum + p[1] * weights[i], 0);
    return world(center + side * u, v);
  }

  function strip(side, start, end, paint) {
    const a = point(side, start), b = point(side, end);
    const dx = b.x - a.x, dy = b.y - a.y, length = Math.hypot(dx, dy);
    return { a, b, dx, dy, length, side, paint };
  }

  const walls = [-1, 1].flatMap(side => Array.from({ length: bayCount }, (_, bay) =>
    strip(side, bay / bayCount, (bay + 1) / bayCount, bay)));

  function blocked(x, y) {
    return walls.some(({ a, dx, dy, length }) => {
      const t = Math.max(0, Math.min(1, ((x - a.x) * dx + (y - a.y) * dy) / length ** 2));
      return Math.hypot(x - a.x - t * dx, y - a.y - t * dy) <= thickness / 2;
    });
  }

  function drawBay(c, { a, b, dx, dy, length, side, paint }) {
    const nx = side * dy / length * thickness / 2;
    const ny = -side * dx / length * thickness / 2;
    // Use the visible edge of the top as the baseline for the facade.
    const front = ny < 0 ? -1 : 1;
    const pointAt = (u, z, edge = front) => [
      a.x + dx * u + nx * edge,
      a.y + dy * u + ny * edge - z,
    ];
    function fill(points, color) {
      c.beginPath();
      points.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y));
      c.closePath();
      c.fillStyle = color;
      c.fill();
    }
    function line(points, color, width) {
      c.beginPath();
      points.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y));
      c.strokeStyle = color;
      c.lineWidth = width;
      c.stroke();
    }
    function face(left, right, low, high, color) {
      fill([pointAt(left, low), pointAt(right, low),
        pointAt(right, high), pointAt(left, high)], color);
    }

    const stone = ['#a46e61', '#ad7868', '#b98372', '#b27d6d'][paint % 4];
    face(0, 1.005, 0, height, stone);
    const emblem = paint === bayCount - 2;
    if (!emblem && paint !== 0) {
      fill([pointAt(.17, .65), pointAt(.82, .65), pointAt(.88, 6.25), pointAt(.11, 6.25)], '#334c4c');
      fill([pointAt(.2, 1), pointAt(.79, 1), pointAt(.83, 5.9), pointAt(.15, 5.9)], '#658482');
      fill([pointAt(.27, 1), pointAt(.4, 1), pointAt(.57, 5.9), pointAt(.47, 5.9)], '#90a6a0');
      line([pointAt(.43, .9), pointAt(.55, 6.1)], '#32484a', .32);
      line([pointAt(.15, 3.4), pointAt(.84, 3.4)], '#405c5c', .30);
      face(.04, .1, 3.9, 5.6, '#343539');
    } else {
      for (const z of [2, 4.1, 6.25]) line([pointAt(0, z), pointAt(1, z)], '#855b51', .16);
    }
    for (const z of [6.5, 8]) line([pointAt(0, z), pointAt(1, z)], '#885e52', .17);
    line([pointAt(.52, 6.5), pointAt(.52, 8)], '#d19982', .14);
    face(0, 1.005, 0, .36, '#80594e');

    if (paint === 0 || paint === bayCount - 1) {
      const end = paint === 0 ? 0 : 1;
      fill([pointAt(end, 0, -1), pointAt(end, 0, 1),
        pointAt(end, height, 1), pointAt(end, height, -1)], '#925f53');
      for (const z of [2, 4.1, 6.25, 8]) {
        line([pointAt(end, z, -1), pointAt(end, z, 1)], '#b6806c', .17);
      }
    }
    fill([pointAt(0, height, -1), pointAt(1.015, height, -1),
      pointAt(1.015, height, 1), pointAt(0, height, 1)], '#ce9a83');
    line([pointAt(0, height), pointAt(1.015, height)], '#e0b199', .24);

    if (emblem) {
      const [cx, cy] = pointAt(.48, 4.1);
      const badgeWidth = 1.38 + Math.min(1, Math.abs(dx) / length) * .5;
      c.save();
      c.translate(cx, cy);
      c.scale(badgeWidth / 1.85, 1);
      c.fillStyle = '#263234';
      c.beginPath();
      c.arc(0, 0, 1.85, 0, 2 * Math.PI);
      c.fill();
      c.strokeStyle = '#9ba6a0';
      c.lineWidth = .22;
      c.beginPath();
      c.arc(0, 0, 1.52, 0, 2 * Math.PI);
      c.stroke();
      line([[-1.04,.5],[-.51,.94],[.62,.93],[1.06,.47]], '#b6bcb2', .2);
      for (const x of [-.65, 0, .65]) {
        line([[x-.28,.61],[x+.2,-.53],[x+.3,-.68]], '#b6bcb2', .17);
      }
      c.restore();
    }
  }

  function objects(view) {
    return walls.filter(({a,b}) =>
      Math.max(a.x,b.x)+3>=view.x && Math.min(a.x,b.x)-3<=view.x+view.w &&
      Math.max(a.y,b.y)>=view.y && Math.min(a.y,b.y)-height<=view.y+view.h
    ).map(wall => ({
      y: (wall.a.y + wall.b.y) / 2,
      draw: c => drawBay(c, wall),
    }));
  }

  return { blocked, objects };
}
