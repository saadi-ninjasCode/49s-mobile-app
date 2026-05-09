---
paths:
  - "src/**/*.{ts,tsx}"
  - "app/**/*.{ts,tsx}"
---

# Screens

## Routing — Expo Router with Drawer

Navigation is **Expo Router** with a single drawer navigator declared in [app/_layout.tsx](../../app/_layout.tsx). The drawer renders [src/components/SideBar/](../../src/components/SideBar/) as its custom drawer content.

How routes are wired:

- Each `<Drawer.Screen name="<route>">` in [app/_layout.tsx](../../app/_layout.tsx) corresponds to a file at [app/<route>.tsx](../../app/).
- Files under [app/](../../app/) are **thin wrappers** — they import the actual screen from [src/screen/](../../src/screen/) and render it. See [app/draw.tsx](../../app/draw.tsx) for an example that also wires `useLayoutEffect` to set a back button via `navigation.setOptions`.
- The default `headerShown` behaviour and theming come from `screenOptions` on the root `<Drawer>`.

Imperative navigation: use `useRouter()` from `expo-router`. Pass params via `router.push({ pathname, params })`:

```tsx
const router = useRouter();
router.push({ pathname: "/draw", params: { gameId, drawTypeId, name, from: "card" } });
```

See [src/components/MainCard/MainCard.tsx:27](../../src/components/MainCard/MainCard.tsx#L27).

Inside a route file, read params with `useLocalSearchParams<{ ... }>()` — see [app/draw.tsx:10](../../app/draw.tsx#L10).

## Every screen is its own folder

Screens live under [src/screen/](../../src/screen/) — note the **singular** `screen`, not `screens` or `pages`. No flat single-file screens at the top level of `src/screen/`.

```
src/screen/
├── Main/
│   ├── Main.tsx
│   └── styles.ts
├── Draw/
│   ├── Draw.tsx
│   └── styles.ts
├── BallFrequency/
│   ├── BallFrequency.tsx
│   └── styles.ts
├── Generator/
├── Notification/
├── Privacy/
├── Condition/
└── Stub/
```

Rules:

- Folder name **PascalCase**, matching the screen component (`Main/`, `Draw/`, `BallFrequency/`).
- Main file matches the folder: `Main/Main.tsx`, `Draw/Draw.tsx`.
- Styles always `styles.ts`.
- `use<ScreenName>.ts` — optional logic hook, added when state/effects are non-trivial.
- `index.ts` — optional default re-export. Most screens don't have one; the `app/` wrapper imports the screen file directly: `import Draw from "../src/screen/Draw/Draw"`.

## Screen contents

For screens that are more than trivial JSX:

- **`<ScreenName>.tsx`** — JSX, prop destructuring, calls into the hook, renders.
- **`use<ScreenName>.ts`** — state, effects, repo calls (from [src/services/db/](../../src/services/db/)), Firestore listeners, handler memoisation, navigation. Push everything non-JSX here.
- **`styles.ts`** — `useStyles()` hook returning a memoised `StyleSheet.create(...)`. See [theme.md](./theme.md).
- **`index.ts`** — optional default re-export.

Logic, side effects, and data access belong in the hook. If a `useEffect` is non-trivial or multiple repo calls are composed in the screen file, extract `use<ScreenName>.ts`.

## No screen-local components

There are **no** screen-local reusable components. Any visual piece — however screen-specific it feels — belongs in [src/components/](../../src/components/). A screen folder contains only the screen itself: `<Name>.tsx`, `styles.ts`, optional `use<Name>.ts`, optional `index.ts`. Nothing else.

If you want a sub-component "just for this screen", add it to [src/components/](../../src/components/) with generic props — then use it from the screen. See [components.md](./components.md).

## Prop types

Screen prop types follow the same rules as components: `readonly` on every field, declared ambiently in [src/Types/](../../src/Types/) — never inline in the `.tsx`. See [typescript.md](./typescript.md).

For routes that take params via Expo Router, type them at the call site of `useLocalSearchParams<{...}>()` in the [app/](../../app/) wrapper — see [app/draw.tsx:10](../../app/draw.tsx#L10).

## Adding a new screen

1. Create the folder: [src/screen/<Name>/](../../src/screen/) with `<Name>.tsx` and `styles.ts`.
2. Create the route wrapper: [app/<route>.tsx](../../app/) — import the screen, render it, optionally call `navigation.setOptions` for header tweaks. Follow [app/draw.tsx](../../app/draw.tsx) as a template.
3. Register the route in [app/_layout.tsx](../../app/_layout.tsx):
   ```tsx
   <Drawer.Screen name="<route>" options={{ title: "Display Name" }} />
   ```
   To hide a sub-route from the drawer (e.g. a detail screen that's only navigated to from a card), add `drawerItemStyle: { display: "none" }` — see the `draw` entry.
4. Navigate to it with `router.push({ pathname: "/<route>", params: { ... } })`.

## Drawer / header options

Drawer-level defaults are set in `screenOptions` on the root `<Drawer>` in [app/_layout.tsx](../../app/_layout.tsx). Per-screen overrides go in the `options` prop of `<Drawer.Screen>`:

| Need | `options` |
|---|---|
| Set the drawer label / header title | `{ title: "Results" }` |
| Hide from drawer list | `{ drawerItemStyle: { display: "none" } }` |
| Custom header left (back button, etc.) | Use `useLayoutEffect` + `navigation.setOptions` inside the route wrapper — see [app/draw.tsx:30](../../app/draw.tsx#L30) |
| Custom drawer content | Already wired via `drawerContent={renderDrawerContent}` rendering [src/components/SideBar/](../../src/components/SideBar/) |

Theme-aware colors (`headerStyle`, `drawerStyle`, `drawerActiveTintColor`, etc.) come from `useTheme() as NavigationTheme` — never hardcoded. See [theme.md](./theme.md).

## Do NOT

- Add flat single-file screens directly under [src/screen/](../../src/screen/) — every screen is a folder.
- Add reusable components under a screen folder — they go in [src/components/](../../src/components/).
- Define `StyleSheet.create` or types inline in the screen `.tsx`.
- Put screen files outside [src/screen/](../../src/screen/).
- Add a second navigation stack/drawer outside the root one in [app/_layout.tsx](../../app/_layout.tsx) unless the design genuinely requires it.
- Hardcode route strings in many places — `router.push({ pathname: "/<route>" })` is fine in one component, but if a route name appears in 3+ places, extract a constant.
