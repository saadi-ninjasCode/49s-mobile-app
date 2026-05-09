# Firestore Rules (Collections, Document IDs, Fields)

How Firestore is structured for this app, and the conventions to follow when adding new collections or documents. Optimised for **deterministic IDs** (no auto-IDs) so writes are idempotent and lookups don't need queries.

## Top-level collections

| Collection | Doc ID pattern |
|------------|----------------|
| [`games`](#games) | hard-coded slug |
| [`drawTypes`](#drawtypes) | hard-coded slug |
| [`draws`](#draws) | composite: `{drawTypeId}_{YYYYMMDD}` |

## ID convention — the rule

**Document IDs are deterministic, not auto-generated.** Pick the form that matches the doc's identity:

1. **Single canonical entity** → kebab-case slug constant in code (e.g. `forty-nines`).
2. **Enum-like row** → lowercase slug of the name (e.g. `lunchtime`).
3. **Time-series row** → composite `{parentSlug}_{YYYYMMDD}` (e.g. `lunchtime_20260508`).
4. **Externally-keyed row** → use the external key verbatim as the ID (e.g. a Stripe customer ID).

**Do not use `addDoc(...)`** (auto-IDs) for anything that should be re-runnable or directly lookup-able. Auto-IDs make repeated writes create duplicates instead of merging.

### Why deterministic IDs

- **Idempotent writes** — `set(ref, data, { merge: true })` upserts cleanly. Re-running the same write on the same day overwrites that day's row rather than adding a second one.
- **Direct reads without queries** — `doc(db, "draws", "lunchtime_20260508")` is one round trip; `where("drawTypeId", "==", ...).where("date", "==", ...)` needs a composite index.
- **Stable references** — FK fields like `drawTypeId: "lunchtime"` are human-readable in the console and stay stable across writes.

## Per-collection schema

### `games`

- **ID**: kebab-case slug. Currently only `forty-nines`.
- **Fields**:
  - `name: string`
  - `icon_name: string`
  - `mainBallCount: number`
  - `mainBallMax: number`
  - `specialBallCount: number`
  - `specialBallMax: number`
  - `hotBall: { ball: number; times: number }[]`
  - `coldBall: { ball: number; times: number }[]`
  - `updatedAt: Timestamp` — see write invariant below

#### Write invariant

Every server-side write to `games/{id}` **must** include `updatedAt: serverTimestamp()` (or a server-monotonic equivalent). The client's delta-sync (`refreshGamesIfStale` in [src/services/firestore.ts](../../src/services/firestore.ts)) uses `where("updatedAt", ">", localMax)`; docs missing `updatedAt` are silently skipped by Firestore, and non-monotonic timestamps cause clients to miss updates. Treat `updatedAt` as part of the write contract, not a derived field.

### `drawTypes`

- **ID**: lowercase slug of the schedule name. Current set: `brunchtime`, `lunchtime`, `drivetime`, `teatime`.
- **Fields**:
  - `gameId: string` — FK to `games/{id}`
  - `name: string` — display name (`"Lunchtime"`)
  - `icon_name: string`
  - `hour: number` — local hour in `timeZone`
  - `minute: number`
  - `timeZone: string` — IANA zone, e.g. `"Europe/London"`

### `draws`

- **ID**: `` `${drawTypeId}_${YYYYMMDD}` ``.
  - Examples: `lunchtime_20260508`, `teatime_20260508`.
  - The `YYYYMMDD` portion is **always the Europe/London civil date** of the draw, regardless of the writer's local timezone.
- **Fields** (mirrored in the `DrawDoc` type at [src/services/firestore.ts](../../src/services/firestore.ts)):
  - `gameId: string`
  - `drawTypeId: string` — FK; queries filter on this
  - `date: Timestamp` — the draw's scheduled instant, expressed as Europe/London local time (`hour`/`minute` from the drawType, on the day matching the ID's `YYYYMMDD`).
  - `balls: number[]` — sorted ascending, unique
  - `specialBalls: number[]` — booster ball(s); excluded from `balls`
  - `pending: boolean`

## Client-side mapping

Firestore doc IDs are surfaced as `_id` on domain objects:

```ts
// src/services/firestore.ts
const drawFromDoc = (id, data) => ({ _id: id, ...mappedFields });
```

Always copy `snap.id` into `_id` when reading. Do **not** also store the ID inside the doc data — it's already the doc key. Exception: FK fields (e.g. `drawTypeId` on a `draws` doc) are stored explicitly because they're queried.

## Adding a new collection

1. Pick an ID pattern from the four forms above. If none fits, that's a signal the schema needs another look.
2. Add the read path to [src/services/firestore.ts](../../src/services/firestore.ts):
   - List → `getDocs(collection(db(), "<name>"))`
   - One known doc → `getDoc(doc(db(), "<name>", id))`
   - Live updates → `onSnapshot(query(...))` writing through to SQLite, the way `startDashboardSync` does.
3. If clients should read offline, add a SQLite mirror under [src/services/db/](../../src/services/db/) and write through on snapshot — Firestore's built-in cache is **disabled** ([firestore.ts:28](../../src/services/firestore.ts#L28)), SQLite is the canonical local store.

## `collection()` vs `doc()` — quick reference

| Want… | Call | Path segments |
|-------|------|---------------|
| The whole collection | `collection(db(), "draws")` | odd (1) |
| One known document | `doc(db(), "draws", id)` | even (2) |
| Subcollection on a doc | `collection(db(), "users", uid, "posts")` | odd (3) |

Rule: paths alternate `collection / doc / collection / …`. `collection(...)` ends on a collection name (odd count), `doc(...)` ends on a doc ID (even count). Mismatched counts throw at runtime.

## Anti-patterns

- ❌ `addDoc(collection(db(), "draws"), data)` — produces an auto-ID. Use `setDoc(doc(db(), "draws", buildDrawId(...)), data)`.
- ❌ Storing the doc ID inside the doc's own fields (e.g. `{ _id: "lunchtime", ... }`). It's already the key.
- ❌ Querying for a doc whose ID you already know — read it directly with `getDoc(doc(...))`.
- ❌ Re-enabling Firestore's offline persistence without removing the SQLite mirror first — the two caches will diverge.
- ❌ Writing to `games/{id}` without bumping `updatedAt: serverTimestamp()`. Breaks the client's delta watermark.
- ❌ Computing the `YYYYMMDD` portion of a draws ID, or the `date` field on a draws doc, from system-local time or UTC. Both must be derived from **Europe/London** (e.g. via `Intl.DateTimeFormat("en-CA", { timeZone: "Europe/London" })`). Mixed-timezone writers will otherwise produce two IDs for the same draw, or land the timestamp on the wrong civil day. **Note**: this rule does *not* apply to `updatedAt` on `games/{id}` — that stays `serverTimestamp()` (see the write invariant above).
