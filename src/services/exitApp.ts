import { BackHandler, Platform } from 'react-native';
import { exitAndRemoveFromRecents } from 'weblet-exit';

/**
 * Exit the app and remove it from Android Recents (cold-start shortcut close).
 * Falls back to BackHandler.exitApp() if the native module isn't linked yet.
 */
export function exitAppCompletely() {
  if (Platform.OS !== 'android') return;

  if (exitAndRemoveFromRecents()) return;

  BackHandler.exitApp();
}
