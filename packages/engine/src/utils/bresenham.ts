import type { Point } from '@game/shared';

export const bresenham = (
  start: Point,
  end: Point,
  options: { includeStart: boolean } = {
    includeStart: true
  }
): Point[] => {
  const cells: Point[] = [];

  let { x: x0, y: y0 } = start;
  const { x: x1, y: y1 } = end;

  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (options.includeStart || x0 !== start.x || y0 !== start.y) {
      cells.push({ x: x0, y: y0 });
    }

    if (x0 === x1 && y0 === y1) break;

    const e2 = 2 * err;

    if (e2 > -dy) {
      err -= dy;
      x0 += sx;
    }

    if (e2 < dx) {
      err += dx;
      y0 += sy;
    }
  }

  return cells;
};
