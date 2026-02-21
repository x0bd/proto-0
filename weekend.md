# DOT Weekend Build Plan 🚀

Following the success of the LinkedIn post, our goal this weekend is to push DOT from a "cool experiment" to a highly shareable, responsive, and visually stunning entity. 

We will focus on four key areas: making it instantly shareable, adding lifelike eye physics, introducing subtle sound design, and expanding the visual language with two new premium, colorful face variants.

## 1. The "Viral" Loop (Shareable States)
*   **Target:** Capitalize on the attention by letting users instantly share their DOT creations.
*   **Implementation:** 
    *   Encode the current state (`emotion` sliders, `variant`, active interactions) into a query string (`?emotion=joy:0.8,curious:0.4&variant=chroma`).
    *   Add a "Share" button to the UI that copies this URL or generates a clean QR code.
    *   When someone visits the link, their DOT instantly boots into that exact state with a smooth intro animation.

## 2. Physics 2.0: Saccadic Eye Movement
*   **Target:** Make the eyes feel significantly more lifelike and less "robotic."
*   **Implementation:** 
    *   Human eyes do not pan smoothly; they dart rapidly (saccades) and then fixate.
    *   Update the pointer-tracking logic in `Avatar.tsx` / `useAvatarSimulation`. Instead of continuous `lerp` tracking, implement a system where the pupil rapidly darts to the target position, pauses to "focus," and darts again, punctuated by micro-movements even when the cursor is still.

## 3. Premium Sound Design
*   **Target:** Elevate the visceral "Apple/Vercel" premium feel through audio.
*   **Implementation:** 
    *   Add abstract, minimal audio cues (soft, organic, synth-based tones).
    *   Subtle low-frequency hum on hover.
    *   Soft, satisfying "boop" bell/chime on face clicks.
    *   Gentle, shifting ambient chords that perfectly match the active emotion (e.g., slightly dissonant for anger, warm and resonant for joy).
    *   *(Note: Implemented with an opt-in toggle for accessibility).*

## 4. New Flavor: The "Colorful Fluid" Variants
While our current variants (Minimal, Echo, Myst, Flux) rule the monochrome aesthetic, we need variants that pop off the screen with modern, dynamic web appeal. We will build two new variants that utilize rich colors and animated glassmorphism/fluid blurs.

### New Preset A: `Aura`
*   **Vibe:** Ethereal, empathetic, dream-like. Apple Vision Pro glass aesthetic.
*   **Visuals:**
    *   **Background:** An animated, slow-moving fluid mesh gradient (soft pinks, purples, and warm oranges).
    *   **Face Element:** Thick, frosted-glass components with heavy backdrop-blur. The eyes and mouth are luminous, reactive cutouts in the glass.
    *   **Emotion Cue:** The fluid colors subtly shift based on emotion (e.g., shifts to cool blues for sadness, vibrant yellows for joy).

### New Preset B: `Chroma` 
*   **Vibe:** High-energy, digital, cyberpunk-lite, highly saturated.
*   **Visuals:**
    *   **Background:** Aggressive, fast-moving saturated neon blobs (cyan, magenta, lime) against a deep black void.
    *   **Face Element:** Sharp, high-contrast, glowing neon vector lines for the eyes and mouth.
    *   **Emotion Cue:** The speed and intensity of the background blur/blobs ramp up with high-energy emotions (anger/surprise) and slow down to a crawl for low-energy (sadness).
