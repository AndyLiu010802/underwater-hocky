import { describe, it, expect } from 'vitest'
import { applyFriction, applyBounce, isAlive } from '@/lib/puckPhysics'

describe('applyFriction', () => {
  it('reduces velocity by friction factor each call', () => {
    const [vx, vy] = applyFriction(10, 0)
    expect(vx).toBeCloseTo(9.85)
    expect(vy).toBe(0)
  })

  it('applies symmetrically to both axes', () => {
    const [vx, vy] = applyFriction(0, 10)
    expect(vx).toBe(0)
    expect(vy).toBeCloseTo(9.85)
  })
})

describe('applyBounce', () => {
  const W = 1280, H = 720, R = 8

  it('reverses and dampens vx when hitting right edge', () => {
    const [nx, ny, nvx, nvy] = applyBounce(W - R, 100, 10, 0, W, H, R)
    expect(nx).toBe(W - R)
    expect(nvx).toBeCloseTo(-7)
    expect(nvy).toBe(0)
  })

  it('reverses and dampens vx when hitting left edge', () => {
    const [nx, , nvx] = applyBounce(R, 100, -10, 0, W, H, R)
    expect(nx).toBe(R)
    expect(nvx).toBeCloseTo(7)
  })

  it('reverses and dampens vy when hitting bottom edge', () => {
    const [, ny, , nvy] = applyBounce(100, H - R, 0, 10, W, H, R)
    expect(ny).toBe(H - R)
    expect(nvy).toBeCloseTo(-7)
  })

  it('reverses and dampens vy when hitting top edge', () => {
    const [, ny, , nvy] = applyBounce(100, R, 0, -10, W, H, R)
    expect(ny).toBe(R)
    expect(nvy).toBeCloseTo(7)
  })

  it('does not bounce when puck is in bounds', () => {
    const [nx, ny, nvx, nvy] = applyBounce(400, 300, 5, 3, W, H, R)
    expect(nx).toBeCloseTo(405)
    expect(ny).toBeCloseTo(303)
    expect(nvx).toBe(5)
    expect(nvy).toBe(3)
  })
})

describe('isAlive', () => {
  it('returns true when speed is above threshold', () => {
    expect(isAlive(3, 4)).toBe(true)
  })

  it('returns false when speed is at or below threshold', () => {
    expect(isAlive(0.3, 0.4)).toBe(false)
  })
})
