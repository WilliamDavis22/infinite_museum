import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import * as THREE from 'three'
import { frameVert, FRAME_SHADERS } from '@/shaders/frameShaders'

interface Props {
  position: [number, number, number]
  rotation?: [number, number, number]
  shaderIndex: number
  accentColor: string
}

export function FloatingFrame({ position, rotation = [0, 0, 0], shaderIndex, accentColor }: Props) {
  const matRef = useRef<THREE.ShaderMaterial>(null)

  const shader = FRAME_SHADERS[shaderIndex % FRAME_SHADERS.length]

  useFrame(({ clock }) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = clock.getElapsedTime()
    }
  })

  return (
    <Float speed={1.5} rotationIntensity={0.08} floatIntensity={0.25}>
      <group position={position} rotation={rotation}>
        {/* Outer glow plane behind frame */}
        <mesh position={[0, 0, -0.06]}>
          <planeGeometry args={[3.4, 4.4]} />
          <meshBasicMaterial color={accentColor} transparent opacity={0.18} depthWrite={false} />
        </mesh>
        {/* Frame body */}
        <mesh>
          <boxGeometry args={[3.2, 4.2, 0.08]} />
          <meshStandardMaterial color="#6b4f10" metalness={0.95} roughness={0.25} />
        </mesh>
        {/* Inner artwork */}
        <mesh position={[0, 0, 0.05]}>
          <planeGeometry args={[2.6, 3.6]} />
          <shaderMaterial
            ref={matRef}
            vertexShader={frameVert}
            fragmentShader={shader.frag}
            uniforms={{ uTime: { value: 0 } }}
          />
        </mesh>
        {/* Subtle frame edge trim */}
        <mesh position={[0, 0, 0.05]}>
          <boxGeometry args={[3.2, 4.2, 0.01]} />
          <meshStandardMaterial
            color={accentColor}
            emissive={accentColor}
            emissiveIntensity={0.4}
            metalness={1}
            roughness={0.1}
            transparent
            opacity={0.5}
          />
        </mesh>
      </group>
    </Float>
  )
}
