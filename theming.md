# Theming & Customization - Implementation Plan

A roadmap for transforming Kokoro from a single-face entity into a multi-persona platform. This involves a flexible theme engine, distinct face archetypes ("Variants"), and a dedicated customization studio.

## 1. Architecture Refactor 🏗️

-   [ ] **Theme Context**:
    -   Create a `ThemeContext` or extend `next-themes` to support custom data attributes beyond just `dark/light`.
    -   Attributes needed: `--color-eyes`, `--color-mouth`, `--color-bg-noise`, `--stroke-style`.
-   [ ] **Face Variant Prop**:
    -   Update `Avatar.tsx` to accept a `variant` prop: `'minimal' | 'tron' | 'kawaii' | 'analogue'`.
    -   Refactor internal rendering to switch between SVG geometries based on this prop.

## 2. Face Archetypes (Variants) 🎭

### **A. The "Tron" (Cyber)**

-   **Visuals**:
    -   Eyes: Squircular rectangles (rounded rects).
    -   Mouth: Polyline/Stepped path (digital signal look).
    -   Colors: Neon Cyan/Magenta on Void Black.
-   **Animation**:
    -   Motion: `steps(5)` ease for robotic movement.
    -   Idle: Scanline glitch effect instead of breathing.
    -   Blink: Vertical CRT power-off compression.

### **B. The "Kawaii" (Soft)**

-   **Visuals**:
    -   Eyes: Large perfect circles, wide set.
    -   Mouth: "W" shape or cat-like curve.
    -   Additions: SVG filter blushes (cheeks).
    -   Colors: Pastels (Pink/Mint).
-   **Animation**:
    -   Motion: High elasticity (`elastic.out(1, 0.3)`).
    -   Reaction: "Squish" distortion on click.

### **C. The "Analogue" (Sketch)**

-   **Visuals**:
    -   Style: Hand-drawn stroke (rough edges via `stroke-dasharray` or displacement map).
    -   Eyes: Sketchy outlines, not solid fills.
    -   Colors: Sepia/Charcoal (Paper & Ink).
-   **Animation**:
    -   Framerate: Throttled updates (12fps) for stop-motion feel.
    -   Drift: Eyes float slightly independently.

## 3. Customization Studio (UI) 🎛️

-   [ ] **Persona Selector**:
    -   A horizontal carousel in the `CustomizationModal` to swipe between active archetypes.
-   [ ] **Palette Picker**:
    -   Pre-defined color swatches per variant (e.g., "Neon Grid" for Tron, "Sakura" for Kawaii).
-   [ ] **Fine Tuning** (Future):
    -   Sliders for "Bounciness" (Physics spring tension).
    -   Toggle for "Eye Contact" intensity.

## 4. Implementation Phases 📅

1.  **Phase 1: Refactor** ✅: Extract geometry logic from `Avatar.tsx` into sub-components (`Eyes.tsx`, `Mouth.tsx`) to make swapping easier.
2.  **Phase 2: The Engine** ✅: Implement the `variant` prop and one new face (e.g., Tron) to test the abstraction.
3.  **Phase 3: The Studio** ✅: Build the UI controls in `CustomizationModal` to toggle these states live.
4.  **Phase 4: Polish**: Add unique sound/haptics per variant.
