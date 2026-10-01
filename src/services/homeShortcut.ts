import { Alert, Platform } from 'react-native';
import { appShortcut } from '@aun-abbas/expo-pin-shortcut';
import type { LiteApp } from '@/types';

export function canPinHomeShortcut(): boolean {
  if (Platform.OS !== 'android') return false;
  try {
    return appShortcut.isSupported();
  } catch {
    return false;
  }
}

/**
 * Path-style deep link so Expo Router opens /browser as the initial route.
 * (Host-style weblet://browser?... is treated as hostname, not a route.)
 */
export function buildHomeShortcutUri(app: LiteApp): string {
  const params = new URLSearchParams({
    url: app.url,
    title: app.name,
    appId: app.id,
    fromHome: '1',
  });
  return `weblet:///browser?${params.toString()}`;
}

export async function pinLiteAppToHome(app: LiteApp): Promise<boolean> {
  if (Platform.OS !== 'android') {
    Alert.alert(
      'Not available on iOS',
      'Home screen shortcuts can only be pinned on Android.'
    );
    return false;
  }

  if (!canPinHomeShortcut()) {
    Alert.alert(
      'Native build required',
      'Pinning to the home screen needs a development build (Expo Go cannot do this).\n\nRun:\nnpx expo run:android'
    );
    return false;
  }

  try {
    return await appShortcut.pin({
      id: app.id,
      label: app.name,
      uri: buildHomeShortcutUri(app),
      iconUrl: app.favicon ?? null,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Could not pin shortcut.';
    Alert.alert('Could not add shortcut', message);
    return false;
  }
}
