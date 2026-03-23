# DOT Functionality TODO Plan

## F0 Contracts and Types
- [ ] Define `ProviderId` type and provider enum mapping.
- [ ] Define `KeyVaultEntry` and key metadata interfaces.
- [ ] Define `MemoryItem` and `MemoryPolicy` interfaces.
- [ ] Define `VoiceSessionState` interfaces and status model.
- [ ] Define `CheckIn` and `StreakState` interfaces.
- [ ] Define `PersonaConfig` interface.
- [ ] Define `ExportJob` and export status interfaces.
- [ ] Define shared API request/response contracts for all new routes.

## F1 BYOK Key Vault Logic
- [ ] Implement `lib/security/key-vault.ts`.
- [ ] Implement passphrase-based key derivation using Web Crypto.
- [ ] Implement API key encryption/decryption using AES-GCM.
- [ ] Implement persistent encrypted blob format.
- [ ] Implement session-only key mode with no persistence.
- [ ] Implement in-memory decrypted key cache with timeout.
- [ ] Implement lock/unlock and clear-cache behavior.
- [ ] Implement strict no-server-persistence policy for user keys.

## F2 AI Route and Orchestration (AI SDK)
- [ ] Create `POST /api/ai/respond`.
- [ ] Add provider routing logic using `x-dot-provider`.
- [ ] Read user-provided API key from request headers.
- [ ] Implement OpenAI provider execution with AI SDK.
- [ ] Implement Google provider execution with AI SDK.
- [ ] Implement streaming responses to client.
- [ ] Inject persona context into request prompt stack.
- [ ] Inject memory retrieval context into request prompt stack.
- [ ] Add normalized error mapping for missing/invalid keys.

## F3 ElevenLabs Voice Runtime
- [ ] Create or normalize `POST /api/tts/speak`.
- [ ] Read ElevenLabs key from request headers only.
- [ ] Stream audio response payload to client.
- [ ] Upgrade voice client hook for interrupt/cancel support.
- [ ] Implement barge-in behavior to stop active playback.
- [ ] Expose analyzer node for avatar audio reactivity.
- [ ] Add fallback to browser SpeechSynthesis when key is missing.
- [ ] Add unified error states for voice failures.

## F4 Memory Engine
- [ ] Implement local persistence adapter (IndexedDB) for memory.
- [ ] Implement memory write pipeline from chat interactions.
- [ ] Implement memory write pipeline from voice interactions.
- [ ] Implement explicit manual save path.
- [ ] Implement memory search and filtering logic.
- [ ] Implement memory retrieval scoring for relevance.
- [ ] Implement policy enforcement for read/write toggles.
- [ ] Implement retention handling and purge behavior.
- [ ] Implement clear-all and category purge operations.

## F5 Check-ins and Streak Engine
- [ ] Implement check-in storage model and adapter.
- [ ] Implement one-check-in-per-day guard.
- [ ] Implement timezone-aware day boundary utility.
- [ ] Implement current streak calculation.
- [ ] Implement longest streak calculation.
- [ ] Implement weekly mood aggregation metrics.
- [ ] Provide check-in summary context for AI responses.

## F6 Persona Runtime
- [ ] Create persona registry config (Coach, Playful, Deep Thinker, Focus Buddy).
- [ ] Implement active persona persistence.
- [ ] Implement runtime persona switch logic.
- [ ] Apply persona prompt profile to AI requests.
- [ ] Apply persona voice defaults to TTS requests.
- [ ] Apply persona-driven avatar behavior tuning hooks.

## F7 Share and Export Runtime
- [ ] Harden PNG export pipeline.
- [ ] Harden GIF/WebM export pipeline.
- [ ] Add export cancellation and failure recovery.
- [ ] Add deterministic output sizing and template overlays.
- [ ] Integrate Web Share API path where available.
- [ ] Add download fallback for unsupported share environments.
- [ ] Add progress and completion events for UI feedback.

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

