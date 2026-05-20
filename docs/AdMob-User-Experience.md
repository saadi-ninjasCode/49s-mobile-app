# UK 49's Results — In-App Ads: User Experience Guide

*A non-technical walkthrough of every ad shown in the app, when each one appears, how often, and what the user can do about it. Prepared for client review.*

---

## 1. What kinds of ads will the app show?

The app will use six different ad types from Google AdMob. Each one has a specific job and a specific moment to appear. They're not all on screen at once — most users will only see two or three on any given visit.

| Ad type | What it looks like | Who triggers it |
|---|---|---|
| **Banner** | Small horizontal strip at the bottom of a screen. Always visible while the user is on that screen. | The app — appears automatically. |
| **Interstitial** | Full-screen ad that briefly covers the app. User taps "X" to close. | The app — appears at certain navigation points. |
| **Rewarded** | Full-screen video ad. User chooses to watch it in exchange for a benefit. | The user — only plays if the user taps "Watch Ad". |
| **Rewarded Interstitial** | Full-screen ad with an intro screen explaining the reward first. | The user — must tap "Continue" before the ad plays. |
| **Native** | Looks like a regular card inside a list (e.g. blends in with the draw cards), but labelled "Ad". | The app — appears at fixed positions inside lists. |
| **App Open** | Full-screen ad shown when re-entering the app after being away. | The app — appears on returning to the app, with limits. |

---

## 2. The first time someone opens the app

Three short steps before any ad ever appears:

**Step 1 — 18+ confirmation.**  
On the very first launch, a screen asks "Are you 18 or older?" with two buttons.
- If the user taps **"I'm 18 or older"** — the app continues normally.
- If the user taps **"I'm under 18"** — the app shows a friendly message explaining it's only for adults and disables all ads forever on that device. The user can still read the Privacy Policy but cannot use the rest of the app.

The user is asked this **only once per install**. The answer is remembered.

**Step 2 — Consent dialog (UK & EU users only).**  
Users in the United Kingdom and European Union see a Google consent dialog explaining what data may be used for ads. They can choose:
- **"Consent"** — they'll see personalised ads.
- **"Manage Options"** — they can opt out of personalised ads but will still see generic, non-personalised ads.

Users outside the UK/EU do not see this dialog at all.

**Step 3 — iPhone tracking permission (iPhone only).**  
On iPhone, Apple shows its own "Allow this app to track" prompt once. This is Apple's standard system dialog and we cannot change the wording, only when it appears.

Once these steps are done, the user reaches the main app and they're never shown again.

---

## 3. Where banner ads appear

Banner ads sit at the bottom of these screens:

- **Results (home screen)** — beneath the disclaimer text, at the very bottom of the list.
- **Draw Details** — fixed at the bottom while the user browses historical results.
- **Hot & Cold (statistics)** — fixed at the bottom of the stats list.
- **Number Generator** — beneath the "Create" button.

**Banner ads do NOT appear on:**

- Notifications screen
- Privacy Policy
- Terms & Conditions
- Settings
- The 18+ confirmation
- The under-18 dead-end screen

The banner is always separated from any button or tappable element by a small visible gap, so users cannot accidentally tap it. The banner image automatically refreshes itself with a new ad every minute while the user stays on that screen.

---

## 4. When full-screen interstitial ads appear

These are the brief full-screen ads that the user closes with an "X". They only appear at natural pause-points in the user's flow — never in the middle of doing something.

### Trigger points

| User action | How often it triggers an interstitial |
|---|---|
| Tapping a draw card on the home screen to view details | Every **3rd time** in a session — not on the 1st or 2nd. |
| Tapping "Create" in the Number Generator | Every **4th** generation, and **never** on the first generation of a session. |

### Frequency rules (the user will never see more than this)

- **At least 2 minutes** must pass between any two full-screen ads (whether interstitial, rewarded, or App Open). No exceptions.
- **At least 3 clicks** of navigation must happen between any two interstitials — they can't fire back-to-back.
- **Maximum 4 interstitials per session.** A session ends when the user backgrounds the app for a long period.
- If a banner ad has just shown, an interstitial is skipped for 5 seconds.
- If the user just toggled a setting or notification preference, ads are paused for 30 seconds out of respect.

### What the user does

The interstitial appears, the user taps the "X" in the corner (or waits the SDK-mandated countdown), and is returned exactly where they were going.

### What does NOT trigger an interstitial

- Pulling down to refresh
- Changing a date filter on Draw Details
- Pressing Back
- Opening the side drawer menu

---

## 5. Rewarded ads — optional, opt-in

Rewarded ads are 100% the user's choice. They only ever play if the user actively taps a "Watch Ad" button after reading a short confirmation message. They are **never forced**.

### The three rewards available

| Where | Offer | What the user gets |
|---|---|---|
| Number Generator | "Get 5 extra spins" | 5 additional generations on top of the daily allowance, used immediately. |
| Hot & Cold statistics | "Unlock the 90-day deep breakdown" | Access to a more detailed stats view for the next **24 hours**. |
| Banner ad area (anywhere) | "Remove banner ads for 1 hour" | All banners hidden across the entire app for **60 minutes**. |

### What the user sees, in order

1. The user taps a "Watch Ad" button.
2. A small popup says: *"You'll see a video ad. Reward: \[the reward]."* with two buttons — **Watch Ad** and **No Thanks**.
3. If they tap **No Thanks**, nothing happens.
4. If they tap **Watch Ad**, the video plays (usually 15–30 seconds, with a skip option after a few seconds depending on the ad).
5. When the ad finishes, the reward is applied and the user sees a "You earned: \[reward]" confirmation.

If the user backs out of the ad before it ends, **the reward is still granted as long as they watched the minimum required portion** (controlled by Google).

---

## 6. Rewarded Interstitial — one specific spot only

This is a hybrid: it appears like an interstitial but offers a reward.

**Where:** Once during a longer session (max once every 30 minutes), on the home → Draw Details navigation, the app may offer:
> "Skip ads on the Draw screen for the next 10 minutes — watch a short ad to unlock."

The user sees an intro screen with two clear buttons: **Continue** or **No Thanks**. If they tap **No Thanks**, the navigation continues normally with no ad. If they tap **Continue**, they watch the ad and earn a 10-minute ad-free window on the Draw Details screen.

---

## 7. Native ads — woven into lists

Native ads are designed to feel less interruptive. They appear as cards inside the existing lists, styled to match the app's look — but they always carry a visible **"Ad"** label in the corner, as Google requires.

**Where native ads appear:**

| Screen | Frequency |
|---|---|
| Home (Results list) | One ad card after the first 3 draw cards, then one every 5 cards from then on. |
| Draw Details (history list) | One every 10 historical results. |
| Hot & Cold (stats) | One ad section after the first game's section. |

Tapping a native ad opens the advertiser's link in the browser, just like any other ad.

---

## 8. App Open ads — only on return, never on first open

These ads cover the full screen the moment the app becomes visible.

### Strict rules for when App Open ads appear

- ❌ **Never on the very first launch of the day** — the user is already waiting through the splash screen, an ad on top would feel hostile.
- ❌ **Never within 60 seconds** of opening the app fresh from cold.
- ❌ **Never when the user opens the app by tapping a notification** — they came for a specific reason, we respect that.
- ❌ **Never if the user backgrounded the app for less than 30 seconds** — that's just switching apps briefly, not a "fresh visit".
- ❌ **Never more than once every 4 minutes**.
- ✅ **Yes**, when the user returns to the app after being away 30+ seconds and up to 4 hours (after that the ad expires and a new one needs to load).

The user sees the ad, taps the "X" to close it, and lands on the screen they were on when they left.

---

## 9. Settings — the user's controls

The Settings drawer entry gives users full control:

- **Theme** — light / dark / system.
- **Notification preferences** — link to the notification settings.
- **Manage ad preferences** — re-opens the consent dialog from step 2 above, so users can change their mind about personalised ads at any time. (Google requires this.)

When a user removes consent via this control, the app immediately switches to non-personalised ads with no restart needed.

---

## 10. The full journey, end-to-end

### Day 1, first-time UK user, brand new install:

1. Splash logo (≈ 1 second).
2. **"Are you 18 or older?"** modal. Taps **Yes**.
3. **Google consent dialog**. Taps **Consent**.
4. (iPhone only) **Apple tracking prompt**. Taps **Allow**.
5. Home screen appears. **Banner ad** at the bottom.
6. Scrolls past 3 draw cards, sees a **native ad** card. Scrolls on.
7. Taps "Lunchtime" card. Navigates to Draw Details. (1st draw open — no interstitial.)
8. Goes back, taps "Teatime". (2nd open — no interstitial.)
9. Goes back, taps "Brunchtime". (3rd open — **interstitial** appears, taps X, lands on Draw Details.)
10. Switches to Number Generator. Taps "Create" 4 times. The 4th time → **interstitial** (since it's > 2 min after the previous one).
11. Finishes, closes the app.

### Day 1, two hours later, same user reopens the app:

1. **App Open ad** appears (return after 30s+ away).
2. Taps X, lands on the screen they last had open.
3. On the Generator screen, taps **"Watch ad for 5 extra spins"** → confirmation popup → **Watch Ad** → video plays → reward granted, "+5 spins" confirmation.
4. Continues using the app, banner still visible.

### Day 1, ten minutes later, taps a push notification:

1. App opens directly to the notified draw. **No App Open ad** (push entry suppresses it).

### Throughout the day:

- Maximum **4 interstitials** total.
- Banners refresh themselves every 60 seconds while visible.
- Native ads appear once per list scroll-through, never repeat themselves mid-scroll.
- Rewarded ads only ever play if the user explicitly opts in.

---

## 11. Summary table — at a glance

| Format | First-time appearance | Frequency afterwards | User control |
|---|---|---|---|
| Banner | After age gate + consent, on Results/Draw/Hot&Cold/Generator screens | Refreshes every 60s while visible | Watch a rewarded ad to remove for 1 hour |
| Interstitial | After 3rd draw-card tap **or** 4th generation, whichever comes first | At least 2 min between any two; max 4 per session | Auto-close after a few seconds |
| Rewarded | Only when user taps "Watch Ad" | User decides | Always optional |
| Rewarded Interstitial | Once per 30 min, replaces an interstitial | Max once per 30 min | "No Thanks" button |
| Native | After 3rd item on home list; every 10th on history list | Embedded in lists, scroll-only | Just scroll past |
| App Open | First time the app is resumed (not opened) after 30s+ background | At least 4 min apart, never on cold start, never on notification entry | Auto-close button |

---

## 12. What we do to keep users happy (and Google happy)

- **An 18+ gate** before any lottery content or ads are shown.
- **Clear "Ad" labels** on every ad — required by Google for native ads.
- **A 24-pixel safety margin** between every ad and any button, to prevent accidental taps.
- **No ads on sensitive screens** (Privacy, Terms, Settings, Notifications).
- **No ads on app exit** — we never interrupt someone trying to leave.
- **No ad immediately after a destructive action** (changing a setting, toggling a notification) — 30-second cool-off.
- **A "Manage ad preferences"** entry in Settings so users can change consent at any time.
- **A non-blocking message** the first time the user opens the version-with-ads update: *"Ads help keep this app free."* — shown once, never again.
- **Real ads only in the production app.** During development and testing, Google's test creatives are used, so no real revenue is generated by the dev team accidentally tapping ads.

---

## 13. What this means for revenue vs. user experience

Our priorities, in order:

1. **Don't make the user uninstall.** Every single frequency cap exists for this reason. We start conservative and only loosen if data shows users aren't bothered.
2. **Don't get flagged by Google Play.** The 18+ gate, the disclaimer, the MA content rating, the privacy policy update — all built in.
3. **Don't get flagged by AdMob.** No accidental clicks, no stacking, no ads on consent screens, clear labels.
4. **Then maximise revenue.** Within the above three boundaries, we use all six ad formats so that no single format has to work too hard.

This is the standard Google-recommended approach for a freemium app showing gambling-adjacent content, and matches the strategy used by other lottery-results apps in the UK & EU markets.
