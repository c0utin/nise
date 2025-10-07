# Nise - Modular Generative Art

A modular generative art project built with React and Three.js, paying tribute to **Nise da Silveira**, the pioneering Brazilian psychiatrist who revolutionized mental health treatment through art therapy.

## Features

- **Modular Architecture**: Clean separation of art modules (Mandala, Fractals)
- **React + Three.js**: Modern web stack using React Three Fiber
- **WebGL Rendering**: Hardware-accelerated 3D graphics
- **Interactive Controls**: Orbit controls for camera manipulation
- **GitHub Pages**: Automatic deployment via GitHub Actions

## Art Modules

### 1. Mandala
Sacred geometric patterns with:
- Multiple rotating layers
- Procedurally generated colors
- Particle effects
- Real-time animation

### 2. Fractal (Mandelbrot)
Classic fractal visualization with:
- Animated zoom and color cycling
- Mandelbrot set calculation
- Dynamic palette generation

### 3. Fractal (Julia)
Julia set variation with:
- Animated parameters
- Complex plane exploration
- Smooth color gradients

## Development

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The app will be available at `http://localhost:3000`

## Deployment

### Automatic (GitHub Actions)
Push to the `main` branch to automatically deploy to GitHub Pages.

### Manual
```bash
# Deploy to GitHub Pages
npm run deploy
```

The site will be available at: `https://c0utin.github.io/nise/`

## Project Structure

```
nise/
├── src/
│   ├── modules/
│   │   ├── Mandala.jsx    # Mandala art module
│   │   └── Fractal.jsx    # Fractal art module
│   ├── App.jsx            # Main application
│   └── main.jsx           # Entry point
├── index.html             # HTML template
├── package.json           # Dependencies
└── vite.config.js         # Build configuration
```

## Adding New Modules

To add a new art module:

1. Create a new component in `src/modules/YourModule.jsx`
2. Import and add it to the modules array in `src/App.jsx`:

```jsx
import YourModule from './modules/YourModule'

const modules = [
  { name: 'Your Module', component: YourModule },
  // ... other modules
]
```

## About Nise da Silveira

Nise da Silveira (1905-1999) was a revolutionary Brazilian psychiatrist who:
- Founded the Museum of Images of the Unconscious in 1952
- Pioneered the use of art therapy in mental health treatment
- Rejected aggressive treatments like electroshock in favor of creative expression
- Demonstrated that art could be a window into the human psyche and a path to healing

This project honors her legacy by exploring the intersection of art, mathematics, and digital creation.

Learn more: [Nise da Silveira - Wikipedia](https://pt.wikipedia.org/wiki/Nise_da_Silveira)

## Technologies

- **React 18** - UI framework
- **Three.js** - 3D graphics library
- **React Three Fiber** - React renderer for Three.js
- **React Three Drei** - Helper components
- **Vite** - Build tool and dev server
- **GitHub Actions** - CI/CD pipeline

## License

MIT

## Credits

Created by [@c0utin](https://github.com/c0utin) as a tribute to Nise da Silveira's pioneering work in art therapy.
