'use client'
import { useEffect, useRef } from 'react'
import { applyFriction, applyBounce, isAlive } from '@/lib/puckPhysics'

interface Puck {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  trail: Array<{ x: number; y: number }>
}

const MAX_PUCKS = 5
const TRAIL_LENGTH = 20
const PUCK_RADIUS = 8
const STICK_LENGTH = 38

let _nextId = 0

export function CustomCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if ('ontouchstart' in window) return

    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const pucks: Puck[] = []
    const mouse = { x: -200, y: -200 }
    let dragStart: { x: number; y: number } | null = null
    let stickAngle = -Math.PI / 4

    const onMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
    }
    const onMouseDown = (e: MouseEvent) => {
      dragStart = { x: e.clientX, y: e.clientY }
    }
    const onMouseUp = (e: MouseEvent) => {
      if (!dragStart) return
      const dx = dragStart.x - e.clientX
      const dy = dragStart.y - e.clientY
      const rawSpeed = Math.sqrt(dx * dx + dy * dy)
      if (rawSpeed > 8) {
        const speed = Math.min(rawSpeed, 60) * 0.35
        const angle = Math.atan2(dy, dx)
        stickAngle = angle
        if (pucks.length >= MAX_PUCKS) pucks.shift()
        pucks.push({
          id: _nextId++,
          x: e.clientX,
          y: e.clientY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          trail: [],
        })
      }
      dragStart = null
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mouseup', onMouseUp)

    let rafId: number
    const tick = () => {
      const w = canvas.width
      const h = canvas.height
      ctx.clearRect(0, 0, w, h)

      // Update + draw pucks
      for (let i = pucks.length - 1; i >= 0; i--) {
        const p = pucks[i]
        p.trail.push({ x: p.x, y: p.y })
        if (p.trail.length > TRAIL_LENGTH) p.trail.shift()

        const [nx, ny, nvx, nvy] = applyBounce(p.x, p.y, p.vx, p.vy, w, h, PUCK_RADIUS)
        p.x = nx; p.y = ny
        const [fvx, fvy] = applyFriction(nvx, nvy)
        p.vx = fvx; p.vy = fvy

        if (!isAlive(p.vx, p.vy)) { pucks.splice(i, 1); continue }

        // trail
        p.trail.forEach((pt, ti) => {
          const alpha = (ti / p.trail.length) * 0.45
          ctx.beginPath()
          ctx.arc(pt.x, pt.y, 2.5, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(0,212,255,${alpha})`
          ctx.fill()
        })

        // puck body
        ctx.save()
        ctx.shadowColor = '#00d4ff'
        ctx.shadowBlur = 14
        ctx.beginPath()
        ctx.arc(p.x, p.y, PUCK_RADIUS, 0, Math.PI * 2)
        ctx.fillStyle = '#0a0a1a'
        ctx.fill()
        ctx.strokeStyle = '#00d4ff'
        ctx.lineWidth = 2
        ctx.stroke()
        ctx.restore()
      }

      // drag power line
      if (dragStart) {
        ctx.save()
        ctx.setLineDash([5, 5])
        ctx.strokeStyle = 'rgba(0,212,255,0.55)'
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.moveTo(mouse.x, mouse.y)
        ctx.lineTo(dragStart.x, dragStart.y)
        ctx.stroke()
        ctx.restore()
        const dist = Math.min(
          Math.sqrt((dragStart.x - mouse.x) ** 2 + (dragStart.y - mouse.y) ** 2),
          60
        )
        const chargeRadius = PUCK_RADIUS * (dist / 60)
        ctx.beginPath()
        ctx.arc(mouse.x, mouse.y, chargeRadius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(0,212,255,${0.3 * (dist / 60)})`
        ctx.fill()
      }

      // hockey stick cursor
      ctx.save()
      ctx.translate(mouse.x, mouse.y)
      ctx.rotate(stickAngle)
      ctx.beginPath()
      ctx.moveTo(6, 0)
      ctx.lineTo(6 + STICK_LENGTH, 0)
      ctx.strokeStyle = 'rgba(255,255,255,0.92)'
      ctx.lineWidth = 4
      ctx.lineCap = 'round'
      ctx.stroke()
      ctx.shadowColor = '#00d4ff'
      ctx.shadowBlur = 10
      ctx.beginPath()
      ctx.moveTo(6 + STICK_LENGTH, -8)
      ctx.quadraticCurveTo(6 + STICK_LENGTH + 12, 0, 6 + STICK_LENGTH, 8)
      ctx.strokeStyle = '#00d4ff'
      ctx.lineWidth = 3
      ctx.lineCap = 'round'
      ctx.stroke()
      ctx.restore()

      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 9999 }}
      aria-hidden="true"
    />
  )
}
