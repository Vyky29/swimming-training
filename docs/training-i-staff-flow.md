# Training I staff flow — 5 October 2026

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

The complete five-module course has **not** been walked end to end in a production browser. Local preview has no live `/api/tts` service, so these browser checks exercised the audio-failure fallback; live narration and authenticated staff reporting were not validated. A full staff acceptance run of modules 2–5 remains necessary before claiming comprehensive launch certification.

Progress remains browser-local, as in the existing implementation. It is not a server-verified staff completion record and does not synchronize between devices. Restarting a prerequisite module relocks later modules until it is passed again, without deleting their saved progress. In-progress concepts may require their unfinished review steps again after reload; completed concepts and leaves remain saved.

## Narration follow-up

- Lily is the configured ElevenLabs voice, with multilingual v2, stability 0.55, similarity 0.8, restrained style 0.05, speaker boost and speed 0.95 on the direct API path.
- The existing PixtoLearn proxy remains the fallback. Its response does not identify its voice, so the exact fallback voice cannot be certified from this repository. Do not describe every proxy sample as verified Lily. A dedicated ELEVENLABS_API_KEY on the deployment is needed for the directly controlled voice settings; no secrets are checked in.
- ElevenLabs now lists Lily among default voices due to expire on 31 December 2026, recommending Florence as a replacement. Re-audition a supported voice before that date: https://help.elevenlabs.io/hc/en-us/articles/26942950589969-What-are-Default-voices
- Narration uses complete sentence chunks and no longer silently truncates after eight pieces. Failed audio is not cached permanently. Network, playback and decoding failures report failure separately from an actual ended event.
- Outcomes have a brief introduction, then individual narrations and confirmations in order. Image stories follow the concept introduction. Key ideas and activities remain their own subsequent steps.
- The image script library now covers 115 asset names: the original 96 plus six replacement PixtoLearn page names and 13 category page images. Decorative icons and activity tokens are not each assigned a separate narrated review. The four stroke category pages share a category-level teaching script; these are not bespoke descriptions of each diagram.
- Five actual production API requests returned HTTP 200 audio/mpeg, decoded by macOS afinfo: M1 31.48s, M2 24.69s, M3 22.99s, M4 23.33s, M5 19.07s. These validate representative generated files, not every narration or subjective voice quality.
- Local browser connected to the production TTS endpoint: Journey remained locked during narration and unlocked after actual playback completed. The browser also confirmed outcomes narrate individually and reject confirmation while their audio is playing. Full five-module end-to-end acceptance remains outstanding.
