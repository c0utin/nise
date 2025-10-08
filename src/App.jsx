import { useState, useEffect } from 'react'
import Raycaster from './Raycaster'

function MinimapNav({ currentSection, onNavigate }) {
  const [hoveredSection, setHoveredSection] = useState(null)

  const sections = [
    { id: 'projects', label: 'Projects', angle: 0 },
    { id: 'nise', label: 'Museum', angle: 120 },
    { id: 'about', label: 'About', angle: 240 }
  ]

  return (
    <div style={{
      position: 'fixed',
      top: '30px',
      left: '30px',
      width: '100px',
      height: '100px',
      zIndex: 1000,
      fontFamily: 'monospace'
    }}>
      {/* Outer ring */}
      <div style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(10px)',
        transition: 'border-color 0.3s ease'
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

      {/* Compass needle pointing north */}
      <svg
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '40px',
          height: '40px',
          pointerEvents: 'none'
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

export default function App() {
  const [currentSection, setCurrentSection] = useState('projects')

  const handleNavigate = (sectionId) => {
    setCurrentSection(sectionId)
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
