import { Alert, Platform, ToastAndroid } from 'react-native';

/** Short confirmation feedback. Uses Toast on Android; Alert on iOS. */
export function showToast(message: string) {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
    return;
  }
  Alert.alert(message);
}
