import { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

const DESKTOP_COUNT = 120
const MOBILE_COUNT = 40

export function Particles() {
  const meshRef = useRef<THREE.Points>(null)
  const { size } = useThree()
  const count = size.width < 768 ? MOBILE_COUNT : DESKTOP_COUNT

  const [geometry, velocities] = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const vel = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 22
      pos[i * 3 + 1] = (Math.random() - 0.5) * 12
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8
      vel[i * 3]     = (Math.random() - 0.5) * 0.004
      vel[i * 3 + 1] = Math.random() * 0.003 + 0.0008
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.003
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    return [geo, vel]
  }, [count])

  useFrame(() => {
    if (!meshRef.current) return
    const pos = geometry.attributes.position.array as Float32Array
    for (let i = 0; i < count; i++) {
      pos[i * 3]     += velocities[i * 3]
      pos[i * 3 + 1] += velocities[i * 3 + 1]
      pos[i * 3 + 2] += velocities[i * 3 + 2]
      if (pos[i * 3 + 1] > 6) pos[i * 3 + 1] = -6
    }
    geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={meshRef} geometry={geometry}>
      <pointsMaterial
        color="#00d4ff"
        size={0.055}
        transparent
        opacity={0.75}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  )
}
