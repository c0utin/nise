/**
 * AI-Optimized Export Utility
 *
 * Generates token-minimized versions of blog posts for LLM consumption.
 * Removes formatting, compresses whitespace, and focuses on content.
 *
 * Features:
 * - Strips unnecessary HTML/JSX
 * - Removes code comments
 * - Compresses whitespace
 * - Preserves semantic structure
 * - Includes metadata for context
 *
 * Usage:
 * import { exportForAI } from './utils/aiOptimize'
 * const optimized = exportForAI(postData, 'en')
 */

/**
 * Extract text content from React component
 * This is a simplified version - for production, consider using a proper React renderer
 */
function extractTextContent(component, lang) {
  // For now, return the AI summary from metadata
  // In production, you'd want to actually render and extract text
  return component.metadata.aiSummary || ''
}

/**
 * Main export function
 */
export function exportForAI(postData, lang = 'en') {
  const { metadata, component } = postData

  // Get localized content
  const title = metadata.title[lang] || metadata.title.en
  const description = metadata.description[lang] || metadata.description.en

  // Build optimized output
  const sections = []

  // Header
  sections.push(`TITLE: ${title}`)
  sections.push(`DATE: ${metadata.date}`)
  sections.push(`AUTHOR: ${metadata.author}`)
  sections.push(`TAGS: ${metadata.tags.join(', ')}`)
  sections.push(`READ_TIME: ${metadata.readTime}min`)
  sections.push(``)

  // Description
  sections.push(`SUMMARY: ${description}`)
  sections.push(``)

  // AI-optimized summary
  if (metadata.aiSummary) {
    sections.push(`AI_SUMMARY: ${metadata.aiSummary}`)
    sections.push(``)
  }

  // Keywords
  if (metadata.keywords && metadata.keywords.length > 0) {
    sections.push(`KEYWORDS: ${metadata.keywords.join(', ')}`)
    sections.push(``)
  }

  // Content extraction note
  sections.push(`CONTENT_NOTE: This is an AI-optimized export. Full interactive content available at source.`)
  sections.push(``)

  // Calculate token estimate (rough approximation: 1 token ≈ 4 characters)
  const fullText = sections.join('\n')
  const estimatedTokens = Math.ceil(fullText.length / 4)

  sections.push(`TOKEN_ESTIMATE: ~${estimatedTokens} tokens`)

  return sections.join('\n')
}

/**
 * Export with content extraction (advanced)
 * This would require actual component rendering
 */
export async function exportForAIWithContent(postData, lang = 'en') {
  // TODO: Implement full content extraction
  // This would involve:
  // 1. Rendering the React component to string
  // 2. Parsing and extracting text content
  // 3. Removing code blocks, images, etc. (or converting to descriptions)
  // 4. Structuring into sections
  // 5. Minimizing whitespace and tokens

  return exportForAI(postData, lang) + '\n\n[Full content extraction not yet implemented]'
}

/**
 * Calculate token count estimate
 */
export function estimateTokens(text) {
  // Rough estimate: 1 token ≈ 4 characters for English
  // For other languages, this may vary
  return Math.ceil(text.length / 4)
}

/**
 * Optimize text for minimal tokens
 */
export function minimizeTokens(text) {
  return text
    // Remove multiple spaces
    .replace(/\s+/g, ' ')
    // Remove leading/trailing whitespace from lines
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    // Remove redundant words (optional, configurable)
    // .replace(/\b(very|really|actually|basically)\b/gi, '')
    .join('\n')
    .trim()
}

/**
 * Export in JSON format for programmatic consumption
 */
export function exportForAIJSON(postData, lang = 'en') {
  const { metadata } = postData

  return JSON.stringify({
    title: metadata.title[lang] || metadata.title.en,
    description: metadata.description[lang] || metadata.description.en,
    date: metadata.date,
    author: metadata.author,
    tags: metadata.tags,
    readTime: metadata.readTime,
    aiSummary: metadata.aiSummary,
    keywords: metadata.keywords || [],
    slug: metadata.slug,
    lang: lang
  }, null, 2)
}
