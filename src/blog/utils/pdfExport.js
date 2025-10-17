/**
 * PDF Export Utility
 *
 * Exports blog posts to PDF format using browser's print functionality
 *
 * Usage:
 * import { exportToPDF } from './utils/pdfExport'
 * exportToPDF(postData, 'en')
 */

export function exportToPDF(postData, lang = 'en') {
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
        padding: 20px !important;
        background: white !important;
        color: black !important;
      }

      /* Typography */
      #pdf-print-content h1,
      #pdf-print-content h2,
      #pdf-print-content h3,
      #pdf-print-content h4 {
        color: #000 !important;
        page-break-after: avoid;
      }

      #pdf-print-content h1 { font-size: 24pt !important; }
      #pdf-print-content h2 {
        font-size: 20pt !important;
        margin-top: 24pt !important;
        page-break-before: auto;
      }
      #pdf-print-content h3 { font-size: 16pt !important; }
      #pdf-print-content h4 { font-size: 14pt !important; }

      #pdf-print-content p {
        color: #000 !important;
        font-size: 11pt !important;
        line-height: 1.5 !important;
        margin-bottom: 12pt !important;
      }

      /* Lists */
      #pdf-print-content ul,
      #pdf-print-content ol {
        color: #000 !important;
        margin-left: 20pt !important;
      }

      #pdf-print-content li {
        color: #000 !important;
        font-size: 11pt !important;
        margin-bottom: 6pt !important;
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

      /* Headers and footers */
      @page {
        margin: 1.5cm;
      }
    }
  `

  // Add print styles to head
  document.head.appendChild(printStyles)

  // Clone the content
  const printContent = blogContent.cloneNode(true)
  printContent.id = 'pdf-print-content'
  printContent.style.cssText = 'display: none;'

  // Remove any canvas elements (3D graphics)
  const canvases = printContent.querySelectorAll('canvas')
  canvases.forEach(canvas => canvas.remove())

  // Remove any interactive buttons
  const buttons = printContent.querySelectorAll('button')
  buttons.forEach(btn => btn.remove())

  // Append to body
  document.body.appendChild(printContent)

  // Trigger print dialog
  setTimeout(() => {
    window.print()

    // Cleanup after print dialog closes
    setTimeout(() => {
      if (document.body.contains(printContent)) {
        document.body.removeChild(printContent)
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
