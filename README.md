# 49's Results

A mobile app showing UK 49's lottery draw results, history, hot/cold ball stats, and a quick-pick number generator. Built with Expo SDK 54, expo-router, React 19, and React Native 0.81 on the New Architecture.

## Stack

- Expo SDK 54 (managed workflow) — New Architecture, React Compiler, typed routes all enabled
- expo-router v6 with drawer navigation
- React 19.1 / React Native 0.81.5
- TypeScript (strict)

## Project layout

```
app/                file-based routes (expo-router)
  _layout.tsx       drawer + status bar setup
  index.tsx         home / dashboard
  lottery.tsx       single lottery details (typed params: lotteryId, name)
  profile.tsx
  notification.tsx
  favourite.tsx     hot & cold balls
  generator.tsx     quick-pick generator
  condition.tsx
  privacy.tsx
src/
  screen/           screen components, one per route
  components/       reusable UI (MainCard, LotteryCard, Counter, SideBar, Text, ...)
  utilities/        colors, scaling, alignment, time/date helpers (barrel-exported)
  mock/             mock data (swap for real API — see below)
  types.ts          shared domain types
assets/images/      icons, splash, adaptive icons
scripts/            project utility scripts
```

Routes in `app/` are intentionally thin wrappers that delegate to screen components in `src/screen/`.

## Get started

```bash
npm install
npm start                # expo start
npm run android          # expo start --android
npm run ios              # expo start --ios
npm run web              # expo start --web
npm run lint             # expo lint
```

## Data

All screens currently read from `src/mock/` (`dashboard.ts`, `draws.ts`, `favouriteBall.ts`, `profile.ts`). To wire up a real backend, add an `src/api/` folder with a `fetch`-based client that returns the same shapes as `src/types.ts`, and replace the mock imports in each screen.

API base URL should come from an `EXPO_PUBLIC_API_URL` environment variable so it stays out of the source.

## Builds

This project is published to the Play Store via **manual builds** (no EAS). Native folders (`/ios`, `/android`) are gitignored and regenerated locally with `npx expo prebuild` before each build.

```bash
npx expo prebuild --clean
# then build with the native toolchain (Xcode / Android Studio / gradle)
```

## Notes

- `userInterfaceStyle` is locked to `"light"` because the app uses a fixed colour palette ([src/utilities/colors.ts](src/utilities/colors.ts)).
- `predictiveBackGestureEnabled` is `false` on Android — re-evaluate before targeting Android 15+.
