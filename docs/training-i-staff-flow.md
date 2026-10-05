# Training I staff flow — 5 October 2026

## Completion rules

- Complete modules in order. Passing the preceding modules unlocks the next one; direct module URLs respect the same rule.
- Journey → learning outcomes, reviewed individually in order → blocks → recap → quiz. The existing 100% quiz pass requirement is retained. A failed review attempt does not erase an earned pass.
- The existing guide points to the next action. Completed concepts can be reopened for review.
- Expanded teaching images require 30 seconds of loaded, visible viewing. Hidden tabs pause the timer. Audio failure cannot award completion or indefinitely lock the image. A broken image can be closed and retried without awarding progress.
- Complete each subconcept before returning to its parent picker. The last sibling completes the parent and returns to the block grid. Module 4 levels return to the stage picker until the stage is complete.
- Completion is persisted by the actual completion handler, before the panel changes target. Reload restores completed concepts and leaves. Module 5 nested folder/category progress is scoped to its parent concept.
- Classification exercises support selecting an item and selecting a category with a pointer or keyboard, in addition to dragging.
- Old standalone quiz routes redirect to the inline assessment, using the same prerequisite checks and progress store.

## Verification

Run from the repository root:

```sh
node scripts/test-training-i-progress.js
node scripts/test-staff-flow.cjs
node scripts/flow-smoke.mjs
node scripts/module-audit.mjs
python3 build_swimming_training.py
```

The behavioral suite executes the production timer and completion handlers with a deterministic clock and DOM doubles. It covers 30-second timing, hidden tabs, image failures/replacement, sibling return/last-leaf exit, Module 4 stage return, Module 5 nested persistence, and click/keyboard classification in modules 1–4. Progress tests cover all five modules, quiz prerequisites, module sequencing, reload, legacy migration, and review attempts. Structural audits are supplementary, not browser end-to-end tests.

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
