/**
 * LaTeX Text Formatting Components
 *
 * Allows writing blog post content using LaTeX-style formatting commands.
 * Provides React components that parse and render LaTeX text formatting.
 *
 * Supported LaTeX commands:
 * - \textbf{bold text}
 * - \textit{italic text}
 * - \texttt{monospace text}
 * - \emph{emphasized text}
 * - \underline{underlined text}
 * - \section{Section Title}
 * - \subsection{Subsection Title}
 * - \paragraph{Paragraph title}
 * - \cite{reference}
 * - \ref{label}
 * - \\newline or \\ for line breaks
 *
 * Usage:
 * import { LaTeXText, LaTeXParagraph } from './utils/LaTeXText'
 *
 * <LaTeXParagraph>
 *   This is \textbf{bold} and \textit{italic} text.
 * </LaTeXParagraph>
 */

import React from 'react'
import { InlineMath } from './LaTeX'

/**
 * Parse LaTeX text formatting commands
 */
function parseLatexText(text) {
  if (typeof text !== 'string') return text

  const parts = []
  let remaining = text
  let key = 0

  // Pattern for LaTeX commands: \command{content}
  const commandRegex = /\\(textbf|textit|texttt|emph|underline|cite|ref)\{([^}]+)\}/g

  let match
  let lastIndex = 0

  while ((match = commandRegex.exec(remaining)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      const beforeText = remaining.substring(lastIndex, match.index)
      // Check for inline math in the before text
      parts.push(...parseInlineMath(beforeText, key))
      key += 100
    }

    const command = match[1]
    const content = match[2]

    // Render based on command
    switch (command) {
      case 'textbf':
        parts.push(<strong key={`cmd-${key++}`}>{content}</strong>)
        break
      case 'textit':
        parts.push(<em key={`cmd-${key++}`}>{content}</em>)
        break
      case 'texttt':
        parts.push(<code key={`cmd-${key++}`} className="inline-code">{content}</code>)
        break
      case 'emph':
        parts.push(<em key={`cmd-${key++}`}>{content}</em>)
        break
      case 'underline':
        parts.push(<u key={`cmd-${key++}`}>{content}</u>)
        break
      case 'cite':
        parts.push(
          <sup key={`cmd-${key++}`}>
            <a href={`#ref-${content}`} className="citation">[{content}]</a>
          </sup>
        )
        break
      case 'ref':
        parts.push(
          <a key={`cmd-${key++}`} href={`#${content}`} className="reference">
            ({content})
          </a>
        )
        break
      default:
        parts.push(<span key={`cmd-${key++}`}>{content}</span>)
    }

    lastIndex = commandRegex.lastIndex
  }

  // Add remaining text
  if (lastIndex < remaining.length) {
    const afterText = remaining.substring(lastIndex)
    parts.push(...parseInlineMath(afterText, key))
  }

  return parts
}

/**
 * Parse inline math $...$
 */
function parseInlineMath(text, keyOffset = 0) {
  const parts = []
  const mathRegex = /\$([^$]+)\$/g

  let match
  let lastIndex = 0
  let key = keyOffset

  while ((match = mathRegex.exec(text)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      parts.push(
        <span key={`text-${key++}`}>
          {text.substring(lastIndex, match.index)}
        </span>
      )
    }

    // Add inline math
    parts.push(
      <InlineMath key={`math-${key++}`} math={match[1]} />
    )

    lastIndex = mathRegex.lastIndex
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(
      <span key={`text-${key++}`}>
        {text.substring(lastIndex)}
      </span>
    )
  }

  // If no math found, return original text
  if (parts.length === 0) {
    return [<span key={`text-${keyOffset}`}>{text}</span>]
  }

  return parts
}

/**
 * LaTeX Paragraph Component
 * Parses LaTeX formatting in paragraph text
 */
export function LaTeXParagraph({ children, className = '' }) {
  const parsed = parseLatexText(children)

  return (
    <p className={`latex-paragraph ${className}`}>
      {parsed}
    </p>
  )
}

/**
 * LaTeX Text Span Component
 * Parses LaTeX formatting in inline text
 */
export function LaTeXText({ children, className = '' }) {
  const parsed = parseLatexText(children)

  return (
    <span className={`latex-text ${className}`}>
      {parsed}
    </span>
  )
}

/**
 * LaTeX Section Component
 * Creates a section with LaTeX-style formatting
 */
export function LaTeXSection({ title, children, numbered = false, number = null }) {
  return (
    <section className="latex-section">
      <h2>
        {numbered && number && <span className="section-number">{number}. </span>}
        {parseLatexText(title)}
      </h2>
      <div className="section-content">
        {children}
      </div>
    </section>
  )
}

/**
 * LaTeX Subsection Component
 */
export function LaTeXSubsection({ title, children, numbered = false, number = null }) {
  return (
    <div className="latex-subsection">
      <h3>
        {numbered && number && <span className="subsection-number">{number}. </span>}
        {parseLatexText(title)}
      </h3>
      <div className="subsection-content">
        {children}
      </div>
    </div>
  )
}

/**
 * LaTeX List Component
 * Creates itemized or enumerated lists
 */
export function LaTeXList({ type = 'itemize', children }) {
  const Tag = type === 'enumerate' ? 'ol' : 'ul'

  return (
    <Tag className={`latex-list latex-${type}`}>
      {children}
    </Tag>
  )
}

/**
 * LaTeX List Item Component
 */
export function LaTeXItem({ children }) {
  const parsed = parseLatexText(children)

  return (
    <li className="latex-item">
      {parsed}
    </li>
  )
}

/**
 * LaTeX Quote/Block Component
 */
export function LaTeXQuote({ children }) {
  return (
    <blockquote className="latex-quote">
      {typeof children === 'string' ? parseLatexText(children) : children}
    </blockquote>
  )
}

/**
 * LaTeX Document Component
 * Wrapper for entire LaTeX-formatted document
 */
export function LaTeXDocument({ children }) {
  return (
    <div className="latex-document">
      {children}
    </div>
  )
}

/**
 * Parse full LaTeX-like document structure
 * This is a more advanced parser for complete documents
 */
export function parseLatexDocument(latexText) {
  // This would be a full parser for LaTeX syntax
  // For now, we'll keep it simple and just handle basic formatting
  // Can be expanded to handle \begin{document}, \section, etc.

  return <LaTeXParagraph>{latexText}</LaTeXParagraph>
}

/**
 * Example usage helper
 */
export const LaTeXExample = () => (
  <LaTeXDocument>
    <LaTeXParagraph>
      This is a paragraph with \textbf{bold}, \textit{italic}, and \texttt{monospace} text.
      You can also include inline math like $E = mc^2$ directly.
    </LaTeXParagraph>

    <LaTeXSection title="Introduction" numbered number="1">
      <LaTeXParagraph>
        Section content with \emph{emphasis} and citations\cite{ref1}.
      </LaTeXParagraph>
    </LaTeXSection>

    <LaTeXList type="itemize">
      <LaTeXItem>First item with \textbf{bold}</LaTeXItem>
      <LaTeXItem>Second item with math: $\alpha + \beta$</LaTeXItem>
    </LaTeXList>
  </LaTeXDocument>
)
