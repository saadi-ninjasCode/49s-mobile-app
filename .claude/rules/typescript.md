---
paths:
  - "src/**/*.{ts,tsx}"
  - "app/**/*.{ts,tsx}"
---

# TypeScript

## No types in component / screen / hook files

Do **not** define `interface`, `type`, or type aliases inside `.tsx` / `.ts` component, screen, or hook files. Component files **consume** types — they don't declare them. Types live in ambient `.d.ts` files so they're globally available without imports.

Exception: a truly one-off, non-exported local type used in just one function (e.g. `type FontAwesome5Glyph = React.ComponentProps<typeof FontAwesome5>["name"]` at [src/components/MainCard/MainCard.tsx:11](../../src/components/MainCard/MainCard.tsx#L11)) may stay inline. Anything that describes props, public API, or reused shapes goes into a `.d.ts`.

## Props are `readonly`

Component **and** screen prop types must mark every field `readonly`. See [components.md](./components.md) for examples. Apply this universally.

## Where types go

Two locations:

| File / Folder | Contents |
|---|---|
| [src/Types/types.d.ts](../../src/Types/types.d.ts) | Domain shapes used app-wide: `Game`, `DrawType`, `Draw`, `DashboardEntry`, `DrawWithContext`, `BallStat`, `BallFrequencySection`, `BallFrequencyData`, `TimeLeft`. |
| [src/Types/notification.d.ts](../../src/Types/notification.d.ts) | Notification-related shapes (`DisplayPayload`, `ChannelDef`, `EnabledMap`, etc.). |
| [src/theme/Theme.d.ts](../../src/theme/Theme.d.ts) | The global `NavigationTheme` type. Registered explicitly via `"files": ["src/theme/Theme.d.ts"]` in [tsconfig.json](../../tsconfig.json) because the default `**/*.ts` glob doesn't reliably pick `.d.ts` files up as ambient declarations under Expo's tsconfig base. |

[src/Types/](../../src/Types/) uses **PascalCase** for the folder name — that's the existing convention; keep it. Don't rename it to `src/types/`.

For new component prop types or shared shapes, add them to the appropriate file under [src/Types/](../../src/Types/). Group by domain (one file per topic) rather than splitting per component.

## Ambient `.d.ts` pattern

This project's [tsconfig.json](../../tsconfig.json) extends `expo/tsconfig.base`. To make types globally available without imports, use the **`declare global { ... }` + `export {};`** pattern that [src/theme/Theme.d.ts](../../src/theme/Theme.d.ts) already follows:

```ts
// src/theme/Theme.d.ts
declare global {
  type NavigationTheme = import('@react-navigation/native').Theme & {
    dark: boolean;
    colors: import('@react-navigation/native').Theme['colors'] & {
      headerBackground: string;
      drawerColor: string;
      // ...
    };
  };
}

export {};
```

Why both halves matter:

- `declare global { ... }` puts the declarations in the global scope so other files can use them without importing.
- `export {};` marks the file as a module so `declare global` is allowed (TypeScript only permits `declare global` inside modules).
- Use `import("pkg").Type` syntax to reference external types — that keeps the reference in type-only space and doesn't pull in a runtime import.

For new ambient type files, prefer this pattern. Some existing files in this repo ([src/Types/types.d.ts](../../src/Types/types.d.ts), [src/Types/notification.d.ts](../../src/Types/notification.d.ts)) use a simpler top-level `interface ... { ... }` form — that's pre-existing; for **new** ambient files use the `declare global { ... } export {};` form to be unambiguous.

**Never import from a `.d.ts` file** in application code. Ambient types are global — just use them: `function MainCard(props: Readonly<DashboardEntry>) { ... }` ([src/components/MainCard/MainCard.tsx:13](../../src/components/MainCard/MainCard.tsx#L13)).

## `interface` vs `type`

- Use `interface` for object shapes, especially component prop types:
  ```ts
  interface CounterProps {
    readonly hour: number;
    readonly minute: number;
    readonly timeZone: string;
  }
  ```
- Use `type` for unions, intersections, computed/mapped types, and tuples:
  ```ts
  type DrawStatus = "scheduled" | "drawn" | "pending";
  type ThemeColors = NavigationTheme["colors"];
  ```
- Use `type X = Readonly<{...}>` if you prefer the type-alias form for props — still enforces `readonly`.

## Naming

- **Type / interface names**: PascalCase — `Game`, `DrawType`, `DashboardEntry`, `NavigationTheme`, `CounterProps`. Never `I`-prefixed (`IGame` is forbidden).
- **Props types**: `<ComponentName>Props` — `MainCardProps`, `CounterProps`.
- **`.d.ts` filenames**:
  - Files in [src/Types/](../../src/Types/) are **camelCase**: `types.d.ts`, `notification.d.ts`.
  - [src/theme/Theme.d.ts](../../src/theme/Theme.d.ts) is **PascalCase** — it follows the colocated `theme/` folder convention and is the documented exception. Don't rename.

## Strictness

[tsconfig.json](../../tsconfig.json) sets `strict: true`. Don't silence errors with `@ts-ignore` — use `@ts-expect-error` with a comment explaining why, or fix the type. `any` is a smell; prefer `unknown` + a narrowing check when the shape is genuinely unknown (e.g. raw Firestore `data()` before mapping into a domain type).

## Do NOT

- Define `interface` / `type` / type aliases in `.tsx` / `.ts` component, screen, or hook files (except truly one-off non-exported local types).
- Import from a `.d.ts` file — ambient types are already global.
- Omit `readonly` on prop fields.
- Use `any` where `unknown` + narrowing works.
- Prefix interfaces with `I` (`IGame`, `ICounterProps` — forbidden).
- Silence TypeScript with `@ts-ignore` — use `@ts-expect-error` with a reason, or fix the type.
- Rename [src/Types/](../../src/Types/) to `src/types/` — PascalCase folder is the existing convention.
