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
npx expo start
```

Then press `a` for Android, `i` for iOS, or scan the QR code with Expo Go.

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
