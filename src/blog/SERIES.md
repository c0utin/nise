# Blog Series Feature

## Overview

The blog system now supports **sequential post series** based on directory structure. This allows you to create multi-part tutorials, courses, or any content that should be read in a specific order.

## Features

- ✅ Sequential navigation (Previous/Next buttons)
- ✅ Series grouping in blog listing
- ✅ Automatic ordering based on metadata
- ✅ Direct URL routing to specific posts
- ✅ Series progress indication
- ✅ GitHub contribution links per post
- ✅ Optimized performance with React.memo

## Creating a Series

### 1. Directory Structure

Create a directory for your series inside `src/blog/posts/`:

```
src/blog/posts/
  react-fundamentals/
    01-intro.jsx
    02-components.jsx
    03-state.jsx
  standalone-post.jsx
  example-post.jsx
```

### 2. Post Metadata

Each post in a series must include these metadata fields:

```javascript
export const metadata = {
  slug: 'react-fundamentals-01-intro',
  title: {
    en: 'Introduction to React',
    pt: 'Introdução ao React',
    es: 'Introducción a React'
  },
  description: {
    en: 'Learn the basics of React',
    pt: 'Aprenda os fundamentos do React',
    es: 'Aprende los conceptos básicos de React'
  },
  date: '2025-01-20',
  author: 'Your Name',
  tags: ['react', 'tutorial'],
  readTime: 8,
  published: true,

  // Series-specific fields
  series: 'React Fundamentals',  // Series name
  seriesOrder: 1,                 // Position in series (1, 2, 3, ...)

  aiSummary: 'Brief summary for AI',
  keywords: ['react', 'javascript']
}
```

### 3. Register in Index

Add your posts to `src/blog/posts/index.js`:

```javascript
// Import your series posts
import ReactPart1, { metadata as meta1 } from './react-fundamentals/01-intro'
import ReactPart2, { metadata as meta2 } from './react-fundamentals/02-components'

// Add to postsData array
const postsData = [
  {
    component: ReactPart1,
    metadata: meta1
  },
  {
    component: ReactPart2,
    metadata: meta2
  },
  // ... other posts
]
```

The system will automatically:
- Sort posts within a series by `seriesOrder`
- Add `previousPost` and `nextPost` navigation
- Calculate `totalInSeries`
- Group posts in the series view

## URL Routing

Posts are accessible via direct URLs:

```
#blog/react-fundamentals-01-intro
#blog/react-fundamentals-02-components
```

The URL structure allows:
- ✅ Direct linking to specific posts
- ✅ Sharing links to series content
- ✅ Browser back/forward navigation
- ✅ Bookmarking

## UI Features

### Blog Listing Views

Three view modes:

1. **All** — Shows all posts with series indicators
2. **Series** — Groups posts by series
3. **Standalone** — Shows only non-series posts

### Series Navigation

- **Top banner** — Shows series name and part number
- **Previous/Next buttons** — Quick navigation within series
- **Bottom navigation** — Larger cards for continue reading
- **Footer metadata** — Shows series name in post footer

## Performance Optimizations

The blog system uses:

- `React.memo` — Prevents unnecessary re-renders of post cards
- `useMemo` — Caches filtered and sorted posts
- `useCallback` — Memoizes event handlers
- `will-change-transform` — GPU-accelerated hover effects

## Example Series

See the **React Fundamentals** series for a complete example:

- Part 1: Introduction to React
- Part 2: Understanding Components

## Best Practices

1. **Consistent Naming** — Use numeric prefixes (01-, 02-) in filenames
2. **Clear Slugs** — Include series name in slug for uniqueness
3. **Series Name** — Use the same series name across all parts
4. **Sequential Order** — Use consecutive numbers for seriesOrder
5. **Complete Content** — Each part should be valuable standalone
6. **Navigation Context** — Reference previous/next topics in content

## Contributing

To contribute to blog posts:

1. Find the post file in the GitHub repository
2. Click "Edit this post on GitHub" button
3. Submit your improvements via pull request

Each post has a direct link to its source file on GitHub for easy contributions.

## Example Post Template

```javascript
import React from 'react'

export const metadata = {
  slug: 'my-series-01-intro',
  title: {
    en: 'Introduction',
    pt: 'Introdução',
    es: 'Introducción'
  },
  description: {
    en: 'First part of the series',
    pt: 'Primeira parte da série',
    es: 'Primera parte de la serie'
  },
  date: '2025-01-20',
  author: 'Your Name',
  tags: ['tutorial', 'beginner'],
  readTime: 5,
  published: true,
  series: 'My Series',
  seriesOrder: 1,
  aiSummary: 'Brief summary',
  keywords: ['keyword1', 'keyword2']
}

export default function MyPost({ lang = 'en' }) {
  const t = metadata.title[lang] || metadata.title.en
  const d = metadata.description[lang] || metadata.description.en

  return (
    <article className="prose prose-invert max-w-4xl mx-auto">
      <header className="mb-12">
        <h1 className="text-4xl font-bold mb-4">{t}</h1>
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <span>{metadata.date}</span>
          <span>•</span>
          <span>{metadata.readTime} min read</span>
        </div>
        <p className="text-xl text-gray-300 mt-4">{d}</p>
      </header>

      <section>
        <h2>Your Content Here</h2>
        <p>Write your content using semantic HTML and React components...</p>
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
```

## Technical Details

### Navigation Flow

```
User clicks post → URL updates → React router handles →
Component renders with series context → Previous/Next buttons available
```

### Data Flow

```
posts/index.js → buildPosts() → Process series metadata →
Add navigation props → Export posts array → Components consume
```

### Series Processing

1. Group posts by series name
2. Sort within each series by seriesOrder
3. Calculate previous/next slugs
4. Inject navigation metadata
5. Export enriched post data

## Future Enhancements

Potential features for future development:

- [ ] Series completion tracking
- [ ] Series overview/index pages
- [ ] Reading progress indicators
- [ ] Series tags/categories
- [ ] Related series suggestions
- [ ] Export entire series as PDF
