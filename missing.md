# DOT — Missing / Incomplete Features

## ~~1. Voice Pipeline Not Wired~~ ✅ Fixed
- `useVoiceConversation` hook implements full loop: SpeechRecognition → `/api/chat` → ElevenLabs TTS → avatar audio analysis
- `FloatingDock` now accepts real `voiceState`, `onToggleMic`, `onInterrupt` props
- TTS audio drives avatar during speaking; mic levels resume on idle
- Browser `SpeechSynthesis` fallback when no ElevenLabs key is set
- `/api/tts` route now accepts BYOK `apiKey` from request body, falls back to env var

## ~~2. Memory Never Influences AI Responses~~ ✅ Fixed
- `loadMemories` and `isMemoryEnabled` exported from `memory-drawer.tsx`
- `ChatModule` writes user messages (>20 chars) as memories with auto-tags when learning is enabled
- `ChatModule` reads the 8 most recent memories and passes them as `memoryContext` to `/api/chat`
- `/api/chat/route.ts` injects memory context into the system prompt — DOT now personalises responses

## ~~3. TTS Route is Not BYOK~~ ✅ Fixed
- `/api/tts/route.ts` accepts `apiKey` from request body, falls back to env var (done in #1)
- `useVoiceSynthesis` now reads ElevenLabs key from key-store and forwards it on every TTS call
- Key vault panel rows now show a purpose label (`CHAT · VOICE` / `TTS_ENGINE`) so users know what each key powers

## ~~4. Keys Stored in Plaintext~~ ✅ Fixed
- `lib/key-store.ts` uses raw `localStorage.setItem` with no encryption
- Plan specifies Web Crypto (`crypto.subtle`) with a user passphrase
- Session-only mode toggle exists in the data model but is not exposed in the Key Vault UI

## ~~5. WebM Export Stub~~ ✅ Fixed
- `handleExportWebM` uses `canvas.captureStream(12)` + `MediaRecorder` — records 3s at 12fps
- WEBM button enabled and wired in `ShareDock`

## ~~6. Deep Thinker Persona Locked~~ ✅ Fixed
- Removed `unavailable: true` and `ERR_LOCKED` guard from `CustomizationModal`
- System prompt tone was already defined in `/api/chat/route.ts`

## ~~7. Panel Positions Not Persisted~~ ✅ Fixed
- `hooks/usePanelPosition.ts` — `useMotionValue` x/y initialised from `localStorage`, saved on `onDragEnd`
- Applied to all 7 draggable panels: chat, memory, ritual, audio-lab, customization, share-dock, voice-settings

## ~~8. Memory Not Injected Into Chat From Voice or Ritual~~ ✅ Fixed
- `useVoiceConversation`: writes user's spoken transcript as `source: "voice"` memory after AI responds
- `RitualDrawer.handleCheckIn`: writes mood + note as `source: "ritual"` memory on check-in

## ~~9. Provider Selection Has No Model Picker UI~~ ✅ Fixed
- `PROVIDER_MODELS` map added to `key-vault-panel.tsx` with OpenAI and Google variants
- Button-group picker in edit view sets `modelValue`, saved via `setKey(..., { model })`

## ~~10. No Onboarding Flow~~ ✅ Fixed
- Pulsing orange dot on settings button when no keys are configured (clears on first open)
- Chat module no-key state now has `OPEN_SETTINGS` action button that closes chat and opens settings
