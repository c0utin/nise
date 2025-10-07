import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function calculateMandelbrot(x, y, maxIterations) {
  let real = x
  let imag = y
  let r2 = 0
  let i2 = 0

  for (let i = 0; i < maxIterations; i++) {
    if (r2 + i2 > 4.0) return i

    const newReal = r2 - i2 + real
    const newImag = 2.0 * Math.sqrt(r2) * Math.sqrt(i2) + imag

    r2 = newReal * newReal
    i2 = newImag * newImag
  }

  return maxIterations
}

function calculateJulia(x, y, cReal, cImag, maxIterations) {
  let real = x
  let imag = y

  for (let i = 0; i < maxIterations; i++) {
    const r2 = real * real
    const i2 = imag * imag

    if (r2 + i2 > 4.0) return i

    const newReal = r2 - i2 + cReal
    const newImag = 2.0 * real * imag + cImag

    real = newReal
    imag = newImag
  }

  return maxIterations
}

function generatePalette(hueShift = 0) {
  const palette = []

  for (let i = 0; i < 256; i++) {
    const t = i / 255.0
    const hue = ((t * 360.0 + hueShift) % 360) / 360

    const color = new THREE.Color()
    color.setHSL(hue, 0.8, 0.5 + Math.sin(t * Math.PI) * 0.2)
    palette.push(color)
  }

  return palette
}

function FractalPlane({ type = 'mandelbrot', resolution = 256 }) {
  const meshRef = useRef()
  const materialRef = useRef()

  const { geometry, texture } = useMemo(() => {
    const geo = new THREE.PlaneGeometry(16, 12, 1, 1)
    const canvas = document.createElement('canvas')
    canvas.width = resolution
    canvas.height = resolution * 0.75

    const tex = new THREE.CanvasTexture(canvas)
    tex.minFilter = THREE.LinearFilter
    tex.magFilter = THREE.LinearFilter

    return { geometry: geo, texture: tex }
  }, [resolution])

  useFrame((state) => {
    const time = state.clock.elapsedTime
    const zoom = 1.0 + Math.sin(time * 0.3) * 0.3
    const offsetX = type === 'mandelbrot' ? -0.5 : 0
    const offsetY = 0

    const canvas = texture.image
    const ctx = canvas.getContext('2d')
    const width = canvas.width
    const height = canvas.height

    const palette = generatePalette(time * 50)
    const iterations = 100
    const scale = 3.0 / (zoom * Math.min(width, height))

    const imageData = ctx.createImageData(width, height)
    const data = imageData.data

    for (let x = 0; x < width; x += 2) {
      for (let y = 0; y < height; y += 2) {
        const real = (x - width / 2.0) * scale + offsetX
        const imag = (y - height / 2.0) * scale + offsetY

        let iter
        if (type === 'julia') {
          const cReal = -0.7 + Math.sin(time * 0.5) * 0.1
          const cImag = 0.27 + Math.cos(time * 0.3) * 0.1
          iter = calculateJulia(real, imag, cReal, cImag, iterations)
        } else {
          iter = calculateMandelbrot(real, imag, iterations)
        }

        if (iter < iterations) {
          const color = palette[iter % 256]
          const fade = 1.0 - iter / iterations

          const idx = (y * width + x) * 4
          data[idx] = color.r * 255
          data[idx + 1] = color.g * 255
          data[idx + 2] = color.b * 255
          data[idx + 3] = (0.8 + fade * 0.2) * 255

          // Fill adjacent pixels for performance
          if (x + 1 < width) {
            data[idx + 4] = data[idx]
            data[idx + 5] = data[idx + 1]
            data[idx + 6] = data[idx + 2]
            data[idx + 7] = data[idx + 3]
          }
          if (y + 1 < height) {
            const idx2 = ((y + 1) * width + x) * 4
            data[idx2] = data[idx]
            data[idx2 + 1] = data[idx + 1]
            data[idx2 + 2] = data[idx + 2]
            data[idx2 + 3] = data[idx + 3]
          }
        }
      }
    }

    ctx.putImageData(imageData, 0, 0)
    texture.needsUpdate = true
  })

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshBasicMaterial ref={materialRef} map={texture} transparent />
    </mesh>
  )
}

export default function Fractal({ type = 'mandelbrot' }) {
  return (
    <>
      <color attach="background" args={['#000000']} />
      <ambientLight intensity={1} />

      <FractalPlane type={type} resolution={256} />

      {/* Overlay glow effect */}
      <mesh position={[0, 0, -1]}>
        <planeGeometry args={[20, 15]} />
        <meshBasicMaterial color={0x000000} transparent opacity={0.3} />
      </mesh>
    </>
  )
}
