import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { VoidConfig } from '@/generation/archetypes/void'
import { TwinkleField, DriftingGeometryCloud } from '@/components/shared/RoomAccents'

interface Props {
  config: VoidConfig
  zOffset: number
}

export function VoidRoom({ config, zOffset }: Props) {
  const focalRef = useRef<THREE.Mesh>(null)
  const lightRef = useRef<THREE.PointLight>(null)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (focalRef.current) {
      focalRef.current.rotation.y = t * 0.15
      focalRef.current.rotation.x = t * 0.07
    }
    if (lightRef.current) {
      // Slow pulse
      lightRef.current.intensity = config.lightIntensity * (0.7 + Math.sin(t * 0.4) * 0.3)
    }
  })

  const { palette } = config
  const fogFar = config.fogDensity * 60
  const scale = config.elementScale

  function renderFocalElement() {
    switch (config.elementType) {
      case 'sphere':
        return (
          <mesh ref={focalRef}>
            <sphereGeometry args={[scale, 24, 24]} />
            <meshStandardMaterial
              color="#000"
              emissive={config.lightColor}
              emissiveIntensity={1.5}
              metalness={0.9}
              roughness={0.1}
            />
          </mesh>
        )
      case 'monolith':
        return (
          <mesh ref={focalRef}>
            <boxGeometry args={[scale * 0.5, scale * 3, scale * 0.15]} />
            <meshStandardMaterial
              color="#0a0a0a"
              emissive={config.lightColor}
              emissiveIntensity={0.5}
              metalness={1}
              roughness={0.05}
            />
          </mesh>
        )
      case 'arch':
        return (
          <group ref={focalRef}>
            <mesh position={[0, scale * 0.5, 0]}>
              <torusGeometry args={[scale, scale * 0.08, 6, 20, Math.PI]} />
              <meshStandardMaterial color="#000" emissive={config.lightColor} emissiveIntensity={2} />
            </mesh>
            <mesh position={[-scale, scale * 0.25, 0]}>
              <cylinderGeometry args={[scale * 0.08, scale * 0.1, scale * 0.5, 6]} />
              <meshStandardMaterial color="#0a0a0a" metalness={0.9} roughness={0.2} />
            </mesh>
            <mesh position={[scale, scale * 0.25, 0]}>
              <cylinderGeometry args={[scale * 0.08, scale * 0.1, scale * 0.5, 6]} />
              <meshStandardMaterial color="#0a0a0a" metalness={0.9} roughness={0.2} />
            </mesh>
          </group>
        )
    }
  }

  return (
    <group position={[0, 0, -zOffset]}>
      <fog attach="fog" args={[palette.fogColor, 3, fogFar]} />

      <ambientLight intensity={0.022} />

      <TwinkleField count={72} bounds={[38, 14, 34]} color={palette.emissive} zCenter={-20} />
      <TwinkleField count={48} bounds={[42, 10, 38]} color={palette.accent} zCenter={-20} />

      <pointLight position={[-12, 5, -14]} color={palette.accent} intensity={0.35} distance={40} />
      <pointLight position={[12, 5, -26]} color={palette.primary} intensity={0.3} distance={40} />

      {/* Focal element centered in room */}
      <group position={[0, 2.5 + scale * 0.3, -20]}>
        {renderFocalElement()}
        {/* The dramatic single point light */}
        <pointLight
          ref={lightRef}
          position={[0, 0, 0]}
          color={config.lightColor}
          intensity={config.lightIntensity}
          distance={25}
        />
      </group>

      <DriftingGeometryCloud
        count={52}
        bounds={[44, 12, 40]}
        color={palette.accent}
        zCenter={-20}
        emissiveIntensity={0.2}
        sizeMin={0.12}
        sizeMax={0.65}
      />
      <DriftingGeometryCloud
        count={36}
        bounds={[48, 10, 44]}
        color={config.lightColor}
        zCenter={-20}
        emissiveIntensity={0.14}
        sizeMin={0.15}
        sizeMax={0.55}
      />

      {/* Minimal floor — near-invisible */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -20]}>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#020202" roughness={1} />
      </mesh>
    </group>
  )
}
