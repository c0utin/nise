import { useRef, useEffect, useState } from 'react'
import { createSymbioticArt } from './ArtTexture'

// Museum layout - 0 = empty, 1 = wall, 2 = info plaque, 3 = artwork, 4 = special feature
const worldMap = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,2,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,1,1,1,0,0,0,1,1,1,0,0,0,0,0,1],
  [1,0,0,0,0,1,3,1,0,0,0,1,3,1,0,0,0,0,0,1],
  [1,0,0,0,0,1,1,1,0,0,0,1,1,1,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,2,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,1],
  [1,0,0,0,0,1,1,1,0,0,0,1,1,1,0,0,0,0,0,1],
  [1,0,0,0,0,1,3,1,0,0,0,1,3,1,0,0,0,0,0,1],
  [1,0,0,0,0,1,1,1,0,0,0,1,1,1,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,2,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
]

// Museum information plaques
const museumInfo = {
  entrance: {
    title: "MUSEU DE IMAGENS DO INCONSCIENTE",
    content: "Founded by Nise da Silveira in Rio de Janeiro. A center for study and research preserving thousands of artworks created by people with profound psychic experiences."
  },
  nise: {
    title: "NISE DA SILVEIRA (1905-1999)",
    content: "Revolutionary Brazilian psychiatrist who transformed mental health treatment through art therapy. She rejected aggressive treatments, championing creative expression as a pathway to healing."
  },
  workshops: {
    title: "ATELIÊS TERAPÊUTICOS",
    content: "Therapeutic workshops where patients express themselves through painting and sculpture. Most artists had no prior training, creating with complete creative freedom guided by their 'inner music'."
  },
  collection: {
    title: "THE COLLECTION",
    content: "Thousands of artworks revealing the depths of human psychology. These images serve as windows into the unconscious, expressing what words cannot capture."
  },
  research: {
    title: "CENTRO DE ESTUDOS",
    content: "Years of research material studying artistic expressions from deep psychological states. The museum continues Nise's legacy of understanding the inner world through images."
  },
  location: {
    title: "VISIT THE MUSEUM",
    content: "Rua Ramiro Magalhães, 521, Engenho de Dentro, Rio de Janeiro. Open Tuesday-Saturday, 10h-16h. Free entry."
  }
}

// Artwork descriptions - inspired by the unconscious
const artworks = [
  { title: "Mandala", artist: "Anonymous", description: "Circular patterns emerging from the unconscious" },
  { title: "Inner Landscape", artist: "Workshop Patient", description: "A world seen through different eyes" },
  { title: "The Garden", artist: "Therapeutic Atelier", description: "Nature as metaphor for the psyche" },
  { title: "Cosmic Vision", artist: "Anonymous", description: "The universe within and without" }
]

// Map specific locations to specific content
const contentMap = {
  // Info plaques (type 2) by position
  '3,2': 'entrance',
  '15,2': 'nise',
  '3,10': 'workshops',
  '15,10': 'collection',
  '3,16': 'research',
  '15,16': 'location',
  // Artworks (type 3) by position
  '6,5': 0,
  '13,5': 1,
  '6,12': 2,
  '13,12': 3
}

export default function Raycaster({ onRoomEnter, onPortalTouch }) {
  const canvasRef = useRef(null)
  const [currentRoom, setCurrentRoom] = useState(null)
  const [lookingAt, setLookingAt] = useState(null)
  const animationRef = useRef(null)

  // Player state - start in center of museum
  const playerRef = useRef({
    x: 10,
    y: 10,
    dirX: 0,
    dirY: -1,
    planeX: 0.66,
    planeY: 0,
    moveSpeed: 0.05,
    rotSpeed: 0.03
  })

  // Input state
  const keysRef = useRef({})

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const width = canvas.width
    const height = canvas.height

    // Handle keyboard input
    const handleKeyDown = (e) => {
      keysRef.current[e.key.toLowerCase()] = true
    }

    const handleKeyUp = (e) => {
      keysRef.current[e.key.toLowerCase()] = false
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    // Track what player is looking at (local to render loop)
    let centerLook = { type: 0, x: 0, y: 0, dist: 999 }

    // Raycasting render loop
    const render = () => {
      centerLook = { type: 0, x: 0, y: 0, dist: 999 }
      const player = playerRef.current
      const keys = keysRef.current

      // Movement - allow walking through portals (5,6,7) but not walls (1)
      if (keys['w'] || keys['arrowup']) {
        const newX = player.x + player.dirX * player.moveSpeed
        const newY = player.y + player.dirY * player.moveSpeed
        const cellType = worldMap[Math.floor(newY)][Math.floor(newX)]
        if (cellType === 0 || cellType >= 5) {
          player.x = newX
          player.y = newY
        }
      }

      if (keys['s'] || keys['arrowdown']) {
        const newX = player.x - player.dirX * player.moveSpeed
        const newY = player.y - player.dirY * player.moveSpeed
        const cellType = worldMap[Math.floor(newY)][Math.floor(newX)]
        if (cellType === 0 || cellType >= 5) {
          player.x = newX
          player.y = newY
        }
      }

      // Rotation
      if (keys['a'] || keys['arrowleft']) {
        const oldDirX = player.dirX
        player.dirX = player.dirX * Math.cos(player.rotSpeed) - player.dirY * Math.sin(player.rotSpeed)
        player.dirY = oldDirX * Math.sin(player.rotSpeed) + player.dirY * Math.cos(player.rotSpeed)
        const oldPlaneX = player.planeX
        player.planeX = player.planeX * Math.cos(player.rotSpeed) - player.planeY * Math.sin(player.rotSpeed)
        player.planeY = oldPlaneX * Math.sin(player.rotSpeed) + player.planeY * Math.cos(player.rotSpeed)
      }

      if (keys['d'] || keys['arrowright']) {
        const oldDirX = player.dirX
        player.dirX = player.dirX * Math.cos(-player.rotSpeed) - player.dirY * Math.sin(-player.rotSpeed)
        player.dirY = oldDirX * Math.sin(-player.rotSpeed) + player.dirY * Math.cos(-player.rotSpeed)
        const oldPlaneX = player.planeX
        player.planeX = player.planeX * Math.cos(-player.rotSpeed) - player.planeY * Math.sin(-player.rotSpeed)
        player.planeY = oldPlaneX * Math.sin(-player.rotSpeed) + player.planeY * Math.cos(-player.rotSpeed)
      }

      // Clear screen - museum atmosphere
      ctx.fillStyle = '#2a2a2a' // Darker ceiling
      ctx.fillRect(0, 0, width, height / 2)
      ctx.fillStyle = '#1a1a1a' // Dark floor
      ctx.fillRect(0, height / 2, width, height / 2)

      // Raycasting
      for (let x = 0; x < width; x++) {
        const cameraX = 2 * x / width - 1
        const rayDirX = player.dirX + player.planeX * cameraX
        const rayDirY = player.dirY + player.planeY * cameraX

        let mapX = Math.floor(player.x)
        let mapY = Math.floor(player.y)

        const deltaDistX = Math.abs(1 / rayDirX)
        const deltaDistY = Math.abs(1 / rayDirY)

        let stepX, stepY
        let sideDistX, sideDistY

        if (rayDirX < 0) {
          stepX = -1
          sideDistX = (player.x - mapX) * deltaDistX
        } else {
          stepX = 1
          sideDistX = (mapX + 1.0 - player.x) * deltaDistX
        }

        if (rayDirY < 0) {
          stepY = -1
          sideDistY = (player.y - mapY) * deltaDistY
        } else {
          stepY = 1
          sideDistY = (mapY + 1.0 - player.y) * deltaDistY
        }

        // DDA algorithm
        let hit = 0
        let side = 0

        while (hit === 0) {
          if (sideDistX < sideDistY) {
            sideDistX += deltaDistX
            mapX += stepX
            side = 0
          } else {
            sideDistY += deltaDistY
            mapY += stepY
            side = 1
          }

          if (worldMap[mapY][mapX] > 0) hit = 1
        }

        // Calculate wall distance
        let perpWallDist
        if (side === 0) {
          perpWallDist = (mapX - player.x + (1 - stepX) / 2) / rayDirX
        } else {
          perpWallDist = (mapY - player.y + (1 - stepY) / 2) / rayDirY
        }

        // Calculate wall height
        const lineHeight = Math.floor(height / perpWallDist)
        const drawStart = Math.max(0, -lineHeight / 2 + height / 2)
        const drawEnd = Math.min(height, lineHeight / 2 + height / 2)

        // Wall rendering - museum themed
        const wallType = worldMap[mapY][mapX]
        let color = '#3a3a3a' // Default wall color (darker gray)

        // Info plaques - blue tint
        if (wallType === 2) {
          color = '#2d4a6e'
        }
        // Artworks - warm tint
        else if (wallType === 3) {
          const time = Date.now() * 0.0005
          const pulse = Math.sin(time) * 0.1 + 0.9
          const r = Math.floor(80 * pulse)
          const g = Math.floor(60 * pulse)
          const b = Math.floor(40 * pulse)
          color = `rgb(${r},${g},${b})`
        }

        // Darken side walls for depth
        if (side === 1) {
          const rgb = color.startsWith('#') ? parseInt(color.slice(1), 16) : null
          if (rgb !== null) {
            const r = Math.floor(((rgb >> 16) & 255) * 0.6)
            const g = Math.floor(((rgb >> 8) & 255) * 0.6)
            const b = Math.floor((rgb & 255) * 0.6)
            color = `rgb(${r},${g},${b})`
          } else {
            // Already rgb format
            color = color.replace(/rgb\((\d+),(\d+),(\d+)\)/, (_, r, g, b) =>
              `rgb(${Math.floor(r*0.6)},${Math.floor(g*0.6)},${Math.floor(b*0.6)})`
            )
          }
        }

        // Track what we're looking at (center of screen)
        if (x === Math.floor(width / 2)) {
          centerLook = { type: wallType, x: mapX, y: mapY, dist: perpWallDist }
        }

        ctx.fillStyle = color
        ctx.fillRect(x, drawStart, 1, drawEnd - drawStart)
      }

      // Update looking at info
      if (centerLook.dist < 3) { // Close enough to read
        const posKey = `${centerLook.x},${centerLook.y}`
        const content = contentMap[posKey]

        if (centerLook.type === 2 && content && typeof content === 'string') {
          // Info plaque
          const info = museumInfo[content]
          if (info) {
            setLookingAt({ type: 'info', ...info })
          } else {
            setLookingAt(null)
          }
        } else if (centerLook.type === 3 && content !== undefined && typeof content === 'number') {
          // Artwork
          const artwork = artworks[content]
          if (artwork) {
            setLookingAt({ type: 'art', ...artwork })
          } else {
            setLookingAt(null)
          }
        } else {
          setLookingAt(null)
        }
      } else {
        setLookingAt(null)
      }

      animationRef.current = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [currentRoom, onRoomEnter])

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: '#000' }}>
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        style={{
          width: '100%',
          height: '100%',
          imageRendering: 'pixelated'
        }}
      />

      {/* Museum Title */}
      <div
        style={{
          position: 'absolute',
          top: '30px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontFamily: 'monospace',
          fontSize: '14px',
          color: 'rgba(255, 255, 255, 0.9)',
          textAlign: 'center',
          letterSpacing: '3px',
          textTransform: 'uppercase',
          textShadow: '0 2px 8px rgba(0,0,0,0.8)'
        }}
      >
        Museu de Imagens do Inconsciente
      </div>

      {/* Information Display */}
      {lookingAt && (
        <div
          style={{
            position: 'absolute',
            top: '80px',
            left: '50%',
            transform: 'translateX(-50%)',
            maxWidth: '600px',
            background: 'rgba(0, 0, 0, 0.9)',
            border: '1px solid rgba(26, 115, 232, 0.5)',
            borderRadius: '8px',
            padding: '20px 30px',
            fontFamily: 'monospace',
            color: '#fff',
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
            animation: 'fadeIn 0.3s ease'
          }}
        >
          <div style={{
            fontSize: '16px',
            fontWeight: 'bold',
            marginBottom: '10px',
            color: '#1a73e8',
            letterSpacing: '1px'
          }}>
            {lookingAt.type === 'info' ? lookingAt.title : lookingAt.title}
          </div>
          <div style={{
            fontSize: '13px',
            lineHeight: '1.6',
            color: 'rgba(255, 255, 255, 0.85)'
          }}>
            {lookingAt.type === 'info' ? lookingAt.content : (
              <>
                <div style={{ marginBottom: '8px' }}>
                  <span style={{ color: '#1a73e8' }}>Artist:</span> {lookingAt.artist}
                </div>
                <div>{lookingAt.description}</div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Minimap */}
      <div
        style={{
          position: 'absolute',
          bottom: '30px',
          right: '30px',
          width: '180px',
          height: '180px',
          background: 'rgba(0, 0, 0, 0.8)',
          border: '1px solid rgba(26, 115, 232, 0.3)',
          borderRadius: '4px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.5)',
          padding: '10px'
        }}
      >
        <svg width="160" height="160" viewBox="0 0 20 20">
          {worldMap.map((row, y) =>
            row.map((cell, x) => {
              if (cell > 0) {
                let color = '#444'
                let opacity = 0.8

                // Info plaques
                if (cell === 2) {
                  color = '#2d4a6e'
                  opacity = 1
                }
                // Artworks
                else if (cell === 3) {
                  color = '#8b6f47'
                  opacity = 1
                }

                return (
                  <rect
                    key={`${x}-${y}`}
                    x={x}
                    y={y}
                    width="1"
                    height="1"
                    fill={color}
                    opacity={opacity}
                  />
                )
              }
              return null
            })
          )}
          {/* Player position */}
          <circle
            cx={playerRef.current.x}
            cy={playerRef.current.y}
            r="0.3"
            fill="#1a73e8"
          />
          {/* Player direction indicator */}
          <line
            x1={playerRef.current.x}
            y1={playerRef.current.y}
            x2={playerRef.current.x + playerRef.current.dirX * 0.8}
            y2={playerRef.current.y + playerRef.current.dirY * 0.8}
            stroke="#1a73e8"
            strokeWidth="0.15"
          />
        </svg>
      </div>

      {/* Controls Info */}
      <div
        style={{
          position: 'absolute',
          bottom: '30px',
          left: '30px',
          background: 'rgba(0, 0, 0, 0.8)',
          border: '1px solid rgba(26, 115, 232, 0.3)',
          padding: '12px 16px',
          borderRadius: '4px',
          fontFamily: 'monospace',
          fontSize: '12px',
          color: 'rgba(255, 255, 255, 0.7)',
          lineHeight: '1.6'
        }}
      >
        <div><strong style={{ color: '#1a73e8' }}>WASD</strong> or <strong style={{ color: '#1a73e8' }}>Arrows</strong> to move</div>
        <div style={{ marginTop: '4px', fontSize: '11px' }}>Walk close to blue plaques and artworks</div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(-50%) translateY(-10px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  )
}
