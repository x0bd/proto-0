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
- [x] Build `VoiceCompanionBar` with push-to-talk, mute, interrupt, and mode toggle.
- [x] Build `VoiceStatusPill` with idle/listening/thinking/speaking states.
- [x] Build `TranscriptPanel` for partial and final transcript rendering.
- [x] Build `VoiceSettingsSheet` for voice profile and tuning controls.
- [x] Add mic-permission required state.
- [x] Add listening active visual state.
- [x] Add generating response visual state.
- [x] Add speaking playback visual state.
- [x] Add interrupted and error visual states.

## U4 Daily Check-ins + Streaks UI
- [x] Build `DailyCheckInCard`.
- [x] Build mood input control (sliders or quick mood chips).
- [x] Build `ReflectionPromptCard`.
- [x] Build `StreakBadge`.
- [x] Build `WeeklySnapshotPanel`.
- [x] Add first-check-in empty onboarding state.
- [x] Add completed-today state.
- [x] Add streak-broken state.
- [x] Add weekly-data-empty state.
- [x] Add weekly-data-populated state.

## U5 Persona Packs UI
- [x] Build `PersonaPicker`.
- [x] Build `PersonaCard`.
- [x] Build `PersonaPreview`.
- [x] Build `ActivePersonaChip`.
- [x] Build `PersonaSettingsPanel`.
- [x] Add default persona state.
- [x] Add active persona switch state feedback.
- [x] Add unavailable persona state when requirements are missing.

## U6 Shareable Moments UI
- [x] Build `ShareDock`.
- [x] Build `ExportOptionsSheet` for PNG/GIF/WebM.
- [x] Build `TemplatePicker` for mood/reflection/reaction templates.
- [x] Build export progress and result toasts.
- [x] Build share target row with fallback behavior hints.
- [x] Add export in-progress state.
- [x] Add export success state.
- [x] Add export failure state.
- [x] Add share API unavailable fallback state.

## U7 Integration and QA
- [ ] Integrate all UI sections into `app/page.tsx` shell flow.
- [ ] Add mock stores so all views are navigable without backend.
- [ ] Validate safe-area spacing for mobile.
- [ ] Validate touch targets and overlap behavior on small screens.
- [ ] Validate keyboard/focus states for controls and dialogs.
- [ ] Validate contrast and readability for all actionable elements.
