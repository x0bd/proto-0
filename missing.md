# DOT Missing Feature Audit

Date: 2026-04-28

Scope: static code audit of the current project against `ui.md`, `functuion.md`, the BYOK AI plan, and the ElevenLabs voice plan. I did not perform live upstream calls because no real provider keys were available in the repo/session.

## Executive Summary

- [x] BYOK AI chat is partially real: keys can be stored in the local key vault, read by chat/voice clients, and sent to `/api/chat`, which uses the AI SDK with OpenAI and Google providers.
- [x] ElevenLabs TTS is partially real: the app can read the ElevenLabs key from the vault and send it to `/api/tts`, which calls ElevenLabs with `xi-api-key`.
- [ ] The implemented API contracts still use `/api/chat` and `/api/tts` rather than the originally planned `/api/ai/respond` and `/api/tts/speak`, but BYOK key forwarding now uses request headers.
- [ ] Several polished UI surfaces are still local-only or partially wired. They look like complete product features, but a few still need deeper product/runtime integration.
- [x] `functuion.md` and `ui.md` now reflect the current partial implementations instead of showing everything as pending.

## BYOK AI Findings

- [x] `lib/key-store.ts` supports `openai`, `google`, and `elevenlabs` keys, including session-only storage, optional passphrase encryption, model metadata, unlock, and clear.
- [x] `app/components/key-vault-panel.tsx` is no longer just UI. It writes keys through `setKey`, reads state through `getKey`, and unlocks encrypted keys through `unlockVault`.
- [x] `app/components/chat-module.tsx` selects the first configured OpenAI or Google key and streams through `/api/chat`.
- [x] `hooks/useVoiceConversation.ts` also selects an OpenAI or Google key and sends the voice transcript through `/api/chat`.
- [x] `app/api/chat/route.ts` uses `createOpenAI`, `createGoogleGenerativeAI`, and `streamText`, so the AI SDK path is real.
- [x] BYOK key transport now uses the `x-dot-api-key` request header from chat, voice chat, and TTS clients. Server routes still accept the legacy JSON `apiKey` as a fallback.
- [x] The key vault footer now uses tighter product copy: `LOCAL_VAULT · PROXY_HEADER_ONLY · SERVER_NOT_STORED`.
- [x] Key validity can now be checked from the vault. `app/api/keys/validate/route.ts` validates OpenAI, Google, and ElevenLabs keys through provider APIs, and `key-vault-panel.tsx` exposes `TST` / `PING_KEY` controls.
- [x] Provider/model validation now happens before AI SDK execution. `/api/chat` allows only the supported OpenAI/Google providers and known configured model IDs, with clear fallback/default handling.
- [x] Chat error handling is now normalized. `/api/chat` returns structured auth/quota/model/provider errors, and `chat-module.tsx` surfaces the code plus suggested action.
- [x] Voice chat now passes recent memory context into `/api/chat`, matching the text chat personalization path.

## ElevenLabs Findings

- [x] `/api/tts/route.ts` calls ElevenLabs directly with `xi-api-key` and returns an `audio/mpeg` response.
- [x] The TTS route accepts a BYOK key from the `x-dot-api-key` header, keeps legacy body fallback, and falls back to `process.env.ELEVENLABS_API_KEY`.
- [x] `hooks/useVoiceConversation.ts` reads the `elevenlabs` key from the vault and posts it to `/api/tts`.
- [x] If ElevenLabs fails or no key is available, the voice hook falls back to browser `speechSynthesis`.
- [ ] The route is `/api/tts`, not the planned `/api/tts/speak`.
- [ ] The client buffers the full ElevenLabs audio response with `arrayBuffer()` before decoding and playing it. The API route returns a stream, but playback is not true low-latency streaming.
- [x] Voice settings now affect ElevenLabs. `components/ui/voice-settings-sheet.tsx` persists profile, speed, warmth, clarity, auto-speak, and interruption controls through `hooks/useVoiceSettings.ts`; `hooks/useVoiceConversation.ts` sends mapped ElevenLabs voice settings to `/api/tts`.
- [x] Voice profiles now send profile-specific ElevenLabs voice IDs. `useVoiceSettings` maps companion/guide/late-night profiles to voice IDs, and `useVoiceConversation` passes the selected ID to `/api/tts`.
- [x] `/api/tts/route.ts` now accepts dynamic `voice_settings` for `stability`, `similarity_boost`, `style`, `speed`, and `use_speaker_boost`.
- [x] ElevenLabs key validation exists in the key vault via the `TST` / `PING_KEY` controls.

## UI-Only / Partially Wired Product Areas

- [x] Voice settings sheet is no longer UI-only. It persists settings, feeds `useVoiceConversation`, passes ElevenLabs settings into `/api/tts`, controls browser speech fallback rate/pitch, and makes auto-speak/interruption toggles affect runtime behavior.
- [x] Persona tuning is wired into the active settings modal. The CORE tab now exposes expressiveness, directness, auto-voice, and voice mood controls in the same TE hardware style as the rest of the product.
- [x] Active persona selection now drives runtime behavior beyond the ID. Persona tuning is persisted locally, sent to `/api/chat` for prompt shaping, used by voice chat, mapped into ElevenLabs/browser speech settings, and blended into avatar emotion bias.
- [ ] Memory is local-only. `MemoryDrawer` persists localStorage memories, search, filters, delete, clear-all, tag purge, and a local 200-block retention cap, but there is no backend memory API, embeddings, import/export, or cloud sync.
- [x] Text and voice chat now use local relevance-ranked memory context instead of only taking the newest entries. Recall scores prompt/token/tag overlap with recency as a tiebreaker, while embeddings, summarization, dedupe, and richer editing remain future work.
- [x] Voice memory capture now uses the shared memory helpers. Spoken transcripts are stored as `source: "voice"` when learning is enabled, and recent memories are sent with voice prompts.
- [ ] Rituals are local-only. Mood check-ins persist to localStorage, use local-calendar day keys, track current/best streaks, show weekly mood history, and can write memory entries, but there are no reminders, notifications, calendar integration, or configurable timezone controls.
- [x] Share/export now has real client renderers for PNG, GIF, WebM, and native share. Mood card, reflection card, and reaction clip templates composite the avatar into distinct designed canvas layouts.
- [x] Export cancellation is now available. PNG/GIF/WebM/native share jobs share an abort flag, GIF/WebM loops stop on cancel, WebM recorder streams are cleaned up, and the export UI exposes `ABORT` / `ABORT_RENDER` controls while rendering.
- [ ] Audio Lab is functional locally, but it is not integrated as a reusable product feature. Uploaded audio can drive emotion/levels, but there is no saved session, no generated insight, no export, and no connection to AI chat.
- [ ] Onboarding is minimal. There is a settings-key indicator and no-key chat action, but no guided first-run setup for AI provider, ElevenLabs, memory consent, mic permission, and voice test.
- [x] Key deletion now has confirmation. `key-vault-panel.tsx` opens a destructive confirmation dialog before clearing a provider key.
- [x] Key vault copy has been tightened. The footer now says `LOCAL_VAULT · PROXY_HEADER_ONLY · SERVER_NOT_STORED`, while the edit UI still distinguishes encrypted, session-only, and plain local storage modes.
- [ ] Legacy/parallel components still exist. `ChatWindow.tsx`, `DownloadButton.tsx`, `components/audio-panel.tsx`, and unused persona UI components may now be dead or stale surfaces unless they are intentionally kept for reference.

## Plan / Docs Drift

- [x] `functuion.md` now checks the implemented slices for BYOK key storage, AI routing, voice, memory, rituals, persona runtime, and share/export while leaving incomplete items unchecked.
- [x] `ui.md` now names `app/companion/page.tsx` as the product shell and marks the integrated/local-store UI work that is already present.
- [ ] The route names in the plans do not match the code. Current implementation uses `/api/chat` and `/api/tts`, though key forwarding now matches the header-based plan.
- [ ] The privacy/security language needs a pass now that keys are sent from browser to app routes for proxying.

## Priority Fix List

- [x] Wire `VoiceSettingsSheet` into a persisted voice settings store and pass those settings into `useVoiceConversation` and `/api/tts`.
- [x] Decide whether BYOK keys should move from JSON body to headers, then align `/api/chat`, `/api/tts`, chat client, voice client, and docs.
- [x] Add provider key validation/test buttons for OpenAI, Google, and ElevenLabs.
- [x] Add key deletion confirmation and update vault copy to be precise about local storage, encryption, and proxy-route usage.
- [x] Add memory context and memory writes to voice conversations.
- [x] Replace template-only export labels with real template renderers for mood/reflection/reaction outputs.
- [x] Update `functuion.md` and `ui.md` so the project plan reflects what is now implemented vs still missing.
- [x] Normalize `/api/chat` provider/model validation and user-facing AI error messages.
- [x] Wire visible voice profiles to actual ElevenLabs voice IDs.
- [x] Add client-side export cancellation for long GIF/WebM renders.
- [x] Replace shallow recent-memory recall with local relevance-ranked memory context for chat and voice.
- [x] Add local memory retention cap and tag-level purge controls.
- [x] Harden local check-in day boundaries and longest-streak tracking.
- [x] Wire persona tuning into settings UI, AI prompt behavior, voice defaults, and avatar behavior bias.
