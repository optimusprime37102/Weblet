import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AnimatedSplash } from '@/components/AnimatedSplash';
import { AppProvider, useApp } from '@/context/AppContext';
import { subscribeHomeShortcutLinks } from '@/services/deepLink';

// Keep the OS splash until JS can paint our animated splash (avoids a white flash).
SplashScreen.preventAutoHideAsync().catch(() => {});
SplashScreen.setOptions({
  duration: 150,
  fade: true,
});

function RootNavigator() {
  const { ready, colors, isDark } = useApp();
  const [showSplash, setShowSplash] = useState(true);

  const finishSplash = useCallback(() => {
    setShowSplash(false);
  }, []);

  useEffect(() => {
    if (!ready) return;
    return subscribeHomeShortcutLinks();
  }, [ready]);

  return (
    <>
      <StatusBar style={showSplash ? 'light' : isDark ? 'light' : 'dark'} />
      {ready ? (
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="browser"
            options={{
              animation: 'none',
              gestureEnabled: false,
            }}
          />
          <Stack.Screen
            name="add-app"
            options={{
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="ready-made"
            options={{
              animation: 'slide_from_right',
            }}
          />
        </Stack>
      ) : null}

      {showSplash ? (
        <AnimatedSplash ready={ready} onFinish={finishSplash} />
      ) : null}
    </>
  );
}

export default function RootLayout() {
  // Hide OS splash on the first React layout pass — as soon as JS is alive.
  useLayoutEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppProvider>
          <RootNavigator />
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
