const FRICTION = 0.985
const BOUNCE_DAMPEN = 0.7
const MIN_SPEED = 0.5

export function applyFriction(vx: number, vy: number): [number, number] {
  return [vx * FRICTION, vy * FRICTION]
}

export function applyBounce(
  x: number,
  y: number,
  vx: number,
  vy: number,
  w: number,
  h: number,
  r: number,
): [number, number, number, number] {
  let nx = x + vx, ny = y + vy, nvx = vx, nvy = vy

  if (nx < r) {
    nvx = Math.abs(nvx) * BOUNCE_DAMPEN
    nx = r
  } else if (nx > w - r) {
    nvx = -Math.abs(nvx) * BOUNCE_DAMPEN
    nx = w - r
  }

  if (ny < r) {
    nvy = Math.abs(nvy) * BOUNCE_DAMPEN
    ny = r
  } else if (ny > h - r) {
    nvy = -Math.abs(nvy) * BOUNCE_DAMPEN
    ny = h - r
  }

  return [nx, ny, nvx, nvy]
}

export function isAlive(vx: number, vy: number): boolean {
  return Math.sqrt(vx * vx + vy * vy) > MIN_SPEED
}
