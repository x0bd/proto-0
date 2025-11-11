# Dreaming Avatar – Vaporous Smiley

**Type:** Interactive Avatar  
**Platform:** Browser (Next.js 16)  
**Input:** Text (required), Voice (optional)  
**Render:** SVG + GSAP

---

## Overview

The Dreaming Avatar is a **minimalist, browser-based expressive agent**.  
It uses **two eyes and five spectral bars** as a mouth to represent emotion.  
The avatar reacts in real-time to user input, producing a **dreamlike, vaporous presence**.

-   **Eyes:** Glow, tilt, and size reflect emotion.
-   **Mouth (spectral bars):** Height, skew, pulse, and curvature map emotion visually.
-   **Vapor/ambient effects:** Optional SVG particles drift subtly around the avatar.

---

## Emotion Mapping

| Emotion   | Eyes              | Spectral Bars                 |
| --------- | ----------------- | ----------------------------- |
| Joy       | Open, bright      | Bars curve upward, pulse fast |
| Sadness   | Half-lowered, dim | Bars droop, slow pulse        |
| Surprise  | Wide, bright      | Bars spike irregularly        |
| Anger     | Narrowed, red-ish | Bars tense, flicker           |
| Curiosity | Tilted slightly   | Bars wave gently              |

---

## Interaction Flow

1. User inputs text (or optionally voice).
2. AI (OpenAI API or local model) returns **JSON emotion vector**:

```json
{
	"joy": 0.7,
	"sadness": 0.1,
	"surprise": 0.2,
	"anger": 0.0,
	"curiosity": 0.5
}
```
