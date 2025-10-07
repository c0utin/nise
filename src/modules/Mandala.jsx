import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function MandalaPattern({ radius, segments, layer, rotation }) {
  const meshRef = useRef()

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    const vertices = []
    const colors = []
    const angleStep = (Math.PI * 2) / segments

    const primaryColor = new THREE.Color(0x8b4513)
    const secondaryColor = new THREE.Color(0xffd700)

    for (let i = 0; i < segments; i++) {
      const angle = i * angleStep
      const nextAngle = (i + 1) * angleStep

      // Center point
      vertices.push(0, 0, 0)
      // First edge point
      vertices.push(Math.cos(angle) * radius, Math.sin(angle) * radius, 0)
      // Second edge point
      vertices.push(Math.cos(nextAngle) * radius, Math.sin(nextAngle) * radius, 0)

      // Color interpolation
      const color = i % 2 === 0 ? primaryColor : secondaryColor
      colors.push(color.r, color.g, color.b)
      colors.push(color.r, color.g, color.b)
      colors.push(color.r, color.g, color.b)

      // Inner decorative circle vertices
      const midAngle = angle + angleStep / 2
      const innerRadius = radius * 0.5
      vertices.push(
        Math.cos(midAngle) * innerRadius,
        Math.sin(midAngle) * innerRadius,
        0.01
      )
    }

    geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))

    return geo
  }, [radius, segments])

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.z = rotation + Math.sin(state.clock.elapsedTime + layer) * 0.2
    }
  })

  return (
    <group>
      <mesh ref={meshRef} geometry={geometry}>
        <meshBasicMaterial vertexColors transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>
      <lineSegments geometry={geometry}>
        <lineBasicMaterial color={0xffd700} vertexColors opacity={0.8} transparent />
      </lineSegments>
    </group>
  )
}

function Particles({ count = 200 }) {
  const points = useRef()

  const particlesPosition = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20
      positions[i * 3 + 1] = (Math.random() - 0.5) * 15
      positions[i * 3 + 2] = (Math.random() - 0.5) * 5

      colors[i * 3] = Math.random()
      colors[i * 3 + 1] = Math.random()
      colors[i * 3 + 2] = Math.random()
    }

    return { positions, colors }
  }, [count])

  useFrame((state) => {
    if (points.current) {
      const positions = points.current.geometry.attributes.position.array

      for (let i = 0; i < count; i++) {
        const i3 = i * 3
        positions[i3] += Math.sin(state.clock.elapsedTime + i) * 0.001
        positions[i3 + 1] += Math.cos(state.clock.elapsedTime + i) * 0.001
      }

      points.current.geometry.attributes.position.needsUpdate = true
    }
  })

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particlesPosition.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={particlesPosition.colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.05} vertexColors transparent opacity={0.3} />
    </points>
  )
}

export default function Mandala() {
  return (
    <>
      <color attach="background" args={['#0a0a14']} />
      <ambientLight intensity={0.5} />

      <Particles count={300} />

      {/* Multiple mandala layers */}
      {[0, 1, 2].map((layer) => (
        <MandalaPattern
          key={layer}
          radius={2 + layer * 0.6}
          segments={12 + layer * 4}
          layer={layer}
          rotation={(layer * Math.PI) / 6}
        />
      ))}

      {/* Center sphere */}
      <mesh position={[0, 0, 0.05]}>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial color={0x8b4513} emissive={0xffd700} emissiveIntensity={0.5} />
      </mesh>
    </>
  )
}
