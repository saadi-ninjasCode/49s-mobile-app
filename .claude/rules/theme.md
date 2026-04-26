---
paths:
  - "src/**/*.{ts,tsx}"
  - "app/**/*.{ts,tsx}"
---

# Theming Rules (Expo + React Navigation)

Follow this theming approach for consistency and light/dark support. Aligns with Expo color themes and React Navigation theming.

## File layout

| File | Purpose |
|------|--------|
| [src/theme/colors.ts](../../src/theme/colors.ts) | Raw hex/rgba values only (`COLORS`). No light/dark split. |
| [src/theme/color-theme.ts](../../src/theme/color-theme.ts) | Light/Dark theme objects (`THEME.Light`, `THEME.Dark`) mapping `COLORS` to semantic keys. |
| [src/theme/fonts.ts](../../src/theme/fonts.ts) | `Outfit`, `Fonts` (platform font config). |
| [src/theme/theme.ts](../../src/theme/theme.ts) | Barrel only: re-exports from colors, color-theme, fonts. |
| [src/theme/Theme.d.ts](../../src/theme/Theme.d.ts) | `NavigationTheme` global type. Registered via `files` in [tsconfig.json](../../tsconfig.json) so `NavigationTheme` is global without imports. Named for React Navigation to avoid conflicts if other theme packages are added. |

## 1. Color palette (raw values only)

- Keep all raw hex/rgba in **`src/theme/colors.ts`**.
- Export a single object `COLORS` with color-descriptive names. Do **not** split by light/dark; themes map these in `color-theme.ts`.

```typescript
// src/theme/colors.ts
export const COLORS = {
  deepIndigo: 'rgb(34, 25, 119)',
  white: '#FFFFFF',
  black: '#000000',
  textDark: '#212121',
  textMutedLight: '#949393',
  textMutedDark: '#B0B0B0',
};
```

## 2. Theme colors (Light + Dark)

- In **`src/theme/color-theme.ts`**, extend React Navigation `DefaultTheme` (light) and `DarkTheme` (dark).
- Export `THEME` with `Light` and `Dark` keys. Use the **same semantic color keys** in both; only values differ (from `COLORS`).
- Set `dark: true` / `dark: false` on each.

```typescript
// src/theme/color-theme.ts
import { DarkTheme, DefaultTheme } from '@react-navigation/native';
import { COLORS } from './colors';

const AppThemeDefinition = {
  Light: { ...DefaultTheme, dark: false, colors: { ...DefaultTheme.colors, text: COLORS.textDark, background: COLORS.paleGrey, primary: COLORS.deepIndigo, /* ... */ } },
  Dark:  { ...DarkTheme,  dark: true,  colors: { ...DarkTheme.colors,  text: COLORS.white,    background: COLORS.nearBlack, primary: COLORS.skyBlue,    /* ... */ } },
} as const satisfies { Light: NavigationTheme; Dark: NavigationTheme };

export const THEME = AppThemeDefinition;
```

## 3. Theme type (global, no import)

- In **`src/theme/Theme.d.ts`**, declare `NavigationTheme` inside `declare global { ... }` and export `{}` to mark the file as a module. Expo's `tsconfig.base` sets `moduleDetection: "force"` so this pattern is required for global ambient types.
- The file is registered via `"files": ["src/theme/Theme.d.ts"]` in [tsconfig.json](../../tsconfig.json) (the default `**/*.ts` glob does not include `.d.ts`).

```typescript
// src/theme/Theme.d.ts — NavigationTheme available globally
declare global {
  type NavigationTheme = import('@react-navigation/native').Theme & {
    dark: boolean;
    colors: import('@react-navigation/native').Theme['colors'] & {
      headerBackground: string;
      drawerColor: string;
      // ... add keys to match THEME.Light/Dark.colors
    };
  };
}
export {};
```

## 4. Expo config and root layout

- **Expo**: In `app.json` set `userInterfaceStyle: "automatic"` (or `"light"` / `"dark"`). For Android dev builds, install `expo-system-ui` if using appearance.
- **Scheme**: Use `useColorScheme()` from React Native.
- **ThemeProvider**: In root layout ([app/_layout.tsx](../../app/_layout.tsx)), pass `theme={colorScheme === 'dark' ? THEME.Dark : THEME.Light}`. Import `THEME` from `../src/theme/theme`.
- **Status bar**: Use `expo-status-bar` with `style="auto"` or set from `colorScheme`.

```tsx
// app/_layout.tsx
import { ThemeProvider } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { THEME } from '../src/theme/theme';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? THEME.Dark : THEME.Light;
  return (
    <ThemeProvider value={theme}>
      {/* Stack / Drawer / children */}
      <StatusBar style="light" backgroundColor={theme.colors.headerBackground} />
    </ThemeProvider>
  );
}
```

## 5. Using theme in components and styles

- **Style files** export a `useStyles()` hook that calls `useTheme() as NavigationTheme` and returns a memoized `StyleSheet`. No raw `COLORS` import in style files.

```typescript
// src/components/Foo/styles.ts
import { useTheme } from '@react-navigation/native';
import { useMemo } from 'react';
import { StyleSheet } from 'react-native';

export const useStyles = () => {
  const { colors } = useTheme() as NavigationTheme;
  return useMemo(
    () =>
      StyleSheet.create({
        box: { backgroundColor: colors.headerBackground },
      }),
    [colors],
  );
};
```

```tsx
// src/components/Foo/Foo.tsx
import { useTheme } from '@react-navigation/native';
import { useStyles } from './styles';

export function Foo() {
  const { colors } = useTheme() as NavigationTheme;
  const styles = useStyles();
  return <View style={styles.box}>{/* colors.headerText … */}</View>;
}
```

- Use **semantic** keys from `theme.colors` (e.g. `colors.text`, `colors.background`, `colors.headerBackground`, `colors.drawerColor`), never the raw `COLORS` constant in UI.

```typescript
// ❌ Avoid: raw COLORS in UI components or styles
import { COLORS } from '../../theme/theme';
backgroundColor: COLORS.deepIndigo
```

- ❌ Don't import `colors` from `src/utilities` — that file is a deprecated shim and will be removed. Use `useTheme() as NavigationTheme` instead.

## 6. Adding a new theme color

1. Add the raw value to **`src/theme/colors.ts`** if needed.
2. Add the key to **`src/theme/Theme.d.ts`** in `NavigationTheme['colors']`.
3. Add the mapping in both **`THEME.Light.colors`** and **`THEME.Dark.colors`** in `src/theme/color-theme.ts`.

## 7. Shadow colors

Shadow colors follow a **split-opacity** pattern: the raw color has no alpha, and the component controls opacity via `shadowOpacity`.

### Rules

1. **`colors.ts`** — shadow colors use **generic names** and **no alpha channel** (`rgb()` or hex, never `rgba()` with alpha).
   ```typescript
   // ✅
   shadowGrey: 'rgb(112, 112, 112)',
   shadowBlack: 'rgb(0, 0, 0)',
   // ❌
   shadowGrey: 'rgba(112, 112, 112, 0.4)',
   ```
2. **`color-theme.ts`** — map generic raw colors to **component-specific semantic names** (e.g. `boxShadow`, `inputShadow`).
   ```typescript
   boxShadow: COLORS.shadowGrey,  // Light
   boxShadow: COLORS.shadowBlack, // Dark
   ```
3. **Component `styles.ts`** — use `shadowColor` from theme and control alpha with `shadowOpacity`. Never bake alpha into the shadow color.
   ```typescript
   // ✅
   shadowColor: colors.boxShadow,
   shadowOpacity: 0.2,
   // ❌
   shadowColor: 'rgba(112, 112, 112, 0.2)',
   shadowOpacity: 1,
   ```
4. **Text shadows** are the exception — React Native has no `textShadowOpacity`, so `textShadowColor` may include alpha (e.g. `rgba(0, 0, 0, 0.25)`).

## Summary

| Concern | Approach |
|--------|----------|
| Raw values | `src/theme/colors.ts` → COLORS. `src/theme/color-theme.ts` → THEME (Light/Dark). `src/theme/fonts.ts` → Outfit, Fonts. `src/theme/theme.ts` → barrel. |
| Types | `src/theme/Theme.d.ts` with `declare global { ... } export {}`; registered via `files` in `tsconfig.json`. |
| Scheme | `useColorScheme()` (React Native / Expo). |
| Theme object | React Navigation `DefaultTheme` / `DarkTheme` extended in `color-theme.ts`. |
| Consumption | `useStyles()` hook in style files using `useTheme() as NavigationTheme`. No raw COLORS in UI. |
| Expo | `userInterfaceStyle: "automatic"` in `app.json`. |
