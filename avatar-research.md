# Avatar Preset Research – Shader-Based Concepts

## Current Presets (SVG-based)
- **Pure/Minimal** – Clean lines, monochrome
- **Digital/Tron** – System aesthetics (basic)
- **Sketch/Analogue** – Hand-drawn feel

---

## Phase 2: Shader-Based Presets (Three.js + React Three Fiber)

### 1. **NEON GRID** ⚡
> *"The Matrix meets VisionOS"*

- **Visual**: Glowing wire-frame face, grid scanlines, edge bloom
- **Colors**: Customizable neon: Electric Green, Cyan, Magenta, Red, Orange
- **Shader Effects**:
  - Fresnel edge glow (brighter at face silhouette)
  - Animated pulse/flicker on emotion change
  - CRT scan-lines overlay
- **Emotion Mapping**: Glow intensity = emotion intensity; color temperature = joy/anger bias

---

### 2. **HOLOGRAM** 👻
> *"Blade Runner 2049 companion"*

- **Visual**: Translucent projection with scan-line artifacts
- **Colors**: Icy Blue, Spectral Teal, Ghost White
- **Shader Effects**:
  - Chromatic aberration (RGB split)
  - Horizontal jitter/noise bands
  - Additive blending (no solid forms)
  - Flicker when "thinking" (CPU/emotion processing)
- **Emotion Mapping**: Stability = calmness; glitch intensity = surprise/anger

---

### 3. **PLASMA** 🔥
> *"Living lava lamp energy"*

- **Visual**: Organic flowing colors, soft blobby shapes
- **Colors**: Sunset gradients, Aurora palettes, customizable
- **Shader Effects**:
  - Fractal noise displacement
  - Real-time color blending based on emotion mix
  - Smooth, slow morphing (Perlin noise)
- **Emotion Mapping**: Color = dominant emotion; movement speed = energy level

---

### 4. **SYNTHWAVE** 🌆
> *"1984 called, it wants its avatar back"*

- **Visual**: Chrome reflections, sunset gradient backdrop, grid floor
- **Colors**: Hot Pink, Electric Blue, Orange, Purple sunset
- **Shader Effects**:
  - Environment reflection (fake chrome)
  - Sun/gradient behind face
  - VHS noise grain
  - Glow bloom on eyes/mouth
- **Emotion Mapping**: Sunset position = mood (high sun = joy, low sun = sadness)

---

### 5. **GLITCH** 📺
> *"Corrupted data, beautiful chaos"*

- **Visual**: Digital artifacts, datamosh aesthetics
- **Colors**: Dark base with RGB split highlights
- **Shader Effects**:
  - RGB channel offset (chromatic aberration)
  - Block displacement (random rectangles shift)
  - Scan-line tearing
  - Static noise bursts on emotion peaks
- **Emotion Mapping**: Glitch severity = emotional intensity; chaos = anger/surprise

---

### 6. **CRYSTAL** 💎
> *"Faceted, refractive, premium"*

- **Visual**: Low-poly gem, prismatic reflections
- **Colors**: Rainbow refractions, customizable base tint
- **Shader Effects**:
  - Refraction distortion (see-through warping)
  - Specular highlights on facets
  - Rainbow dispersion on edges
  - Slow rotation/tilt based on gaze
- **Emotion Mapping**: Facet sharpness = alertness; color dispersion = curiosity

---

### 7. **INK BLEED** 🎨
> *"Sumi-e meets digital"*

- **Visual**: Watercolor/ink edges, organic spread
- **Colors**: Sumi Black, Indigo, customizable accent bleeds
- **Shader Effects**:
  - Edge dissolution (ink spreading outward)
  - Paper texture overlay
  - Wet-on-wet color mixing on emotion change
- **Emotion Mapping**: Ink density = emotion weight; bleed speed = emotional flux

---

### 8. **AURORA** 🌌
> *"Northern lights across your face"*

- **Visual**: Flowing, dancing light ribbons
- **Colors**: Green/Teal/Purple aurora palette
- **Shader Effects**:
  - Vertical wave displacement
  - Color gradient animation
  - Soft particle trails
- **Emotion Mapping**: Wave speed = energy; color shift = emotional state

---

## Implementation Notes

### Tech Stack
- **Three.js** via `@react-three/fiber` (R3F)
- **Shaders**: GLSL fragment/vertex shaders, or `drei` helpers
- **Performance**: Use `<Canvas frameloop="demand">` for battery efficiency

### Color Customization
- User picks a "base hue" (0-360)
- Shader calculates complementary/analogous colors automatically
- Store as `{ hue: number, saturation: number, lightness: number }`

### Emotion → Shader Uniforms
```glsl
uniform float u_joy;
uniform float u_sadness;
uniform float u_anger;
uniform float u_curiosity;
uniform float u_surprise;
uniform float u_time;
```

### Priority Order
1. **Neon Grid** (most requested, achievable with current SVG + post-processing)
2. **Hologram** (high visual impact, moderate complexity)
3. **Glitch** (can layer on top of any base)
4. **Plasma/Aurora** (requires full 3D mesh)
5. **Crystal** (advanced, needs proper geometry)

---

*"The avatar is not just a face—it's a mood ring for the soul."*
