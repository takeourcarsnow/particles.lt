# Particle Tilt Playground

A highly interactive, customizable particle simulation playground for the web. Simulate thousands of particles with real-time physics, turbulence, collisions, and device tilt controls. Designed for both desktop and mobile, with a modern UI and extensive configuration options.

## Features

- **Real-time Particle Physics:**
  - Gravity, air drag, wind, and multiple turbulence modes (flow, curl, vortex, wind, jets, swirl grid, wells)
  - Elastic, soft, inelastic, or no collisions
  - Multiple boundary types: screen bounce, wrap, circle/square containers
- **Device Tilt & Mouse Gravity:**
  - On mobile, enable tilt to control gravity direction
  - On desktop, click to set gravity direction
- **Customizable Visuals:**
  - Particle shape (circle, square, triangle), color (solid, velocity, heat), blend modes, opacity
  - Adjustable trails, wireframe, and container outlines
- **Interactive UI:**
  - Control panel for all simulation parameters
  - Presets and randomization
  - HUD with live stats (FPS, gravity, particle count, etc.)
  - Pause, step, reset, and fullscreen controls
- **Performance:**
  - Adaptive mode for high particle counts
  - Efficient grid-based collision detection

## Demo

Open [index.html](index.html) in your browser, or deploy to Vercel/Netlify for instant access.

![screenshot](https://user-images.githubusercontent.com/your-screenshot.png)

## Usage

1. **Clone or Download:**
   ```sh
   git clone https://github.com/takeourcarsnow/particles.lt.git
   cd particles.lt
   ```
2. **Open `index.html` in your browser.**
   - No build step required. All code is in the `js/` folder.

## Controls

- **Desktop:**
  - Click anywhere to set gravity direction
  - Space: Pause/Resume
  - C: Toggle control panel
  - G: Toggle mouse gravity
  - R: Reset particles
  - F: Toggle HUD
- **Mobile:**
  - Tap "Enable Tilt" and grant motion permission
  - Roll your phone to move marbles

## File Structure

- `index.html` — Main HTML file
- `styles.css` — Modern, responsive styles
- `js/` — Modular JavaScript source:
  - `main.js` — App entry point, animation loop
  - `config.js` — All simulation settings and presets
  - `particles.js` — Particle creation and management
  - `renderer.js` — Drawing particles and containers
  - `forces.js` — Turbulence and force fields
  - `grid.js` — Grid-based collision detection
  - `hud.js` — Heads-up display logic
  - `input.js` — Mouse, touch, tilt, and keyboard input
  - `state.js` — Global state
  - `ui.js` — Control panel and UI logic
  - `utils.js` — Math, color, and noise helpers
- `vercel.json` — (Optional) Vercel deployment config

## Customization

- Tweak any setting in the control panel or edit `js/config.js` for defaults and presets.
- Add new turbulence modes, shapes, or UI features by extending the modular JS files.

## License

MIT. See [LICENSE](LICENSE) for details.

---

**Created by [takeourcarsnow](https://github.com/takeourcarsnow)**
