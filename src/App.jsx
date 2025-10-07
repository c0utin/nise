import { useState } from 'react'
import Raycaster from './Raycaster'

export default function App() {
  const [mode, setMode] = useState('raycaster') // 'raycaster' or 'website'
  const [currentSection, setCurrentSection] = useState(null)

  const handlePortalTouch = (room) => {
    setMode('website')
    setCurrentSection(room)
  }

  const handleBackToRaycaster = () => {
    setMode('raycaster')
    setCurrentSection(null)
  }

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: mode === 'raycaster' ? 'hidden' : 'auto', background: '#ffffff' }}>
      {mode === 'raycaster' ? (
        <Raycaster onPortalTouch={handlePortalTouch} />
      ) : (
        <>
          {/* Navigation */}
          <nav style={{
            position: 'fixed',
            top: 0,
            width: '100%',
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
            zIndex: 1000,
            padding: '1rem 2rem'
          }}>
            <div style={{
              maxWidth: '1400px',
              margin: '0 auto',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <button
                onClick={handleBackToRaycaster}
                style={{
                  fontSize: '1.5rem',
                  fontWeight: '500',
                  color: '#202124',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                }}
              >
                Nise
              </button>
              <div style={{ display: 'flex', gap: '2rem' }}>
                <a href="https://github.com/c0utin" target="_blank" rel="noopener noreferrer" style={{
                  color: '#5f6368',
                  textDecoration: 'none',
                  fontSize: '0.95rem',
                  transition: 'color 0.3s ease'
                }}>
                  GitHub
                </a>
              </div>
            </div>
          </nav>

            {/* Projects Section */}
            {currentSection === 'projects' && (
              <section style={{
                padding: '5rem 2rem',
                background: '#ffffff',
                marginTop: '60px',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              }}>
                <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                  <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <h2 style={{
                      fontFamily: 'Georgia, serif',
                      fontSize: '2.5rem',
                      color: '#202124',
                      marginBottom: '1rem'
                    }}>
                      Projects & Work
                    </h2>
                    <p style={{
                      fontSize: '1.1rem',
                      color: '#5f6368',
                      maxWidth: '600px',
                      margin: '0 auto'
                    }}>
                      Open source contributions, startups, and professional development
                    </p>
                  </div>

                  <div style={{
                    display: 'flex',
                    gap: '2rem',
                    overflowX: 'auto',
                    scrollBehavior: 'smooth',
                    padding: '1rem 0 2rem 0',
                    scrollbarWidth: 'none'
                  }}>
                    {/* L1NE Company Card */}
                    <div style={{
                      minWidth: '380px',
                      background: '#f8f9fa',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}>
                      <div style={{
                        height: '200px',
                        background: 'linear-gradient(135deg, #000 0%, #00ff00 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#00ff00',
                        fontSize: '1.8rem',
                        fontWeight: 'bold',
                        position: 'relative'
                      }}>
                        <span style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          background: '#00ff00',
                          color: '#000',
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '0.75rem'
                        }}>STARTUP</span>
                        L1NE Company
                      </div>
                      <div style={{ padding: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.3rem', marginBottom: '0.8rem', color: '#202124' }}>
                          Cloud-Native Without Containers
                        </h3>
                        <p style={{ color: '#5f6368', lineHeight: '1.5', marginBottom: '1rem', fontSize: '0.95rem' }}>
                          Building cloud-native paradigm on NixOS only. No containers, no Kubernetes.
                        </p>
                        <a href="https://github.com/l1ne-company/.github" target="_blank" rel="noopener noreferrer" style={{
                          color: '#1a73e8',
                          textDecoration: 'none',
                          fontSize: '0.9rem'
                        }}>View Startup →</a>
                      </div>
                    </div>

                    {/* Nise Raycaster Card */}
                    <div style={{
                      minWidth: '380px',
                      background: '#f8f9fa',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}>
                      <div style={{
                        height: '200px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '1.8rem',
                        fontWeight: 'bold'
                      }}>
                        Nise
                      </div>
                      <div style={{ padding: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.3rem', marginBottom: '0.8rem', color: '#202124' }}>
                          Raycaster Portfolio
                        </h3>
                        <p style={{ color: '#5f6368', lineHeight: '1.5', marginBottom: '1rem', fontSize: '0.95rem' }}>
                          First-person 3D portfolio using classic raycasting techniques.
                        </p>
                        <a href="https://github.com/c0utin/nise" target="_blank" rel="noopener noreferrer" style={{
                          color: '#1a73e8',
                          textDecoration: 'none',
                          fontSize: '0.9rem'
                        }}>View Project →</a>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Posts Section */}
            {currentSection === 'posts' && (
              <section style={{
                padding: '5rem 2rem',
                background: '#ffffff',
                marginTop: '60px',
                minHeight: '60vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              }}>
                <div style={{ textAlign: 'center', maxWidth: '600px' }}>
                  <h2 style={{
                    fontFamily: 'Georgia, serif',
                    fontSize: '2.5rem',
                    color: '#202124',
                    marginBottom: '1rem'
                  }}>
                    Posts
                  </h2>
                  <p style={{ fontSize: '1.1rem', color: '#5f6368' }}>
                    Blog posts and articles coming soon...
                  </p>
                </div>
              </section>
            )}

            {/* Nise Tribute Section */}
            {currentSection === 'nise' && (
              <section style={{
                padding: '5rem 2rem',
                background: '#f8f9fa',
                marginTop: '60px',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              }}>
                <div style={{
                  maxWidth: '1200px',
                  margin: '0 auto',
                  display: 'grid',
                  gridTemplateColumns: '1fr',
                  gap: '4rem'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <h2 style={{
                      fontFamily: 'Georgia, serif',
                      fontSize: '2.5rem',
                      color: '#202124',
                      marginBottom: '1.5rem'
                    }}>
                      Honoring Nise da Silveira
                    </h2>
                    <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'left' }}>
                      <p style={{ color: '#5f6368', lineHeight: '1.8', marginBottom: '1.5rem' }}>
                        This project pays homage to Nise da Silveira, a revolutionary Brazilian psychiatrist
                        who transformed mental health treatment through art and compassion. She rejected the
                        aggressive treatments of her time, instead championing creative expression as a
                        pathway to healing.
                      </p>
                      <p style={{ color: '#5f6368', lineHeight: '1.8', marginBottom: '1.5rem' }}>
                        At the Museum of Images of the Unconscious, which she founded in 1952, Silveira
                        demonstrated that art could be a window into the human psyche, allowing patients
                        to express what words could not capture. Her work proved that creativity and
                        dignity were fundamental to mental health treatment.
                      </p>
                      <p style={{ color: '#5f6368', lineHeight: '1.8', marginBottom: '2rem' }}>
                        Just as Silveira saw patterns and meaning in the artistic expressions of her patients,
                        this raycasting portfolio explores the beauty that emerges from mathematical rules—a
                        different kind of unconscious, but equally profound in its revelations.
                      </p>
                      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                        <a
                          href="https://pt.wikipedia.org/wiki/Nise_da_Silveira"
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: '#1a73e8',
                            textDecoration: 'none',
                            fontWeight: '500',
                            fontSize: '1.1rem'
                          }}
                        >
                          Read more about her life and work →
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}
        </>
      )}
    </div>
  )
}
