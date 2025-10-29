/**
 * LaTeX Component Utilities
 *
 * Provides React components for rendering LaTeX equations using KaTeX.
 * Supports both inline and display (block) math modes.
 *
 * Features:
 * - Fast client-side rendering
 * - Support for inline and display math
 * - Auto-numbered equations
 * - Error handling with fallback display
 * - Compatible with PDF export
 *
 * Usage:
 * import { InlineMath, DisplayMath, Equation } from './utils/LaTeX'
 *
 * <InlineMath math="E = mc^2" />
 * <DisplayMath math="\int_{0}^{\infty} e^{-x^2} dx = \frac{\sqrt{\pi}}{2}" />
 * <Equation number="1" math="F = ma" label="newton" />
 */

import React, { useEffect, useRef } from 'react'
import 'katex/dist/katex.min.css'

// Lazy load katex to avoid blocking initial page load
let katex = null
const loadKatex = async () => {
  if (!katex) {
    katex = await import('katex')
  }
  return katex.default || katex
}

/**
 * Inline Math Component
 * Renders LaTeX inline with text
 */
export function InlineMath({ math, errorColor = '#cc0000' }) {
  const ref = useRef(null)

  useEffect(() => {
    if (!ref.current || !math) return

    loadKatex().then(k => {
      try {
        k.render(math, ref.current, {
          displayMode: false,
          throwOnError: false,
          errorColor: errorColor,
          strict: false,
          trust: false
        })
      } catch (error) {
        console.error('KaTeX inline rendering error:', error)
        ref.current.textContent = `[LaTeX Error: ${math}]`
        ref.current.style.color = errorColor
      }
    }).catch(error => {
      console.error('Failed to load KaTeX:', error)
      ref.current.textContent = math
    })
  }, [math, errorColor])

  return <span ref={ref} className="katex-inline" data-latex={math}></span>
}

/**
 * Display Math Component
 * Renders LaTeX as a centered block
 */
export function DisplayMath({ math, errorColor = '#cc0000' }) {
  const ref = useRef(null)

  useEffect(() => {
    if (!ref.current || !math) return

    loadKatex().then(k => {
      try {
        k.render(math, ref.current, {
          displayMode: true,
          throwOnError: false,
          errorColor: errorColor,
          strict: false,
          trust: false
        })
      } catch (error) {
        console.error('KaTeX display rendering error:', error)
        ref.current.textContent = `[LaTeX Error: ${math}]`
        ref.current.style.color = errorColor
      }
    }).catch(error => {
      console.error('Failed to load KaTeX:', error)
      ref.current.textContent = math
    })
  }, [math, errorColor])

  return (
    <div
      ref={ref}
      className="katex-display my-6 overflow-x-auto"
      data-latex={math}
      style={{ textAlign: 'center' }}
    ></div>
  )
}

/**
 * Numbered Equation Component
 * Renders LaTeX with equation number (IEEE style)
 */
export function Equation({ math, number, label, errorColor = '#cc0000' }) {
  const ref = useRef(null)

  useEffect(() => {
    if (!ref.current || !math) return

    loadKatex().then(k => {
      try {
        k.render(math, ref.current, {
          displayMode: true,
          throwOnError: false,
          errorColor: errorColor,
          strict: false,
          trust: false
        })
      } catch (error) {
        console.error('KaTeX equation rendering error:', error)
        ref.current.textContent = `[LaTeX Error: ${math}]`
        ref.current.style.color = errorColor
      }
    }).catch(error => {
      console.error('Failed to load KaTeX:', error)
      ref.current.textContent = math
    })
  }, [math, errorColor])

  return (
    <div className="equation-container my-6 flex items-center justify-center gap-4" id={label}>
      <div
        ref={ref}
        className="katex-display flex-1 overflow-x-auto"
        data-latex={math}
        style={{ textAlign: 'center' }}
      ></div>
      {number && (
        <div className="equation-number text-gray-400 font-medium" style={{ minWidth: '40px', textAlign: 'right' }}>
          ({number})
        </div>
      )}
    </div>
  )
}

/**
 * Multi-line Aligned Equations Component
 * Renders multiple aligned equations (using align environment)
 */
export function AlignedEquations({ equations, errorColor = '#cc0000' }) {
  const ref = useRef(null)

  useEffect(() => {
    if (!ref.current || !equations) return

    // Build aligned LaTeX string
    const alignedLatex = `\\begin{aligned}\n${equations}\n\\end{aligned}`

    loadKatex().then(k => {
      try {
        k.render(alignedLatex, ref.current, {
          displayMode: true,
          throwOnError: false,
          errorColor: errorColor,
          strict: false,
          trust: false
        })
      } catch (error) {
        console.error('KaTeX aligned equations rendering error:', error)
        ref.current.textContent = `[LaTeX Error: ${alignedLatex}]`
        ref.current.style.color = errorColor
      }
    }).catch(error => {
      console.error('Failed to load KaTeX:', error)
      ref.current.textContent = equations
    })
  }, [equations, errorColor])

  return (
    <div
      ref={ref}
      className="katex-display my-6 overflow-x-auto"
      data-latex={equations}
      style={{ textAlign: 'center' }}
    ></div>
  )
}

/**
 * Inline LaTeX with auto-detection
 * Automatically detects and renders LaTeX in text using $...$ and $$...$$ delimiters
 */
export function AutoLatex({ children }) {
  if (typeof children !== 'string') {
    return <>{children}</>
  }

  // Split text by LaTeX delimiters
  const parts = []
  let remaining = children
  let key = 0

  // Regex to match $$...$$ (display) and $...$ (inline)
  const regex = /(\$\$[^\$]+\$\$|\$[^\$]+\$)/g
  let match
  let lastIndex = 0

  while ((match = regex.exec(remaining)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      parts.push(
        <span key={`text-${key++}`}>
          {remaining.substring(lastIndex, match.index)}
        </span>
      )
    }

    // Add LaTeX
    const latex = match[0]
    if (latex.startsWith('$$') && latex.endsWith('$$')) {
      // Display math
      parts.push(
        <DisplayMath
          key={`display-${key++}`}
          math={latex.slice(2, -2).trim()}
        />
      )
    } else if (latex.startsWith('$') && latex.endsWith('$')) {
      // Inline math
      parts.push(
        <InlineMath
          key={`inline-${key++}`}
          math={latex.slice(1, -1).trim()}
        />
      )
    }

    lastIndex = regex.lastIndex
  }

  // Add remaining text
  if (lastIndex < remaining.length) {
    parts.push(
      <span key={`text-${key++}`}>
        {remaining.substring(lastIndex)}
      </span>
    )
  }

  return <>{parts}</>
}

/**
 * Utility function to extract LaTeX from components for export
 * Used by PDF and AI export utilities
 */
export function extractLatexContent(element) {
  if (!element) return ''

  const latexElements = []

  // Find all elements with data-latex attribute
  const walkTree = (node) => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const latex = node.getAttribute('data-latex')
      if (latex) {
        latexElements.push(latex)
      }
      node.childNodes.forEach(walkTree)
    }
  }

  walkTree(element)
  return latexElements
}

/**
 * Preload KaTeX for better performance
 * Call this in the app entry point or when entering the blog section
 */
export function preloadKatex() {
  return loadKatex()
}

// Re-export LaTeX text formatting components for convenience
export {
  LaTeXParagraph,
  LaTeXText,
  LaTeXSection,
  LaTeXSubsection,
  LaTeXList,
  LaTeXItem,
  LaTeXQuote,
  LaTeXDocument
} from './LaTeXText'
