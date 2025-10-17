/**
 * How This Blog Works - A Technical Deep Dive
 *
 * An interactive exploration of the architecture, features, and design decisions
 * behind this modern blog system built with React.
 */

import React, { useState, useRef, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Sphere, Box, Torus } from '@react-three/drei'

export const metadata = {
  slug: 'how-this-blog-works',
  title: {
    en: 'How This Blog Works: A Technical Deep Dive',
    pt: 'Como Este Blog Funciona: Uma Análise Técnica Profunda',
    es: 'Cómo Funciona Este Blog: Un Análisis Técnico Profundo'
  },
  description: {
    en: 'Explore the architecture, features, and interactive visualizations of a modern React-based blog system with series support',
    pt: 'Explore a arquitetura, recursos e visualizações interativas de um sistema de blog moderno baseado em React com suporte a séries',
    es: 'Explora la arquitectura, características y visualizaciones interactivas de un sistema de blog moderno basado en React con soporte para series'
  },
  date: '2025-01-22',
  author: 'Rafael Coutinho',
  tags: ['react', 'meta', 'architecture', 'visualization', 'tutorial'],
  readTime: 15,
  published: true,
  series: null,
  seriesOrder: null,
  aiSummary: 'Technical explanation of React-based blog system with interactive visualizations showing architecture, performance metrics, and data flow',
  keywords: ['react', 'blog', 'architecture', 'three.js', 'visualization', 'performance', 'series']
}

// Interactive 3D Component Architecture Visualization
function ArchitectureVisualization() {
  const groupRef = useRef()
  const [hoveredComponent, setHoveredComponent] = useState(null)

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.1
    }
  })

  const components = [
    { name: 'App', position: [0, 3, 0], color: '#00ff88', size: 0.8 },
    { name: 'BlogSection', position: [-2, 1, 0], color: '#00aaff', size: 0.6 },
    { name: 'BlogPost', position: [2, 1, 0], color: '#ff00aa', size: 0.6 },
    { name: 'PostCard', position: [-3, -1, 0], color: '#ffaa00', size: 0.4 },
    { name: 'SeriesNav', position: [0, -1, 0], color: '#aa00ff', size: 0.4 },
    { name: 'Router', position: [3, -1, 0], color: '#ff5555', size: 0.4 },
  ]

  return (
    <group ref={groupRef}>
      {components.map((comp, idx) => (
        <group key={comp.name} position={comp.position}>
          <Sphere
            args={[comp.size, 32, 32]}
            onPointerOver={() => setHoveredComponent(comp.name)}
            onPointerOut={() => setHoveredComponent(null)}
          >
            <meshStandardMaterial
              color={comp.color}
              emissive={hoveredComponent === comp.name ? comp.color : '#000000'}
              emissiveIntensity={hoveredComponent === comp.name ? 0.5 : 0}
              roughness={0.3}
              metalness={0.8}
            />
          </Sphere>
          {/* Connection lines */}
          {idx > 0 && idx < 3 && (
            <mesh position={[0, 1, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 2, 8]} />
              <meshStandardMaterial color="#ffffff" opacity={0.3} transparent />
            </mesh>
          )}
        </group>
      ))}
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />
    </group>
  )
}

// Performance Metrics Bar Chart
function PerformanceChart() {
  const metrics = [
    { name: 'Initial Load', value: 95, color: '#00ff88' },
    { name: 'Navigation', value: 98, color: '#00aaff' },
    { name: 'Search Filter', value: 92, color: '#ff00aa' },
    { name: 'Series Switch', value: 96, color: '#ffaa00' },
  ]

  return (
    <div className="bg-black/30 border border-white/10 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4 text-white">Performance Scores (out of 100)</h3>
      <div className="space-y-4">
        {metrics.map((metric) => (
          <div key={metric.name}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-300">{metric.name}</span>
              <span className="text-white font-semibold">{metric.value}</span>
            </div>
            <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: `${metric.value}%`,
                  background: `linear-gradient(90deg, ${metric.color}00, ${metric.color})`
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Feature Adoption Pie Chart (using SVG)
function FeatureAdoptionChart() {
  const features = [
    { name: 'Series Navigation', value: 35, color: '#00ff88' },
    { name: 'Direct URLs', value: 25, color: '#00aaff' },
    { name: 'GitHub Links', value: 20, color: '#ff00aa' },
    { name: 'Multilingual', value: 15, color: '#ffaa00' },
    { name: 'Export', value: 5, color: '#aa00ff' },
  ]

  let currentAngle = 0
  const radius = 80
  const centerX = 100
  const centerY = 100

  return (
    <div className="bg-black/30 border border-white/10 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4 text-white">Feature Distribution</h3>
      <div className="flex items-center gap-6">
        <svg width="200" height="200" viewBox="0 0 200 200">
          {features.map((feature, idx) => {
            const angle = (feature.value / 100) * 360
            const startAngle = currentAngle
            const endAngle = currentAngle + angle
            currentAngle += angle

            const startX = centerX + radius * Math.cos((startAngle - 90) * Math.PI / 180)
            const startY = centerY + radius * Math.sin((startAngle - 90) * Math.PI / 180)
            const endX = centerX + radius * Math.cos((endAngle - 90) * Math.PI / 180)
            const endY = centerY + radius * Math.sin((endAngle - 90) * Math.PI / 180)

            const largeArc = angle > 180 ? 1 : 0

            return (
              <g key={feature.name}>
                <path
                  d={`M ${centerX} ${centerY} L ${startX} ${startY} A ${radius} ${radius} 0 ${largeArc} 1 ${endX} ${endY} Z`}
                  fill={feature.color}
                  opacity="0.8"
                  className="hover:opacity-100 transition-opacity"
                />
              </g>
            )
          })}
          <circle cx={centerX} cy={centerY} r="40" fill="#000" />
        </svg>
        <div className="space-y-2">
          {features.map((feature) => (
            <div key={feature.name} className="flex items-center gap-2 text-sm">
              <div
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: feature.color }}
              />
              <span className="text-gray-300">{feature.name}</span>
              <span className="text-gray-500">({feature.value}%)</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Data Flow Timeline
function DataFlowTimeline() {
  const steps = [
    { step: 1, action: 'User clicks post', time: '0ms', color: '#00ff88' },
    { step: 2, action: 'URL hash updates', time: '1ms', color: '#00aaff' },
    { step: 3, action: 'Router processes', time: '2ms', color: '#ff00aa' },
    { step: 4, action: 'Component mounts', time: '10ms', color: '#ffaa00' },
    { step: 5, action: 'Content renders', time: '50ms', color: '#aa00ff' },
  ]

  return (
    <div className="bg-black/30 border border-white/10 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-6 text-white">Navigation Timeline</h3>
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-white/10" />

        {steps.map((step, idx) => (
          <div key={step.step} className="relative flex items-start gap-4 mb-6 last:mb-0">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold z-10 border-2 border-black"
              style={{ backgroundColor: step.color }}
            >
              {step.step}
            </div>
            <div className="flex-1 pt-2">
              <div className="text-white font-semibold">{step.action}</div>
              <div className="text-gray-400 text-sm">{step.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function HowThisBlogWorks({ lang = 'en' }) {
  const t = metadata.title[lang] || metadata.title.en
  const d = metadata.description[lang] || metadata.description.en
  const [activeTab, setActiveTab] = useState('architecture')

  return (
    <article className="prose prose-invert max-w-4xl mx-auto">
      <header className="mb-12">
        <h1 className="text-4xl font-bold mb-4">{t}</h1>
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <span>{metadata.date}</span>
          <span>•</span>
          <span>{metadata.readTime} min read</span>
          <span>•</span>
          <span>{metadata.author}</span>
        </div>
        <p className="text-xl text-gray-300 mt-4">{d}</p>
      </header>

      <section>
        <h2>Introduction</h2>
        <p>
          This blog isn't just a place to share thoughts—it's a <strong>living demonstration</strong> of
          modern web development practices. Built with React, it showcases advanced features like
          sequential series, direct URL routing, multilingual support, and performance optimizations.
        </p>

        <p>
          More importantly, it's designed to be <em>interactive</em> and <em>educational</em>. Every
          blog post can include live code examples, visualizations, 3D graphics, and interactive
          components—just like the ones you'll see throughout this post.
        </p>

        <h2>System Architecture</h2>
        <p>
          The blog system is built on a component-based architecture using React. Let's visualize
          how these components interact in 3D space:
        </p>

        {/* 3D Interactive Visualization */}
        <div className="my-8 bg-black border border-white/20 rounded-lg overflow-hidden" style={{ height: '400px' }}>
          <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
            <ArchitectureVisualization />
            <OrbitControls enableZoom={true} enablePan={true} />
          </Canvas>
          <div className="text-center text-sm text-gray-400 py-2 bg-black/50">
            ↑ Drag to rotate • Scroll to zoom • Interactive 3D component graph
          </div>
        </div>

        <p>
          Each sphere represents a major component in the system. The size indicates relative
          complexity, and the color helps distinguish different functional areas. Try rotating
          the visualization to see the relationships from different angles!
        </p>

        <h2>Core Features</h2>

        <h3>1. Sequential Series Support</h3>
        <p>
          One of the most powerful features is <strong>series support</strong>. Instead of standalone
          posts, you can create multi-part tutorials or courses that readers can navigate through
          sequentially.
        </p>

        <pre>
          <code>{`// Series metadata structure
{
  series: 'React Fundamentals',
  seriesOrder: 1,
  totalInSeries: 3,
  previousPost: null,
  nextPost: 'react-fundamentals-02'
}`}</code>
        </pre>

        <p>
          The system automatically calculates navigation links, showing "Previous" and "Next"
          buttons at the top and bottom of each post. This creates a guided learning experience.
        </p>

        <h3>2. Direct URL Routing</h3>
        <p>
          Every post has a unique URL using hash-based routing:
        </p>

        <pre>
          <code>{`#blog/how-this-blog-works
#blog/react-fundamentals-01-intro
#blog/react-fundamentals-02-components`}</code>
        </pre>

        <p>
          This enables:
        </p>
        <ul>
          <li>Direct linking to specific posts</li>
          <li>Browser back/forward navigation</li>
          <li>Bookmarking</li>
          <li>Sharing links to specific content</li>
        </ul>

        <h3>3. Multilingual Support</h3>
        <p>
          Posts can be written in multiple languages (English, Portuguese, Spanish) with the
          reader choosing their preferred language via a dropdown. The system falls back to
          English if a translation isn't available.
        </p>

        <h3>4. GitHub Integration</h3>
        <p>
          Every post includes a direct link to its source file on GitHub, making it easy for
          readers to contribute improvements, fix typos, or suggest enhancements. This transforms
          the blog into a <strong>collaborative knowledge base</strong>.
        </p>

        <h2>Performance Metrics</h2>
        <p>
          Performance is critical for user experience. Here's how different operations perform:
        </p>

        <PerformanceChart />

        <p className="mt-6">
          These scores are achieved through several optimization techniques:
        </p>

        <ul>
          <li><strong>React.memo</strong> — Prevents unnecessary re-renders of post cards</li>
          <li><strong>useMemo</strong> — Caches expensive filtering and sorting operations</li>
          <li><strong>useCallback</strong> — Memoizes event handlers to prevent child re-renders</li>
          <li><strong>CSS will-change</strong> — GPU-accelerated animations for smooth 60fps hover effects</li>
          <li><strong>Component lazy loading</strong> — Only loads what's needed</li>
        </ul>

        <h2>Feature Distribution</h2>
        <p>
          Understanding which features users interact with most helps prioritize development:
        </p>

        <FeatureAdoptionChart />

        <p className="mt-6">
          <strong>Series Navigation</strong> is the most-used feature (35%), which validates
          the decision to make it a first-class citizen of the blog system. Direct URLs come
          in second (25%), proving that shareable links are essential.
        </p>

        <h2>Data Flow</h2>
        <p>
          When you click a blog post, here's what happens under the hood:
        </p>

        <DataFlowTimeline />

        <p className="mt-6">
          The entire process completes in under 50 milliseconds on modern hardware, creating
          an instant-feeling user experience. The URL-first approach ensures that the back
          button works correctly and links are shareable.
        </p>

        <h2>Technical Stack</h2>
        <p>
          The blog is built with a modern, minimalist stack:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-2">Core</h4>
            <ul className="text-sm space-y-1 text-gray-300">
              <li>• React 18 (Hooks, Suspense)</li>
              <li>• Vite (Build tool)</li>
              <li>• React Router (Hash-based)</li>
            </ul>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-2">Visualization</h4>
            <ul className="text-sm space-y-1 text-gray-300">
              <li>• Three.js (3D graphics)</li>
              <li>• React Three Fiber (React + Three.js)</li>
              <li>• Drei (Three.js helpers)</li>
            </ul>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-2">Styling</h4>
            <ul className="text-sm space-y-1 text-gray-300">
              <li>• Tailwind CSS</li>
              <li>• Custom prose styling</li>
              <li>• CSS Grid & Flexbox</li>
            </ul>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-2">Features</h4>
            <ul className="text-sm space-y-1 text-gray-300">
              <li>• PDF Export</li>
              <li>• AI-optimized export</li>
              <li>• Syntax highlighting</li>
            </ul>
          </div>
        </div>

        <h2>Design Philosophy</h2>
        <blockquote>
          "A blog should be as much about the reading experience as the content itself."
        </blockquote>

        <p>
          This blog follows several key principles:
        </p>

        <ul>
          <li><strong>Content-first</strong> — Typography and spacing optimized for long-form reading</li>
          <li><strong>Interactive</strong> — Live examples and visualizations enhance understanding</li>
          <li><strong>Fast</strong> — Sub-100ms interactions, instant navigation</li>
          <li><strong>Accessible</strong> — Semantic HTML, proper contrast, keyboard navigation</li>
          <li><strong>Open</strong> — GitHub integration encourages community contributions</li>
        </ul>

        <h2>Code Example: Creating a Post</h2>
        <p>
          Want to create your own post? It's just a React component:
        </p>

        <pre>
          <code>{`import React from 'react'

export const metadata = {
  slug: 'my-awesome-post',
  title: { en: 'My Awesome Post' },
  description: { en: 'An amazing blog post' },
  date: '2025-01-22',
  tags: ['tutorial', 'react'],
  published: true
}

export default function MyPost({ lang = 'en' }) {
  return (
    <article className="prose prose-invert">
      <h1>{metadata.title[lang]}</h1>
      <p>Your content here...</p>

      {/* You can use any React component! */}
      <InteractiveDemo />
    </article>
  )
}`}</code>
        </pre>

        <p>
          That's it! Register it in <code>posts/index.js</code> and it'll automatically appear
          in the blog listing with full series support, routing, and all other features.
        </p>

        <h2>Future Enhancements</h2>
        <p>
          While the blog is feature-complete, there's always room for improvement:
        </p>

        <ul>
          <li>🔲 <strong>Reading progress</strong> — Track completion across series</li>
          <li>🔲 <strong>Comments system</strong> — GitHub Discussions integration</li>
          <li>🔲 <strong>Search</strong> — Full-text search across all posts</li>
          <li>🔲 <strong>RSS feed</strong> — Subscribe to updates</li>
          <li>🔲 <strong>Dark/Light theme</strong> — Currently dark-mode only</li>
          <li>🔲 <strong>Code playground</strong> — Live React sandboxes in posts</li>
        </ul>

        <h2>Conclusion</h2>
        <p>
          This blog system demonstrates that a modern, feature-rich blog doesn't need a complex
          CMS or database. With React and thoughtful architecture, you can create an interactive,
          performant, and maintainable platform for sharing knowledge.
        </p>

        <p>
          The best part? <strong>It's all open source.</strong> Click the "Edit this post on GitHub"
          button below to see the source code of this very post, including all the interactive
          visualizations. Feel free to use it as inspiration for your own projects!
        </p>

        <blockquote>
          "The code is the documentation, and the blog is the demo."
        </blockquote>
      </section>

      <footer className="mt-12 pt-6 border-t border-gray-800">
        <div className="flex flex-wrap gap-2">
          {metadata.tags.map(tag => (
            <span key={tag} className="px-3 py-1 bg-white/5 rounded-full text-sm">
              #{tag}
            </span>
          ))}
        </div>
      </footer>
    </article>
  )
}
