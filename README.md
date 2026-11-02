# FrameTrace

An interactive and web-based environment for visualizing and assessing 3D transformations in computer graphics education.

Final Year Project for Module PU3190, University of Plymouth.

### Run locally

Requires Node.js (LTS).

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # unit tests
```

## Project structure

- `src/core`: pure math (unit-tested)
- `src/scene`: Three.js rendering classes
- `src/ui`: React components
- `docs/CONVENTIONS.md`: mathematical conventions