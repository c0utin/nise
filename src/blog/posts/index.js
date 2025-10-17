/**
 * Blog Posts Index
 *
 * This file exports all blog posts and their metadata.
 * Each post is a React component with multilingual support.
 *
 * Series Structure:
 * - Posts can be standalone or part of a series
 * - Series are defined by directory structure: posts/series-name/01-post.jsx
 * - Sequential posts in a series use numeric prefixes: 01-, 02-, 03-
 * - Series metadata is defined in the series directory
 *
 * Usage:
 * import { posts, series } from './blog/posts'
 */

// Import posts
import HowThisBlogWorks, { metadata as blogWorksMeta } from './how-this-blog-works'

// Build posts array with series information
const buildPosts = () => {
  const postsData = [
    // Standalone posts
    {
      component: HowThisBlogWorks,
      metadata: {
        ...blogWorksMeta,
        series: null,
        seriesOrder: null,
        totalInSeries: null,
        previousPost: null,
        nextPost: null
      }
    }
    // Add more posts here
  ]

  // Process series information
  const seriesMap = new Map()

  postsData.forEach(post => {
    if (post.metadata.series) {
      if (!seriesMap.has(post.metadata.series)) {
        seriesMap.set(post.metadata.series, [])
      }
      seriesMap.get(post.metadata.series).push(post)
    }
  })

  // Sort series posts and add navigation info
  seriesMap.forEach((seriesPosts, seriesName) => {
    seriesPosts.sort((a, b) => a.metadata.seriesOrder - b.metadata.seriesOrder)

    seriesPosts.forEach((post, index) => {
      post.metadata.totalInSeries = seriesPosts.length
      post.metadata.previousPost = index > 0 ? seriesPosts[index - 1].metadata.slug : null
      post.metadata.nextPost = index < seriesPosts.length - 1 ? seriesPosts[index + 1].metadata.slug : null
    })
  })

  return { posts: postsData, seriesMap }
}

const { posts: postsArray, seriesMap } = buildPosts()

// Export posts array
export const posts = postsArray

// Export series information
export const series = Array.from(seriesMap.entries()).map(([name, posts]) => ({
  name,
  posts: posts.map(p => p.metadata),
  totalPosts: posts.length
}))

// Helper to get post by slug
export const getPostBySlug = (slug) => {
  return posts.find(post => post.metadata.slug === slug)
}

// Helper to get posts by tag
export const getPostsByTag = (tag) => {
  return posts.filter(post => post.metadata.tags.includes(tag))
}

// Helper to get posts by series
export const getPostsBySeries = (seriesName) => {
  return posts
    .filter(post => post.metadata.series === seriesName)
    .sort((a, b) => a.metadata.seriesOrder - b.metadata.seriesOrder)
}

// Helper to get all series
export const getAllSeries = () => {
  return series
}

// Helper to get all tags
export const getAllTags = () => {
  const tags = new Set()
  posts.forEach(post => {
    post.metadata.tags.forEach(tag => tags.add(tag))
  })
  return Array.from(tags)
}
