import { useRef, useEffect, useState } from 'react'
import { createSymbioticArt } from './ArtTexture'

// Map layout - 0 = empty, 1 = wall, 5-7 = portals
const worldMap = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,5,0,0,0,6,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,7,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
]

// Portal locations
const portals = {
  5: { x: 5, y: 3, room: 'projects', color: '#4ecdc4' },
  6: { x: 9, y: 3, room: 'posts', color: '#ff6b6b' },
  7: { x: 5, y: 9, room: 'nise', color: '#1a73e8' }
}

// Static art placement on specific walls
const artPlacements = [
  { x: 7, y: 0, side: 1, artId: 1 }, // Top wall, art 1
  { x: 15, y: 7, side: 0, artId: 2 }, // Right wall, art 2
  { x: 7, y: 15, side: 1, artId: 3 }  // Bottom wall, art 3
]

export default function Raycaster({ onRoomEnter, onPortalTouch }) {
  const canvasRef = useRef(null)
  const [currentRoom, setCurrentRoom] = useState(null)
  const animationRef = useRef(null)
  const artTexturesRef = useRef([])
  const inPortalRef = useRef(false)

  // Player state
  const playerRef = useRef({
    x: 8,
    y: 8,
    dirX: -1,
    dirY: 0,
    planeX: 0,
    planeY: 0.66,
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

    // Check portal collision - check if player is standing on portal
    const checkPortalCollision = () => {
      const player = playerRef.current
      const px = Math.floor(player.x)
      const py = Math.floor(player.y)

      // Check current cell
      const cellType = worldMap[py]?.[px]

      if (cellType >= 5 && cellType <= 7 && portals[cellType]) {
        if (!inPortalRef.current) {
          inPortalRef.current = true
          const portal = portals[cellType]
          console.log('Portal detected! Type:', cellType, 'Room:', portal.room, 'Position:', px, py)

          // Small delay to ensure state update
          setTimeout(() => {
            if (onPortalTouch) {
              console.log('Calling onPortalTouch with:', portal.room)
              onPortalTouch(portal.room)
            } else {
              console.log('onPortalTouch is undefined!')
            }
          }, 100)
        }
      } else {
        inPortalRef.current = false
      }
    }

    // Raycasting render loop
    const render = () => {
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

      // Clear screen
      ctx.fillStyle = '#fafafa'
      ctx.fillRect(0, 0, width, height / 2)
      ctx.fillStyle = '#e0e0e0'
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

        // Wall rendering - simple solid colors only
        const wallType = worldMap[mapY][mapX]
        let color = '#e0e0e0'

        // Portals have special animated colors
        if (wallType >= 5 && wallType <= 7 && portals[wallType]) {
          const time = Date.now() * 0.001
          const pulse = Math.sin(time * 3) * 0.3 + 0.7
          const portalColor = portals[wallType].color
          const rgb = parseInt(portalColor.slice(1), 16)
          const r = Math.floor(((rgb >> 16) & 255) * pulse)
          const g = Math.floor(((rgb >> 8) & 255) * pulse)
          const b = Math.floor((rgb & 255) * pulse)
          color = `rgb(${r},${g},${b})`
        }

        // Darken side walls for depth
        if (side === 1) {
          const rgb = parseInt(color.slice(1), 16)
          const r = Math.floor(((rgb >> 16) & 255) * 0.7)
          const g = Math.floor(((rgb >> 8) & 255) * 0.7)
          const b = Math.floor((rgb & 255) * 0.7)
          color = `rgb(${r},${g},${b})`
        }

        ctx.fillStyle = color
        ctx.fillRect(x, drawStart, 1, drawEnd - drawStart)
      }

      checkPortalCollision()
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
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
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

      {/* Compass Minimap */}
      <div
        style={{
          position: 'absolute',
          top: '40px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '180px',
          height: '180px',
          background: 'rgba(255, 255, 255, 0.95)',
          border: '1px solid #e0e0e0',
          borderRadius: '50%',
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          padding: '10px'
        }}
      >
        <svg width="160" height="160" viewBox="0 0 16 16" style={{ filter: 'contrast(1.2)' }}>
          {worldMap.map((row, y) =>
            row.map((cell, x) => {
              if (cell > 0) {
                let color = '#999'
                let opacity = 0.6

                // Portals
                if (cell === 5) {
                  color = '#4ecdc4'
                  opacity = 0.9
                }
                else if (cell === 6) {
                  color = '#ff6b6b'
                  opacity = 0.9
                }
                else if (cell === 7) {
                  color = '#1a73e8'
                  opacity = 0.9
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
          {/* Player position - updates with render */}
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
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(255, 255, 255, 0.95)',
          padding: '12px 20px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          fontSize: '13px',
          color: '#666',
          textAlign: 'center'
        }}
      >
        <strong style={{ color: '#333' }}>WASD</strong> or <strong style={{ color: '#333' }}>Arrow Keys</strong> to move • Walk into colored portals to enter sections
      </div>
    </div>
  )
}
