# Kokoro – Feature Map

A minimal, expressive avatar whose entire soul is eyes + mouth. Built like the face of a future OS: Blade‑Runner‑clean, Apple/Vercel‑precise.

## Core (shipped)

-   Minimal EVE-style face: two ellipses (eyes) + one bezier line (mouth)
-   Emotion engine (joy, sadness, surprise, anger, curiosity) that drives:
    -   Eye openness, tilt, vertical offset
    -   Mouth curvature (smile/frown) and subtle tilt
-   Perfect symmetry: all geometry centered; mouth never drifts
-   Dark/Light theme toggle (top-right), project label “kokoro” (top-left)
-   Idle life:
    -   Breathing (container micro-scale)
    -   Smart blinks (randomized)
    -   Micro-glances (tiny tilts, vertical shifts)
-   Cursor presence:
    -   Eyes track pointer (tilt + Y)
    -   Mouth/face micro-parallax
    -   Eye hover widens slightly, then returns to baseline
-   Control bar with emotion presets + VOICE toggle
-   Voice (simulated): mouth line becomes a smooth, centered audio-like viz (layered sines), seamless toggle back to idle/emotion

## Design System

-   Single-source symmetry: face center set explicitly; all transforms pivot around it
-   Smoothness everywhere: GSAP curves (sine/power2), short durations, no jank
-   Accessibility-first toggles; SSR-safe theme initialization

## Fun Ideas (next)

-   Cursor → Emotion mapping (prototype)
    -   Vertical pointer position modulates joy/sadness smoothly
    -   Horizontal offsets modulate curiosity/anger bias
    -   Gentle hysteresis for organic feel
-   TTS “breathing” mode (no audio needed)
    -   Timed blink cadence and micro-mouth pulses for “thinking”
    -   Idle phoneme illusion with deterministic waveform
-   Presets 2.0
    -   Save/share scenes as tiny JSON (palettes, emotion curves, idle seeds)
    -   One-click import to reproduce performances
-   Record/export
    -   In-browser WebM/MP4 capture of short emotion performances
    -   “Trailer” template: title card → emotion loop → outro mark
-   Micro-interactions polish
    -   Eye “glass” refraction line (1px highlight that tracks tilt)
    -   Inertia on gaze follow and mouth tilt (critically damped)
    -   Haptics (if supported) on preset change / VOICE toggle
    -   Tiny hover sound scaffolding (disabled by default)
-   Scenes
    -   “Dreaming” scene: slow aurora sweep behind the face (1‑2px lines)
    -   “Neon rain” scene: vertical parallax lines responding to emotions
-   Real voice (later)
    -   Optional mic input -> analyser -> bezier mouth driver
    -   Soft limiter + smoothing to keep curvature elegant, centered

## Technical Notes

-   Eyes: SVGEllipse with rx/ry/rotation/cy tweens; hover returns to emotion baseline
-   Mouth: single quadratic bezier in local space (M -w/2 0 Q 0 curve w/2 0), rotated from face center to guarantee symmetry
-   VOICE simulated: layered sines on the control Y (no mic; smooth, musical envelope)
-   Cleanup everywhere (tickers, tweens) to prevent leaks, retain snappy toggles

## Wishlist (stretch)

-   STT + intent → emotion choreography (“tell me about the sea” triggers curiosity/joy wave)
-   Keyframe editor: timeline scrub + keyframe easing per emotion channel
-   Palette modes (“Sakura”, “Indigo”, “Monolith”) with one‑click theme morph
-   Live embed: drop‑in web component with minimal API

—
kokoro (心): heart, mind, spirit. Minimal surface, maximal feeling.
