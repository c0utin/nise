/**
 * Blog Post View Component
 *
 * Displays an individual blog post with controls for language selection,
 * PDF export, and AI-optimized export.
 *
 * Supports:
 * - LaTeX equations via KaTeX
 * - 3D graphics via Three.js
 * - Interactive components
 * - IEEE paper structure
 */

import React, { useState } from 'react'
import { getPostBySlug } from './posts'
import { exportToPDF, exportToLatex } from './utils/pdfExport'
import { exportForAI } from './utils/aiOptimize'

export default function BlogPost({ slug, onNavigate, onBack, onSelectPost }) {
  const [selectedLang, setSelectedLang] = useState('en')
  const [showExportMenu, setShowExportMenu] = useState(false)

  const postData = getPostBySlug(slug)

  // Smooth reading styles
  const proseStyles = `
    .prose-smooth {
      line-height: 1.8;
      letter-spacing: 0.01em;
    }

    .prose-smooth h1,
    .prose-smooth h2,
    .prose-smooth h3,
    .prose-smooth h4 {
      font-weight: 700;
      line-height: 1.3;
      margin-top: 2rem;
      margin-bottom: 1rem;
      color: #ffffff;
    }

    .prose-smooth h1 { font-size: 2.5rem; }
    .prose-smooth h2 { font-size: 2rem; margin-top: 3rem; }
    .prose-smooth h3 { font-size: 1.5rem; }
    .prose-smooth h4 { font-size: 1.25rem; }

    .prose-smooth p {
      margin-bottom: 1.5rem;
      color: rgba(255, 255, 255, 0.85);
      font-size: 1.125rem;
    }

    .prose-smooth ul,
    .prose-smooth ol {
      margin-bottom: 1.5rem;
      padding-left: 1.5rem;
    }

    .prose-smooth li {
      margin-bottom: 0.75rem;
      color: rgba(255, 255, 255, 0.85);
      line-height: 1.8;
    }

    .prose-smooth pre {
      margin: 2rem 0;
      padding: 1.5rem;
      background: rgba(0, 0, 0, 0.5);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 0.5rem;
      overflow-x: auto;
      line-height: 1.6;
    }

    .prose-smooth code {
      font-family: 'Fira Code', 'Monaco', 'Consolas', monospace;
      font-size: 0.9em;
      color: #00ff88;
    }

    .prose-smooth a {
      color: #00aaff;
      text-decoration: none;
      transition: color 0.2s ease;
      border-bottom: 1px solid rgba(0, 170, 255, 0.3);
    }

    .prose-smooth a:hover {
      color: #00ddff;
      border-bottom-color: rgba(0, 221, 255, 0.6);
    }

    .prose-smooth blockquote {
      border-left: 4px solid rgba(255, 255, 255, 0.2);
      padding-left: 1.5rem;
      margin: 2rem 0;
      color: rgba(255, 255, 255, 0.7);
      font-style: italic;
    }

    .prose-smooth strong {
      color: #ffffff;
      font-weight: 600;
    }

    .prose-smooth em {
      color: rgba(255, 255, 255, 0.9);
    }

    /* LaTeX equation styles */
    .prose-smooth .katex {
      font-size: 1.1em;
    }

    .prose-smooth .katex-display {
      margin: 2rem 0;
      padding: 1rem;
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 0.5rem;
      overflow-x: auto;
    }

    .prose-smooth .katex-inline {
      padding: 0 0.2em;
    }

    .prose-smooth .equation-container {
      margin: 2rem 0;
      padding: 1rem;
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 0.5rem;
    }

    .prose-smooth .equation-number {
      user-select: none;
    }
  `

  if (!postData) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Post Not Found</h1>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors"
          >
            Back to Posts
          </button>
        </div>
      </div>
    )
  }

  const { component: PostComponent, metadata } = postData

  const handleExportPDF = async () => {
    try {
      await exportToPDF(postData, selectedLang)
      alert('PDF exported successfully!')
    } catch (error) {
      console.error('PDF export failed:', error)
      alert('Failed to export PDF')
    }
  }

  const handleExportAI = () => {
    try {
      const aiData = exportForAI(postData, selectedLang)
      const blob = new Blob([aiData], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${metadata.slug}-ai-optimized.txt`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('AI export failed:', error)
      alert('Failed to export for AI')
    }
  }

  const handleExportLatex = () => {
    try {
      exportToLatex(postData, selectedLang)
      alert('LaTeX file exported successfully!')
    } catch (error) {
      console.error('LaTeX export failed:', error)
      alert('Failed to export to LaTeX')
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <style>{proseStyles}</style>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/95 backdrop-blur border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <span>←</span>
              <span>Back</span>
            </button>

            <div className="flex items-center gap-4">
              {/* Language Selector */}
              <select
                value={selectedLang}
                onChange={(e) => setSelectedLang(e.target.value)}
                className="px-3 py-1 bg-white/5 border border-white/10 rounded text-sm focus:outline-none focus:border-white/30 text-white"
                style={{ colorScheme: 'dark' }}
              >
                <option value="en" className="bg-zinc-900 text-white">English</option>
                <option value="pt" className="bg-zinc-900 text-white">Português</option>
                <option value="es" className="bg-zinc-900 text-white">Español</option>
              </select>

              {/* Export Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded text-sm hover:bg-white/10 transition-colors"
                >
                  Export
                </button>

                {showExportMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-white/10 rounded-lg shadow-lg overflow-hidden">
                    <button
                      onClick={() => {
                        handleExportPDF()
                        setShowExportMenu(false)
                      }}
                      className="w-full px-4 py-3 text-left text-sm hover:bg-white/5 transition-colors"
                    >
                      <div className="font-medium">Export as PDF</div>
                      <div className="text-xs text-gray-400">IEEE format with rendered LaTeX</div>
                    </button>
                    <button
                      onClick={() => {
                        handleExportAI()
                        setShowExportMenu(false)
                      }}
                      className="w-full px-4 py-3 text-left text-sm hover:bg-white/5 transition-colors border-t border-white/10"
                    >
                      <div className="font-medium">Export for AI</div>
                      <div className="text-xs text-gray-400">Token-optimized format</div>
                    </button>
                  </div>
                )}
              </div>

              {/* Home Button */}
              <button
                onClick={() => onNavigate('landing')}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Home
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Series Navigation - Top */}
      {metadata.series && (
        <div className="max-w-4xl mx-auto px-6 pt-6">
          <div className="bg-gradient-to-r from-white/10 to-white/5 border border-white/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <div className="text-sm font-semibold text-white">
                {metadata.series}
              </div>
            </div>
            <div className="text-xs text-gray-400 mb-3">
              Part {metadata.seriesOrder} of {metadata.totalInSeries}
            </div>
            <div className="flex gap-2">
              {metadata.previousPost && (
                <button
                  onClick={() => onSelectPost ? onSelectPost(metadata.previousPost) : null}
                  className="flex-1 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <span>←</span>
                  <span>Previous</span>
                </button>
              )}
              {metadata.nextPost && (
                <button
                  onClick={() => onSelectPost ? onSelectPost(metadata.nextPost) : null}
                  className="flex-1 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <span>Next</span>
                  <span>→</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Post Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="prose-smooth">
          <PostComponent lang={selectedLang} />
        </div>
      </main>

      {/* Contribution CTA */}
      <div className="max-w-4xl mx-auto px-6 pb-8">
        <div className="bg-white/5 border border-white/10 rounded-lg p-6 text-center">
          <p className="text-gray-300 mb-4">
            Found an issue or want to contribute to this post?
          </p>
          <a
            href={`https://github.com/c0utin/nise/blob/main/src/blog/posts/${metadata.slug}.jsx`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
            Edit this post on GitHub
          </a>
        </div>
      </div>

      {/* Series Navigation - Bottom */}
      {metadata.series && (
        <div className="max-w-4xl mx-auto px-6 pb-8">
          <div className="border-t border-white/10 pt-8">
            <h3 className="text-lg font-semibold mb-4 text-white">Continue Reading</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {metadata.previousPost && (
                <button
                  onClick={() => onSelectPost ? onSelectPost(metadata.previousPost) : null}
                  className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-left transition-all group"
                >
                  <div className="text-xs text-gray-400 mb-1">← Previous in Series</div>
                  <div className="text-sm font-medium text-white group-hover:text-gray-200">
                    Part {metadata.seriesOrder - 1}
                  </div>
                </button>
              )}
              {metadata.nextPost && (
                <button
                  onClick={() => onSelectPost ? onSelectPost(metadata.nextPost) : null}
                  className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-left transition-all group md:col-start-2"
                >
                  <div className="text-xs text-gray-400 mb-1">Next in Series →</div>
                  <div className="text-sm font-medium text-white group-hover:text-gray-200">
                    Part {metadata.seriesOrder + 1}
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Navigation Footer */}
      <footer className="border-t border-white/10 bg-zinc-950">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex justify-between items-center">
            <button
              onClick={onBack}
              className="px-6 py-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
            >
              ← All Posts
            </button>
            <div className="text-sm text-gray-400">
              {metadata.date} • {metadata.readTime} min read
              {metadata.series && (
                <>
                  <span className="mx-2">•</span>
                  <span className="text-white/60">{metadata.series}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
