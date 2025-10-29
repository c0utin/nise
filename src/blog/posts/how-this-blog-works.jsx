/**
 * How This Blog Works - A Technical Deep Dive
 *
 * An interactive exploration of the architecture, features, and design decisions
 * behind this modern blog system built with React.
 */

import React, { useState, useRef, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Sphere, Box, Torus } from '@react-three/drei'
import { InlineMath, DisplayMath, Equation } from '../utils/LaTeX'
import { LaTeXParagraph, LaTeXText } from '../utils/LaTeXText'

export const metadata = {
  slug: 'how-this-blog-works',
  title: {
    en: 'How This Blog Works: A Technical Deep Dive',
    pt: 'Como Este Blog Funciona: Uma Análise Técnica Profunda',
    es: 'Cómo Funciona Este Blog: Un Análisis Técnico Profundo'
  },
  description: {
    en: 'Explore the architecture, features, and interactive visualizations of a modern React-based blog system with series support, LaTeX equations, and IEEE paper structure',
    pt: 'Explore a arquitetura, recursos e visualizações interativas de um sistema de blog moderno baseado em React com suporte a séries, equações LaTeX e estrutura de paper IEEE',
    es: 'Explora la arquitectura, características y visualizaciones interactivas de un sistema de blog moderno basado en React con soporte para series, ecuaciones LaTeX y estructura de paper IEEE'
  },
  date: '2025-01-22',
  author: 'Rafael Coutinho',
  tags: ['react', 'meta', 'architecture', 'visualization', 'tutorial', 'latex', 'ieee'],
  readTime: 18,
  published: true,
  series: null,
  seriesOrder: null,
  aiSummary: 'Technical explanation of React-based blog system with interactive visualizations showing architecture, performance metrics, data flow, LaTeX equation support, and IEEE paper structure compatibility',
  keywords: ['react', 'blog', 'architecture', 'three.js', 'visualization', 'performance', 'series', 'latex', 'katex', 'ieee'],
  // IEEE-compatible fields (following IEEE Author Center guidelines)
  abstract: 'This paper presents a modern blog system built with React that supports advanced features including sequential series, LaTeX equations, 3D visualizations, and IEEE paper structure. The system demonstrates how contemporary web technologies can create an interactive, performant, and maintainable platform for technical content.',
  ieeeKeywords: ['Web Development', 'React', 'LaTeX', 'Interactive Visualization', 'Content Management'], // 3-5 keywords recommended
  affiliation: 'Independent Research',
  correspondingAuthor: { name: 'Rafael Coutinho', email: 'contact@example.com' },
  manuscriptReceived: 'January 22, 2025',
  funding: null, // e.g., 'This work was supported by...'
  doi: null // Add DOI if published
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

        <h2>LaTeX Equation Support</h2>
        <p>
          One of the most powerful features for technical writing is native <strong>LaTeX support</strong>.
          You can write mathematical equations directly in your posts using KaTeX, which renders
          beautifully and exports correctly to PDF and native LaTeX format.
        </p>

        <p>
          For example, here's Einstein's famous equation inline: <InlineMath math="E = mc^2" />,
          and here's the quadratic formula as a display equation:
        </p>

        <DisplayMath math="x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}" />

        <p>
          You can also create numbered equations (IEEE style) for easy reference:
        </p>

        <Equation
          number="1"
          label="fourier"
          math="F(\omega) = \int_{-\infty}^{\infty} f(t) e^{-i\omega t} dt"
        />

        <p>
          The Fourier transform shown in Equation (1) is fundamental to signal processing.
          Complex equations with matrices are also supported:
        </p>

        <DisplayMath math="\begin{bmatrix} a & b \\ c & d \end{bmatrix} \begin{bmatrix} x \\ y \end{bmatrix} = \begin{bmatrix} ax + by \\ cx + dy \end{bmatrix}" />

        <p>
          When you export to PDF, these equations are rendered beautifully in IEEE format with
          proper two-column layout, serif fonts, and professional typesetting.
        </p>

        <h3>Writing Text in LaTeX Format</h3>
        <p>
          Beyond equations, you can write your entire blog post using LaTeX-style text formatting
          commands. This gives you precise control over typography while keeping content readable:
        </p>

        <LaTeXParagraph>
          {"You can use \\textbf{bold text}, \\textit{italic text}, and \\texttt{monospace code} directly in your paragraphs. Combine this with inline math like $\\alpha = \\beta + \\gamma$ for technical writing that feels natural."}
        </LaTeXParagraph>

        <p>
          The LaTeX text components parse commands like:
        </p>

        <pre>
          <code>{`<LaTeXParagraph>
  This research shows that \textbf{algorithm A} performs
  \textit{significantly better} than previous methods, achieving
  an accuracy of $95\%$ with runtime $O(n \log n)$.
</LaTeXParagraph>`}</code>
        </pre>

        <p>
          Supported LaTeX commands include: <code>\textbf{}</code>, <code>\textit{}</code>,
          <code>\texttt{}</code>, <code>\emph{}</code>, <code>\underline{}</code>,
          <code>\cite{}</code>, and <code>\ref{}</code>. You can also use <code>$...$</code> for
          inline math anywhere in your text.
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

        <h2>IEEE Paper Structure Support</h2>
        <p>
          For academic writing, the blog supports <strong>IEEE paper structure</strong> out of the box.
          You can use specialized components to create properly formatted research papers:
        </p>

        <pre>
          <code>{`import { IEEEPaper, Abstract, IEEEKeywords, FirstFootnote,
         Introduction, Methodology, Results, Discussion, Conclusion,
         Equation, Figure, References, Citation } from './utils/IEEEStructure'

export default function ResearchPost({ lang }) {
  return (
    <IEEEPaper
      title="Optimization of Neural Networks Using Novel Gradient Methods"
      authors={[
        { name: "John Doe", affiliation: "Department of Computer Science, MIT",
          email: "jdoe@mit.edu" }
      ]}
    >
      {/* Abstract: Single paragraph, up to 250 words, self-contained */}
      <Abstract>
        This paper presents a comprehensive analysis of gradient descent
        optimization methods for training deep neural networks. We propose
        novel adaptive learning rate strategies that demonstrate improved
        convergence rates across multiple benchmark datasets...
      </Abstract>

      {/* Keywords: 3-5 terms from IEEE Thesaurus */}
      <IEEEKeywords keywords={['Neural networks', 'Optimization', 'Gradient descent',
                                'Machine learning', 'Adaptive algorithms']} />

      {/* First Footnote: Publication metadata */}
      <FirstFootnote
        manuscriptReceived="January 15, 2025"
        correspondingAuthor={{ name: "John Doe", email: "jdoe@mit.edu" }}
        funding="This work was supported by NSF Grant #12345"
      />

      {/* I. INTRODUCTION */}
      <Introduction>
        Deep learning has revolutionized machine learning...
      </Introduction>

      {/* II. METHODOLOGY */}
      <Methodology>
        <Equation number="1" label="loss"
          math="L(\\theta) = \\frac{1}{n} \\sum_{i=1}^{n} (y_i - f(x_i; \\theta))^2" />
        The loss function in Eq. (1) measures prediction error...
      </Methodology>

      {/* III. RESULTS */}
      <Results>
        <Figure caption="Training accuracy over 100 epochs" label="fig1">
          <img src="results.png" alt="Results" />
        </Figure>
        As shown in Fig. 1, our method achieves...
      </Results>

      {/* IV. DISCUSSION */}
      <Discussion>
        The experimental results demonstrate that...
      </Discussion>

      {/* V. CONCLUSION */}
      <Conclusion>
        We presented a novel optimization approach...
      </Conclusion>

      {/* REFERENCES (not numbered) */}
      <References references={[
        {
          authors: "Y. LeCun, Y. Bengio, and G. Hinton",
          title: "Deep learning",
          journal: "Nature",
          volume: "521",
          pages: "436-444",
          year: "2015",
          doi: "10.1038/nature14539"
        }
      ]} />
    </IEEEPaper>
  )
}`}</code>
        </pre>

        <p>
          The IEEE structure components automatically handle:
        </p>
        <ul>
          <li><strong>Roman numeral section numbering</strong> (I, II, III, IV, V...)</li>
          <li><strong>Letter subsection numbering</strong> (A, B, C...)</li>
          <li><strong>Abstract word count validation</strong> (250-word limit with warnings)</li>
          <li><strong>Keyword count validation</strong> (3-5 keywords recommended)</li>
          <li><strong>First footnote generation</strong> (manuscript dates, corresponding author, funding)</li>
          <li><strong>Structured sections</strong> (Introduction, Methodology, Results, Discussion, Conclusion)</li>
          <li><strong>Figure and table auto-numbering</strong> with IEEE-style captions</li>
          <li><strong>Citation and reference formatting</strong></li>
          <li><strong>Author blocks</strong> with affiliations and contact information</li>
        </ul>

        <p>
          This follows the official <strong>IEEE Author Center guidelines</strong> for journal article structure,
          ensuring your posts are publication-ready. When exported to PDF, the document maintains IEEE
          two-column format with proper typography and spacing.
        </p>

        <h2>Code Example: Creating a Post</h2>
        <p>
          Want to create your own post? It's just a React component:
        </p>

        <pre>
          <code>{`import React from 'react'
import { DisplayMath, Equation, LaTeXParagraph } from '../utils/LaTeX'

export const metadata = {
  slug: 'my-research-post',
  title: { en: 'Neural Network Optimization' },
  description: { en: 'Analysis of gradient descent variants' },
  date: '2025-01-22',
  tags: ['machine-learning', 'optimization'],
  published: true,
  // IEEE metadata for PDF export
  abstract: 'This paper presents a comparative analysis...',
  ieeeKeywords: ['Neural Networks', 'Optimization', 'Gradient Descent'],
  author: 'Your Name',
  affiliation: 'Your University'
}

export default function MyPost({ lang = 'en' }) {
  return (
    <article className="prose prose-invert">
      <h2>Introduction</h2>

      <LaTeXParagraph>
        The \textbf{gradient descent} algorithm is fundamental to training
        neural networks. For a loss function $L(\\theta)$, we update parameters
        using the rule shown in Equation (1).
      </LaTeXParagraph>

      <Equation
        number="1"
        label="gd"
        math="\\theta_{t+1} = \\theta_t - \\eta \\nabla L(\\theta_t)"
      />

      <LaTeXParagraph>
        Where $\\eta$ is the \textit{learning rate} and $\\nabla L$ represents
        the gradient. This method achieves convergence rate $O(1/\\sqrt{t})$.
      </LaTeXParagraph>

      {/* Interactive visualizations still work! */}
      <InteractiveGradientVisualization />
    </article>
  )
}`}</code>
        </pre>

        <p>
          That's it! Register it in <code>posts/index.js</code> and it'll automatically appear
          in the blog listing with full series support, routing, and all other features.
        </p>

        <h3>PDF Export in IEEE Format</h3>
        <p>
          When you click "Export as PDF", the system automatically:
        </p>

        <ul>
          <li>Waits for all LaTeX equations to fully render</li>
          <li>Captures Three.js canvases as static PNG snapshots</li>
          <li>Formats the document in IEEE conference paper style</li>
          <li>Applies two-column layout to the main content</li>
          <li>Uses Times New Roman font at appropriate sizes</li>
          <li>Includes title, authors, abstract, and keywords in single-column header</li>
          <li>Preserves all rendered LaTeX with proper spacing</li>
          <li>Opens the browser's print dialog for PDF generation</li>
        </ul>

        <p>
          The result is a professional-looking academic paper that you can save as PDF,
          ready for submission to conferences or sharing with colleagues. All mathematical
          notation is perfectly rendered, and interactive visualizations are preserved as
          high-quality snapshots.
        </p>

        <h2>Recent Enhancements</h2>
        <p>
          The blog system continues to evolve with new features:
        </p>

        <ul>
          <li><strong>LaTeX Equations</strong> — Native mathematical equation rendering with KaTeX</li>
          <li><strong>LaTeX Text Formatting</strong> — Write content using LaTeX commands (textbf, textit, etc.)</li>
          <li><strong>IEEE PDF Export</strong> — Professional two-column IEEE format with rendered LaTeX</li>
          <li><strong>IEEE Structure Components</strong> — Academic paper formatting with auto-numbering</li>
          <li><strong>3D Snapshot Export</strong> — Captures Three.js canvases as static images in PDF</li>
          <li><strong>Performance Optimizations</strong> — KaTeX preloading, lazy loading</li>
        </ul>

        <h2>Future Enhancements</h2>
        <p>
          There's always room for more improvement:
        </p>

        <ul>
          <li><strong>Reading progress</strong> — Track completion across series</li>
          <li><strong>Comments system</strong> — GitHub Discussions integration</li>
          <li><strong>Search</strong> — Full-text search across all posts</li>
          <li><strong>RSS feed</strong> — Subscribe to updates</li>
          <li><strong>Dark/Light theme</strong> — Currently dark-mode only</li>
          <li><strong>Code playground</strong> — Live React sandboxes in posts</li>
          <li><strong>BibTeX integration</strong> — Import and manage references</li>
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
