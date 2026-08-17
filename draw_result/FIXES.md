# Source-data corrections

These JSON files were pulled from the WordPress jet-cct REST API on **2026-08-17**, then
hand-corrected. `scripts/sync-draws-from-wordpress.js` reads these files rather than the live
endpoint, because re-pulling would silently reintroduce the bugs below.

## How the bugs were found

Each draw type has a tight, characteristic data-entry window (the hour of `cct_created`):

| Draw type  | Draws at (London) | Entry window | Lag  |
|------------|-------------------|--------------|------|
| brunchtime | 11:49             | 15:00–16:xx  | ~4 h |
| lunchtime  | 12:49             | 16:00–17:xx  | ~4 h |
| drivetime  | 16:49             | 20:00–21:xx  | ~4 h |
| teatime    | 17:49             | 21:00–22:xx  | ~4 h |

Results are entered on a uniform ~4-hour lag after each draw, so the entry hour identifies the
draw type unambiguously.

Three rows were entered in *another* type's window **and** lined up exactly with a hole in the
calendar of that other type. Each "duplicate" was therefore not a duplicate at all — it was one
draw's result filed under the wrong draw type or the wrong date, which is simultaneously why
another draw appeared to be missing.

Two of the three were independently confirmed against Firestore, which already holds
`lunchtime_20260601` = `3,13,29,35,38,44` B9 and `teatime_20260601` = `3,18,35,37,42,43` B6 —
exactly the split fix 2 produces — and `drivetime_20260428` = `3,13,19,21,45,46` B8, exactly the
row fix 1 keeps. Fixes 1 and 3 additionally recover two results that were absent from Firestore
entirely (`brunchtime_20260428`, `teatime_20260417`); those two are inferred, not confirmed.

Before: 3 conflicting duplicate dates, 3 unexplained calendar gaps.
After: 0 conflicts, 0 gaps (except 2025-12-25 — no 49's draws on Christmas Day).

## The three corrections

| # | Was | Now | Evidence |
|---|-----|-----|----------|
| 1 | `drivetime` `_ID 92`, 2026-04-28, `7,8,12,25,30,31` B48 | moved to `brunchtime` 2026-04-28, `_ID` → `moved-d92` | created 15:57 (brunchtime window); brunchtime 2026-04-28 was missing |
| 2 | `lunchtime` `_ID 361`, 2026-06-01, `3,18,35,37,42,43` B6 | moved to `teatime` 2026-06-01, `_ID` → `moved-l361` | created 21:53 (teatime window); teatime 2026-06-01 was missing |
| 3 | `teatime` `_ID 306`, `t_date` = 2026-04-24, `12,18,24,25,30,41` B36 | `t_date` → 2026-04-17 | created 2026-04-17 21:53 (teatime window, right day); teatime 2026-04-17 was missing |

Moved rows keep their original `cct_created` / `cct_modified` and get a `moved-*` `_ID` so their
provenance stays visible. `_ID` is only used for log output by the sync script.

## Remaining duplicates (harmless)

Seven dates still carry two rows, but both rows are byte-identical, so the sync collapses them onto
one doc with no ambiguity: brunchtime 2026-04-05 / 2026-05-29, lunchtime 2025-08-25,
drivetime 2026-05-27 / 2026-06-09, teatime 2025-09-03 / 2026-04-23.

## Keeping this in sync

The real fix belongs upstream in WordPress. Once rows 1–3 are corrected there, re-pull with
`--from-url`, confirm the sync reports 0 conflicts, and this file can go away.
