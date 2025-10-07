import { useRef, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import Mandala from './modules/Mandala'
import Fractal from './modules/Fractal'

export function generateArtTexture(type = 'mandala', size = 256) {
  return new Promise((resolve) => {
    const offscreenCanvas = document.createElement('canvas')
    offscreenCanvas.width = size
    offscreenCanvas.height = size

    const root = document.createElement('div')
    root.style.position = 'absolute'
    root.style.left = '-9999px'
    root.style.width = `${size}px`
    root.style.height = `${size}px`
    document.body.appendChild(root)

    // Create a temporary canvas to render Three.js scene
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = size
    tempCanvas.height = size

    import('@react-three/fiber').then(({ createRoot }) => {
      const fiber = createRoot(tempCanvas)

      fiber.render(
        <Canvas
          gl={{ preserveDrawingBuffer: true }}
          camera={{ position: [0, 0, 5], fov: 50 }}
        >
          <color attach="background" args={['#fafafa']} />
          <ambientLight intensity={1} />
          {type === 'mandala' && <Mandala />}
          {type === 'julia' && <Fractal type="julia" />}
          {type === 'mandelbrot' && <Fractal type="mandelbrot" />}
        </Canvas>
      )

      // Wait for render then capture
      setTimeout(() => {
        const ctx = offscreenCanvas.getContext('2d')
        ctx.drawImage(tempCanvas, 0, 0)

        fiber.unmount()
        document.body.removeChild(root)

        resolve(offscreenCanvas)
      }, 100)
    })
  })
}

export function createSymbioticArt(artId, size = 128) {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')

  const centerX = size / 2
  const centerY = size / 2

  // Create symbiotic abstract art - blend mandala + fractal
  if (artId === 1) {
    // Art 1: Mandala-Fractal fusion
    // Fractal background
    const imageData = ctx.createImageData(size, size)
    const data = imageData.data

    for (let x = 0; x < size; x += 2) {
      for (let y = 0; y < size; y += 2) {
        const real = (x - size / 2) * 2.5 / size
        const imag = (y - size / 2) * 2.5 / size

        let zReal = real
        let zImag = imag
        let iter = 0
        const maxIter = 30

        while (iter < maxIter && zReal * zReal + zImag * zImag < 4) {
          const temp = zReal * zReal - zImag * zImag + real
          zImag = 2 * zReal * zImag + imag
          zReal = temp
          iter++
        }

        const idx = (y * size + x) * 4
        if (iter < maxIter) {
          const hue = (iter / maxIter) * 0.3 + 0.15 // Blue-teal range
          const rgb = hslToRgb(hue, 0.7, 0.5)
          data[idx] = rgb[0]
          data[idx + 1] = rgb[1]
          data[idx + 2] = rgb[2]
          data[idx + 3] = 255

          // Fill adjacent pixels
          if (x + 1 < size) {
            data[idx + 4] = rgb[0]
            data[idx + 5] = rgb[1]
            data[idx + 6] = rgb[2]
            data[idx + 7] = 255
          }
          if (y + 1 < size) {
            const idx2 = ((y + 1) * size + x) * 4
            data[idx2] = rgb[0]
            data[idx2 + 1] = rgb[1]
            data[idx2 + 2] = rgb[2]
            data[idx2 + 3] = 255
          }
        }
      }
    }
    ctx.putImageData(imageData, 0, 0)

    // Overlay mandala pattern
    ctx.globalAlpha = 0.6
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2
      ctx.save()
      ctx.translate(centerX, centerY)
      ctx.rotate(angle)
      ctx.strokeStyle = '#ffd700'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.lineTo(size / 2 - 10, 0)
      ctx.stroke()
      ctx.restore()
    }
  }
  else if (artId === 2) {
    // Art 2: Geometric abstract
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, size / 2)
    gradient.addColorStop(0, '#ff6b6b')
    gradient.addColorStop(0.5, '#4ecdc4')
    gradient.addColorStop(1, '#1a73e8')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, size, size)

    // Abstract shapes
    ctx.globalAlpha = 0.7
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2
      const x = centerX + Math.cos(angle) * 30
      const y = centerY + Math.sin(angle) * 30

      ctx.fillStyle = i % 2 === 0 ? '#ffd700' : '#fff'
      ctx.beginPath()
      ctx.arc(x, y, 15, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  else if (artId === 3) {
    // Art 3: Wave pattern
    for (let y = 0; y < size; y += 4) {
      const wave = Math.sin(y / 15) * 20
      const hue = (y / size) * 0.4 + 0.5
      const rgb = hslToRgb(hue, 0.8, 0.6)
      ctx.fillStyle = `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`
      ctx.fillRect(0, y, size, 4)
    }

    // Overlay circles
    ctx.globalAlpha = 0.5
    for (let i = 0; i < 5; i++) {
      const y = (i / 4) * size
      ctx.strokeStyle = '#1a73e8'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(centerX, y, 20 + i * 5, 0, Math.PI * 2)
      ctx.stroke()
    }
  }

  return canvas
}

function hslToRgb(h, s, l) {
  let r, g, b

  if (s === 0) {
    r = g = b = l
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1/6) return p + (q - p) * 6 * t
      if (t < 1/2) return q
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
      return p
    }

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1/3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1/3)
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)]
}
