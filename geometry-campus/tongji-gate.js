import { makeGateCheckpoints } from './tongji-gate-checkpoints.js';
import { gateWallProfile, makeGateWalls } from './tongji-gate-walls.js';

const stoneRanges = [[8, 48], [76, 86], [158, 168], [196, 236]];
const stoneWidth = 228;
const frontBaseline = 158;
const spriteDensity = 4;

export function makeTongjiGate(footprint) {
  // Fit the drawing's four supports to the existing OSM footprint.
  const ring = footprint.polys[0][0].slice(0, -1);
  const front = [...ring].sort((a, b) => b[1] - a[1]).slice(0, 4);
  front.sort((a, b) => a[0] - b[0]);
  const [x, y] = front[0];
  const right = front.at(-1);
  const width = Math.hypot(right[0] - x, right[1] - y);
  const angle = Math.atan2(right[1] - y, right[0] - x);
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const scale = width / stoneWidth;
  const depth = Math.max(...ring.map(([px, py]) => (px - x) * sin - (py - y) * cos));
  const image = new Image();
  image.src = new URL('../assets/tongji-gate/gate.png', import.meta.url).href;
  const ready = image.decode();

  function world(u, v) {
    return { x: x + u * cos - v * sin, y: y + u * sin + v * cos };
  }

  const walls = makeGateWalls(world, width / 2);

  const checkpoints = makeGateCheckpoints(world, width / 2);

  function blocked(px, py) {
    if (walls.blocked(px, py)) return true;
    const u = (px - x) * cos + (py - y) * sin;
    const v = -(px - x) * sin + (py - y) * cos;
    const pillarX = u / scale + 8;
    return checkpoints.blocked(u, v) || (v >= -depth && v <= 0 &&
      stoneRanges.some(([left, right]) => pillarX >= left && pillarX <= right));
  }

  function isVisible(view, margin = 60) {
    return x + width + margin >= view.x && x - margin <= view.x + view.w &&
      y + margin >= view.y && y - margin <= view.y + view.h;
  }

  // The frontage follows the straight street edge; the campus side curves around the gate.
  function paving(c) {
    const center = width / 2;
    const left = center - 55;
    const right = center + 55;
    c.save();
    c.translate(x, y);
    c.rotate(angle);

    // Planted beds frame the campus approach and wrap around the edge of the paving.
    c.fillStyle = '#619747';
    for (const side of [-1, 1]) {
      c.save();
      c.translate(center, 0);
      c.scale(side, 1);
      c.beginPath();
      c.moveTo(14, -96);
      c.lineTo(49, -96);
      c.quadraticCurveTo(67, -65, 70, -26);
      c.quadraticCurveTo(72, 4, 58, 28);
      c.quadraticCurveTo(61, -9, 43, -29);
      c.quadraticCurveTo(32, -43, 14, -43);
      c.closePath();
      c.fill();
      c.restore();
    }

    // Use the wall's own curve so there is no turf between the stone paving and its base.
    const [front, lower, upper, rear] = gateWallProfile;
    c.beginPath();
    c.moveTo(left + 2, 44);
    c.quadraticCurveTo(center - front[0], 37, center - front[0], front[1]);
    c.bezierCurveTo(center - lower[0], lower[1], center - upper[0], upper[1],
      center - rear[0], rear[1]);
    c.lineTo(center - 25, -58);
    c.lineTo(center + 25, -58);
    c.lineTo(center + rear[0], rear[1]);
    c.bezierCurveTo(center + upper[0], upper[1], center + lower[0], lower[1],
      center + front[0], front[1]);
    c.quadraticCurveTo(center + front[0], 37, right - 2, 44);
    c.closePath();
    c.rect(center - 10, -100, 20, 72);
    c.fillStyle = '#b9b4a4';
    c.fill();
    c.save();
    c.clip();

    const stone = ['#c9c3b3', '#ccc6b7', '#c6c1b1', '#d0cabc', '#c4bfb0'];
    for (let row = 0, v = -100; v < 44; row++, v += 2.2) {
      for (let col = 0, u = left - 12 + (row % 2) * 1.7; u < right + 12; col++, u += 3.4) {
        c.fillStyle = stone[(col * 13 + row * 7 + ((col * row) % 9)) % stone.length];
        c.fillRect(u, v, 3.24, 2.04);
      }
    }
    c.restore();

    c.fillStyle = '#56575126';
    c.fillRect(-1, -depth, width + 2, depth + 2);
    c.restore();
  }

  function landscapingArea(px, py) {
    const u = (px - x) * cos + (py - y) * sin - width / 2;
    const v = -(px - x) * sin + (py - y) * cos;
    return Math.abs(u) < 76 && v > -109 && v < 44;
  }

  function plantings() {
    const center = width / 2;
    const trees = [[-23, -58], [-37, -69], [-46, -48], [-28, -88],
      [24, -59], [41, -66], [46, -47], [27, -90], [72, -21], [-72, -27], [50, -34], [-49, -35]];
    const shrubs = [[-17, -65], [17, -65]];
    return [
      ...trees.map(([u, v], i) => ({ ...world(center + u, v), name: i % 3 ? 'tree-main' : 'large-tree-summer-2' })),
      ...shrubs.map(([u, v]) => ({ ...world(center + u, v), name: 'shrub-main' })),
    ];
  }

  function objects(view) {
    const visibleDetails = [...walls.objects(view), ...checkpoints.objects(view)];
    if (!image.naturalWidth || !isVisible(view)) return visibleDetails;
    return [...visibleDetails, {
      y: world(width / 2, 0).y,
      draw(c) {
        c.save();
        c.translate(x, y);
        c.rotate(angle);
        c.drawImage(image, -8 * scale, -frontBaseline * scale,
          image.naturalWidth * scale / spriteDensity, image.naturalHeight * scale / spriteDensity);
        c.restore();
      },
    }];
  }

  return { blocked, isVisible, paving, objects, ready, width, depth, world, landscapingArea, plantings };
}
