import { useEffect, useRef, useState } from 'react'

export default function ASCIIAnimation({ autoPlay = true, fps = 8 }) {
  const [framesData, setFramesData] = useState([])
  const [currentFrame, setCurrentFrame] = useState(0)
  const [error, setError] = useState(null)
  const intervalRef = useRef(null)
  const scriptLoadedRef = useRef(false)

  useEffect(() => {
    if (scriptLoadedRef.current) return

    const loadFrames = () => {
      // Check if already loaded
      if (window.asciiFrames && window.asciiFrames.length > 0) {
        const reduced = window.asciiFrames.filter((_, i) => i % 4 === 0)
        setFramesData(reduced)
        return
      }

      const script = document.createElement('script')
      script.src = '/animation.js'
      script.async = false

      script.onload = () => {
        setTimeout(() => {
          if (window.asciiFrames && Array.isArray(window.asciiFrames)) {
            // Take every 4th frame for performance
            const reducedFrames = window.asciiFrames.filter((_, index) => index % 4 === 0)
            console.log(`Loaded ${window.asciiFrames.length} frames, using ${reducedFrames.length}`)
            setFramesData(reducedFrames)
            scriptLoadedRef.current = true
          } else {
            setError('Frames not available')
            console.error('window.asciiFrames not found')
          }
        }, 200)
      }

      script.onerror = () => {
        setError('Failed to load animation')
        console.error('Failed to load /animation.js')
      }

      document.head.appendChild(script)
    }

    loadFrames()

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (autoPlay && framesData.length > 0) {
      intervalRef.current = setInterval(() => {
        setCurrentFrame((prev) => (prev + 1) % framesData.length)
      }, 1000 / fps)

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }
      }
    }
  }, [autoPlay, framesData, fps])

  if (error) {
    return null // Hide error, just show nothing
  }

  if (framesData.length === 0) {
    return null // Don't show loading text
  }

  return (
    <div className="w-full h-full flex items-center justify-center overflow-hidden">
      <pre
        className="font-mono text-white whitespace-pre leading-none select-none"
        style={{
          fontSize: 'clamp(5px, 0.6vw, 8px)',
          lineHeight: 0.9,
          opacity: 0.4,
          textAlign: 'left',
          textShadow: '0 0 10px rgba(255,255,255,0.3)',
        }}
      >
        {framesData[currentFrame]}
      </pre>
    </div>
  )
}
