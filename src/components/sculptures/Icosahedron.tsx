import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { displacementVert, displacementFrag } from '@/shaders/displacementShader'

interface Props {
  color1: string
  color2: string
}

export function Icosahedron({ color1, color2 }: Props) {
  const matRef = useRef<THREE.ShaderMaterial>(null)

  useFrame(({ clock }) => {
    if (!matRef.current) return
    const t = clock.getElapsedTime()
    matRef.current.uniforms.uTime.value = t
    matRef.current.uniforms.uDisplacement.value = 0.28 + Math.sin(t * 0.5) * 0.14
  })

  return (
    <mesh rotation={[0.2, 0, 0.1]}>
      <icosahedronGeometry args={[2, 4]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={displacementVert}
        fragmentShader={displacementFrag}
        uniforms={{
          uTime: { value: 0 },
          uDisplacement: { value: 0.28 },
          uColor1: { value: new THREE.Color(color1) },
          uColor2: { value: new THREE.Color(color2) },
        }}
      />
    </mesh>
  )
}
