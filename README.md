# Mathematical Art Portfolio - Tribute to Nise da Silveira

A beautiful, modern web portfolio showcasing algorithmically generated mathematical art, created as a tribute to Nise da Silveira, the pioneering Brazilian psychiatrist who revolutionized mental health treatment through art therapy.

## Features

- **Algorithmic Art Generation**: Real-time generation of mandalas, fractals, and spiral patterns using mathematical algorithms
- **Modern Design**: Clean, minimalist interface inspired by Google Arts & Culture
- **Interactive Canvas**: Generate and save unique mathematical artworks
- **Responsive Layout**: Beautiful on all devices
- **Smooth Animations**: Elegant transitions and auto-refreshing art displays

## Quick Start

### Option 1: Simple HTTP Server (Python)

If you have Python installed:

```bash
# Python 3
python3 -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

Then open your browser and navigate to: `http://localhost:8000/portfolio_beautiful.html`

### Option 2: Node.js HTTP Server

If you have Node.js installed:

```bash
# Install http-server globally (only need to do this once)
npm install -g http-server

# Run the server
http-server -p 8000
```

Then open your browser and navigate to: `http://localhost:8000/portfolio_beautiful.html`

### Option 3: Direct File Opening

Simply open the `portfolio_beautiful.html` file directly in your web browser:

```bash
# On macOS
open portfolio_beautiful.html

# On Linux
xdg-open portfolio_beautiful.html

# On Windows
start portfolio_beautiful.html
```

## Project Structure

```
nise/
├── portfolio_beautiful.html  # Main portfolio website
├── README.md                 # This file
└── [other project files]
```

## About the Art Generation

Each artwork is generated using:
- **Mathematical Algorithms**: Trigonometric functions for circular patterns
- **Controlled Randomness**: Unique but aesthetically balanced compositions
- **Real-time Rendering**: HTML5 Canvas API for instant generation
- **Multiple Pattern Types**:
  - Sacred Mandalas (circular geometric patterns)
  - Fractal Trees (recursive branching structures)
  - Mathematical Spirals (logarithmic and Archimedean spirals)

## About Nise da Silveira

Nise da Silveira (1905-1999) was a Brazilian psychiatrist who:
- Founded the Museum of Images of the Unconscious in 1952
- Pioneered the use of art therapy in mental health treatment
- Rejected aggressive treatments in favor of creative expression
- Demonstrated that art could be a window into the human psyche

Learn more: [Nise da Silveira - Wikipedia](https://pt.wikipedia.org/wiki/Nise_da_Silveira)

## Technologies Used

- **HTML5**: Structure and Canvas element
- **CSS3**: Modern styling with animations and gradients
- **JavaScript**: Algorithm implementation and interactivity
- **Canvas API**: Real-time graphics rendering

## Browser Compatibility

Works on all modern browsers:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Opera 76+

## License

This project is created as an educational and artistic tribute. Feel free to use and modify for your own creative projects.

## Credits

- Inspired by the life and work of Nise da Silveira
- Design influenced by Google Arts & Culture
- Mathematical patterns based on classical geometric algorithms