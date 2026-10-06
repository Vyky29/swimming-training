# Training I staff-flow acceptance — 6 October 2026

## Implemented flow

Journey → separately narrated learning outcomes → “Inside this module, we’ll explore…” with each numbered block and full title → blocks/concepts → recap → quiz. One pulsing target points to the next required action. Modules unlock in order after all content and a perfect quiz.

Each instructional image requires 15 seconds while loaded and visible, plus completed narration. Longer narration extends the review naturally. Hidden-tab time is excluded. Failed narration offers a transcript acknowledgement; section narration also offers Retry narration. Neither failure nor closing an unfinished modal earns completion. Previously reviewed images remain reviewed, and distinct images each require review.

Nested concepts return to their picker between siblings. The final leaf closes the parent or advances to the next required group. Module 5 uses its actual Done handler rather than a Back shortcut; completed hubs also expose Done after reload.

Continue restores the module, concept, nested screen, completed cards/images, practice cues, and interrupted narration chunk/second. Module 4 additionally preserves stage cards, journey-map visits, level focus points and open focus, and development-factor points. Persistence is in this browser; cross-device/account synchronization of these detailed checkpoints was not verified.

## Voice and images

ElevenLabs Holly — Relaxing, Velvety and Silky, voice ID `B9PDs7mcHTMxHUw5U8Cf`, verified in the official British-English voice library. The API pins Holly for both providers and rejects a mismatched fallback identity. Direct generation uses multilingual v2; the existing PixtoLearn fallback uses v3 with different pacing. No keys or billing settings were created or changed.

All five modules were walked through with real generated MP3 narration against the production TTS endpoint from the local release build. Direct-handler voice identity was separately smoke-tested. Image scripts are present in code, including renamed assets and Module 5 nested categories. The four swimming-stroke images share a category explanation rather than four bespoke diagram scripts. All four were individually played and reviewed. The 54 distinct external image URLs passed availability checks.

## Live acceptance

- Module 1: all blocks, nested forces, images, activities, recap and quiz; 8/8. Intermediate forces returned to the picker; final force closed its parent.
- Module 2: all blocks, emotional states and environment/internal factors, images, activities, recap and quiz; 8/8. A 7/8 attempt was exercised. Partial practice-cue resume restored the next cue.
- Module 3: all blocks, five teaching approaches, images, activities, recap and quiz; 8/8. Wrong matching was rejected. The last approach closed the parent; disengagement sequence passed.
- Module 4: all four blocks, three stages, all six levels and every focus point, development factors and three review steps; recap and quiz 8/8. Reload/chooser returns preserved partial stage, level and factor work. The legacy recap ID now resolves correctly. The external term-review form is optional practice and was not submitted with fictional data.
- Module 5: all three blocks; all five folders and every category; all six flashcards; all three visual schedules; sequence and session planning; full narrated recap and quiz 8/8. Two- and three-step boards, the six-card overview and its three breakdowns, and the Level 3 session plan all passed with keyboard controls. The final schedule closed its parent and highlighted Swimming Sequence. Both sequence images were required. Yellow-card reload restored step five after four were reviewed. The final portal return and chooser showed all five modules completed.

Module 5 acceptance exposed and fixed incorrect attempts awarding activity completion, a hidden final Done button, inaccessible schedule pockets, and a result-card label incorrectly saying QUIZ PASSED on failure. The latter could also fool the shell's text-based fallback into recording completion. The result card now preserves the actual failure score and marks its explicit outcome; the shell does not resubmit a score inferred from presentation copy. The corrected live result showed Quiz incomplete / 7/8, followed by all eight correct and the final congratulations card. A behavioral test ensures a failed card cannot cause a second inferred submission. Earlier local test completion was not used as evidence of passing: all eight answers were subsequently completed correctly.

One transient block-intro audio failure was recovered by reloading/Continue and then listening to the complete real narration. Retry narration now exposes that recovery without requiring a reload.

The certificate button is available after success. Its native name prompt/download was not confirmed in the in-app browser; certificate export is not counted as a completed acceptance check.

## Automated validation

All seven regression entry points passed: progress, staff flow (39 behavioral cases), voice queue/resume, TTS provider/identity, detailed resume, next-module/legacy recap, and mandatory subconcept requirements. Structural module audit: PASS for all five. Flow smoke: ENGINE PASS, PLAN PENDING 0. Release build and whitespace checks passed.

Screenshots are retained in the parent workspace, including Holly's official identity, narration/resume checks, Modules 1–3 passed, and `training-i-module-5-passed.jpg` showing the final successful result. Module 4's browser viewport prevented screenshot capture during that portion; its live UI result was checked.

## Narration startup follow-up

Inside This Module used to generate a full audio file on arrival: five measured generation requests took 8.3–12.0 seconds. The five unchanged scripts now have prepared Holly MP3s, matched by exact text and served as static assets. The live generator remains a fallback if an asset cannot be fetched. Outcomes and intro pillars prefetch the next item while the current audio plays; the final outcome prepares Inside This Module. Prefetch never plays audio or grants progress, and existing chunk/second checkpoints remain unchanged.

A local browser fixture using the production voice engine measured actual `playing` events after 24, 10, 5, 9 and 6 ms for Modules 1–5. These are local results, not a production-network guarantee. New tests verify exact script/asset coverage for all five modules, silent prefetch reuse, and fallback when a prepared asset is missing. The temporary measurement fixture is excluded from the release build.
