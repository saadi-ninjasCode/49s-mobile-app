---
paths:
  - "src/**/*.{ts,tsx}"
  - "app/**/*.{ts,tsx}"
---

# Components

## Where reusable components live

All reusable components live under [src/components/](../../src/components/). This is a single Expo app — there is no monorepo, no `packages/*`, and no atomic-design tier split (no `atoms/` / `molecules/` / `organisms/`). Just one flat folder with one folder per component.

A screen that needs a piece of UI gets it from `src/components/`. If it doesn't exist there, **add it there** — never under the screen folder. See [screens.md](./screens.md) for the screen-side rule.

## Folder pattern

Every component is its own folder, **PascalCase**, matching the main component name:

```
src/components/MyComponent/
├── MyComponent.tsx    # the component (default export)
├── styles.ts          # useStyles() hook — see theme.md
├── useMyComponent.ts  # optional — logic hook (only when non-trivial)
└── index.ts           # optional barrel — see below
```

Rules:

- Folder name **PascalCase** matching the main component name: `MainCard/`, `DrawCard/`, `Counter/`, `BootSplash/`.
- Main file matches the folder: `MainCard/MainCard.tsx`.
- Styles file is **always** `styles.ts` — never `MyComponent.styles.ts`. See [theme.md](./theme.md).
- `index.ts` is optional. It's required when the folder exposes multiple items (e.g. [src/components/Text/index.ts](../../src/components/Text/index.ts) exports `TextDefault` and `TextError`; [src/components/ListState/index.ts](../../src/components/ListState/index.ts) exports `EmptyView`, `ErrorView`, `FooterLoader`, `InlineErrorBanner`, `LoadingView`). For a single-default-export component, callers can import from `./MyComponent/MyComponent` directly — `index.ts` is not required.
- Existing examples: [src/components/MainCard/](../../src/components/MainCard/), [src/components/DrawCard/](../../src/components/DrawCard/), [src/components/Counter/](../../src/components/Counter/), [src/components/SideBar/](../../src/components/SideBar/), [src/components/BootSplash/](../../src/components/BootSplash/).

## One component per file

**Each `.tsx` file defines exactly one React component.** No inline `function MenuItem(...)` definitions inside another component's file, no "tiny helper" carve-outs.

What counts as a component (and needs its own folder):

- Item renderers (`MenuItem`, `Row`, `Card`, `ListItem`).
- Sub-headers, sub-footers, sub-sections.
- Anything you'd `useCallback` over because it's rendered in a `.map()`.
- Any function that returns JSX.

What is **not** a component and may stay inline:

- Pure data transformations (e.g. `leftItemKey(item, idx) => string`).
- Style builders (e.g. `getButtonStyle(variant) => ViewStyle`).
- Constants and helper objects.
- A single inline JSX value (`const Spacer = <View style={...} />` is fine — it's a value, not a function).

If a sub-component is single-use today, it still goes in its own `src/components/<Name>/` folder. The cost of doing it right from day one is zero; the cost of extracting later is real.

## Default export

The main component is always the default export:

```tsx
function MainCard(props: Readonly<DashboardEntry>) {
  // ...
}
export default React.memo(MainCard);
```

`React.memo` wrap is appropriate when the component renders inside a `.map()` or `FlatList` — see [src/components/MainCard/MainCard.tsx:97](../../src/components/MainCard/MainCard.tsx#L97). Named exports are fine for utilities inside the component folder; the main component stays default-exported.

## Props are `readonly`

Every prop field must be `readonly`. Both forms are accepted:

```ts
// ✅ interface form
interface CounterProps {
  readonly hour: number;
  readonly minute: number;
  readonly timeZone: string;
}

// ✅ Readonly<> wrapper
type CounterProps = Readonly<{
  hour: number;
  minute: number;
  timeZone: string;
}>;

// ✅ inline Readonly<> on a prop type sourced from src/Types/
function MainCard(props: Readonly<DashboardEntry>) { ... }
```

For arrays that shouldn't be mutated, use `ReadonlyArray<T>` (or `readonly T[]`):

```ts
interface DrawListProps {
  readonly items: ReadonlyArray<Draw>;
}
```

Why: React doesn't enforce immutability on props at the type level. `readonly` catches `props.foo = "x"` and documents intent.

## Touchable: `Pressable` with `android_ripple`

`Pressable` with `android_ripple` is the project standard — see [src/components/MainCard/MainCard.tsx:79](../../src/components/MainCard/MainCard.tsx#L79). Match this pattern in new components:

```tsx
<Pressable
  onPress={handlePress}
  android_ripple={{ color: colors.headerBackground }}
  style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
>
  ...
</Pressable>
```

`TouchableOpacity` is also fine when you want simple opacity feedback and don't need ripple. Don't mix `Pressable` and `TouchableOpacity` arbitrarily within one component.

## Presentational vs. logic

Keep components presentational. Push logic into:

- **Colocated `use<Component>.ts`** — for component-specific logic (timer state, derived data, handler memoisation).
- **Repos in [src/services/db/](../../src/services/db/)** — for SQLite reads/writes (`games.repo.ts`, `drawTypes.repo.ts`, `draws.repo.ts`).
- **Sync in [src/services/sync/](../../src/services/sync/)** — for Firestore→SQLite sync.
- **Helpers in [src/utilities/](../../src/utilities/)** — pure functions (`scale`, `alignment`, date / string transforms).

A component file should mostly be: imports, `useTheme()`, `useStyles()`, prop destructuring, JSX, handlers that delegate. If non-JSX logic crosses ~150 lines, extract a `use<Name>.ts`.

## Reuse → extend → new

Before creating anything new, in order:

1. **Reuse** an existing component as-is.
2. **Extend** an existing one by adding an **optional** prop with a default. No required new props on existing shared components, no breaking renames — backward compatibility first.
3. **New**: only when nothing above fits.

## Types

Prop types live in ambient `.d.ts` files — never declared inside `.tsx`. See [typescript.md](./typescript.md).

- Domain shapes (`Game`, `DrawType`, `Draw`, `DashboardEntry`, `BallStat`, etc.) live in [src/Types/types.d.ts](../../src/Types/types.d.ts) and are used directly by components: `Readonly<DashboardEntry>` at [src/components/MainCard/MainCard.tsx:13](../../src/components/MainCard/MainCard.tsx#L13).
- Notification types live in [src/Types/notification.d.ts](../../src/Types/notification.d.ts).
- For a new component-specific prop type, add it to the appropriate ambient file under [src/Types/](../../src/Types/) — don't redeclare inside the component.

## Do NOT

- Define `StyleSheet.create` in the component file. Style hooks live in `styles.ts`. See [theme.md](./theme.md).
- Define `interface` / `type` / type aliases inside `.tsx` / `.ts` component files. See [typescript.md](./typescript.md).
- Put multiple components in one file.
- Use a named export for the main component.
- Omit `readonly` on prop fields.
- Hardcode hex / `rgba()` / font family strings — read from `useTheme() as NavigationTheme` and `Fonts.*`. See [theme.md](./theme.md).
- Use raw pixel numbers for `fontSize`, `padding*`, `margin*`, `width`, `height` — use `scale()` from [src/utilities/scaling.ts](../../src/utilities/scaling.ts) and the `alignment.*` helpers from [src/utilities/alignment.ts](../../src/utilities/alignment.ts).
- Place reusable components under a screen folder ([src/screen/<Name>/](../../src/screen/)) — they go in [src/components/](../../src/components/).
