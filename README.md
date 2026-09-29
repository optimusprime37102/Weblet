# Weblet — Lite Apps Browser

Turn websites into lightweight apps. Built with React Native + Expo.

## Features

- **Lite Apps grid** — save sites as icon shortcuts
- **In-app browser** — WebView with back / forward / reload
- **Search or URL bar** — Google search or direct navigation
- **Bookmarks** — save pages from the browser toolbar
- **Settings** — theme (system / light / dark) + data reset
- **Side drawer** — quick navigation

## Run

```bash
npm install

# Expo Go
npm run start:expo

# Debug build on emulator (non–Expo Go — supports home-screen pin)
npm run android

# Debug build on a USB / wireless device
npm run android:device

# Metro for an installed development build
npm run start:dev-client
```

### Android packages (APK / AAB)

Local builds need Android SDK. Cloud builds need `npx eas-cli@latest login`.

| Script | Output |
|--------|--------|
| `npm run apk:debug` | Debug **APK** (local) |
| `npm run apk:release` | Release **APK** (local) |
| `npm run aab` | Play Store **.aab** (local) |
| `npm run apk:debug:cloud` | Debug APK (EAS cloud) |
| `npm run apk:release:cloud` | Release APK (EAS cloud) |
| `npm run aab:cloud` | AAB (EAS cloud) |
| `npm run build:dev` | Dev-client APK for physical devices |

### Home screen shortcuts (Android)

Pinning Lite Apps to the home screen needs a **development build** (`npm run android`). Expo Go cannot pin shortcuts.

## Structure

```
src/
  app/           # Expo Router screens
  components/    # UI building blocks
  context/       # App state + persistence
  services/      # storage, favicon, seed data
  theme/         # colors, spacing, typography
  types/
  utils/
```
