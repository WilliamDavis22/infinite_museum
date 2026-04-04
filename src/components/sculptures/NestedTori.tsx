import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface Props {
  color: string
}

interface TorusConfig {
  radius: number
  tube: number
  rx: number
  ry: number
  rz: number
  speed: [number, number, number]
}

const TORUS_CONFIGS: TorusConfig[] = [
  { radius: 1.6, tube: 0.12, rx: 0, ry: 0, rz: 0, speed: [0.4, 0.3, 0.0] },
  { radius: 2.4, tube: 0.09, rx: Math.PI / 2, ry: 0, rz: 0, speed: [-0.25, 0.0, 0.35] },
  { radius: 3.2, tube: 0.07, rx: Math.PI / 4, ry: Math.PI / 4, rz: 0, speed: [0.15, -0.4, 0.2] },
]

function Torus({ cfg, color, emissiveIntensity }: { cfg: TorusConfig; color: THREE.Color; emissiveIntensity: number }) {
  const ref = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.getElapsedTime()
    ref.current.rotation.x = cfg.rx + t * cfg.speed[0]
    ref.current.rotation.y = cfg.ry + t * cfg.speed[1]
    ref.current.rotation.z = cfg.rz + t * cfg.speed[2]
  })

  return (
    <mesh ref={ref} rotation={[cfg.rx, cfg.ry, cfg.rz]}>
      <torusGeometry args={[cfg.radius, cfg.tube, 12, 64]} />
      <meshStandardMaterial
        color="#000"
        emissive={color}
        emissiveIntensity={emissiveIntensity}
        metalness={0.9}
        roughness={0.1}
      />
    </mesh>
  )
}

export function NestedTori({ color }: Props) {
  const c = new THREE.Color(color)
  return (
    <group>
      {TORUS_CONFIGS.map((cfg, i) => (
        <Torus key={i} cfg={cfg} color={c} emissiveIntensity={2.5 - i * 0.3} />
      ))}
    </group>
  )
}
