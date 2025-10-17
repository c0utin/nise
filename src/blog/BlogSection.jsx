/**
 * Blog Section Component
 *
 * Displays a list of all blog posts with filtering and search capabilities.
 */

import React, { useState, useMemo, useCallback } from 'react'
import { posts, getAllTags, getAllSeries } from './posts'

// Memoized Post Card Component for better performance
const PostCard = React.memo(({ post, selectedLang, onSelectPost }) => {
  const meta = post.metadata
  const title = meta.title[selectedLang] || meta.title.en
  const desc = meta.description[selectedLang] || meta.description.en

  const handleClick = useCallback(() => {
    onSelectPost(meta.slug)
  }, [meta.slug, onSelectPost])

  return (
    <article
      onClick={handleClick}
      className="group cursor-pointer bg-white/5 border border-white/10 rounded-lg p-6 hover:bg-white/10 hover:border-white/20 transition-all will-change-transform"
    >
      {meta.series && (
        <div className="flex items-center gap-1 text-xs text-gray-400 mb-2">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <span>{meta.series} • Part {meta.seriesOrder}</span>
        </div>
      )}
      <h2 className="text-xl font-semibold mb-2 group-hover:text-gray-200 transition-colors">
        {title}
      </h2>
      <p className="text-sm text-gray-400 line-clamp-3 mb-3">{desc}</p>
      <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
        <span>{meta.date}</span>
        <span>•</span>
        <span>{meta.readTime} min</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {meta.tags.slice(0, 3).map(tag => (
          <span key={tag} className="px-2 py-1 bg-white/5 rounded text-xs">
            #{tag}
          </span>
        ))}
      </div>
    </article>
  )
})

PostCard.displayName = 'PostCard'

export default function BlogSection({ onNavigate, onSelectPost }) {
  const [selectedLang, setSelectedLang] = useState('en')
  const [selectedTag, setSelectedTag] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState('all') // 'all', 'series', 'standalone'

  // Memoize expensive computations
  const allTags = useMemo(() => getAllTags(), [])
  const allSeries = useMemo(() => getAllSeries(), [])

  // Memoize filtered and sorted posts
  const { sortedPosts, groupedPosts } = useMemo(() => {
    // Filter posts
    const filtered = posts.filter(post => {
      const meta = post.metadata

      // Filter by published status
      if (!meta.published) return false

      // Filter by tag
      if (selectedTag && !meta.tags.includes(selectedTag)) return false

      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const title = (meta.title[selectedLang] || meta.title.en).toLowerCase()
        const desc = (meta.description[selectedLang] || meta.description.en).toLowerCase()
        const tags = meta.tags.join(' ').toLowerCase()

        if (!title.includes(query) && !desc.includes(query) && !tags.includes(query)) {
          return false
        }
      }

      return true
    })

    // Sort by date (newest first)
    const sorted = [...filtered].sort((a, b) => {
      return new Date(b.metadata.date) - new Date(a.metadata.date)
    })

    // Group posts by series
    const grouped = sorted.reduce((acc, post) => {
      const series = post.metadata.series || '__standalone__'
      if (!acc[series]) {
        acc[series] = []
      }
      acc[series].push(post)
      return acc
    }, {})

    // Sort series posts by order
    Object.keys(grouped).forEach(series => {
      if (series !== '__standalone__') {
        grouped[series].sort((a, b) => a.metadata.seriesOrder - b.metadata.seriesOrder)
      }
    })

    return { sortedPosts: sorted, groupedPosts: grouped }
  }, [selectedLang, selectedTag, searchQuery])

  // Memoize callbacks
  const handleSelectPost = useCallback((slug) => {
    onSelectPost(slug)
  }, [onSelectPost])

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <button
              onClick={() => onNavigate('landing')}
              className="text-xl font-semibold hover:text-gray-300 transition-colors"
            >
              @c0utin
            </button>
            <div className="flex items-center gap-4">
              <button
                onClick={() => onNavigate('landing')}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Home
              </button>
              <button
                onClick={() => onNavigate('about')}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                About
              </button>
              <button
                onClick={() => onNavigate('projects')}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Projects
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Page Title */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-4">Blog Posts</h1>
          <p className="text-xl text-gray-400">
            Thoughts, experiments, and explorations in code, art, and technology
          </p>
        </div>

        {/* Filters and Search */}
        <div className="mb-8 space-y-4">
          {/* Search */}
          <div>
            <input
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-white/30 transition-colors"
            />
          </div>

          {/* View Mode and Language */}
          <div className="flex flex-wrap gap-4 items-center">
            {/* View Mode */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">View:</span>
              <button
                onClick={() => setViewMode('all')}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  viewMode === 'all'
                    ? 'bg-white text-black'
                    : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setViewMode('series')}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  viewMode === 'series'
                    ? 'bg-white text-black'
                    : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                Series
              </button>
              <button
                onClick={() => setViewMode('standalone')}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  viewMode === 'standalone'
                    ? 'bg-white text-black'
                    : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                Standalone
              </button>
            </div>

            {/* Language Selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Language:</span>
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
            </div>

            {/* Tag Filter */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-400">Tags:</span>
              <button
                onClick={() => setSelectedTag(null)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  !selectedTag
                    ? 'bg-white text-black'
                    : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                All
              </button>
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    selectedTag === tag
                      ? 'bg-white text-black'
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Posts Display */}
        {sortedPosts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-gray-400">No posts found</p>
          </div>
        ) : viewMode === 'series' ? (
          // Series View - Grouped by series
          <div className="space-y-8">
            {Object.entries(groupedPosts)
              .filter(([series]) => series !== '__standalone__')
              .map(([seriesName, seriesPosts]) => (
                <div key={seriesName} className="border border-white/10 rounded-lg p-6 bg-white/5">
                  <div className="flex items-center gap-2 mb-4">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <h3 className="text-2xl font-bold text-white">{seriesName}</h3>
                    <span className="text-sm text-gray-400">({seriesPosts.length} parts)</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {seriesPosts.map(post => {
                      const meta = post.metadata
                      const title = meta.title[selectedLang] || meta.title.en
                      const desc = meta.description[selectedLang] || meta.description.en

                      return (
                        <article
                          key={meta.slug}
                          onClick={() => onSelectPost(meta.slug)}
                          className="group cursor-pointer bg-black/30 border border-white/10 rounded-lg p-4 hover:bg-black/50 hover:border-white/20 transition-all"
                        >
                          <div className="text-xs text-gray-500 mb-2">Part {meta.seriesOrder}</div>
                          <h4 className="text-lg font-semibold mb-2 group-hover:text-gray-200 transition-colors">
                            {title}
                          </h4>
                          <p className="text-sm text-gray-400 line-clamp-2 mb-3">{desc}</p>
                          <div className="text-xs text-gray-500">{meta.readTime} min</div>
                        </article>
                      )
                    })}
                  </div>
                </div>
              ))}
          </div>
        ) : viewMode === 'standalone' ? (
          // Standalone View - Only non-series posts
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(groupedPosts['__standalone__'] || []).map(post => {
              const meta = post.metadata
              const title = meta.title[selectedLang] || meta.title.en
              const desc = meta.description[selectedLang] || meta.description.en

              return (
                <article
                  key={meta.slug}
                  onClick={() => onSelectPost(meta.slug)}
                  className="group cursor-pointer bg-white/5 border border-white/10 rounded-lg p-6 hover:bg-white/10 hover:border-white/20 transition-all"
                >
                  <h2 className="text-xl font-semibold mb-2 group-hover:text-gray-200 transition-colors">
                    {title}
                  </h2>
                  <p className="text-sm text-gray-400 line-clamp-3 mb-3">{desc}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                    <span>{meta.date}</span>
                    <span>•</span>
                    <span>{meta.readTime} min</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {meta.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="px-2 py-1 bg-white/5 rounded text-xs">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </article>
              )
            })}
          </div>
        ) : (
          // All View - Traditional grid with memoized cards
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedPosts.map(post => (
              <PostCard
                key={post.metadata.slug}
                post={post}
                selectedLang={selectedLang}
                onSelectPost={handleSelectPost}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
