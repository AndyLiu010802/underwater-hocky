import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export function LightBeam() {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const t = clock.getElapsedTime()
    meshRef.current.position.x = Math.sin(t * 0.15) * 3
    ;(meshRef.current.material as THREE.MeshBasicMaterial).opacity =
      0.06 + Math.sin(t * 0.4) * 0.02
  })

  return (
    <mesh ref={meshRef} position={[0, 0, -2]} rotation={[0, 0, 0]}>
      <cylinderGeometry args={[0.6, 2.5, 14, 8, 1, true]} />
      <meshBasicMaterial
        color="#00d4ff"
        transparent
        opacity={0.07}
        side={THREE.BackSide}
        depthWrite={false}
      />
    </mesh>
  )
}
