# Blog System Documentation

A robust, feature-rich blog system with multilingual support, interactive components, and multiple export formats.

## Table of Contents

1. [Features](#features)
2. [Architecture](#architecture)
3. [Creating Posts](#creating-posts)
4. [Interactive Components](#interactive-components)
5. [Export Formats](#export-formats)
6. [Multilingual Support](#multilingual-support)
7. [Post Editor (Coming Soon)](#post-editor)
8. [API Reference](#api-reference)

---

## Features

✅ **JS-based Posts** - Write posts as React components for full interactivity
✅ **Multilingual** - Support for multiple languages per post (EN, PT, ES, and more)
✅ **Interactive Components** - Embed graphs, 3D visualizations, code blocks
✅ **PDF Export** - Generate printable PDFs from posts
✅ **AI-Optimized Export** - Token-minimized format for LLM consumption
✅ **Search & Filter** - Find posts by tags, search query, or language
✅ **Responsive Design** - Mobile-friendly interface
✅ **SEO-Ready** - Metadata and keywords for search engines

---

## Architecture

```
src/blog/
├── posts/                    # Individual blog posts
│   ├── example-post.jsx      # Example post template
│   └── index.js              # Posts registry
├── components/               # Reusable blog components (future)
│   ├── LineChart.jsx
│   ├── Scene3D.jsx
│   └── CodeBlock.jsx
├── editor/                   # Post editor interface (future)
│   ├── PostEditor.jsx
│   └── LivePreview.jsx
├── utils/
│   ├── pdfExport.js          # PDF generation utility
│   └── aiOptimize.js         # AI export utility
├── BlogSection.jsx           # Blog listing page
├── BlogPost.jsx              # Individual post view
└── README.md                 # This file
```

---

## Creating Posts

### Step 1: Create a New Post File

Create a new file in `src/blog/posts/` with your post content:

```jsx
// src/blog/posts/my-awesome-post.jsx

/**
 * My Awesome Post
 *
 * Brief description of what this post is about
 */

import React from 'react'

// Post metadata - REQUIRED
export const metadata = {
  slug: 'my-awesome-post',           // Unique identifier (URL-safe)

  // Multilingual titles
  title: {
    en: 'My Awesome Post',
    pt: 'Meu Post Incrível',
    es: 'Mi Publicación Increíble'
  },

  // Multilingual descriptions
  description: {
    en: 'An exploration of awesome concepts',
    pt: 'Uma exploração de conceitos incríveis',
    es: 'Una exploración de conceptos increíbles'
  },

  date: '2025-01-15',                // ISO format (YYYY-MM-DD)
  author: 'Your Name',
  tags: ['javascript', 'react', 'tutorial'],
  readTime: 10,                      // Estimated read time in minutes
  published: true,                   // Set to false to hide from listing

  // AI-optimized summary (keep it concise!)
  aiSummary: 'Post about X, covering Y and Z. Key insights: A, B, C.',

  // Optional: Keywords for SEO
  keywords: ['react', 'blog', 'javascript', 'interactive']
}

// Post content component
export default function MyAwesomePost({ lang = 'en' }) {
  // Access localized metadata
  const t = metadata.title[lang] || metadata.title.en
  const d = metadata.description[lang] || metadata.description.en

  return (
    <article className="prose prose-invert max-w-4xl mx-auto">
      {/* Header */}
      <header className="mb-12">
        <h1 className="text-4xl font-bold mb-4">{t}</h1>
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <span>{metadata.date}</span>
          <span>•</span>
          <span>{metadata.readTime} min read</span>
          <span>•</span>
          <span>{metadata.author}</span>
        </div>
        <p className="text-xl text-gray-300 mt-4">{d}</p>
      </header>

      {/* Content */}
      <section className="space-y-6">
        <h2>Introduction</h2>
        <p>Your content here...</p>

        {/* You can use any React component! */}
        <MyCustomComponent />

        <h2>Another Section</h2>
        <p>More content...</p>
      </section>

      {/* Footer with tags */}
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

### Step 2: Register Your Post

Add your post to the registry in `src/blog/posts/index.js`:

```javascript
// Import your post
import MyAwesomePost, { metadata as myAwesomeMeta } from './my-awesome-post'

// Add to posts array
export const posts = [
  {
    component: MyAwesomePost,
    metadata: myAwesomeMeta
  },
  // ... other posts
]
```

That's it! Your post will now appear in the blog listing.

---

## Interactive Components

### Example: Line Chart

```jsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

const data = [
  { name: 'Jan', value: 400 },
  { name: 'Feb', value: 300 },
  // ...
]

<LineChart width={600} height={300} data={data}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="name" />
  <YAxis />
  <Tooltip />
  <Legend />
  <Line type="monotone" dataKey="value" stroke="#8884d8" />
</LineChart>
```

### Example: 3D Scene

```jsx
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'

<Canvas>
  <ambientLight intensity={0.5} />
  <mesh>
    <boxGeometry args={[1, 1, 1]} />
    <meshStandardMaterial color="hotpink" />
  </mesh>
  <OrbitControls />
</Canvas>
```

### Example: Code Block with Syntax Highlighting

```jsx
<pre className="bg-zinc-900 p-4 rounded-lg overflow-x-auto">
  <code className="language-javascript">{`
function example() {
  console.log('Hello, World!')
}
  `}</code>
</pre>
```

---

## Export Formats

### PDF Export

Users can export any post as a PDF by clicking the "Export" button and selecting "Export as PDF".

**Requirements:**
```bash
npm install html2pdf.js
```

**How it works:**
- Renders the React component to HTML
- Generates a PDF using html2pdf.js
- Downloads automatically

### AI-Optimized Export

Export posts in a token-minimized format for LLM consumption.

**Format:**
```
TITLE: Post Title
DATE: 2025-01-15
AUTHOR: Author Name
TAGS: tag1, tag2, tag3
READ_TIME: 10min

SUMMARY: Brief description

AI_SUMMARY: Ultra-concise summary for AI models

KEYWORDS: keyword1, keyword2

TOKEN_ESTIMATE: ~250 tokens
```

**Benefits:**
- Minimal tokens (~75% reduction vs full content)
- Preserves key information
- Structured format for easy parsing
- Includes metadata and context

---

## Multilingual Support

### Supported Languages

Currently supported:
- `en` - English
- `pt` - Português (Portuguese)
- `es` - Español (Spanish)

### Adding a New Language

1. Add language code to metadata:
```javascript
export const metadata = {
  title: {
    en: 'Title',
    pt: 'Título',
    es: 'Título',
    fr: 'Titre'  // Add French
  },
  // ...
}
```

2. Update language selector in `BlogSection.jsx` and `BlogPost.jsx`:
```jsx
<option value="fr">Français</option>
```

### Content Translation

You can provide different content per language:

```jsx
export default function Post({ lang = 'en' }) {
  const content = {
    en: {
      intro: 'Welcome to this post...',
      section1: 'First section...'
    },
    pt: {
      intro: 'Bem-vindo a este post...',
      section1: 'Primeira seção...'
    }
  }

  const t = content[lang] || content.en

  return (
    <article>
      <p>{t.intro}</p>
      <p>{t.section1}</p>
    </article>
  )
}
```

---

## Post Editor

**Status:** Coming Soon

Planned features:
- Visual editor with live preview
- Component library browser
- Drag-and-drop interactive elements
- Markdown support
- Real-time token count
- Export preview before publishing

---

## API Reference

### Posts Registry (`src/blog/posts/index.js`)

#### `posts`
Array of all blog posts with their metadata and components.

#### `getPostBySlug(slug)`
Returns post data for a given slug.
```javascript
const post = getPostBySlug('my-awesome-post')
```

#### `getPostsByTag(tag)`
Returns all posts with a specific tag.
```javascript
const tutorialPosts = getPostsByTag('tutorial')
```

#### `getAllTags()`
Returns array of all unique tags across all posts.
```javascript
const tags = getAllTags() // ['tutorial', 'javascript', ...]
```

### Export Utilities

#### `exportToPDF(postData, lang)`
Generates and downloads a PDF of the post.
```javascript
import { exportToPDF } from './utils/pdfExport'
await exportToPDF(postData, 'en')
```

#### `exportForAI(postData, lang)`
Returns AI-optimized text format.
```javascript
import { exportForAI } from './utils/aiOptimize'
const optimized = exportForAI(postData, 'en')
```

#### `exportForAIJSON(postData, lang)`
Returns JSON format for programmatic consumption.
```javascript
import { exportForAIJSON } from './utils/aiOptimize'
const json = exportForAIJSON(postData, 'en')
```

#### `estimateTokens(text)`
Estimates token count for given text.
```javascript
import { estimateTokens } from './utils/aiOptimize'
const tokens = estimateTokens('Some text...') // ~250
```

---

## Best Practices

1. **Keep AI summaries concise** - Aim for <100 words
2. **Use semantic tags** - Be specific and consistent
3. **Provide read time estimates** - Help users manage expectations
4. **Test all languages** - Ensure content works in all translations
5. **Optimize images** - Use compressed formats for faster loading
6. **Document interactive components** - Add comments explaining complex visualizations
7. **Version control** - Track changes to posts over time

---

## Examples

See `src/blog/posts/example-post.jsx` for a complete working example.

---

## Troubleshooting

### Post not appearing in listing
- Check `published: true` in metadata
- Verify post is registered in `posts/index.js`
- Check browser console for errors

### PDF export not working
- Ensure `html2pdf.js` is installed
- Check browser console for errors
- Try a simpler post first

### Language not switching
- Verify language code in metadata
- Check `lang` prop is being passed to component
- Ensure fallback to English is working

---

## Future Enhancements

- [ ] Visual post editor with live preview
- [ ] Component library for graphs/charts
- [ ] Markdown import/export
- [ ] RSS feed generation
- [ ] Social media preview cards
- [ ] Analytics integration
- [ ] Comments system
- [ ] Search with Algolia/ElasticSearch
- [ ] Static site generation for performance

---

## Contributing

When adding new features:

1. Update documentation
2. Add examples
3. Test in all supported languages
4. Ensure backwards compatibility
5. Update the example post if needed

---

## License

Part of the nise project.

---

**Happy blogging! 🚀**
