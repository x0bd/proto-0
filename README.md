# DOT

An SVG-based AI companion that maps emotion to geometry in real time.

DOT responds to your voice, cursor, and gestures — translating them into subtle, expressive changes in a minimal animated face. It's a research project exploring what machine emotion could look like when the interface *is* the face.

**Live:** https://dot-0.vercel.app/

---

## What it does

- **Emotion engine** — five core states (joy, sadness, surprise, anger, curiosity) with smooth interpolation between them
- **Voice reactive** — microphone input drives facial expressions via multi-band audio analysis (bass, mid, presence)
- **Cursor & gesture tracking** — the face follows your pointer; swipe to cycle emotion presets
- **Named companion** — give your companion a name; the UI responds to it
- **Accent color theming** — full HSV spectrum picker, one color paints the entire face
- **Export** — save the current expression as PNG or record an animated GIF

## Face variants

| Variant | Style |
|---------|-------|
| `minimal` | Filled ellipse eyes, clean curves |
| `tron` | Rectangular digital eyes, sharp geometry |
| `analogue` | Sketchy stroke-based, organic line boil |

## Stack

- **Next.js 15** (App Router)
- **React 18** + TypeScript
- **GSAP 3** — SVG face animation
- **Motion/React** — UI transitions
- **Tailwind CSS v4**
- **Web Speech API** — voice synthesis
- **Web Audio API** — real-time frequency analysis

## Getting started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

```
app/
  components/
    Avatar.tsx          # Main face component + animation engine
    face/               # Eye, mouth, ear subcomponents per variant
    ChatWindow.tsx      # Conversation interface
    CustomizationModal.tsx  # Settings: name, color, face variant
    DownloadButton.tsx  # PNG / GIF export
  api/
    chat/route.ts       # AI chat endpoint
    tts/route.ts        # Text-to-speech endpoint
components/
  floating-dock.tsx     # Bottom navigation
  audio-panel.tsx       # Voice controls
```

---

Still a prototype. Feedback welcome.
