---
paths:
  - "src/**/*.{ts,tsx}"
  - "app/**/*.{ts,tsx}"
---

# Restrictions — "Do NOT" list

Quick-reference list of project-wide don'ts. Topic files go into detail; this is the consolidated lookup.

## Code location

- ❌ Add reusable components under [src/screen/<Name>/](../../src/screen/) — every reusable visual piece goes in [src/components/](../../src/components/). → See [components.md](./components.md), [screens.md](./screens.md).
- ❌ Put screen files outside [src/screen/](../../src/screen/) (singular `screen`, not `screens` / `pages`).
- ❌ Put shared utilities anywhere other than [src/utilities/](../../src/utilities/). No component-level `utils.ts` files.
- ❌ Put data-access code anywhere other than [src/services/db/](../../src/services/db/) (SQLite repos), [src/services/firestore.ts](../../src/services/firestore.ts), and [src/services/sync/](../../src/services/sync/).
- ❌ Put route entries anywhere other than thin wrappers under [app/](../../app/) — they import the actual screen from [src/screen/](../../src/screen/). → See [screens.md](./screens.md).

## Styling & theming

→ Full rules in [theme.md](./theme.md).

- ❌ Define `StyleSheet.create` in the component file. Style hooks live in `styles.ts` (a `useStyles()` hook).
- ❌ Hardcode colors, hex, or `rgba(...)` in components or styles. Use `useTheme() as NavigationTheme` and read semantic keys from `colors.*`.
- ❌ Reference raw `COLORS` directly in UI code. UI reads semantic keys from the theme.
- ❌ Apply inline color styles via `style={{ color: ... }}` in JSX. Define a named style in `styles.ts`, then reference `styles.xyz`.
- ❌ Import `colors` from [src/utilities/](../../src/utilities/) — that file is a deprecated shim and slated for removal. Use `useTheme()`.
- ❌ Use raw pixel numbers for `fontSize`, `padding*`, `margin*`, `width`, `height`, `borderRadius`, `borderWidth`. Use `scale()` from [src/utilities/scaling.ts](../../src/utilities/scaling.ts) and the `alignment.*` helpers from [src/utilities/alignment.ts](../../src/utilities/alignment.ts).
- ❌ Hardcode `fontFamily` strings. Read from `Fonts.*` in [src/theme/fonts.ts](../../src/theme/fonts.ts) (or `Outfit.*`).
- ❌ Mix `fontFamily: "Outfit-Medium"` with `fontWeight: "500"` on the same text — pick one (the family).
- ❌ Bake alpha into `shadowColor`. Use opaque color + `shadowOpacity`. Exception: `textShadowColor` may include alpha because RN has no `textShadowOpacity`.
- ❌ Use NativeWind / Tailwind / shadcn. Pure `StyleSheet` + theme only.

## Types

→ Full rules in [typescript.md](./typescript.md).

- ❌ Define `interface`, `type`, or type alias inside `.tsx` / `.ts` component, screen, or hook files (except truly one-off non-exported locals).
- ❌ Omit `readonly` on component / screen prop fields.
- ❌ Import from a `.d.ts` file in application code — ambient types are already global.
- ❌ Skip `declare global { ... } export {};` for new ambient `.d.ts` files — the existing [src/theme/Theme.d.ts](../../src/theme/Theme.d.ts) is the canonical pattern.
- ❌ Silence errors with `@ts-ignore`. Use `@ts-expect-error` with a reason, or fix the type.
- ❌ Use `any` where `unknown` + narrowing works.
- ❌ Prefix interfaces with `I` (`IGame`). Plain PascalCase only.
- ❌ Rename [src/Types/](../../src/Types/) — PascalCase folder is the existing convention.

## Components

→ Full rules in [components.md](./components.md).

- ❌ Put multiple components in one file. **Strictly one component per file**, default-exported. Item renderers (`MenuItem`, `Row`, `Card`), sub-sections, list rows all live in their own folder under [src/components/](../../src/components/).
- ❌ Use a named export for the main component.
- ❌ Create screen-local components — everything visual goes in [src/components/](../../src/components/).
- ❌ Mix `Pressable` and `TouchableOpacity` arbitrarily within one component. `Pressable` with `android_ripple` is the project standard (see [src/components/MainCard/MainCard.tsx:79](../../src/components/MainCard/MainCard.tsx#L79)); `TouchableOpacity` is fine where you only need opacity feedback.
- ❌ Add **required** new props to existing shared components. New props must be optional with a default — backward compatibility first.

## Screens & navigation

→ Full rules in [screens.md](./screens.md).

- ❌ Add flat single-file screens directly under [src/screen/](../../src/screen/). Every screen is a folder.
- ❌ Put reusable components under a screen folder — they go in [src/components/](../../src/components/).
- ❌ Define `StyleSheet.create` or types inline in the screen `.tsx`.
- ❌ Add a second drawer / stack navigator outside the root one in [app/_layout.tsx](../../app/_layout.tsx) unless the design genuinely requires it.
- ❌ Hardcode the same route string in many places. `router.push({ pathname: "/<route>" })` is fine in one component; if a route name appears in 3+ places, extract a constant.
- ❌ Put navigation logic in components — keep it in screens or in `use<ScreenName>.ts` hooks.

## Data & persistence

→ Full rules in [firestore.md](./firestore.md).

- ❌ Use `addDoc(...)` (auto-IDs) for any collection — write deterministic IDs with `setDoc(doc(db, "<col>", id), data, { merge: true })`.
- ❌ Re-enable Firestore offline persistence — SQLite is the canonical local store; the two caches would diverge.
- ❌ Write to `games/{id}` without including `updatedAt: serverTimestamp()`. The client's delta-sync uses it as a watermark; missing values silently drop the doc.
- ❌ Store the Firestore doc ID inside the doc's own fields. The ID is the key; map it onto `_id` when reading.
- ❌ Query by ID when you already know the ID — use `getDoc(doc(db, "<col>", id))`, not a `where` query.

## Assets

- ❌ Put assets anywhere other than [assets/](../../assets/) at the repo root.
- ❌ Add new imports from `react-native-vector-icons`. Use `@expo/vector-icons` — it's already what the project uses (FontAwesome5 across [app/_layout.tsx](../../app/_layout.tsx) and components).
- ❌ Cross-mix icon sets within one UI context. Pick one set per screen / context and stay consistent.
- ❌ Render raw `<svg>` DOM elements in TSX — import the `.svg` as a component.
- ❌ Use percentage `width` / `height` on the root of a custom `.svg`. Use fixed numbers matching `viewBox`.
- ❌ Ship OTF fonts. TTF only.

## Naming

- ❌ kebab-case or snake_case for TypeScript files / folders / symbols.
- ❌ `MyComponent.styles.ts` — always `styles.ts`.
- ❌ Mix camelCase and PascalCase conventions within the same folder.
- Convention: **PascalCase** for component / screen folder names and main `.tsx` files; **camelCase** for utility / service / hook `.ts` files; `styles.ts` is always lowercase.

## Cross-platform

- ❌ Use web/DOM APIs (`window`, `document`, `localStorage`) without a platform check or web-specific file. Prefer `expo-secure-store`, `AsyncStorage`, `Platform.OS`.
- ❌ Add `Capacitor`-specific code. This is an Expo project.
- ❌ Assume iOS-only APIs work on Android — guard with `Platform.OS === "ios"` and provide a fallback.

## Version control

- ❌ Skip hooks (`--no-verify`) when committing.
- ❌ Commit `.env`, `google-services.json`, `GoogleService-Info.plist`, keystores (`*.jks`, `*.keystore`), or provisioning profiles. Check before `git add`.
- ❌ Use a commit message format that doesn't match the repo. Recent commits use Conventional-Commit-style prefixes: `feat:`, `refactor:`, `docs:`, `fix:`. Match that.
