# Kokoro – Feature Map

A minimal, expressive avatar whose entire soul is eyes + mouth. Built like the face of a future OS: Blade‑Runner‑clean, Apple/Vercel‑precise.

## Core Features ✅

-   [x] **Minimal EVE-style face**: two ellipses (eyes) + one bezier line (mouth)
-   [x] **Emotion engine** (joy, sadness, surprise, anger, curiosity) that drives:
    -   [x] Eye openness, tilt, vertical offset
    -   [x] Mouth curvature (smile/frown) and subtle tilt
-   [x] **Perfect symmetry**: all geometry centered; mouth never drifts
-   [x] **Dark/Light theme toggle** (top-right), project label "kokoro" (top-left)
-   [x] **Idle life animations**:
    -   [x] Breathing (container micro-scale)
    -   [x] Smart blinks (randomized)
    -   [x] Micro-glances (tiny tilts, vertical shifts)
    -   [x] Idle mouth wave (subtle curve animation)
-   [x] **Enhanced cursor/touch interactions**:
    -   [x] Eyes track pointer with dramatic tilt + Y movement
    -   [x] Mouth/face micro-parallax with head lean
    -   [x] Eye hover effects with bounce animations
    -   [x] Touch support for mobile devices
-   [x] **Playful click interactions**:
    -   [x] Face boop (click anywhere for squash-stretch + blink)
    -   [x] Eye winks (click individual eyes)
-   [x] **Mobile-first responsive**: touch events, proper scaling, keyboard handling

## Next Level Features 🚀

### **Emotion Intelligence**

-   [x] **Cursor → Emotion mapping**
-   [x] Vertical pointer position modulates joy/sadness smoothly
-   [x] Horizontal offsets modulate curiosity/anger bias
-   [x] Gentle hysteresis for organic feel
-   [x] **Emotion memory system**
-   [x] Face "remembers" recent emotions and blends them subtly
-   [x] Emotional momentum (slow transitions between extreme states)
-   [ ] Context-aware emotion suggestions

### **Advanced Interactions**

-   [x] **Gesture recognition**
    -   [ ] Multi-touch pinch to zoom face scale
    -   [x] Swipe gestures for emotion cycling
    -   [x] Long press for "deep" emotions (enhanced intensity)

## Chat & History Interface ✅

-   [x] **Draggable Glass Window**: Floating history window with glassmorphism aesthetic
-   [x] **Rich Message Types**: Support for text and expandable audio messages
-   [x] **Voice Visualization**: Real-time audio spectrum visualization for voice notes
-   [x] **Smart Transcriptions**: Expandable text transcriptions for audio messages
-   [x] **Status Integration**: Live "Listening/Paused" pill badge in header
-   [x] **Fluid Interactions**: Drag-to-move, scrollable history, minimize/maximize support
-   [x] **Physics-based reactions**
    -   [x] Inertia on gaze follow and mouth tilt (critically damped)
    -   [x] Elastic collision detection for cursor "bouncing" off face
    -   [x] Gravity effects when cursor moves away quickly
-   [x] **Haptic feedback**
    -   [x] Subtle vibrations on mobile for boop, wink, surprise
    -   [x] Haptic patterns that match emotion intensity

### **Smart Features**

-   [ ] **Presets 2.0**
    -   [ ] Save/share emotion scenes as tiny JSON
    -   [ ] QR code sharing for instant emotion transfer
    -   [ ] Community preset gallery with voting
-   [ ] **Performance capture**
    -   [ ] In-browser WebM/MP4 recording of emotion performances
    -   [ ] "Trailer" templates: title → emotion loop → outro
    -   [ ] GIF export for social sharing

### **Audio Integration**

-   [ ] **Sound design**
    -   [ ] Subtle hover sounds (disabled by default)
    -   [ ] Emotion-based ambient tones
    -   [ ] Satisfying click/boop sound effects
-   [ ] **Real voice input**
    -   [ ] Optional mic input → frequency analysis → mouth driver
    -   [ ] Soft limiter + smoothing for elegant curvature
    -   [ ] Voice emotion detection → automatic emotion mapping

### **Developer Experience**

-   [ ] **Component API**
    -   [ ] Headless emotion engine for custom UIs
    -   [ ] React hooks for emotion state management
    -   [ ] TypeScript emotion type system
-   [ ] **Customization**
    -   [ ] Theme system beyond dark/light (neon, pastel, monochrome)
    -   [ ] Custom face geometry (different eye shapes, mouth styles)
    -   [ ] Animation speed controls and easing customization

### **AI Integration** 🤖

-   [ ] **Emotion AI**
    -   [ ] STT + intent → emotion choreography ("tell me about the sea" triggers curiosity/joy)
    -   [ ] Sentiment analysis of chat messages → automatic emotion responses
    -   [ ] Personality modes (shy, energetic, contemplative) that affect base emotions
-   [ ] **Smart conversations**
    -   [ ] Context-aware emotion suggestions based on conversation topic
    -   [ ] Emotion memory that influences future reactions
    -   [ ] Learning system that adapts to user interaction patterns

### **Creative Tools** 🎨

-   [ ] **Keyframe editor**
    -   [ ] Timeline scrub with emotion channel keyframes
    -   [ ] Custom easing curves per emotion transition
    -   [ ] Emotion choreography composer with playback
-   [ ] **Theme studio**
    -   [ ] Palette modes ("Sakura", "Indigo", "Monolith", "Cyberpunk")
    -   [ ] One-click theme morphing with smooth transitions
    -   [ ] Custom color picker with emotion-based color theory
-   [ ] **Performance mode**
    -   [ ] Live streaming overlay integration
    -   [ ] Twitch/YouTube chat emotion triggers
    -   [ ] Audience interaction via emoji reactions

### **Platform Integration** 🌐

-   [ ] **Web component**
    -   [ ] Drop-in `<kokoro-avatar>` with minimal API
    -   [ ] Framework-agnostic (React, Vue, Svelte, vanilla)
    -   [ ] CDN distribution for easy embedding
-   [ ] **API ecosystem**
    -   [ ] REST API for emotion state management
    -   [ ] WebSocket real-time emotion streaming
    -   [ ] Webhook integration for external triggers

## Technical Architecture ⚙️

### **Current Implementation**

-   [x] **SVG-based rendering**: Ellipses (eyes) + quadratic bezier (mouth)
-   [x] **GSAP animation engine**: Premium easing (back.out, elastic.out)
-   [x] **Perfect symmetry**: All transforms pivot from face center (260, 175)
-   [x] **Voice simulation**: Layered sine waves for smooth audio visualization
-   [x] **Memory management**: Proper cleanup of tickers/tweens to prevent leaks
-   [x] **Touch/mouse events**: Unified pointer handling for cross-platform support

### **Performance Targets**

-   [x] **Performance targets** (Partial)
    -   [x] **60fps animations**: Maintained smooth performance on mobile (removed expensive blurs)
    -   [ ] **Bundle size**: Keep core under 50kb gzipped
-   [ ] **Memory efficiency**: Zero memory leaks during extended sessions
-   [ ] **Battery optimization**: Reduce animation complexity when device is low power

### **Accessibility Standards**

-   [x] **Screen reader support**: Proper ARIA labels and descriptions
-   [x] **Keyboard navigation**: All interactions accessible via keyboard
-   [ ] **Reduced motion**: Respect `prefers-reduced-motion` system setting
-   [ ] **High contrast**: Support for high contrast display modes
-   [ ] **Voice control**: Integration with browser voice commands

—
**kokoro (心)**: heart, mind, spirit. Minimal surface, maximal feeling.

_"The future of human-computer interaction isn't about more features—it's about deeper emotional connection through elegant simplicity."_
