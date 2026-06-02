'use client'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useRef } from 'react'
import { Particles } from './Particles'
import { Bubbles } from './Bubbles'
import { LightBeam } from './LightBeam'

function CameraMouseParallax() {
  const { camera } = useThree()
  const mouse = useRef({ x: 0, y: 0 })

  useFrame(() => {
    camera.position.x += (mouse.current.x * 1.5 - camera.position.x) * 0.04
    camera.position.y += (-mouse.current.y * 1 - camera.position.y) * 0.04
    camera.lookAt(0, 0, 0)
  })

  if (typeof window !== 'undefined') {
    window.onmousemove = (e) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2
      mouse.current.y = (e.clientY / window.innerHeight - 0.5) * 2
    }
  }

  return null
}

export default function OceanScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 60 }}
      style={{ background: 'transparent' }}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.1} />
      <pointLight position={[0, 5, 0]} intensity={0.5} color="#00d4ff" />
      <Particles />
      <Bubbles />
      <LightBeam />
      <CameraMouseParallax />
    </Canvas>
  )
}
