/**
 * PDF Export Utility
 *
 * Exports blog posts to PDF format.
 * Uses html2pdf.js for client-side PDF generation.
 *
 * Usage:
 * import { exportToPDF } from './utils/pdfExport'
 * await exportToPDF(postData, 'en')
 */

export async function exportToPDF(postData, lang = 'en') {
  // Dynamically import html2pdf
  let html2pdf
  try {
    const module = await import('html2pdf.js')
    html2pdf = module.default || module
  } catch (error) {
    console.error('Failed to load html2pdf.js:', error)
    throw new Error('PDF export library not available')
  }

  const { metadata } = postData
  const title = metadata.title[lang] || metadata.title.en

  // Create a temporary container
  const container = document.createElement('div')
  container.style.cssText = `
    position: absolute;
    left: -9999px;
    top: 0;
    width: 800px;
    background: white;
    color: black;
    padding: 40px;
    font-family: 'Georgia', serif;
    line-height: 1.6;
  `

  // Render post content
  const PostComponent = postData.component
  const root = document.createElement('div')
  container.appendChild(root)
  document.body.appendChild(container)

  try {
    // Use React to render the component
    const React = await import('react')
    const ReactDOM = await import('react-dom/client')

    const rootElement = ReactDOM.createRoot(root)
    await new Promise((resolve) => {
      rootElement.render(
        React.createElement(PostComponent, { lang }, null)
      )
      setTimeout(resolve, 100) // Wait for render
    })

    // PDF options
    const opt = {
      margin: [15, 15, 15, 15],
      filename: `${metadata.slug}-${lang}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait'
      }
    }

    // Generate PDF
    await html2pdf().set(opt).from(container).save()

    // Cleanup
    rootElement.unmount()
  } finally {
    document.body.removeChild(container)
  }
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
    position: absolute;
    left: -9999px;
    top: 0;
    width: 800px;
    background: white;
    color: black;
    padding: 40px;
    font-family: 'Georgia', serif;
    line-height: 1.6;
  `

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
      setTimeout(resolve, 100)
    })

    const opt = {
      margin: [15, 15, 15, 15],
      filename: `${metadata.slug}-${lang}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait'
      }
    }

    const pdf = await html2pdf().set(opt).from(container).outputPdf('blob')
    rootElement.unmount()
    return pdf
  } finally {
    document.body.removeChild(container)
  }
}
