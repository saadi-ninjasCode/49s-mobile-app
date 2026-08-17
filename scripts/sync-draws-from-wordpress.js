/**
 * Bulk sync: WordPress result dumps -> Firestore `draws` collection.
 *
 * Source of truth is the JSON in `draw_result/`, pulled from the WordPress
 * jet-cct REST API. We read the files rather than the live endpoint because the
 * files carry three hand-applied corrections for rows WordPress has filed under
 * the wrong draw type / date (see draw_result/FIXES.md). Re-pulling from the
 * endpoint would silently reintroduce those bugs, so `--from-url` is opt-in.
 *
 * Per .claude/rules/firestore.md:
 *  - Doc ID is deterministic: `${drawTypeId}_${YYYYMMDD}` (Europe/London civil date).
 *  - `date` is a UTC instant representing the scheduled London civil time
 *    (drawType.hour:minute on the draw's civil day) — NOT cct_created.
 *  - Every write includes `updatedAt: serverTimestamp()` (delta-sync contract).
 *  - Never hard-delete; this script only upserts.
 *
 * Date handling notes:
 *  - `{p}_date` (Unix seconds, midnight UTC of the draw day) is timezone-unambiguous
 *    and is what we derive the civil date from.
 *  - `cct_created` is wall-clock text with no timezone marker and reflects when
 *    the WP row was inserted, not when the draw happened — we ignore it for the
 *    `date` field, and use `cct_modified` only to order same-day duplicates.
 *
 * Writes are change-detected: a doc whose balls/specialBalls/date already match
 * Firestore is left alone. Blindly re-upserting the whole history would bump
 * `updatedAt` on every doc and force every installed app to re-download all of
 * it on next open.
 *
 * Usage:
 *   node scripts/sync-draws-from-wordpress.js --draw-type=lunchtime --dry-run
 *   node scripts/sync-draws-from-wordpress.js --draw-type=lunchtime
 *   node scripts/sync-draws-from-wordpress.js --draw-type=lunchtime --file=/tmp/other.json
 *   node scripts/sync-draws-from-wordpress.js --draw-type=lunchtime --from-url   # bypass local fixes
 */

const admin = require("firebase-admin");
const { fromZonedTime } = require("date-fns-tz");
const fs = require("fs");
const path = require("path");

const SERVICE_ACCOUNT_PATH = path.resolve(__dirname, "../firebase-admin-key.json");
const DATA_DIR = path.resolve(__dirname, "../draw_result");

/** Warn if the newest row in the source is older than this — stale or truncated feed. */
const STALE_AFTER_DAYS = 3;

const SOURCES = {
  brunchtime: {
    url: "https://uk49sresultstoday.co.za/wp-json/jet-cct/brunchtime_result",
    dateKey: "b_date",
    ballKeys: ["b1", "b2", "b3", "b4", "b5", "b6"],
    boosterKey: "bbooster",
  },
  lunchtime: {
    url: "https://uk49sresultstoday.co.za/wp-json/jet-cct/lunchtime_result",
    dateKey: "l_date",
    ballKeys: ["l1", "l2", "l3", "l4", "l5", "l6"],
    boosterKey: "lbooster",
  },
  drivetime: {
    url: "https://uk49sresultstoday.co.za/wp-json/jet-cct/drivetime_result",
    dateKey: "d_date",
    ballKeys: ["d1", "d2", "d3", "d4", "d5", "d6"],
    boosterKey: "dbooster",
  },
  teatime: {
    url: "https://uk49sresultstoday.co.za/wp-json/jet-cct/teatime_result",
    dateKey: "t_date",
    ballKeys: ["t1", "t2", "t3", "t4", "t5", "t6"],
    boosterKey: "tbooster",
  },
};

const USAGE = `Usage: node scripts/sync-draws-from-wordpress.js --draw-type=<${Object.keys(SOURCES).join("|")}> [--dry-run] [--file=PATH] [--from-url] [--force]`;

function parseArgs(argv) {
  // No default draw type on purpose: this is run one type at a time, and a
  // forgotten flag would otherwise silently sync the wrong one.
  const args = { drawType: null, dryRun: false, file: null, fromUrl: false, force: false };
  for (const a of argv.slice(2)) {
    if (a === "--dry-run") args.dryRun = true;
    else if (a === "--from-url") args.fromUrl = true;
    else if (a === "--force") args.force = true;
    else if (a.startsWith("--draw-type=")) args.drawType = a.slice("--draw-type=".length);
    else if (a.startsWith("--file=")) args.file = a.slice("--file=".length);
    else throw new Error(`Unknown argument '${a}'.\n${USAGE}`);
  }
  if (!args.drawType) throw new Error(`--draw-type is required.\n${USAGE}`);
  if (!SOURCES[args.drawType]) {
    throw new Error(`Unknown drawType '${args.drawType}'. Known: ${Object.keys(SOURCES).join(", ")}`);
  }
  return args;
}

function londonCivilDate(unixSeconds) {
  // en-CA gives "YYYY-MM-DD".
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/London",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(unixSeconds * 1000));
}

function buildDrawDocPayload(row, drawTypeId, drawType) {
  const civilDate = londonCivilDate(Number(row[drawType.dateKeySource])); // "YYYY-MM-DD"
  const yyyymmdd = civilDate.replace(/-/g, "");
  const docId = `${drawTypeId}_${yyyymmdd}`;

  const hh = String(drawType.hour).padStart(2, "0");
  const mm = String(drawType.minute).padStart(2, "0");
  // Interpret "YYYY-MM-DD HH:mm:00" as a wall-clock in drawType.timeZone, convert to UTC instant.
  const drawInstant = fromZonedTime(`${civilDate} ${hh}:${mm}:00`, drawType.timeZone);

  const balls = [...new Set(drawType.ballKeysSource.map((k) => Number(row[k])))]
    .filter((n) => Number.isFinite(n))
    .sort((a, b) => a - b);

  const specialBalls = [Number(row[drawType.boosterKeySource])].filter((n) => Number.isFinite(n));

  return {
    docId,
    civilDate,
    data: {
      gameId: drawType.gameId,
      drawTypeId,
      date: admin.firestore.Timestamp.fromDate(drawInstant),
      balls,
      specialBalls,
      pending: false,
      deletedAt: null,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
  };
}

async function readRows(args, source) {
  if (args.fromUrl) {
    console.warn("[sync] --from-url: reading the live endpoint, bypassing the local corrections in draw_result/FIXES.md");
    const res = await fetch(source.url);
    if (!res.ok) throw new Error(`WP fetch failed: ${res.status} ${res.statusText}`);
    return { rows: await res.json(), origin: source.url };
  }
  const file = args.file ?? path.join(DATA_DIR, `${args.drawType}_result.json`);
  if (!fs.existsSync(file)) throw new Error(`Source file not found: ${file}`);
  return { rows: JSON.parse(fs.readFileSync(file, "utf8")), origin: file };
}

const sameBalls = (a, b) =>
  Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((n, i) => n === b[i]);

/** True when Firestore already holds exactly this draw — nothing to write. */
function isUnchanged(snap, data) {
  if (!snap.exists) return false;
  const cur = snap.data();
  return (
    sameBalls(cur.balls, data.balls) &&
    sameBalls(cur.specialBalls, data.specialBalls) &&
    cur.date?.toMillis?.() === data.date.toMillis() &&
    cur.drawTypeId === data.drawTypeId &&
    cur.gameId === data.gameId &&
    cur.pending === data.pending &&
    (cur.deletedAt ?? null) === null
  );
}

async function main() {
  const args = parseArgs(process.argv);
  const source = SOURCES[args.drawType];

  const serviceAccount = require(SERVICE_ACCOUNT_PATH);
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  const db = admin.firestore();

  // Load the drawType doc — we need hour/minute/timeZone/gameId for the `date` field.
  const drawTypeSnap = await db.collection("drawTypes").doc(args.drawType).get();
  if (!drawTypeSnap.exists) {
    throw new Error(`drawTypes/${args.drawType} not found in Firestore. Seed drawTypes first.`);
  }
  const drawTypeData = drawTypeSnap.data();
  const drawType = {
    gameId: drawTypeData.gameId,
    hour: drawTypeData.hour,
    minute: drawTypeData.minute,
    timeZone: drawTypeData.timeZone,
    dateKeySource: source.dateKey,
    ballKeysSource: source.ballKeys,
    boosterKeySource: source.boosterKey,
  };

  console.log(`[sync] drawType=${args.drawType} schedule=${drawType.hour}:${String(drawType.minute).padStart(2, "0")} ${drawType.timeZone}`);

  const { rows, origin } = await readRows(args, source);
  console.log(`[sync] source=${origin}`);
  console.log(`[sync] received ${rows.length} rows`);

  // Process oldest -> newest by cct_modified so the freshest row wins on duplicate civil dates.
  rows.sort((a, b) => String(a.cct_modified).localeCompare(String(b.cct_modified)));

  // Collapse rows onto their target doc ID, and refuse to guess when two rows
  // claim the same civil date with different balls — that means a row is filed
  // under the wrong draw type or date upstream, and picking one silently would
  // both store a wrong result and hide a missing draw.
  const byDocId = new Map();
  const conflicts = [];
  let skipped = 0;

  for (const row of rows) {
    let built;
    try {
      built = buildDrawDocPayload(row, args.drawType, drawType);
    } catch (err) {
      console.warn(`[sync] error on row ${row._ID}: ${err.message}`);
      skipped++;
      continue;
    }
    if (built.data.balls.length !== source.ballKeys.length) {
      console.warn(`[sync] skip ${row._ID}: balls=${JSON.stringify(built.data.balls)} (expected ${source.ballKeys.length} unique)`);
      skipped++;
      continue;
    }
    const prev = byDocId.get(built.docId);
    if (prev && !(sameBalls(prev.data.balls, built.data.balls) && sameBalls(prev.data.specialBalls, built.data.specialBalls))) {
      conflicts.push({
        docId: built.docId,
        keeping: { id: row._ID, balls: built.data.balls, booster: built.data.specialBalls },
        dropping: { id: prev.rowId, balls: prev.data.balls, booster: prev.data.specialBalls },
      });
    }
    byDocId.set(built.docId, { ...built, rowId: row._ID });
  }

  if (conflicts.length) {
    console.error(`\n[sync] ${conflicts.length} conflicting duplicate date(s) — two rows, same civil date, different balls:`);
    for (const c of conflicts) {
      console.error(`  ${c.docId}`);
      console.error(`    keep  _ID ${c.keeping.id}  ${JSON.stringify(c.keeping.balls)} B${c.keeping.booster}  (newer cct_modified)`);
      console.error(`    drop  _ID ${c.dropping.id}  ${JSON.stringify(c.dropping.balls)} B${c.dropping.booster}`);
    }
    if (!args.force) {
      throw new Error("Refusing to guess. Fix the source data, or re-run with --force to take the newest row.");
    }
    console.warn("[sync] --force: taking the newest row for each conflict.\n");
  }

  const entries = [...byDocId.values()];
  const civilDates = entries.map((e) => e.civilDate).sort();
  const newest = civilDates[civilDates.length - 1];
  console.log(`[sync] ${entries.length} unique draws, ${civilDates[0]} -> ${newest}`);

  const ageDays = Math.floor((Date.now() - Date.parse(`${newest}T00:00:00Z`)) / 86_400_000);
  if (ageDays > STALE_AFTER_DAYS) {
    console.warn(`[sync] WARNING: newest draw is ${ageDays} days old — stale or truncated source?`);
  }

  // Change-detection: only write docs that are missing or actually differ.
  const READ_CHUNK = 300;
  const toWrite = [];
  let unchanged = 0;
  let created = 0;
  for (let i = 0; i < entries.length; i += READ_CHUNK) {
    const slice = entries.slice(i, i + READ_CHUNK);
    const snaps = await db.getAll(...slice.map((e) => db.collection("draws").doc(e.docId)));
    snaps.forEach((snap, j) => {
      const entry = slice[j];
      if (isUnchanged(snap, entry.data)) {
        unchanged++;
        return;
      }
      if (!snap.exists) created++;
      toWrite.push(entry);
    });
  }
  const updated = toWrite.length - created;
  console.log(`[sync] unchanged=${unchanged} new=${created} changed=${updated}`);

  if (args.dryRun) {
    for (const e of toWrite) {
      console.log(`[dry-run] would write draws/${e.docId}`, {
        balls: e.data.balls,
        specialBalls: e.data.specialBalls,
        date: e.data.date.toDate().toISOString(),
      });
    }
  } else {
    // Firestore batches are capped at 500 writes.
    const WRITE_CHUNK = 400;
    for (let i = 0; i < toWrite.length; i += WRITE_CHUNK) {
      const batch = db.batch();
      for (const e of toWrite.slice(i, i + WRITE_CHUNK)) {
        batch.set(db.collection("draws").doc(e.docId), e.data, { merge: true });
      }
      await batch.commit();
      console.log(`[sync]   committed ${Math.min(i + WRITE_CHUNK, toWrite.length)} / ${toWrite.length}`);
    }
  }

  console.log(`[sync] done. written=${args.dryRun ? 0 : toWrite.length} skipped=${skipped} unique-draws=${entries.length} dryRun=${args.dryRun}`);
  await admin.app().delete();
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
