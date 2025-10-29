/**
 * PDF Export Utility
 *
 * Exports blog posts to PDF format using browser's print functionality
 * in IEEE conference paper format.
 *
 * IEEE Format Features:
 * - Two-column layout (main content)
 * - Single-column header (title, authors, affiliation)
 * - Single-column abstract with "Abstract—" prefix
 * - Single-column keywords with "Index Terms—" prefix
 * - Times New Roman font (10pt body, 9pt captions/refs)
 * - Letter size paper (8.5" x 11")
 * - Margins: 0.75" top/bottom, 0.6" left/right
 * - Section headers: uppercase, bold, 10pt
 * - Subsection headers: italic, 10pt
 * - Justified text alignment
 * - Rendered LaTeX equations
 * - Static snapshots of 3D visualizations
 *
 * Usage:
 * import { exportToPDF } from './utils/pdfExport'
 * await exportToPDF(postData, 'en')
 */

import { extractLatexContent } from './LaTeX'

/**
 * Wait for all LaTeX equations to render
 */
async function waitForLatexRendering() {
  // Wait for KaTeX to load and render all equations
  return new Promise((resolve) => {
    // Check if there are any LaTeX elements
    const latexElements = document.querySelectorAll('[data-latex]')
    if (latexElements.length === 0) {
      resolve()
      return
    }

    // Wait for all KaTeX spans to appear (rendered content)
    let checkCount = 0
    const maxChecks = 50 // 5 seconds max
    const checkInterval = setInterval(() => {
      const renderedCount = document.querySelectorAll('.katex').length
      checkCount++

      if (renderedCount >= latexElements.length || checkCount >= maxChecks) {
        clearInterval(checkInterval)
        // Add extra delay to ensure rendering is complete
        setTimeout(resolve, 1000)
      }
    }, 100)
  })
}

/**
 * Capture Three.js canvas as static image
 */
async function captureCanvasAsImage(canvas) {
  try {
    // Get the canvas data URL
    const dataURL = canvas.toDataURL('image/png')

    // Create an image element
    const img = document.createElement('img')
    img.src = dataURL
    img.style.maxWidth = '100%'
    img.style.height = 'auto'
    img.className = 'canvas-snapshot'

    return img
  } catch (error) {
    console.error('Failed to capture canvas:', error)
    return null
  }
}

/**
 * Replace all canvas elements with static images
 */
async function replaceCanvasWithImages(container) {
  const canvases = container.querySelectorAll('canvas')
  const replacements = []

  for (const canvas of canvases) {
    const img = await captureCanvasAsImage(canvas)
    if (img) {
      // Create a wrapper with the same dimensions
      const wrapper = document.createElement('div')
      wrapper.className = 'canvas-replacement'
      wrapper.style.cssText = canvas.parentElement.style.cssText

      // Add caption for interactive elements
      const caption = document.createElement('div')
      caption.textContent = '(Interactive 3D visualization - static snapshot)'
      caption.style.cssText = 'text-align: center; font-size: 0.8em; color: #666; margin-top: 0.5em;'

      wrapper.appendChild(img)
      wrapper.appendChild(caption)

      replacements.push({ canvas, wrapper })
    }
  }

  // Replace canvases with images
  replacements.forEach(({ canvas, wrapper }) => {
    canvas.parentElement.replaceChild(wrapper, canvas.parentElement)
  })

  return replacements.length
}

export async function exportToPDF(postData, lang = 'en') {
  const { metadata } = postData

  // Get the current blog post content
  const blogContent = document.querySelector('.prose-smooth')

  if (!blogContent) {
    alert('Please open a blog post before exporting')
    return
  }

  // Create print-friendly styles
  const printStyles = document.createElement('style')
  printStyles.id = 'pdf-export-styles'
  printStyles.textContent = `
    @media print {
      /* Hide everything by default */
      body > *:not(#pdf-print-content) {
        display: none !important;
      }

      /* Show only print content */
      #pdf-print-content {
        display: block !important;
        position: static !important;
        width: 100% !important;
        max-width: 100% !important;
        margin: 0 !important;
        padding: 0.75in 0.6in !important;
        background: white !important;
        color: black !important;
        font-family: 'Times New Roman', Times, serif !important;
      }

      /* IEEE Two-Column Layout */
      #pdf-print-content .ieee-columns {
        column-count: 2 !important;
        column-gap: 0.2in !important;
        column-rule: none !important;
      }

      /* Title and header single column */
      #pdf-print-content .ieee-header {
        column-span: all !important;
        text-align: center !important;
        margin-bottom: 18pt !important;
      }

      #pdf-print-content .ieee-header h1 {
        font-size: 24pt !important;
        font-weight: bold !important;
        margin-bottom: 12pt !important;
      }

      #pdf-print-content .ieee-header .authors {
        font-size: 11pt !important;
        margin-bottom: 4pt !important;
      }

      #pdf-print-content .ieee-header .affiliation {
        font-size: 10pt !important;
        font-style: italic !important;
        margin-bottom: 4pt !important;
      }

      /* Abstract - single column */
      #pdf-print-content .abstract {
        column-span: all !important;
        margin-bottom: 12pt !important;
        padding: 8pt 36pt !important;
      }

      #pdf-print-content .abstract-title {
        font-weight: bold !important;
        font-style: italic !important;
        font-size: 10pt !important;
      }

      #pdf-print-content .abstract-content {
        font-size: 9pt !important;
        text-align: justify !important;
      }

      /* Keywords - single column */
      #pdf-print-content .keywords {
        column-span: all !important;
        margin-bottom: 18pt !important;
        padding: 0 36pt !important;
        font-size: 9pt !important;
      }

      /* Typography - IEEE Style */
      #pdf-print-content h1,
      #pdf-print-content h2,
      #pdf-print-content h3,
      #pdf-print-content h4 {
        color: #000 !important;
        page-break-after: avoid;
        font-weight: bold !important;
      }

      /* Section headers (h2) - IEEE style */
      #pdf-print-content h2 {
        font-size: 10pt !important;
        text-transform: uppercase !important;
        margin-top: 12pt !important;
        margin-bottom: 6pt !important;
        text-align: left !important;
        letter-spacing: 0.5pt !important;
      }

      /* Subsection headers (h3) */
      #pdf-print-content h3 {
        font-size: 10pt !important;
        font-style: italic !important;
        margin-top: 9pt !important;
        margin-bottom: 4pt !important;
        text-align: left !important;
      }

      #pdf-print-content h4 {
        font-size: 10pt !important;
        margin-top: 6pt !important;
        margin-bottom: 3pt !important;
      }

      /* Body text - IEEE style */
      #pdf-print-content p {
        color: #000 !important;
        font-size: 10pt !important;
        line-height: 1.3 !important;
        text-align: justify !important;
        margin-bottom: 6pt !important;
        text-indent: 0 !important;
      }

      /* First paragraph after heading - no indent */
      #pdf-print-content h1 + p,
      #pdf-print-content h2 + p,
      #pdf-print-content h3 + p,
      #pdf-print-content h4 + p {
        text-indent: 0 !important;
      }

      /* Lists - IEEE style */
      #pdf-print-content ul,
      #pdf-print-content ol {
        color: #000 !important;
        margin-left: 18pt !important;
        margin-bottom: 6pt !important;
        font-size: 10pt !important;
      }

      #pdf-print-content li {
        color: #000 !important;
        font-size: 10pt !important;
        line-height: 1.3 !important;
        margin-bottom: 3pt !important;
        text-align: justify !important;
      }

      /* Code blocks */
      #pdf-print-content pre {
        background: #f5f5f5 !important;
        border: 1px solid #ddd !important;
        padding: 10pt !important;
        page-break-inside: avoid;
        overflow: visible !important;
        white-space: pre-wrap !important;
      }

      #pdf-print-content code {
        color: #000 !important;
        font-size: 9pt !important;
        font-family: 'Courier New', monospace !important;
      }

      /* LaTeX equation styles - CRITICAL for rendering */
      #pdf-print-content .katex,
      #pdf-print-content .katex-display,
      #pdf-print-content .katex-inline {
        display: inline !important;
        visibility: visible !important;
        opacity: 1 !important;
        color: #000 !important;
        font-size: 11pt !important;
      }

      #pdf-print-content .katex-display {
        display: block !important;
        margin: 12pt 0 !important;
        text-align: center !important;
        page-break-inside: avoid;
      }

      #pdf-print-content .katex-html {
        display: inline !important;
      }

      #pdf-print-content .equation-container {
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        page-break-inside: avoid;
        margin: 12pt 0 !important;
      }

      #pdf-print-content .equation-number {
        color: #000 !important;
        margin-left: 12pt !important;
      }

      /* Canvas snapshots */
      #pdf-print-content .canvas-replacement {
        page-break-inside: avoid;
        margin: 12pt 0 !important;
      }

      #pdf-print-content .canvas-snapshot {
        max-width: 100% !important;
        height: auto !important;
      }

      /* Links */
      #pdf-print-content a {
        color: #0066cc !important;
        text-decoration: underline !important;
      }

      /* Hide interactive elements */
      #pdf-print-content canvas,
      #pdf-print-content button,
      #pdf-print-content .no-print {
        display: none !important;
      }

      /* Blockquotes */
      #pdf-print-content blockquote {
        border-left: 3pt solid #ccc !important;
        padding-left: 12pt !important;
        color: #666 !important;
        font-style: italic !important;
        page-break-inside: avoid;
      }

      /* Strong and emphasis */
      #pdf-print-content strong {
        color: #000 !important;
        font-weight: bold !important;
      }

      #pdf-print-content em {
        font-style: italic !important;
      }

      /* Tables */
      #pdf-print-content table {
        border-collapse: collapse !important;
        width: 100% !important;
        page-break-inside: avoid;
      }

      #pdf-print-content th,
      #pdf-print-content td {
        border: 1px solid #000 !important;
        padding: 6pt !important;
        color: #000 !important;
      }

      /* Remove backgrounds from divs */
      #pdf-print-content div {
        background: transparent !important;
      }

      /* Figures and captions */
      #pdf-print-content figure,
      #pdf-print-content .ieee-figure {
        break-inside: avoid !important;
        margin: 9pt 0 !important;
      }

      #pdf-print-content figcaption {
        font-size: 9pt !important;
        text-align: center !important;
        margin-top: 3pt !important;
      }

      /* References section */
      #pdf-print-content .ieee-references {
        font-size: 9pt !important;
      }

      #pdf-print-content .ieee-references ol {
        margin-left: 24pt !important;
      }

      #pdf-print-content .ieee-references li {
        font-size: 9pt !important;
        margin-bottom: 3pt !important;
      }

      /* Column breaks */
      #pdf-print-content .column-break-after {
        break-after: column !important;
      }

      #pdf-print-content .column-break-before {
        break-before: column !important;
      }

      /* Page settings - IEEE format */
      @page {
        size: letter;
        margin: 0.75in 0.6in;
      }

      /* Prevent widows and orphans */
      #pdf-print-content p {
        orphans: 3;
        widows: 3;
      }

      #pdf-print-content h2,
      #pdf-print-content h3,
      #pdf-print-content h4 {
        orphans: 4;
        widows: 4;
      }
    }
  `

  // Add print styles to head
  document.head.appendChild(printStyles)

  // Wait for LaTeX to render first (in the live view)
  await waitForLatexRendering()

  // Capture all canvas elements as static images BEFORE cloning
  const originalCanvases = blogContent.querySelectorAll('canvas')
  const canvasSnapshots = []

  for (const canvas of originalCanvases) {
    try {
      const dataURL = canvas.toDataURL('image/png')
      canvasSnapshots.push({
        dataURL,
        parent: canvas.parentElement,
        canvas
      })
    } catch (error) {
      console.warn('Failed to capture canvas:', error)
    }
  }

  // Create IEEE-formatted container
  const printContainer = document.createElement('div')
  printContainer.id = 'pdf-print-content'
  printContainer.style.cssText = 'display: none;'

  // Header section (single column)
  const header = document.createElement('div')
  header.className = 'ieee-header'

  const title = document.createElement('h1')
  const titleText = metadata.title[lang] || metadata.title.en
  title.textContent = titleText
  header.appendChild(title)

  if (metadata.author) {
    const authors = document.createElement('div')
    authors.className = 'authors'
    authors.textContent = metadata.author
    header.appendChild(authors)
  }

  if (metadata.affiliation) {
    const affiliation = document.createElement('div')
    affiliation.className = 'affiliation'
    affiliation.textContent = metadata.affiliation
    header.appendChild(affiliation)
  }

  printContainer.appendChild(header)

  // Abstract section (single column)
  if (metadata.abstract || metadata.description) {
    const abstractSection = document.createElement('div')
    abstractSection.className = 'abstract'

    const abstractTitle = document.createElement('span')
    abstractTitle.className = 'abstract-title'
    abstractTitle.textContent = 'Abstract—'
    abstractSection.appendChild(abstractTitle)

    const abstractContent = document.createElement('span')
    abstractContent.className = 'abstract-content'
    abstractContent.textContent = metadata.abstract || metadata.description[lang] || metadata.description.en
    abstractSection.appendChild(abstractContent)

    printContainer.appendChild(abstractSection)
  }

  // Keywords section (single column) - IEEE uses "Index Terms"
  if (metadata.ieeeKeywords || metadata.keywords || metadata.tags) {
    const keywordsSection = document.createElement('div')
    keywordsSection.className = 'keywords'

    const keywordTitle = document.createElement('span')
    keywordTitle.style.fontWeight = 'bold'
    keywordTitle.style.fontStyle = 'italic'
    keywordTitle.textContent = 'Index Terms—'
    keywordsSection.appendChild(keywordTitle)

    const keywordList = metadata.ieeeKeywords || metadata.keywords || metadata.tags
    // Limit to 5 keywords per IEEE guidelines
    const limitedKeywords = Array.isArray(keywordList) ? keywordList.slice(0, 5) : keywordList
    const keywordText = document.createTextNode(limitedKeywords.join(', ') + '.')
    keywordsSection.appendChild(keywordText)

    printContainer.appendChild(keywordsSection)
  }

  // First footnote (if metadata available)
  if (metadata.correspondingAuthor || metadata.funding || metadata.manuscriptReceived) {
    const footnoteSection = document.createElement('div')
    footnoteSection.className = 'first-footnote'
    footnoteSection.style.cssText = 'font-size: 8pt; color: #666; border-top: 1px solid #ccc; padding-top: 8pt; margin-bottom: 12pt;'

    const footnoteContent = []
    if (metadata.manuscriptReceived) footnoteContent.push(`Manuscript received ${metadata.manuscriptReceived}`)
    if (metadata.manuscriptRevised) footnoteContent.push(`revised ${metadata.manuscriptRevised}`)
    if (metadata.manuscriptAccepted) footnoteContent.push(`accepted ${metadata.manuscriptAccepted}`)
    if (metadata.correspondingAuthor) {
      const corr = typeof metadata.correspondingAuthor === 'string'
        ? metadata.correspondingAuthor
        : `${metadata.correspondingAuthor.name} (email: ${metadata.correspondingAuthor.email})`
      footnoteContent.push(`Corresponding author: ${corr}`)
    }
    if (metadata.funding) footnoteContent.push(metadata.funding)

    footnoteSection.textContent = footnoteContent.join('. ') + '.'
    printContainer.appendChild(footnoteSection)
  }

  // Main content (two columns)
  const columnsContainer = document.createElement('div')
  columnsContainer.className = 'ieee-columns'

  // Clone the actual blog content
  const clonedContent = blogContent.cloneNode(true)

  // Replace canvases with static images in the clone
  const clonedCanvases = clonedContent.querySelectorAll('canvas')
  clonedCanvases.forEach((canvas, idx) => {
    if (canvasSnapshots[idx]) {
      const img = document.createElement('img')
      img.src = canvasSnapshots[idx].dataURL
      img.style.maxWidth = '100%'
      img.style.height = 'auto'
      img.style.display = 'block'
      img.style.margin = '0 auto'

      // Add caption
      const wrapper = document.createElement('div')
      wrapper.style.textAlign = 'center'
      wrapper.style.padding = '0.5rem'

      const caption = document.createElement('p')
      caption.textContent = '(Interactive 3D visualization - static snapshot)'
      caption.style.fontSize = '8pt'
      caption.style.color = '#666'
      caption.style.marginTop = '3pt'

      wrapper.appendChild(img)
      wrapper.appendChild(caption)

      canvas.parentElement.replaceChild(wrapper, canvas)
    } else {
      canvas.remove()
    }
  })

  // Remove any interactive buttons
  const buttons = clonedContent.querySelectorAll('button')
  buttons.forEach(btn => btn.remove())

  // Remove header if exists in content (we already added it)
  const contentHeader = clonedContent.querySelector('header')
  if (contentHeader) contentHeader.remove()

  // Ensure all LaTeX is visible and rendered
  const katexElements = clonedContent.querySelectorAll('.katex, .katex-display, .katex-inline')
  katexElements.forEach(el => {
    el.style.display = 'block'
    el.style.visibility = 'visible'
  })

  // Add the content to columns container
  columnsContainer.innerHTML = clonedContent.innerHTML

  printContainer.appendChild(columnsContainer)

  // Append to body
  document.body.appendChild(printContainer)

  // Small delay to ensure everything is rendered
  await new Promise(resolve => setTimeout(resolve, 1000))

  // Trigger print dialog
  setTimeout(() => {
    window.print()

    // Cleanup after print dialog closes
    setTimeout(() => {
      if (document.body.contains(printContainer)) {
        document.body.removeChild(printContainer)
      }
      if (document.head.contains(printStyles)) {
        document.head.removeChild(printStyles)
      }
    }, 1000)
  }, 500)
}

/**
 * Alternative: Generate PDF URL for download
 */
export async function generatePDFBlob(postData, lang = 'en') {
  // Dynamically import html2pdf
  let html2pdf
  try {
    const module = await import('html2pdf.js')
    html2pdf = module.default || module
  } catch (error) {
    throw new Error('PDF export library not available')
  }

  const { metadata } = postData
  const container = document.createElement('div')
  container.style.cssText = `
    position: fixed;
    left: 0;
    top: 0;
    width: 210mm;
    background: white;
    color: black;
    padding: 20mm;
    font-family: 'Georgia', serif;
    line-height: 1.6;
    z-index: -9999;
    opacity: 0;
    pointer-events: none;
  `

  // Add print-specific styles
  const styleSheet = document.createElement('style')
  styleSheet.textContent = `
    .prose-smooth h1, .prose-smooth h2, .prose-smooth h3, .prose-smooth h4 {
      color: #000 !important;
      page-break-after: avoid;
    }
    .prose-smooth p {
      color: #333 !important;
    }
    .prose-smooth pre {
      background: #f5f5f5 !important;
      border: 1px solid #ddd !important;
      page-break-inside: avoid;
    }
    .prose-smooth code {
      color: #000 !important;
    }
    .prose-smooth a {
      color: #0066cc !important;
    }
    .prose-smooth blockquote {
      border-left-color: #ccc !important;
      color: #666 !important;
    }
    canvas, .no-print {
      display: none !important;
    }
  `
  container.appendChild(styleSheet)

  const PostComponent = postData.component
  const root = document.createElement('div')
  container.appendChild(root)
  document.body.appendChild(container)

  try {
    const React = await import('react')
    const ReactDOM = await import('react-dom/client')

    const rootElement = ReactDOM.createRoot(root)
    await new Promise((resolve) => {
      rootElement.render(
        React.createElement(PostComponent, { lang }, null)
      )
      setTimeout(resolve, 500)
    })

    // Make visible for capture
    container.style.opacity = '1'
    container.style.zIndex = '9999'

    const opt = {
      margin: [10, 10, 10, 10],
      filename: `${metadata.slug}-${lang}.pdf`,
      image: { type: 'jpeg', quality: 0.95 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: true,
        backgroundColor: '#ffffff',
        windowWidth: 794,
        windowHeight: 1123
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait',
        compress: true
      },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    }

    const pdf = await html2pdf().set(opt).from(container).outputPdf('blob')
    rootElement.unmount()
    return pdf
  } finally {
    document.body.removeChild(container)
  }
}

/**
 * Export to native LaTeX format
 * Extracts content and LaTeX equations, generating a complete .tex document
 */
export function exportToLatex(postData, lang = 'en') {
  const { metadata } = postData

  // Get localized content
  const title = metadata.title[lang] || metadata.title.en
  const description = metadata.description[lang] || metadata.description.en

  // Build LaTeX document
  const latexDoc = []

  // Document class and packages (IEEE style)
  latexDoc.push('\\documentclass[conference]{IEEEtran}')
  latexDoc.push('')
  latexDoc.push('% Packages')
  latexDoc.push('\\usepackage{amsmath,amssymb,amsfonts}')
  latexDoc.push('\\usepackage{algorithmic}')
  latexDoc.push('\\usepackage{graphicx}')
  latexDoc.push('\\usepackage{textcomp}')
  latexDoc.push('\\usepackage{xcolor}')
  latexDoc.push('\\usepackage{hyperref}')
  latexDoc.push('\\usepackage{listings}')
  latexDoc.push('')
  latexDoc.push('% Code listing settings')
  latexDoc.push('\\lstset{')
  latexDoc.push('  basicstyle=\\ttfamily\\small,')
  latexDoc.push('  breaklines=true,')
  latexDoc.push('  frame=single,')
  latexDoc.push('  numbers=left,')
  latexDoc.push('  numberstyle=\\tiny,')
  latexDoc.push('  showstringspaces=false')
  latexDoc.push('}')
  latexDoc.push('')

  // Document metadata
  latexDoc.push('\\begin{document}')
  latexDoc.push('')
  latexDoc.push(`\\title{${escapeLatex(title)}}`)
  latexDoc.push('')
  latexDoc.push(`\\author{\\IEEEauthorblockN{${escapeLatex(metadata.author || 'Author')}}`)
  latexDoc.push(`\\IEEEauthorblockA{${escapeLatex(metadata.date || '')}}}`)
  latexDoc.push('')
  latexDoc.push('\\maketitle')
  latexDoc.push('')

  // Abstract (using description)
  latexDoc.push('\\begin{abstract}')
  latexDoc.push(escapeLatex(description))
  latexDoc.push('\\end{abstract}')
  latexDoc.push('')

  // Keywords
  if (metadata.keywords && metadata.keywords.length > 0) {
    latexDoc.push('\\begin{IEEEkeywords}')
    latexDoc.push(metadata.keywords.map(k => escapeLatex(k)).join(', '))
    latexDoc.push('\\end{IEEEkeywords}')
    latexDoc.push('')
  } else if (metadata.tags && metadata.tags.length > 0) {
    latexDoc.push('\\begin{IEEEkeywords}')
    latexDoc.push(metadata.tags.map(t => escapeLatex(t)).join(', '))
    latexDoc.push('\\end{IEEEkeywords}')
    latexDoc.push('')
  }

  // Content extraction from DOM
  const blogContent = document.querySelector('.prose-smooth')
  if (blogContent) {
    latexDoc.push('% Content')
    latexDoc.push('% NOTE: This is auto-generated. Please review and edit as needed.')
    latexDoc.push('')

    // Extract LaTeX equations
    const latexElements = extractLatexContent(blogContent)
    if (latexElements.length > 0) {
      latexDoc.push('% Equations found in document:')
      latexElements.forEach((eq, idx) => {
        latexDoc.push(`% Equation ${idx + 1}: ${eq}`)
      })
      latexDoc.push('')
    }

    // Extract text content (basic conversion)
    latexDoc.push('\\section{Introduction}')
    latexDoc.push('')
    latexDoc.push('% TODO: Add content here')
    latexDoc.push('% The original post contains interactive elements and visualizations')
    latexDoc.push('% that cannot be directly converted to LaTeX.')
    latexDoc.push('% Please refer to the web version for the full experience.')
    latexDoc.push('')
  }

  // References section
  latexDoc.push('\\section{References}')
  latexDoc.push('')
  latexDoc.push('% Add references here')
  latexDoc.push('')

  // End document
  latexDoc.push('\\end{document}')

  // Create download
  const content = latexDoc.join('\n')
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${metadata.slug}-${lang}.tex`
  a.click()
  URL.revokeObjectURL(url)

  return content
}

/**
 * Escape special LaTeX characters
 */
function escapeLatex(text) {
  if (!text) return ''
  return text
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/[&%$#_{}]/g, '\\$&')
    .replace(/~/g, '\\textasciitilde{}')
    .replace(/\^/g, '\\textasciicircum{}')
}
