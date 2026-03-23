# DOT UI TODO Plan

## U0 Foundation
- [x] Define UI token updates for spacing, radius, motion, and status colors.
- [x] Create shared primitives: `SectionCard`.
- [x] Create shared primitives: `SettingsRow`.
- [x] Create shared primitives: `EmptyState`.
- [x] Create shared primitives: `StatusBadge`.
- [x] Create shared primitives: `InlineHint`.
- [x] Create shared primitives: `ConfirmDialog`.
- [x] Ensure all new screens reuse shared primitives.
- [x] Validate base responsive behavior on mobile and desktop.

## U1 Key Vault UI (BYOK)
- [x] Build `KeyVaultPanel`.
- [x] Build provider cards for OpenAI, Google, ElevenLabs, and Integrations.
- [x] Build masked key input with reveal/hide behavior.
- [x] Build passphrase prompt UI for decrypt/lock actions.
- [x] Build key health status row with configured/missing/invalid/session-only states.
- [x] Add empty state for no configured keys.
- [x] Add success and failure feedback states for add/update/remove key actions.
- [x] Add session-only mode toggle UI.
- [x] Add key removal confirmation dialog.

## U2 Memory UI
- [x] Build `MemoryDrawer`.
- [x] Build `MemoryTimelineList`.
- [x] Build `MemoryItemCard`.
- [x] Build `MemoryFiltersBar` with tag chips and search.
- [x] Build `MemoryPolicyPanel` with read/write controls.
- [x] Build `MemoryDangerZone` with clear and purge actions.
- [x] Add empty memory state.
- [x] Add filtered-result state.
- [x] Add memory-disabled state banner.
- [x] Add delete/clear confirmations.

## U3 Voice Companion UI
- [ ] Build `VoiceCompanionBar` with push-to-talk, mute, interrupt, and mode toggle.
- [ ] Build `VoiceStatusPill` with idle/listening/thinking/speaking states.
- [ ] Build `TranscriptPanel` for partial and final transcript rendering.
- [ ] Build `VoiceSettingsSheet` for voice profile and tuning controls.
- [ ] Add mic-permission required state.
- [ ] Add listening active visual state.
- [ ] Add generating response visual state.
- [ ] Add speaking playback visual state.
- [ ] Add interrupted and error visual states.

## U4 Daily Check-ins + Streaks UI
- [ ] Build `DailyCheckInCard`.
- [ ] Build mood input control (sliders or quick mood chips).
- [ ] Build `ReflectionPromptCard`.
- [ ] Build `StreakBadge`.
- [ ] Build `WeeklySnapshotPanel`.
- [ ] Add first-check-in empty onboarding state.
- [ ] Add completed-today state.
- [ ] Add streak-broken state.
- [ ] Add weekly-data-empty state.
- [ ] Add weekly-data-populated state.

## U5 Persona Packs UI
- [ ] Build `PersonaPicker`.
- [ ] Build `PersonaCard`.
- [ ] Build `PersonaPreview`.
- [ ] Build `ActivePersonaChip`.
- [ ] Build `PersonaSettingsPanel`.
- [ ] Add default persona state.
- [ ] Add active persona switch state feedback.
- [ ] Add unavailable persona state when requirements are missing.

## U6 Shareable Moments UI
- [ ] Build `ShareDock`.
- [ ] Build `ExportOptionsSheet` for PNG/GIF/WebM.
- [ ] Build `TemplatePicker` for mood/reflection/reaction templates.
- [ ] Build export progress and result toasts.
- [ ] Build share target row with fallback behavior hints.
- [ ] Add export in-progress state.
- [ ] Add export success state.
- [ ] Add export failure state.
- [ ] Add share API unavailable fallback state.

## U7 Integration and QA
- [ ] Integrate all UI sections into `app/page.tsx` shell flow.
- [ ] Add mock stores so all views are navigable without backend.
- [ ] Validate safe-area spacing for mobile.
- [ ] Validate touch targets and overlap behavior on small screens.
- [ ] Validate keyboard/focus states for controls and dialogs.
- [ ] Validate contrast and readability for all actionable elements.

