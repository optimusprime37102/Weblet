import { Alert, Platform } from 'react-native';
import * as Linking from 'expo-linking';
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

  const uri = Linking.createURL('/browser', {
    queryParams: {
      url: app.url,
      title: app.name,
    },
  });

  try {
    return await appShortcut.pin({
      id: app.id,
      label: app.name,
      uri,
      iconUrl: app.favicon ?? null,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Could not pin shortcut.';
    Alert.alert('Could not add shortcut', message);
    return false;
  }
}
