import { useState, useEffect } from 'react'
import { Canvas, useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { OrbitControls } from '@react-three/drei'
import Raycaster from './Raycaster'
import Mandala from './modules/Mandala'

function SharinganModel() {
  const gltf = useLoader(GLTFLoader, '/nise/sharingan_naruto.glb')

  return (
    <primitive
      object={gltf.scene}
      scale={2}
      position={[0, 0, 0]}
      rotation={[0, 0, 0]}
    />
  )
}

function MinimapNav({ currentSection, onNavigate }) {
  const [hoveredSection, setHoveredSection] = useState(null)
  const [needleAngle, setNeedleAngle] = useState(0)
  const [showInfo, setShowInfo] = useState(false)

  const sections = [
    { id: 'projects', label: 'Projects', angle: 0 },
    { id: 'nise', label: 'Museum', angle: 120 },
    { id: 'about', label: 'About', angle: 240 }
  ]

  useEffect(() => {
    const handleMouseMove = (e) => {
      // Compass is at top: 30px, left: 30px, size: 100px
      const compassCenterX = 30 + 50
      const compassCenterY = 30 + 50

      const dx = e.clientX - compassCenterX
      const dy = e.clientY - compassCenterY

      // Calculate angle in degrees (0 = north/up)
      const angle = Math.atan2(dx, -dy) * (180 / Math.PI)
      setNeedleAngle(angle)
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div
      style={{
        position: 'fixed',
        top: '30px',
        left: '30px',
        width: '100px',
        height: '100px',
        zIndex: 1000,
        fontFamily: 'monospace'
      }}
      onMouseEnter={() => setShowInfo(true)}
      onMouseLeave={() => setShowInfo(false)}
    >
      {/* Outer ring */}
      <div style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        border: `1px solid rgba(255, 255, 255, ${showInfo ? 0.4 : 0.2})`,
        background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(10px)',
        transition: 'all 0.3s ease',
        boxShadow: showInfo ? '0 0 20px rgba(255, 255, 255, 0.1)' : 'none'
      }} />

      {/* Navigation points */}
      {sections.map((section) => {
        const angle = (section.angle - 90) * (Math.PI / 180)
        const radius = 35
        const x = 50 + Math.cos(angle) * radius
        const y = 50 + Math.sin(angle) * radius
        const isActive = currentSection === section.id
        const isHovered = hoveredSection === section.id

        return (
          <div
            key={section.id}
            onMouseEnter={() => setHoveredSection(section.id)}
            onMouseLeave={() => setHoveredSection(null)}
            onClick={() => onNavigate(section.id)}
            title={section.label}
            style={{
              position: 'absolute',
              left: `${x}px`,
              top: `${y}px`,
              transform: 'translate(-50%, -50%)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{
              width: isActive ? '10px' : isHovered ? '8px' : '6px',
              height: isActive ? '10px' : isHovered ? '8px' : '6px',
              borderRadius: '50%',
              background: isActive ? '#fff' : isHovered ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.4)',
              boxShadow: isHovered && !isActive ? '0 0 10px rgba(255, 255, 255, 0.5)' : 'none',
              transition: 'all 0.2s ease'
            }} />

            {/* Hover ripple effect */}
            {isHovered && !isActive && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                animation: 'ripple 1s ease-out infinite'
              }} />
            )}
          </div>
        )
      })}

      {/* Center dot */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '4px',
        height: '4px',
        borderRadius: '50%',
        background: 'rgba(255, 255, 255, 0.6)'
      }} />

      {/* Compass needle pointing toward mouse */}
      <svg
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: `translate(-50%, -50%) rotate(${needleAngle}deg)`,
          width: '40px',
          height: '40px',
          pointerEvents: 'none',
          transition: 'transform 0.15s ease-out'
        }}
        viewBox="0 0 40 40"
      >
        {/* Red north arrow */}
        <path
          d="M 20 8 L 23 20 L 17 20 Z"
          fill="#ff4444"
        />
        {/* White south arrow */}
        <path
          d="M 20 32 L 23 20 L 17 20 Z"
          fill="rgba(255, 255, 255, 0.6)"
        />
      </svg>

      {/* Hover info tooltip */}
      {showInfo && (
        <div style={{
          position: 'absolute',
          left: '110px',
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'rgba(0, 0, 0, 0.9)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '4px',
          padding: '8px 12px',
          whiteSpace: 'nowrap',
          fontSize: '11px',
          color: 'rgba(255, 255, 255, 0.8)',
          animation: 'slideIn 0.2s ease',
          pointerEvents: 'none'
        }}>
          Click sections to navigate
        </div>
      )}

      <style>{`
        @keyframes ripple {
          0% {
            transform: translate(-50%, -50%) scale(0.5);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) scale(2);
            opacity: 0;
          }
        }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-50%) translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(-50%) translateX(0);
          }
        }
      `}</style>
    </div>
  )
}

function ProjectGraph() {
  const [selectedNode, setSelectedNode] = useState(null)
  const [hoveredNode, setHoveredNode] = useState(null)

  const projects = [
    { id: 1, name: 'L1NE', type: 'STARTUP', x: 50, y: 20, connections: [2, 5], link: 'https://github.com/l1ne-company/.github' },
    { id: 2, name: 'blink', type: 'OSS', x: 30, y: 40, connections: [3], link: 'https://github.com/open-sh/blink' },
    { id: 3, name: 'hexis-school', type: 'OSS', x: 20, y: 60, connections: [6], link: 'https://github.com/c0utin/hexis-school' },
    { id: 4, name: 'guidorizzi', type: 'RESEARCH', x: 70, y: 40, connections: [5], link: 'https://github.com/c0utin/guidorizzi' },
    { id: 5, name: 'toga', type: 'INFRA', x: 60, y: 60, connections: [8], link: 'https://github.com/c0utin/toga' },
    { id: 6, name: 'tcp-no-reason', type: 'OSS', x: 40, y: 80, connections: [7], link: 'https://github.com/c0utin/tcp-no-reason' },
    { id: 7, name: 'vex', type: 'HACKATHON', x: 50, y: 95, connections: [], link: 'https://github.com/c0utin/vex' },
    { id: 8, name: 'Trustless Cards', type: 'HACKATHON', x: 75, y: 75, connections: [9], link: 'https://github.com/Trustless-Card/trustless-cards' },
    { id: 9, name: 'Marselo', type: 'HACKATHON', x: 85, y: 55, connections: [10], link: 'https://github.com/marselo-software/marselo-coprocessor' },
    { id: 10, name: 'Data Mining', type: 'HACKATHON', x: 80, y: 35, connections: [11], link: 'https://github.com/c0utin/data_mining_motoko' },
    { id: 11, name: 'Law Hunter', type: 'PROF', x: 65, y: 15, connections: [12], link: 'https://www.linkedin.com/feed/update/urn:li:activity:7250521610812604416/' },
    { id: 12, name: 'Asimov', type: 'PROF', x: 45, y: 5, connections: [], link: 'https://www.gov.br/cvm/pt-br/assuntos/noticias/2024/cvm-recebe-primeira-entrega-referente-a-parceria-com-o-inteli' }
  ]

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      position: 'relative',
      background: '#000',
      overflow: 'hidden',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Simple header */}
      <div style={{
        position: 'absolute',
        top: '30px',
        right: '30px',
        fontSize: '0.875rem',
        color: 'rgba(255, 255, 255, 0.6)',
        zIndex: 10
      }}>
        <a href="https://github.com/c0utin" target="_blank" rel="noopener noreferrer" style={{
          color: 'inherit',
          textDecoration: 'none'
        }}>
          @c0utin
        </a>
      </div>

      {/* Graph SVG */}
      <svg style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 1
      }}>
        {/* Draw connections */}
        {projects.map(project =>
          project.connections.map(targetId => {
            const target = projects.find(p => p.id === targetId)
            if (!target) return null

            const isHighlighted = hoveredNode === project.id || hoveredNode === target.id

            return (
              <line
                key={`${project.id}-${targetId}`}
                x1={`${project.x}%`}
                y1={`${project.y}%`}
                x2={`${target.x}%`}
                y2={`${target.y}%`}
                stroke={isHighlighted ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.15)'}
                strokeWidth="1"
                style={{ transition: 'all 0.3s ease' }}
              />
            )
          })
        )}
      </svg>

      {/* Project nodes */}
      {projects.map(project => {
        const isSelected = selectedNode === project.id
        const isHovered = hoveredNode === project.id
        const showInfo = isHovered || isSelected

        return (
          <div
            key={project.id}
            onMouseEnter={() => setHoveredNode(project.id)}
            onMouseLeave={() => setHoveredNode(null)}
            onClick={() => setSelectedNode(isSelected ? null : project.id)}
            style={{
              position: 'absolute',
              left: `${project.x}%`,
              top: `${project.y}%`,
              transform: 'translate(-50%, -50%)',
              cursor: 'pointer',
              zIndex: showInfo ? 5 : 2
            }}
          >
            {/* Node */}
            <div style={{
              width: showInfo ? '12px' : '8px',
              height: showInfo ? '12px' : '8px',
              borderRadius: '50%',
              background: '#fff',
              boxShadow: isHovered ? '0 0 12px rgba(255, 255, 255, 0.6)' : 'none',
              transition: 'all 0.2s ease'
            }} />

            {/* Label */}
            <div style={{
              position: 'absolute',
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              marginTop: '8px',
              fontSize: '0.75rem',
              color: showInfo ? '#fff' : 'rgba(255, 255, 255, 0.5)',
              whiteSpace: 'nowrap',
              transition: 'color 0.2s ease'
            }}>
              {project.name}
            </div>

            {/* Info panel on hover/select */}
            {showInfo && (
              <div style={{
                position: 'absolute',
                top: '120%',
                left: '50%',
                transform: 'translateX(-50%)',
                marginTop: '20px',
                padding: '0.75rem 1rem',
                background: 'rgba(0, 0, 0, 0.9)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '4px',
                fontSize: '0.75rem',
                color: 'rgba(255, 255, 255, 0.7)',
                whiteSpace: 'nowrap',
                zIndex: 10,
                animation: 'fadeIn 0.2s ease'
              }}>
                <div style={{ marginBottom: '0.5rem', color: '#fff' }}>
                  {project.name}
                </div>
                <div style={{ fontSize: '0.625rem', marginBottom: '0.75rem' }}>
                  {project.type}
                </div>
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: '#fff',
                    textDecoration: 'none',
                    fontSize: '0.75rem'
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  View →
                </a>
              </div>
            )}
          </div>
        )
      })}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
      `}</style>
    </div>
  )
}

function LandingPage({ onEnter, onNavigate }) {
  const [buttonClicks, setButtonClicks] = useState(0)
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 })
  const [isShaking, setIsShaking] = useState(false)
  const [isGlitching, setIsGlitching] = useState(false)
  const [showWarning, setShowWarning] = useState(false)
  const [isChaos, setIsChaos] = useState(false)
  const [isDestroying, setIsDestroying] = useState(false)

  // Load Unicorn Studio script
  useEffect(() => {
    if (!window.UnicornStudio) {
      window.UnicornStudio = { isInitialized: false }
      const script = document.createElement('script')
      script.src = 'https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v1.4.33/dist/unicornStudio.umd.js'
      script.onload = () => {
        if (!window.UnicornStudio.isInitialized) {
          window.UnicornStudio.init()
          window.UnicornStudio.isInitialized = true
        }
      }
      ;(document.head || document.body).appendChild(script)
    }

    // Hide the badge after it's rendered
    const hideBadge = () => {
      // Target by href
      const badges = document.querySelectorAll('a[href*="unicorn.studio"]')
      badges.forEach(badge => {
        badge.style.display = 'none !important'
        badge.style.visibility = 'hidden !important'
        badge.style.opacity = '0 !important'
      })

      // Target by alt text
      const images = document.querySelectorAll('img[alt*="unicorn"]')
      images.forEach(img => {
        if (img.parentElement) {
          img.parentElement.style.display = 'none !important'
          img.parentElement.style.visibility = 'hidden !important'
          img.parentElement.style.opacity = '0 !important'
        }
        img.style.display = 'none !important'
        img.style.visibility = 'hidden !important'
        img.style.opacity = '0 !important'
      })

      // Target by exact alt text
      const exactImages = document.querySelectorAll('img[alt="Made with unicorn.studio"]')
      exactImages.forEach(img => {
        if (img.parentElement) {
          img.parentElement.style.display = 'none !important'
          img.parentElement.style.visibility = 'hidden !important'
          img.parentElement.style.opacity = '0 !important'
        }
        img.style.display = 'none !important'
      })
    }

    // Check repeatedly for the badge and hide it
    const interval = setInterval(hideBadge, 100)
    setTimeout(() => clearInterval(interval), 10000) // Stop after 10 seconds

    return () => clearInterval(interval)
  }, [])

  const handleButtonClick = () => {
    if (buttonClicks === 0) {
      setButtonClicks(1)
    } else if (buttonClicks === 1) {
      setButtonClicks(2)
      const randomX = (Math.random() - 0.5) * 300
      const downY = window.innerHeight * 0.8
      setButtonPosition({ x: randomX, y: downY })

      setTimeout(() => {
        window.scrollTo({
          top: window.innerHeight * 0.5,
          behavior: 'smooth'
        })
      }, 300)
    } else if (buttonClicks === 2) {
      setButtonClicks(3)
      setIsShaking(true)
      setShowWarning(true)
      const randomX = (Math.random() - 0.5) * 400
      const randomY = (Math.random() - 0.5) * 200
      setButtonPosition({ x: randomX, y: randomY })

      setTimeout(() => setIsShaking(false), 500)
    } else if (buttonClicks === 3) {
      setButtonClicks(4)
      setIsGlitching(true)
      setShowWarning(true)

      // Aggressive button movement
      const interval = setInterval(() => {
        const x = (Math.random() - 0.5) * 600
        const y = (Math.random() - 0.5) * 400
        setButtonPosition({ x, y })
      }, 100)

      setTimeout(() => {
        clearInterval(interval)
        setIsGlitching(false)
      }, 1500)
    } else if (buttonClicks === 4) {
      // COMPLETE CHAOS - DESTROY EVERYTHING
      setButtonClicks(5)
      setIsChaos(true)
      setIsDestroying(true)
      setButtonPosition({ x: 0, y: 0 })

      // Show error messages cascading
      const errors = [
        'Error: FATAL - System corrupted',
        'Stack overflow at button.onClick()',
        'Effect.die() called',
        'Memory leak detected: 999999GB',
        'Segmentation fault (core dumped)',
        'Runtime exception: Reality.js:404',
        'CRITICAL: Universe.tsx collapsed',
        'ERR_CONNECTION_REFUSED: sanity',
      ]

      // Cascade error messages
      errors.forEach((error, i) => {
        setTimeout(() => {
          const errorDiv = document.createElement('div')
          errorDiv.textContent = error
          errorDiv.style.cssText = `
            position: fixed;
            top: ${Math.random() * 80}%;
            left: ${Math.random() * 80}%;
            background: rgba(255, 0, 0, 0.9);
            color: white;
            padding: 8px 16px;
            font-family: monospace;
            font-size: 12px;
            border: 2px solid red;
            z-index: 9999;
            animation: error-spawn 0.3s ease-out, float-error 2s ease-in-out infinite;
            pointer-events: none;
          `
          document.body.appendChild(errorDiv)

          setTimeout(() => errorDiv.remove(), 3000)
        }, i * 200)
      })

      // Redirect after chaos
      setTimeout(() => {
        onEnter()
      }, 3000)
    }
  }

  const getButtonText = () => {
    if (buttonClicks === 0) return 'Explore Portfolio'
    if (buttonClicks === 1) return "dont press the button"
    if (buttonClicks === 2) return "are you sure"
    if (buttonClicks === 3) return "押すな"
    if (buttonClicks === 4) return "FATAL ERROR"
    return "OK YOU WIN"
  }

  const getButtonStyle = () => {
    const baseStyle = {
      transform: `translate(${buttonPosition.x}px, ${buttonPosition.y}px)`,
      transition: buttonClicks >= 3 ? 'none' : 'transform 0.3s ease, scale 0.3s ease, background 0.3s ease'
    }

    if (buttonClicks === 3) {
      return {
        ...baseStyle,
        background: '#ff0000',
        color: '#fff',
        animation: isShaking ? 'shake 0.5s ease-in-out' : 'pulse-red 1s ease-in-out infinite',
        boxShadow: '0 0 30px rgba(255, 0, 0, 0.8), 0 0 60px rgba(255, 0, 0, 0.4)',
        border: '2px solid #fff',
        fontWeight: 'bold',
        fontSize: '1.5rem'
      }
    }

    if (buttonClicks === 4) {
      return {
        ...baseStyle,
        background: '#000',
        color: '#ff0000',
        animation: isGlitching ? 'glitch 0.1s infinite, shake-intense 0.1s infinite' : 'none',
        boxShadow: '0 0 40px rgba(255, 0, 0, 1), 0 0 80px rgba(255, 0, 0, 0.6), inset 0 0 20px rgba(255, 0, 0, 0.5)',
        border: '3px solid #ff0000',
        fontWeight: 'bold',
        fontSize: '1.2rem',
        textShadow: '0 0 10px #ff0000',
        letterSpacing: '2px'
      }
    }

    if (buttonClicks === 5) {
      return {
        ...baseStyle,
        background: '#00ff00',
        color: '#000',
        animation: 'blink-win 0.3s infinite, rotate-chaos 2s linear infinite',
        boxShadow: '0 0 60px rgba(0, 255, 0, 1), 0 0 120px rgba(0, 255, 0, 0.6)',
        border: '4px solid #fff',
        fontWeight: 'bold',
        fontSize: '2rem',
        textShadow: '0 0 20px #00ff00',
        letterSpacing: '4px'
      }
    }

    return baseStyle
  }

  return (
    <div className="w-full min-h-screen bg-black text-white overflow-y-auto overflow-x-hidden" style={{
      animation: isChaos ? 'page-destroy 3s ease-in-out' : 'none',
      filter: isChaos ? 'hue-rotate(180deg) saturate(3)' : 'none'
    }}>
      <style>{`
        a[href*="unicorn.studio"],
        a[href*="unicorn"] {
          display: none !important;
        }

        /* Additional targeting for the badge */
        a[href*="utm_source=public-url"] {
          display: none !important;
        }
      `}</style>
      {/* Cover for Unicorn Studio badge - large black box */}
      <div style={{
        position: 'fixed',
        bottom: '0px',
        left: '0px',
        right: '0px',
        width: '100%',
        height: '120px',
        background: '#000',
        zIndex: 9999999999,
        pointerEvents: 'none'
      }} />
      {/* FATAL ERROR OVERLAY */}
      {isChaos && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none" style={{
          background: 'rgba(0, 0, 0, 0.95)',
          animation: 'fade-in-error 0.3s ease-out'
        }}>
          <div style={{
            textAlign: 'center',
            animation: 'glitch-text 0.2s infinite'
          }}>
            <div style={{
              fontSize: '4rem',
              fontWeight: 'bold',
              color: '#ff0000',
              fontFamily: 'monospace',
              textShadow: '0 0 20px #ff0000, 0 0 40px #ff0000',
              marginBottom: '1rem',
              animation: 'pulse-error 0.5s infinite'
            }}>
              ☠️ FATAL ERROR ☠️
            </div>
            <div style={{
              fontSize: '1.5rem',
              color: '#fff',
              fontFamily: 'monospace',
              marginBottom: '2rem',
              animation: 'glitch-text 0.3s infinite'
            }}>
              Effect.die() called
            </div>
            <div style={{
              fontSize: '1rem',
              color: '#ff6666',
              fontFamily: 'monospace',
              padding: '1rem',
              border: '2px solid #ff0000',
              backgroundColor: 'rgba(255, 0, 0, 0.2)',
              maxWidth: '600px',
              margin: '0 auto',
              textAlign: 'left'
            }}>
              <div>Error: FATAL - System corrupted</div>
              <div>at LandingPage.handleButtonClick (App.jsx:432)</div>
              <div>at onClick (button.tsx:89)</div>
              <div>at Reality.render (Universe.tsx:404)</div>
              <div>❌ Unrecoverable defect detected</div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section with Animation Background */}
      <section className="relative w-full h-screen flex items-center justify-center" style={{
        animation: isChaos ? 'section-chaos 0.1s infinite' : 'none'
      }}>
        {/* Navigation Header */}
        <div className="absolute top-0 left-0 right-0 z-20 px-6 py-6" style={{
          animation: isChaos ? 'fly-away 2s ease-out forwards' : 'none',
          transform: isChaos ? 'rotate(45deg) scale(2)' : 'none'
        }}>
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="text-xl font-semibold" style={{
              animation: isChaos ? 'text-explode 1s ease-out' : 'none'
            }}>@c0utin</div>
            <a
              href="https://github.com/c0utin"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-400 hover:text-white transition-colors"
              style={{
                animation: isChaos ? 'text-explode 1.5s ease-out' : 'none'
              }}
            >
              GitHub
            </a>
          </div>
        </div>

        {/* Background Animation - Unicorn Studio */}
        <div className="absolute inset-0 w-full h-full flex items-center justify-center overflow-hidden">
          <div
            data-us-project="kvwITwojiQbPW2UkzTrP"
            style={{
              width: '100%',
              height: '100%',
              opacity: 1,
              filter: isChaos ? 'brightness(2) contrast(3) hue-rotate(360deg) invert(1)' : 'none',
              transform: isChaos ? 'scale(3) rotate(720deg)' : 'scale(1)',
              animation: isChaos ? 'bg-destroy 2s ease-in-out forwards' : 'none'
            }}
          />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center" style={{
          animation: isChaos ? 'content-shatter 2s ease-out forwards' : 'none',
          transform: isChaos ? 'rotate(-15deg) skewX(-20deg)' : 'none'
        }}>
          {showWarning && buttonClicks >= 3 && (
            <div className="fixed top-10 left-1/2 -translate-x-1/2 z-50 bg-red-600 text-white px-6 py-3 rounded-lg font-mono text-sm border-2 border-white" style={{
              animation: isChaos ? 'fly-away 1.5s ease-out forwards' : 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
            }}>
              ⚠️ WARNING: Effect.die() - System will terminate
            </div>
          )}

          <button
            onClick={handleButtonClick}
            className="inline-flex items-center gap-3 px-10 py-4 text-lg font-medium bg-white text-black hover:bg-gray-200 rounded-md transition-all duration-300 hover:scale-105"
            style={getButtonStyle()}
          >
            {getButtonText()}
            {buttonClicks === 0 && <span>→</span>}
            {buttonClicks === 3 && <span className="ml-2">⚠️</span>}
            {buttonClicks === 4 && <span className="ml-2 animate-ping">💀</span>}
            {buttonClicks === 5 && <span className="ml-2">🎉</span>}
          </button>

          <style>{`
            @keyframes shake {
              0%, 100% { transform: translate(${buttonPosition.x}px, ${buttonPosition.y}px) rotate(0deg); }
              10%, 30%, 50%, 70%, 90% { transform: translate(${buttonPosition.x - 10}px, ${buttonPosition.y}px) rotate(-5deg); }
              20%, 40%, 60%, 80% { transform: translate(${buttonPosition.x + 10}px, ${buttonPosition.y}px) rotate(5deg); }
            }

            @keyframes pulse-red {
              0%, 100% {
                background: #ff0000;
                box-shadow: 0 0 30px rgba(255, 0, 0, 0.8), 0 0 60px rgba(255, 0, 0, 0.4);
              }
              50% {
                background: #cc0000;
                box-shadow: 0 0 50px rgba(255, 0, 0, 1), 0 0 100px rgba(255, 0, 0, 0.6);
              }
            }

            @keyframes glitch {
              0% { transform: translate(${buttonPosition.x}px, ${buttonPosition.y}px); }
              20% { transform: translate(${buttonPosition.x - 5}px, ${buttonPosition.y + 5}px); }
              40% { transform: translate(${buttonPosition.x + 5}px, ${buttonPosition.y - 5}px); }
              60% { transform: translate(${buttonPosition.x - 5}px, ${buttonPosition.y - 5}px); }
              80% { transform: translate(${buttonPosition.x + 5}px, ${buttonPosition.y + 5}px); }
              100% { transform: translate(${buttonPosition.x}px, ${buttonPosition.y}px); }
            }

            @keyframes shake-intense {
              0%, 100% { transform: translate(${buttonPosition.x}px, ${buttonPosition.y}px) rotate(0deg); }
              25% { transform: translate(${buttonPosition.x - 8}px, ${buttonPosition.y + 8}px) rotate(-10deg); }
              50% { transform: translate(${buttonPosition.x + 8}px, ${buttonPosition.y - 8}px) rotate(10deg); }
              75% { transform: translate(${buttonPosition.x - 8}px, ${buttonPosition.y - 8}px) rotate(-10deg); }
            }

            @keyframes blink-win {
              0%, 50% { opacity: 1; }
              25%, 75% { opacity: 0; }
            }

            @keyframes rotate-chaos {
              0% { transform: translate(0px, 0px) rotate(0deg) scale(1); }
              25% { transform: translate(-20px, 20px) rotate(90deg) scale(1.5); }
              50% { transform: translate(20px, -20px) rotate(180deg) scale(0.8); }
              75% { transform: translate(-20px, -20px) rotate(270deg) scale(1.3); }
              100% { transform: translate(0px, 0px) rotate(360deg) scale(1); }
            }

            @keyframes page-destroy {
              0% { transform: scale(1) rotate(0deg); }
              25% { transform: scale(1.2) rotate(10deg) skewX(5deg); }
              50% { transform: scale(0.8) rotate(-15deg) skewY(10deg); }
              75% { transform: scale(1.5) rotate(25deg) skewX(-15deg); }
              100% { transform: scale(0.5) rotate(720deg) skewY(20deg); opacity: 0; }
            }

            @keyframes section-chaos {
              0% { transform: translate(0, 0); }
              25% { transform: translate(-10px, 10px) rotate(2deg); }
              50% { transform: translate(10px, -10px) rotate(-2deg); }
              75% { transform: translate(-10px, -10px) rotate(1deg); }
              100% { transform: translate(0, 0); }
            }

            @keyframes fly-away {
              0% { transform: translate(0, 0) rotate(0deg) scale(1); opacity: 1; }
              50% { transform: translate(-200px, -100px) rotate(-45deg) scale(2); opacity: 0.5; }
              100% { transform: translate(-1000px, -500px) rotate(-180deg) scale(5); opacity: 0; }
            }

            @keyframes text-explode {
              0% { transform: scale(1) translate(0, 0); opacity: 1; filter: blur(0px); }
              50% { transform: scale(3) translate(100px, -50px); opacity: 0.5; filter: blur(5px); }
              100% { transform: scale(10) translate(500px, -200px); opacity: 0; filter: blur(20px); }
            }

            @keyframes bg-destroy {
              0% { transform: scale(1.2) rotate(0deg); filter: brightness(0.7); }
              50% { transform: scale(5) rotate(360deg); filter: brightness(5) contrast(5) saturate(5); }
              100% { transform: scale(10) rotate(1080deg); filter: brightness(0) contrast(0); }
            }

            @keyframes content-shatter {
              0% { transform: translate(0, 0) rotate(0deg) skewX(0deg); opacity: 1; }
              20% { transform: translate(-50px, 30px) rotate(-10deg) skewX(-5deg); opacity: 0.8; }
              40% { transform: translate(100px, -50px) rotate(15deg) skewX(10deg); opacity: 0.6; }
              60% { transform: translate(-80px, -100px) rotate(-25deg) skewX(-20deg); opacity: 0.4; }
              80% { transform: translate(150px, 80px) rotate(35deg) skewX(30deg); opacity: 0.2; }
              100% { transform: translate(-300px, 200px) rotate(-90deg) skewX(-50deg); opacity: 0; }
            }

            @keyframes text-break {
              0% { transform: scale(1); filter: blur(0px); letter-spacing: normal; }
              25% { transform: scale(1.5) rotate(5deg); filter: blur(2px); letter-spacing: 10px; }
              50% { transform: scale(0.5) rotate(-10deg); filter: blur(5px); letter-spacing: 20px; }
              75% { transform: scale(2) rotate(15deg); filter: blur(10px); letter-spacing: 30px; }
              100% { transform: scale(0) rotate(360deg); filter: blur(20px); letter-spacing: 50px; opacity: 0; }
            }

            @keyframes rainbow-chaos {
              0% { filter: hue-rotate(0deg) saturate(5); }
              25% { filter: hue-rotate(90deg) saturate(10); }
              50% { filter: hue-rotate(180deg) saturate(15); }
              75% { filter: hue-rotate(270deg) saturate(20); }
              100% { filter: hue-rotate(360deg) saturate(5); }
            }

            @keyframes text-scatter {
              0% { transform: translate(0, 0); opacity: 1; filter: blur(0px); }
              50% { transform: translate(200px, -100px) scale(2); opacity: 0.5; filter: blur(10px); }
              100% { transform: translate(800px, -400px) scale(5); opacity: 0; filter: blur(30px); }
            }

            @keyframes error-spawn {
              0% { transform: scale(0) rotate(-180deg); opacity: 0; }
              50% { transform: scale(1.5) rotate(10deg); opacity: 1; }
              100% { transform: scale(1) rotate(0deg); opacity: 1; }
            }

            @keyframes float-error {
              0%, 100% { transform: translateY(0px) rotate(0deg); }
              25% { transform: translateY(-10px) rotate(5deg); }
              50% { transform: translateY(5px) rotate(-3deg); }
              75% { transform: translateY(-5px) rotate(2deg); }
            }

            @keyframes fade-in-error {
              0% { opacity: 0; }
              100% { opacity: 1; }
            }

            @keyframes glitch-text {
              0% { transform: translate(0, 0) skew(0deg); }
              20% { transform: translate(-2px, 2px) skew(2deg); }
              40% { transform: translate(2px, -2px) skew(-2deg); }
              60% { transform: translate(-2px, -2px) skew(1deg); }
              80% { transform: translate(2px, 2px) skew(-1deg); }
              100% { transform: translate(0, 0) skew(0deg); }
            }

            @keyframes pulse-error {
              0%, 100% { transform: scale(1); opacity: 1; }
              50% { transform: scale(1.1); opacity: 0.8; }
            }

          `}</style>
        </div>

        <div className="absolute left-0 right-0 text-sm text-gray-500" style={{
          bottom: '0px',
          animation: isChaos ? 'text-explode 0.8s ease-out forwards' : 'bounce 1s infinite',
          opacity: isChaos ? 0 : 1,
          background: '#000',
          padding: '40px 20px 60px',
          zIndex: 999999999999,
          width: '100%',
          textAlign: 'center'
        }}>
          Scroll ↓
        </div>
      </section>

      {/* About Section */}
      <section className="relative w-full min-h-screen flex items-center justify-center bg-gradient-to-b from-black to-zinc-950">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-bold mb-8 text-center">About</h2>

          <div className="space-y-6 text-lg text-white/70 leading-relaxed">
            <p>
              I'm a software engineer passionate about pushing the boundaries of what's possible
              with code. My work spans from low-level systems to creative experiments that blend
              art and technology.
            </p>

            <p>
              Currently building innovative solutions at L1NE while contributing to open source
              projects and exploring generative art through code.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white/5 border border-white/10 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Open Source</h3>
              <p className="text-white/60">Contributing to projects like blink, hexis-school, and more</p>
            </div>

            <div className="p-6 bg-white/5 border border-white/10 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Innovation</h3>
              <p className="text-white/60">Building hackathon winners and research projects</p>
            </div>

            <div className="p-6 bg-white/5 border border-white/10 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Creative Tech</h3>
              <p className="text-white/60">Exploring generative art and interactive experiences</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative w-full bg-black border-t border-white/10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Navigation */}
            <div>
              <h3 className="text-white font-semibold mb-4">Navigation</h3>
              <ul className="space-y-2">
                <li>
                  <button onClick={() => onNavigate('landing')} className="text-white/60 hover:text-white transition-colors text-left">Home</button>
                </li>
                <li>
                  <button onClick={() => onNavigate('about')} className="text-white/60 hover:text-white transition-colors text-left">About</button>
                </li>
                <li>
                  <button onClick={() => onNavigate('projects')} className="text-white/60 hover:text-white transition-colors text-left">Projects</button>
                </li>
                <li>
                  <button onClick={() => onNavigate('nise')} className="text-white/60 hover:text-white transition-colors text-left">Museum</button>
                </li>
              </ul>
            </div>

            {/* Connect */}
            <div>
              <h3 className="text-white font-semibold mb-4">Connect</h3>
              <ul className="space-y-2">
                <li>
                  <a href="https://github.com/c0utin" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white transition-colors">
                    GitHub
                  </a>
                </li>
                <li>
                  <a href="https://twitter.com/coutin420" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white transition-colors">
                    Twitter
                  </a>
                </li>
                <li>
                  <a href="https://linkedin.com/in/rafael-coutinho2004" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white transition-colors">
                    LinkedIn
                  </a>
                </li>
		<li>
		  <a href="https://instagram.com/rcoutin" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white transition-colors">
                   Instagram 
                  </a>
	  	</li>
              </ul>
            </div>

            {/* About */}
            <div>
              <h3 className="text-white font-semibold mb-4">@c0utin</h3>
              <p className="text-white/60 text-sm">
                Software engineer, computer artist, nerd.
              </p>
            </div>

            {/* 3D Model */}
            <div className="flex items-center justify-center">
              <div style={{ width: '300px', height: '300px' }}>
                <Canvas
                  camera={{ position: [0, 3.5, 8], fov: 50 }}
                  style={{ background: 'transparent' }}
                >
                  <ambientLight intensity={1.5} />
                  <directionalLight position={[5, 5, 5]} intensity={2} />
                  <directionalLight position={[-5, 5, -5]} intensity={1} />
                  <pointLight position={[0, 5, 5]} intensity={1.5} />
                  <SharinganModel />
                  <OrbitControls
                    enableZoom={false}
                    enablePan={false}
                    enableRotate={true}
                    autoRotate={true}
                    autoRotateSpeed={2}
                    target={[0, 2.5, 0]}
                  />
                </Canvas>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default function App() {
  const [currentSection, setCurrentSection] = useState('landing')

  const handleNavigate = (sectionId) => {
    setCurrentSection(sectionId)
  }

  const handleEnterApp = () => {
    setCurrentSection('projects')
  }

  // Landing page doesn't show navigation
  if (currentSection === 'landing') {
    return <LandingPage onEnter={handleEnterApp} onNavigate={handleNavigate} />
  }

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: currentSection === 'nise' ? 'hidden' : 'auto', background: currentSection === 'nise' ? '#000000' : '#0a0a0a' }}>
      {/* Minimap Navigation - Always visible */}
      <MinimapNav currentSection={currentSection} onNavigate={handleNavigate} />

      {/* Projects Section - Graph Pathway */}
      {currentSection === 'projects' && (
        <ProjectGraph />
      )}

      {/* Nise Museum - Raycaster */}
      {currentSection === 'nise' && (
        <Raycaster onPortalTouch={(room) => setCurrentSection(room)} />
      )}

      {/* About - Posts Section */}
      {currentSection === 'about' && (
        <div style={{
          width: '100vw',
          minHeight: '100vh',
          position: 'relative',
          background: '#000',
          fontFamily: 'monospace',
          padding: '100px 30px 30px 30px',
          overflowY: 'auto'
        }}>
          <div style={{
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            <div style={{
              fontSize: '0.75rem',
              color: '#666',
              marginBottom: '1rem',
              letterSpacing: '2px'
            }}>
              [ POSTS ]
            </div>

            <h2 style={{
              fontSize: '2rem',
              color: '#fff',
              marginBottom: '3rem',
              fontWeight: '700'
            }}>
              Writing & Thoughts
            </h2>

            <div style={{
              fontSize: '0.875rem',
              lineHeight: '1.8',
              color: 'rgba(255, 255, 255, 0.6)',
              textAlign: 'center',
              padding: '4rem 2rem'
            }}>
              Coming soon...
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
