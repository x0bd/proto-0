# Deep AI Integration Architecture

## Executive Summary

This document outlines the architecture for Dot's AI system: a user-configurable LLM for conversation, ElevenLabs-powered voice synthesis, and an **Emotion Motion Engine** that uses the LLM to choreograph avatar expressions in real-time.

---

## Current State Analysis

### What Exists

| Component | Status | Location |
|---|---|---|
| **LLM Chat** | ✅ Working | `page.tsx:285-352` — Raw `fetch` to OpenAI-compatible endpoint |
| **User Config** | ✅ Working | `CustomizationModal.tsx` — `AIConfig { baseUrl, apiKey, model }` |
| **Emotion System** | ✅ Working | `page.tsx:179-196` — `baseEmotionRef`, `targetEmotionRef`, lerp interpolation |
| **Avatar Animation** | ✅ Working | `Avatar.tsx` — GSAP-driven eyes, mouth, breathing |
| **Audio Analysis** | ✅ Working | `useAudioAnalysis.ts` — Multi-band frequency extraction from mic/file |
| **Voice Playback** | ❌ Missing | Console shows "voice note" UI but no actual audio |
| **Streaming** | ❌ Missing | Response is fetched in one block, not streamed |
| **Vercel AI SDK** | ❌ Not Installed | Currently using raw `fetch` |

### Current LLM Flow

```
User types → fetch() to aiConfig.baseUrl → Response JSON → Append to history
                                                      ↓
                                            Regex extract { joy, sadness, ... }
                                                      ↓
                                            Update baseEmotionRef → Avatar animates
```

---

## Proposed Architecture

### Three-Layer Model

```
┌────────────────────────────────────────────────────────────────────────────┐
│                           DOT AI SYSTEM                                   │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐        │
│  │  LAYER 1:       │    │  LAYER 2:       │    │  LAYER 3:       │        │
│  │  Conversation   │ →  │  Voice          │ →  │  Motion         │        │
│  │  (User LLM)     │    │  (ElevenLabs)   │    │  (Emotion AI)   │        │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘        │
│         ↓                      ↓                      ↓                   │
│  • User-provided API    • We provide API key  • LLM analyzes text         │
│  • Gemini/OpenAI/etc    • Low-latency TTS     • Outputs emotion JSON      │
│  • Streaming response   • Audio stream        • Drives avatar state       │
│                         • Volume → mouth      • Anticipatory animation    │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## Layer 1: Conversation Layer

### User-Provided LLM

Users bring their own API keys for the conversational LLM. This keeps costs on the user and allows flexibility (GPT-4, Claude, Gemini, local models, etc.).

**Current Implementation:**
- `AIConfig { baseUrl, apiKey, model }` stored in localStorage
- Raw `fetch` to OpenAI-compatible chat completions endpoint

**Improvement: Add Vercel AI SDK**

Install `ai` package for structured streaming:

```typescript
import { streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

// Create provider from user config
const provider = createOpenAI({
  baseURL: aiConfig.baseUrl,
  apiKey: aiConfig.apiKey,
});

const result = await streamText({
  model: provider(aiConfig.model),
  messages,
  onChunk: ({ chunk }) => {
    // Real-time text display
    // Trigger emotion parsing
  },
});
```

**Benefits:**
- Streaming text (word-by-word display)
- Unified API across providers
- Structured tool/function calling for emotion

---

## Layer 2: Voice Layer

### ElevenLabs TTS (We Provide)

Users don't need their own TTS API key—we bundle ElevenLabs for consistent voice quality.

**Implementation:**

```typescript
// hooks/useVoiceSynthesis.ts
export function useVoiceSynthesis() {
  const synthesize = async (text: string) => {
    const response = await fetch('/api/tts', {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
    
    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    
    // Play and analyze for avatar sync
    const audio = new Audio(audioUrl);
    audio.play();
    
    // Connect to Web Audio API for voiceLevel
    const ctx = new AudioContext();
    const source = ctx.createMediaElementSource(audio);
    const analyser = ctx.createAnalyser();
    source.connect(analyser);
    analyser.connect(ctx.destination);
    
    return { audio, analyser };
  };
  
  return { synthesize };
}
```

**Server Route (`/api/tts`):**

```typescript
// app/api/tts/route.ts
export async function POST(req: Request) {
  const { text } = await req.json();
  
  const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/{voice_id}/stream', {
    method: 'POST',
    headers: {
      'xi-api-key': process.env.ELEVENLABS_API_KEY!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: { stability: 0.5, similarity_boost: 0.75 },
    }),
  });
  
  return new Response(response.body, {
    headers: { 'Content-Type': 'audio/mpeg' },
  });
}
```

---

## Layer 3: Motion Engine (Emotion AI)

This is the "magic" layer—the LLM doesn't just respond, it choreographs Dot's emotional expression.

### Two Approaches

#### A) Inline Emotion (Current)

The system prompt instructs the LLM to append emotion JSON:

```
You are Dot. At the end of your message, output a JSON object:
{ "joy": 0.8, "sadness": 0, "surprise": 0.2, "anger": 0, "curiosity": 0.3 }
```

**Pros:** Simple, works with any LLM.
**Cons:** Unreliable parsing, pollutes response text.

#### B) Structured Tool Calling (Recommended)

Use function calling to separate emotion from response:

```typescript
const result = await streamText({
  model: provider(aiConfig.model),
  messages,
  tools: {
    setEmotion: {
      description: 'Set Dot\'s emotional state',
      parameters: z.object({
        joy: z.number().min(0).max(1),
        sadness: z.number().min(0).max(1),
        surprise: z.number().min(0).max(1),
        anger: z.number().min(0).max(1),
        curiosity: z.number().min(0).max(1),
      }),
      execute: async (emotion) => {
        setBaseEmotion(emotion);
        return 'Emotion set';
      },
    },
  },
});
```

### Motion Engine Pipeline

```
LLM Response Stream
       ↓
┌──────────────────────────┐
│ Emotion Extractor        │ ← Tool call OR JSON regex
│ { joy, sadness, ... }    │
└──────────────────────────┘
       ↓
┌──────────────────────────┐
│ Sentiment Heuristics     │ ← Client-side fallback
│ (positive/negative/etc)  │   Uses keyword matching
└──────────────────────────┘
       ↓
┌──────────────────────────┐
│ Motion Scheduler         │
│ - Anticipatory animation │ ← 200ms before speech
│ - Expression curves      │ ← Ease-in/out emotions
│ - Micro-expressions      │ ← Random blinks, glances
└──────────────────────────┘
       ↓
┌──────────────────────────┐
│ Avatar State             │
│ baseEmotionRef           │ → GSAP animations
│ targetEmotionRef         │
└──────────────────────────┘
```

---

## Files to Create/Modify

| File | Action | Purpose |
|---|---|---|
| `hooks/useVoiceSynthesis.ts` | NEW | ElevenLabs TTS integration |
| `app/api/tts/route.ts` | NEW | Server-side TTS proxy |
| `hooks/useEmotionEngine.ts` | NEW | Centralized emotion extraction & scheduling |
| `app/page.tsx` | MODIFY | Use streaming, wire up voice |
| `package.json` | MODIFY | Add `ai`, `@ai-sdk/openai` |

---

## Environment Variables

```env
# .env.local
ELEVENLABS_API_KEY=sk_...  # We provide (bundled cost)
```

---

## Phased Rollout

### Phase 1: Voice Synthesis (MVP)
- [ ] Create `/api/tts` route
- [ ] Create `useVoiceSynthesis` hook
- [ ] Connect audio output to `audioLevels` → Avatar

### Phase 2: Streaming Responses
- [ ] Install Vercel AI SDK
- [ ] Refactor `onSendMessage` to use `streamText`
- [ ] Display text as it streams

### Phase 3: Emotion Tool Calling
- [ ] Add `setEmotion` tool to LLM call
- [ ] Create `useEmotionEngine` for scheduling
- [ ] Add anticipatory animation

### Phase 4: STT (Optional)
- [ ] Add mic input with Web Speech API or Deepgram
- [ ] Full voice-to-voice conversation

---

## Open Questions

1. **Voice Character**: What personality should Dot's voice have?
2. **ElevenLabs Voice**: Should we create a custom voice or use a preset?
3. **Rate Limiting**: How do we prevent TTS abuse?
4. **Offline Mode**: Should there be a fallback for no internet?

---

## Next Steps

Once this plan is approved:
1. Install Vercel AI SDK
2. Create `/api/tts` route
3. Build `useVoiceSynthesis` hook
4. Wire everything together
