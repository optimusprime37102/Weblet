import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { Platform, StatusBar as RNStatusBar, StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { enableFreeze, enableScreens } from 'react-native-screens';
import { AnimatedSplash } from '@/components/AnimatedSplash';
import { AppProvider, useApp } from '@/context/AppContext';
import { subscribeHomeShortcutLinks } from '@/services/deepLink';
import { prefetchCatalog } from '@/services/catalog';
import { BRAND_RED } from '@/theme';

enableScreens(true);
enableFreeze(true);

// Keep the OS splash until JS can paint our animated splash (avoids a white flash).
SplashScreen.preventAutoHideAsync().catch(() => {});
SplashScreen.setOptions({
  duration: 150,
  fade: true,
});

SystemUI.setBackgroundColorAsync(BRAND_RED).catch(() => {});

function applyBrandStatusBar() {
  if (Platform.OS !== 'android') return;
  try {
    RNStatusBar.setBackgroundColor(BRAND_RED, true);
    RNStatusBar.setBarStyle('light-content', true);
    RNStatusBar.setTranslucent(true);
  } catch {
    // Edge-to-edge builds may ignore backgroundColor; overlay still covers it.
  }
}

function BrandStatusBarFill({ visible }: { visible: boolean }) {
  const insets = useSafeAreaInsets();
  if (!visible || insets.top <= 0) return null;

  return (
    <View
      pointerEvents="none"
      style={[
        styles.statusFill,
        {
          height: insets.top,
          backgroundColor: BRAND_RED,
        },
      ]}
    />
  );
}

function RootNavigator() {
  const { ready, colors } = useApp();
  const [showSplash, setShowSplash] = useState(true);

  const finishSplash = useCallback(() => {
    setShowSplash(false);
  }, []);

  useEffect(() => {
    applyBrandStatusBar();
  }, []);

  useEffect(() => {
    if (!ready) return;
    void prefetchCatalog();
    return subscribeHomeShortcutLinks();
  }, [ready]);

  return (
    <>
      <StatusBar style="light" />
      <BrandStatusBarFill visible={!showSplash} />

      {ready ? (
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
            animation: 'slide_from_right',
            animationDuration: 280,
            freezeOnBlur: true,
            gestureEnabled: true,
            fullScreenGestureEnabled: true,
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="browser"
            options={{
              // Fast fade keeps WebView mount off the critical path of a long slide.
              animation: 'fade',
              animationDuration: 180,
              gestureEnabled: true,
              fullScreenGestureEnabled: true,
            }}
          />
          <Stack.Screen name="add-app" />
          <Stack.Screen name="ready-made" />
          <Stack.Screen name="lite-app-settings" />
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
    applyBrandStatusBar();
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <AppProvider>
          <RootNavigator />
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BRAND_RED,
  },
  statusFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    elevation: 1000,
  },
});
