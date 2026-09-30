import { Platform } from 'react-native';
import { requireOptionalNativeModule } from 'expo-modules-core';

interface WebletExitNative {
  /** Finishes the activity and removes it from Android Recents. */
  exitAndRemoveTask(): void;
}

const native = requireOptionalNativeModule<WebletExitNative>('WebletExit');

export function exitAndRemoveFromRecents(): boolean {
  if (Platform.OS !== 'android' || !native) return false;
  try {
    native.exitAndRemoveTask();
    return true;
  } catch {
    return false;
  }
}
