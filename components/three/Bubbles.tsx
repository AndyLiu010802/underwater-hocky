import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const BUBBLE_COUNT = 18

interface BubbleState {
  x: number
  y: number
  z: number
  speed: number
  wobble: number
  wobbleSpeed: number
  radius: number
}

export function Bubbles() {
  const groupRef = useRef<THREE.Group>(null)

  const bubbles = useMemo<BubbleState[]>(() =>
    Array.from({ length: BUBBLE_COUNT }, () => ({
      x: (Math.random() - 0.5) * 18,
      y: -7 - Math.random() * 5,
      z: (Math.random() - 0.5) * 4,
      speed: 0.01 + Math.random() * 0.015,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.5 + Math.random() * 0.5,
      radius: 0.04 + Math.random() * 0.1,
    })),
  [])

  useFrame((_, delta) => {
    if (!groupRef.current) return
    const children = groupRef.current.children as THREE.Mesh[]
    bubbles.forEach((b, i) => {
      b.y += b.speed
      b.wobble += delta * b.wobbleSpeed
      if (b.y > 7) b.y = -7
      const mesh = children[i]
      if (mesh) {
        mesh.position.set(b.x + Math.sin(b.wobble) * 0.15, b.y, b.z)
      }
    })
  })

  return (
    <group ref={groupRef}>
      {bubbles.map((b, i) => (
        <mesh key={i} position={[b.x, b.y, b.z]}>
          <sphereGeometry args={[b.radius, 8, 8]} />
          <meshBasicMaterial
            color="#00d4ff"
            transparent
            opacity={0.18}
            wireframe={false}
          />
        </mesh>
      ))}
    </group>
  )
}
