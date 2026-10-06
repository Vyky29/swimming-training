# Training I staff flow — 5–6 October 2026

## Completion rules

- Complete modules in order. Passing the preceding modules unlocks the next one; direct module URLs respect the same rule.
- Journey → learning outcomes, reviewed individually in order → blocks → recap → quiz. The existing 100% quiz pass requirement is retained. A failed review attempt does not erase an earned pass.
- The existing guide points to the next action. Completed concepts can be reopened for review.
- Expanded teaching images require 15 seconds of loaded, visible viewing AND completion of their narration, or explicit confirmation of the visible transcript. Hidden tabs pause the timer and narration. Audio failure opens the transcript and never silently awards completion. A broken image can be closed and retried without awarding progress.
- Complete each subconcept before returning to its parent picker. The last sibling completes the parent and returns to the block grid. Module 4 levels return to the stage picker until the stage is complete.
- Completion is persisted by the actual completion handler, before the panel changes target. Reload restores completed concepts and leaves. Module 5 nested folder/category progress is scoped to its parent concept.
- Classification exercises support selecting an item and selecting a category with a pointer or keyboard, in addition to dragging.
- Old standalone quiz routes redirect to the inline assessment, using the same prerequisite checks and progress store.

## Verification

Run from the repository root:

```sh
node scripts/test-training-i-progress.js
node scripts/test-staff-flow.cjs
node scripts/test-training-i-voice.cjs
node scripts/test-training-i-tts.cjs
node scripts/test-training-i-resume.cjs
node scripts/test-training-i-next-module.cjs
node scripts/test-subconcept-requirements.cjs
node scripts/flow-smoke.mjs
node scripts/module-audit.mjs
python3 build_swimming_training.py
```

The behavioral suite executes the production timer and completion handlers with a deterministic clock and DOM doubles. It covers 15-second timing, longer narration completion, explicit reading alternatives, hidden tabs, image failures/replacement, sibling return/last-leaf exit, Module 4 stage return, Module 5 nested persistence, and click/keyboard classification in modules 1–4. Progress tests cover all five modules, quiz prerequisites, module sequencing, reload, legacy migration, and review attempts. Structural audits are supplementary, not browser end-to-end tests.

Browser smoke performed locally:

- Module 1: Journey, outcomes in order, rejection of skipping to the last outcome, reload of reviewed outcomes.
- Block 1: introduction, first concept, real 30-second image waits, premature Escape blocked, ideas, correct activity, completion.
- Water Forces parent and both children: return to picker after Supportive Forces, saved child completion after reload, Dynamic Forces classification by clicking, last-child parent completion, and Block 2 unlocking after the block confirmation.
- Hub locks modules 2–5; direct Module 2 navigation returns to the hub.
- Legacy Module 1 quiz URL redirects to the inline module without unlocking its quiz prematurely.
- Mobile navigation menu at 390 × 844 opens and closes with Escape.

## Release scope and remaining verification

The complete five-module course has **not** been walked end to end in a production browser. Initial browser checks used the audio-failure fallback; the later local proxy checks below use real production narration. Authenticated staff reporting has not been validated. Modules 1, 2 and 3 have now passed full live acceptance. Walking Modules 4–5 remains necessary before claiming comprehensive launch certification.

Progress remains browser-local, as in the existing implementation. It is not a server-verified staff completion record and does not synchronize between devices. Restarting a prerequisite module relocks later modules until it is passed again, without deleting their saved progress. Continue restores the in-progress concept and reviewed cards, with audio checkpoints for unfinished narration. Unfinished activities still require completion.

## Narration follow-up

- Holly — Relaxing, Velvety and Silky (`B9PDs7mcHTMxHUw5U8Cf`) is pinned on both provider paths. Verified in the signed-in ElevenLabs library under English / British and in an actual upstream response. A fallback response with a different voice is rejected.
- The direct path uses multilingual v2, stability 0.55, similarity 0.8, style 0.05, speaker boost and speed 0.95. The existing PixtoLearn fallback uses its own v3 settings; voice identity is the same, delivery settings differ. No secrets are checked in.
- Narration uses complete sentence chunks and no longer silently truncates after eight pieces. Failed audio is not cached permanently. Network, playback and decoding failures report failure separately from an actual ended event.
- Outcomes have a brief introduction, then individual narrations and confirmations in order. Image stories follow the concept introduction. Key ideas and activities remain their own subsequent steps.
- The image script library now covers 115 asset names: the original 96 plus six replacement PixtoLearn page names and 13 category page images. Decorative icons and activity tokens are not each assigned a separate narrated review. The four stroke category pages share a category-level teaching script; these are not bespoke descriptions of each diagram.
- Five actual production API requests returned HTTP 200 audio/mpeg, decoded by macOS afinfo: M1 31.48s, M2 24.69s, M3 22.99s, M4 23.33s, M5 19.07s. These validate representative generated files, not every narration or subjective voice quality.
- Local browser connected to the production TTS endpoint: Journey remained locked during narration and unlocked after actual playback completed. The browser also confirmed outcomes narrate individually and reject confirmation while their audio is playing. Full five-module end-to-end acceptance remains outstanding.

Live image check: Module 1, Water as an Active Environment, opened its exact scripted story. After 15 visible seconds, Escape was rejected and Close remained disabled while the real narration continued. When playback ended, Image reviewed appeared and Close enabled. The displayed transcript matched the script.

## Resume and voice verification follow-up

The live PixtoLearn GET diagnostic reports `eleven_v3`, and an actual POST response identifies `B9PDs7mcHTMxHUw5U8Cf`. Verified in the signed-in ElevenLabs library with English + British filters: **Holly - Relaxing, Velvety and Silky**, described as a professional English female voice suited to narration. The earlier Lily assumption is superseded. Both paths now select Holly; a proxy response identifying another voice is rejected, and successful responses expose X-Training-Voice-Id.

Resume checkpoints are module-scoped: current concept, reviewed cards, finished section narrations, reviewed images, and partial audio position. Interrupted playing flags are never restored. Continue Module reopens the stored concept only within the next permitted block. A staff member returns through Continue to give the browser a playback gesture. Unfinished activities still require completion; completed steps are not fabricated. The block introduction now begins “Inside this module, we’ll explore the following blocks.” before listing block numbers and titles.

Browser return test: while inside Overview of Water Forces, left to the module chooser, returned, and selected Continue. The same concept reopened with Always Acting still reviewed and the next card highlighted; earlier completed stages did not replay.

Latest API integration smoke: the local handler returned HTTP 200, audio/mpeg, 129193 bytes and X-Training-Voice-Id B9PDs7mcHTMxHUw5U8Cf for the requested Inside This Module / Block One introduction.

Resume regression found and fixed in the live browser: restored intro cards looked checked but the module completion gate still read its initial dataset. Restoration now synchronizes the derived card gates and emits the normal completion-change event. Repeating the dashboard return, reviewing the activity, and finishing Dynamic Forces completed its parent and unlocked Block 2. An interrupted photo could be reopened without being falsely awarded; reviewed cards and completed photos stayed saved.

Asset availability audit: all 54 distinct external image URLs extracted from the five module HTML files returned HTTP 200 to HEAD requests. This checks availability, not visual accuracy. Live Module 1 Block 2 checks completed Drowning Risk (true/false), Who Is More Vulnerable (classification), and Neurodiverse Risk Factors (matching) with real narration and photo gates.

Full live Module 1 path completed: all three blocks, nested forces leaves, photo narrations and 15-second gates, all four activity patterns present, recap, and 8/8 quiz. The chooser shows Module 1 Completed, Module 2 Start Module, and Modules 3–5 locked. Module 2 has now been started through that chooser. The quiz guide now points at the visible next-module/portal link after passing instead of continuing to request the quiz. Four resolver cases cover passed, unpassed, hidden review CTA, and final-module portal behavior.

Live Module 2: Journey, all five narrated outcomes, and the revised Inside This Module introduction completed in order. After finishing the first concept, reload exposed a stale resume point reopening that completed concept. Resume now rejects targets already present in the module completion record; repeated reload correctly guides to Teaching Requires Regulation. Finish cues use the actual button label (Continue or Done).

Module 2 In Practice acceptance: partial cue review originally reset after reload. Resume now saves reviewed Do/Look/Avoid cues and completed actions, synchronizes their visible counters through InPracticeSystem, and retains yellow usage-card reviews for Module 5. Browser checks confirmed resume at Look for after Do, then resume directly at the activity after all cues. Matching and concept completion still worked after those reloads. All six test suites pass (64 behavioral cases).

Subconcept requirement audit found a legacy bypass in Modules 2 and 3: overview-return leaves treated their review and activity requirements as optional. Removed that exception. Production-handler tests now prove leaves require their activity, intro cards, and key ideas before Done enables. The live Calm screen now disables Done while its activity is pending. Parent navigation additionally checks the full parent content readiness rather than only its photo.

Full live Module 2 path completed (6 October): all blocks, both nested pickers, real narration and photo gates, key ideas, In Practice cues, choice/classification/matching exercises, recap, and 8/8 quiz. Calm and Alert returned to their parent picker; Overloaded completed the parent. Reload between children retained Calm and resumed at Alert. Water-Based stayed locked at 7/8 classified items and enabled only after item 8. The final quiz correctly pulsed Go to Next Module and opened Module 3 with Modules 1 and 2 shown completed.

Live Module 3 partial acceptance (6 October): Journey, five sequential outcomes, the numbered/titled Inside This Module narration, all of Blocks 1 and 2, and the first two concepts of Block 3 completed with actual audio, photo gates, key ideas and activities. In Using Engagement Approaches, attempting Modelling before parent reviews, and again after the photo but before key ideas, correctly kept the parent open. After all parent reviews, Modelling unlocked. Modelling, Turn Taking, Guided Discovery and Intensive Interaction each completed and returned to the picker highlighting the next child. Play-Based Interaction was opened and its first two cards confirmed. The browser connection disappeared during the third-card/photo transition; whether that last action completed is unverified. Resume here next. Remaining: finish Play-Based Interaction, verify last-child parent completion, the final Block 3 concept, recap and quiz, then all of Modules 4 and 5. Production remains unchanged.

Browser connection recovered without resetting progress. Full Module 3 acceptance then completed: the final Play-Based Interaction leaf closed its parent and highlighted Responding to Disengagement; its sequence activity, Block 3 checkpoint, recap and quiz all passed. Quiz result 8/8 and Go to Next Module opened Module 4 with Modules 1–3 shown completed. Module 4 Journey and five narrated outcomes have passed; its numbered/titled block introduction is now being checked.

Module 4 live return exposed two issues: renderConcept was private to its DOM-ready callback, and concept restoration registered another DOM-ready listener too late to run. The renderer is now exposed to Continue, and saved completions load during setup, expanding only earned level groups. Reload/Continue reopened Core Principles directly with all prior reviews and 2/3 concepts retained. Completing its keyboard matching exercise enabled Done and the Block 1 checkpoint. Matching chips and slots now expose buttons and keyboard activation in both concept and quiz matching. The full concept matching exercise passed using Enter. Regression tests cover restored concepts and ensure unearned levels remain incomplete.


Module 4 live follow-up (6 October): all four blocks completed with actual Holly audio, including all six levels and their focus-area points. Navigation mascots no longer count as unreviewed photos. Partial stage intro cards, the six-stop journey map, level focus points/open focus, and factor points/open factor survive reload. Verified returning at the next unfinished point, without awarding the rest. The three term-review steps return to the picker between siblings and close the parent after the final step. The external form is explicitly optional practice, is not credited as a submitted review, and instructs staff not to submit fictional records. Timeline guide labels now use step and title only.

Module 4 recap regression: its historical `keyideas` DOM id did not match the canonical `recap` config. This skipped recap narration and could leave the section locked after reload. Both the module shell and flow guide now resolve the alias; a behavior regression test and live reload confirmed the section opens and narrates before the quiz. Module 4 quiz and the full Module 5 walkthrough remain pending at this checkpoint; production has not been published.
