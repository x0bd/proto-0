# DOT Missing Feature Audit

Date: 2026-04-28

Scope: static code audit of the current project against `ui.md`, `functuion.md`, the BYOK AI plan, and the ElevenLabs voice plan. I did not perform live upstream calls because no real provider keys were available in the repo/session.

## Executive Summary

- [x] BYOK AI chat is partially real: keys can be stored in the local key vault, read by chat/voice clients, and sent to `/api/chat`, which uses the AI SDK with OpenAI and Google providers.
- [x] ElevenLabs TTS is partially real: the app can read the ElevenLabs key from the vault and send it to `/api/tts`, which calls ElevenLabs with `xi-api-key`.
- [ ] The implemented API contracts do not match the original functionality plan. The plan references `/api/ai/respond`, `/api/tts/speak`, and header-based key forwarding, but the code uses `/api/chat`, `/api/tts`, and sends keys in the JSON request body.
- [ ] Several polished UI surfaces are still local-only or settings-only. They look like complete product features, but they do not yet control the runtime AI/voice behavior.
- [ ] `functuion.md` is still unchecked, while the code already contains partial implementations. The plan docs and code are now out of sync.

## BYOK AI Findings

- [x] `lib/key-store.ts` supports `openai`, `google`, and `elevenlabs` keys, including session-only storage, optional passphrase encryption, model metadata, unlock, and clear.
- [x] `app/components/key-vault-panel.tsx` is no longer just UI. It writes keys through `setKey`, reads state through `getKey`, and unlocks encrypted keys through `unlockVault`.
- [x] `app/components/chat-module.tsx` selects the first configured OpenAI or Google key and streams through `/api/chat`.
- [x] `hooks/useVoiceConversation.ts` also selects an OpenAI or Google key and sends the voice transcript through `/api/chat`.
- [x] `app/api/chat/route.ts` uses `createOpenAI`, `createGoogleGenerativeAI`, and `streamText`, so the AI SDK path is real.
- [ ] BYOK key transport is not implemented as planned. Keys are sent in the JSON body as `apiKey`, not via an `x-dot-api-key` or provider-specific request header.
- [ ] The key vault says `KEYS STORED ON-DEVICE ONLY · NEVER SENT TO OUR SERVERS`, but the browser sends keys to this app's own API routes. More accurate wording would be "sent only to local app proxy routes, never persisted server-side."
- [ ] Key validity is not checked when saving. A user can save an invalid OpenAI, Google, or ElevenLabs key and only discovers the failure later during chat/TTS.
- [ ] Provider/model validation is thin. Unsupported providers throw, and selected models are passed straight to the AI SDK. Some chosen models may reject the shared `streamText` options, especially if a model does not support streaming or the same generation parameters.
- [ ] Error handling is generic. `/api/chat` returns broad `AI request failed` messages instead of normalized provider/auth/quota/model errors the UI can explain cleanly.
- [ ] Voice chat does not pass memory context into `/api/chat`. Text chat includes recent memories, but `useVoiceConversation.ts` only sends `messages`, `provider`, `model`, `apiKey`, and `persona`.

## ElevenLabs Findings

- [x] `/api/tts/route.ts` calls ElevenLabs directly with `xi-api-key` and returns an `audio/mpeg` response.
- [x] The TTS route accepts a BYOK key from the request body and falls back to `process.env.ELEVENLABS_API_KEY`.
- [x] `hooks/useVoiceConversation.ts` reads the `elevenlabs` key from the vault and posts it to `/api/tts`.
- [x] If ElevenLabs fails or no key is available, the voice hook falls back to browser `speechSynthesis`.
- [ ] The route is `/api/tts`, not the planned `/api/tts/speak`.
- [ ] The client buffers the full ElevenLabs audio response with `arrayBuffer()` before decoding and playing it. The API route returns a stream, but playback is not true low-latency streaming.
- [x] Voice settings now affect ElevenLabs. `components/ui/voice-settings-sheet.tsx` persists profile, speed, warmth, clarity, auto-speak, and interruption controls through `hooks/useVoiceSettings.ts`; `hooks/useVoiceConversation.ts` sends mapped ElevenLabs voice settings to `/api/tts`.
- [ ] `/api/tts/route.ts` always uses a default voice ID unless `voiceId` is provided manually, but the visible voice UI never sends a voice ID.
- [x] `/api/tts/route.ts` now accepts dynamic `voice_settings` for `stability`, `similarity_boost`, `style`, `speed`, and `use_speaker_boost`.
- [ ] No ElevenLabs voice/key validation flow exists in the key vault or voice settings.

## UI-Only / Partially Wired Product Areas

- [x] Voice settings sheet is no longer UI-only. It persists settings, feeds `useVoiceConversation`, passes ElevenLabs settings into `/api/tts`, controls browser speech fallback rate/pitch, and makes auto-speak/interruption toggles affect runtime behavior.
- [ ] Persona tuning UI exists in unused components. `components/ui/persona-settings-panel.tsx`, `persona-picker.tsx`, and `persona-card.tsx` include richer controls, but the active settings modal currently uses a simpler inline persona picker instead.
- [ ] Active persona selection is partially functional. The selected persona ID is persisted and sent to `/api/chat`, but expressiveness, directness, auto-voice, and voice mood are not implemented.
- [ ] Memory is local-only. `MemoryDrawer` persists localStorage memories, search, filters, delete, and purge, but there is no backend memory API, embeddings, semantic recall, import/export, or cloud sync.
- [ ] Text chat uses memory context, but only a shallow recent-memory slice. There is no ranking, summarization, dedupe, consent review, or memory editing beyond deleting stored blocks.
- [ ] Voice memory capture appears missing. `useVoiceConversation.ts` did not show `addMemory` or `memoryContext` usage, so spoken conversations do not currently benefit from the same memory loop as text chat.
- [ ] Rituals are local-only. Mood check-ins persist to localStorage and can write memory entries, but there are no reminders, notifications, calendar integration, timezone controls, or multi-day analytics beyond local streak math.
- [ ] Share/export is partially functional. PNG, GIF, WebM, and native share have real client code, but templates only change labels/filenames. There is no actual designed mood-card/reflection-card/reaction-clip layout layer.
- [ ] Export cancellation is missing. Long GIF/WebM capture can be started, but there is no cancel control once in progress.
- [ ] Audio Lab is functional locally, but it is not integrated as a reusable product feature. Uploaded audio can drive emotion/levels, but there is no saved session, no generated insight, no export, and no connection to AI chat.
- [ ] Onboarding is minimal. There is a settings-key indicator and no-key chat action, but no guided first-run setup for AI provider, ElevenLabs, memory consent, mic permission, and voice test.
- [ ] Key deletion lacks confirmation. `key-vault-panel.tsx` clears a configured key immediately from the row X button.
- [ ] Key vault copy is misleading for unencrypted storage. Without a passphrase, keys can be stored plainly in localStorage. The edit UI does say `PLAIN · NO PASSPHRASE SET`, but the list footer says `LOCAL_ONLY` / `NEVER SENT TO OUR SERVERS`, which can read safer than reality.
- [ ] Legacy/parallel components still exist. `ChatWindow.tsx`, `DownloadButton.tsx`, `components/audio-panel.tsx`, and unused persona UI components may now be dead or stale surfaces unless they are intentionally kept for reference.

## Plan / Docs Drift

- [ ] `functuion.md` still shows all functionality tasks unchecked even though the repo now has partial AI chat, BYOK key storage, TTS, memory, rituals, panel persistence, and exports.
- [ ] `ui.md` still has U7 unchecked. The main app is integrated under `app/companion/page.tsx`, while `app/page.tsx` is now a landing page. The docs should name `/companion` as the actual product shell.
- [ ] The route names in the plans do not match the code. Current implementation uses `/api/chat` and `/api/tts`.
- [ ] The privacy/security language needs a pass now that keys are sent from browser to app routes for proxying.

## Priority Fix List

- [x] Wire `VoiceSettingsSheet` into a persisted voice settings store and pass those settings into `useVoiceConversation` and `/api/tts`.
- [ ] Decide whether BYOK keys should move from JSON body to headers, then align `/api/chat`, `/api/tts`, chat client, voice client, and docs.
- [ ] Add provider key validation/test buttons for OpenAI, Google, and ElevenLabs.
- [ ] Add key deletion confirmation and update vault copy to be precise about local storage, encryption, and proxy-route usage.
- [ ] Add memory context and memory writes to voice conversations.
- [ ] Replace template-only export labels with real template renderers for mood/reflection/reaction outputs.
- [ ] Update `functuion.md` and `ui.md` so the project plan reflects what is now implemented vs still missing.
