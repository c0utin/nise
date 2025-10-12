import { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function ASCIIEffect() {
  const meshRef = useRef()
  const [texture, setTexture] = useState(null)

  useEffect(() => {
    // Load GIF as texture
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const tex = new THREE.Texture(img)
      tex.needsUpdate = true
      tex.minFilter = THREE.LinearFilter
      tex.magFilter = THREE.LinearFilter
      setTexture(tex)
      console.log('ASCII GIF loaded successfully')
    }
    img.onerror = (err) => {
      console.error('Error loading GIF:', err)
    }
    img.src = '/ascii-animation.gif'

    return () => {
      if (texture) texture.dispose()
    }
  }, [])

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime
      // Subtle animation
      meshRef.current.rotation.z = Math.sin(time * 0.1) * 0.02
    }
  })

  if (!texture) return null

  return (
    <mesh ref={meshRef} position={[0, 0, 0]} scale={2.5}>
      <planeGeometry args={[40, 40]} />
      <meshBasicMaterial
        map={texture}
        transparent
        opacity={0.7}
        side={THREE.DoubleSide}
        toneMapped={false}
      />
    </mesh>
  )
}
