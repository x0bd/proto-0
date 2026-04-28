# DOT Functionality TODO Plan

## F0 Contracts and Types
- [x] Define provider type and provider mapping via `Provider` / `DEFAULT_MODELS` in `lib/key-store.ts`.
- [x] Define stored key and key metadata interfaces via `StoredKey` / `StoredEntry` in `lib/key-store.ts`.
- [ ] Centralize `MemoryItem` and `MemoryPolicy` interfaces outside the UI drawer.
- [x] Define voice session status model through the shared `VoiceState` UI contract.
- [x] Define local check-in and streak data structures in `app/components/ritual-drawer.tsx`.
- [ ] Define `PersonaConfig` interface.
- [x] Define export format/status/template types in `app/components/share-dock.tsx`.
- [ ] Define shared API request/response contracts for all new routes.

## F1 BYOK Key Vault Logic
- [x] Implement BYOK key store in `lib/key-store.ts` (planned `lib/security/key-vault.ts` path not created).
- [x] Implement passphrase-based key derivation using Web Crypto PBKDF2.
- [x] Implement API key encryption/decryption using AES-GCM.
- [x] Implement persistent encrypted blob format.
- [x] Implement session-only key mode with no persistence beyond the current tab.
- [ ] Add a timeout to the in-memory decrypted key cache.
- [x] Implement lock/unlock and clear-cache behavior.
- [x] Implement no-server-persistence policy for user keys; keys are forwarded only to proxy routes for provider calls.

## F2 AI Route and Orchestration (AI SDK)
- [x] Create current `POST /api/chat` route (planned `/api/ai/respond` route not created).
- [x] Add provider routing logic from the request body provider field.
- [x] Validate supported providers before AI SDK execution.
- [x] Validate supported provider model IDs before AI SDK execution.
- [x] Read user-provided API key from the `x-dot-api-key` request header.
- [x] Implement OpenAI provider execution with AI SDK.
- [x] Implement Google provider execution with AI SDK.
- [x] Implement streaming responses to client.
- [x] Inject persona context into request prompt stack.
- [x] Inject recent memory context into request prompt stack.
- [x] Add normalized error mapping for missing/invalid keys, quota, provider, and model failures.

## F3 ElevenLabs Voice Runtime
- [x] Create current `POST /api/tts` route (planned `/api/tts/speak` route not created).
- [ ] Read ElevenLabs key from request headers only; route still accepts legacy body/env fallbacks.
- [x] Stream audio response payload from the API route to client.
- [x] Upgrade voice client hook for interrupt/cancel support.
- [x] Implement barge-in behavior to stop active playback.
- [x] Expose analyzer node for avatar audio reactivity.
- [x] Add fallback to browser SpeechSynthesis when key is missing or TTS fails.
- [ ] Add unified error states for voice failures.

## F4 Memory Engine
- [x] Implement local persistence adapter with localStorage for memory (IndexedDB not implemented).
- [x] Implement memory write pipeline from chat interactions.
- [x] Implement memory write pipeline from voice interactions.
- [x] Implement explicit save path from ritual check-ins.
- [x] Implement memory search and filtering logic.
- [x] Implement local memory retrieval scoring for relevance.
- [x] Implement policy enforcement for read/write toggles.
- [x] Implement local retention handling and purge behavior.
- [x] Implement clear-all purge operation.
- [x] Implement category purge operations.

## F5 Check-ins and Streak Engine
- [x] Implement check-in storage model and localStorage adapter.
- [x] Implement one-check-in-per-day guard.
- [x] Implement local timezone-aware day boundary utility.
- [x] Implement current streak calculation.
- [x] Implement longest streak calculation.
- [x] Implement weekly mood aggregation metrics.
- [ ] Provide check-in summary context for AI responses.

## F6 Persona Runtime
- [x] Create persona registry config (Coach, Playful, Deep Thinker, Focus Buddy).
- [x] Implement active persona persistence.
- [x] Implement runtime persona switch logic.
- [x] Apply persona prompt profile to AI requests.
- [x] Apply selected voice profile defaults to TTS voice ID and voice settings.
- [ ] Apply persona-driven avatar behavior tuning hooks.

## F7 Share and Export Runtime
- [x] Harden PNG export pipeline.
- [x] Harden GIF/WebM export pipeline.
- [x] Add export cancellation and basic failure recovery.
- [x] Add deterministic output sizing and template overlays.
- [x] Integrate Web Share API path where available.
- [x] Add download fallback for unsupported share environments.
- [x] Add progress and completion events for UI feedback.

## F8 Integrations (Optional Post-Core)
- [ ] Define integration connector interface contract.
- [ ] Implement connector key validation entry point.
- [ ] Implement weather connector (BYOK).
- [ ] Implement calendar connector read-only MVP (BYOK).
- [ ] Implement Spotify playback MVP (BYOK).
- [ ] Enforce per-connector enable/disable and permission checks.

## F9 Reliability and Testing
- [ ] Add unit tests for key vault crypto helpers.
- [ ] Add unit tests for streak calculation utilities.
- [ ] Add unit tests for memory retrieval ranking logic.
- [ ] Add integration tests for `/api/ai/respond` provider switching.
- [ ] Add integration tests for `/api/tts/speak` streaming and interruption.
- [ ] Add integration tests for memory policy enforcement.
- [ ] Add E2E flow test: BYOK setup -> chat -> memory recall -> voice -> share.
- [ ] Confirm `pnpm build` passes after each phase milestone.

## Suggested Build Order
- [ ] Complete F0.
- [ ] Complete F1.
- [ ] Complete F2.
- [ ] Complete F3.
- [ ] Complete F4.
- [ ] Complete F5.
- [ ] Complete F6.
- [ ] Complete F7.
- [ ] Complete F9.
