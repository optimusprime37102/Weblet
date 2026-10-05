import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AppState,
  BackHandler,
  Linking,
  Platform,
  StyleSheet,
  Text,
  View,
  type AppStateStatus,
} from 'react-native';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import {
  WebView,
  type WebViewNavigation,
} from 'react-native-webview';
import { BrowserChrome } from '@/components/BrowserChrome';
import { CreateLiteAppSheet } from '@/components/CreateLiteAppSheet';
import { FullScreenControls } from '@/components/FullScreenControls';
import { LiteAppSettingsDrawer } from '@/components/lite-app-settings';
import { useApp } from '@/context/AppContext';
import { db } from '@/db';
import { exitAppCompletely } from '@/services/exitApp';
import { pinLiteAppToHome } from '@/services/homeShortcut';
import {
  buildClearSiteDataScript,
  buildWebViewInjection,
  getDataSaverFlags,
  getLiteAppSettings,
  getUserAgent,
  isSameSiteUrl,
} from '@/services/liteAppSettings';
import { getDisplayNameFromUrl, getHostname, normalizeUrl } from '@/utils/url';
import { runWhenIdle } from '@/utils/runWhenIdle';
import { showToast } from '@/utils/toast';
import { spacing, typography } from '@/theme';


function firstParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? '';
  return value ?? '';
}

export default function BrowserScreen() {
  const params = useLocalSearchParams<{
    url?: string | string[];
    title?: string | string[];
    fromHome?: string | string[];
    cold?: string | string[];
    fromSearch?: string | string[];
    appId?: string | string[];
    clearData?: string | string[];
  }>();
  const router = useRouter();
  const navigation = useNavigation();
  const {
    colors,
    bookmarks,
    liteApps,
    addBookmark,
    removeBookmark,
    addLiteApp,
    updateLiteApp,
  } = useApp();
  const webRef = useRef<WebView>(null);

  const fromHome = firstParam(params.fromHome) === '1';
  const fromSearch = firstParam(params.fromSearch) === '1';
  const coldStart = firstParam(params.cold) === '1';
  const clearDataRequested = firstParam(params.clearData) === '1';
  const paramAppId = firstParam(params.appId);
  const showAddLiteApp = !fromSearch && !fromHome && !paramAppId;

  useEffect(() => {
    // Home-shortcut sessions shouldn't be dismissed by edge swipe.
    navigation.setOptions({
      gestureEnabled: !fromHome,
      fullScreenGestureEnabled: !fromHome,
    });
  }, [navigation, fromHome]);
  const initialUrl = useMemo(
    () => normalizeUrl(firstParam(params.url) || 'https://www.google.com'),
    [params.url]
  );

  const liteApp = useMemo(() => {
    if (paramAppId) {
      return liteApps.find((app) => app.id === paramAppId) ?? null;
    }
    const normalized = initialUrl.replace(/\/$/, '');
    return (
      liteApps.find(
        (app) => app.url.replace(/\/$/, '') === normalized
      ) ?? null
    );
  }, [liteApps, paramAppId, initialUrl]);

  const settings = getLiteAppSettings(liteApp);
  const userAgent = getUserAgent(settings.websiteMode);
  const dataSaver = getDataSaverFlags(settings);
  const webViewInjection = buildWebViewInjection(settings);
  const isFullScreen = Boolean(liteApp && settings.fullScreenMode);

  const [currentUrl, setCurrentUrl] = useState(initialUrl);
  const [pageTitle, setPageTitle] = useState(
    firstParam(params.title) || getDisplayNameFromUrl(initialUrl)
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [webviewEpoch, setWebviewEpoch] = useState(0);
  const [appActive, setAppActive] = useState(
    AppState.currentState === 'active'
  );
  const clearHandledRef = useRef(false);

  const matchedBookmark = bookmarks.find(
    (b) => b.url.replace(/\/$/, '') === currentUrl.replace(/\/$/, '')
  );

  const siteOrigin = liteApp?.url ?? initialUrl;

  const clearWebsiteData = useCallback(async (opts?: { silent?: boolean }) => {
    try {
      webRef.current?.clearCache?.(true);
      webRef.current?.injectJavaScript(buildClearSiteDataScript());
      if (!opts?.silent) {
        showToast('Website data cleared');
        setTimeout(() => {
          setError(null);
          webRef.current?.reload();
        }, 120);
      }
    } catch {
      if (!opts?.silent) showToast('Could not clear website data');
    }
  }, []);

  const closeBrowser = useCallback(() => {
    const finishClose = () => {
      if (fromHome) {
        if (coldStart) {
          exitAppCompletely();
          return;
        }
        router.replace('/(tabs)');
        return;
      }
      if (router.canGoBack()) {
        router.back();
        return;
      }
      exitAppCompletely();
    };

    if (liteApp && settings.clearDataOnClose) {
      clearWebsiteData({ silent: true }).finally(finishClose);
      return;
    }
    finishClose();
  }, [
    fromHome,
    coldStart,
    router,
    liteApp,
    settings.clearDataOnClose,
    clearWebsiteData,
  ]);

  useEffect(() => {
    // Home-shortcut and full-screen sessions need explicit back handling so
    // WebView history still works when chrome (or swipe-dismiss) is unavailable.
    if (!fromHome && !isFullScreen) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (settingsOpen) {
        setSettingsOpen(false);
        return true;
      }
      if (canGoBack) {
        webRef.current?.goBack();
        return true;
      }
      closeBrowser();
      return true;
    });
    return () => sub.remove();
  }, [fromHome, isFullScreen, canGoBack, closeBrowser, settingsOpen]);

  useEffect(() => {
    const onChange = (next: AppStateStatus) => {
      setAppActive(next === 'active');
    };
    const sub = AppState.addEventListener('change', onChange);
    return () => sub.remove();
  }, []);

  const settingsKey = [
    settings.websiteMode,
    settings.cookiesEnabled,
    settings.blockThirdPartyCookies,
    settings.theme,
    settings.dataSaverEnabled,
    settings.blockImages,
    settings.disableVideoAutoplay,
    settings.reduceHeavyContent,
  ].join('|');
  const settingsKeyRef = useRef(settingsKey);

  // Remount WebView when mode/privacy/data-saver settings change.
  useEffect(() => {
    if (settingsKeyRef.current === settingsKey) return;
    settingsKeyRef.current = settingsKey;
    setWebviewEpoch((value) => value + 1);
    setError(null);
  }, [settingsKey]);

  // Auto refresh only while this Lite App is active in foreground.
  useEffect(() => {
    if (!liteApp || !settings.autoRefreshEnabled || !appActive) return;

    const timer = setInterval(() => {
      webRef.current?.reload();
    }, settings.autoRefreshInterval * 1000);

    return () => clearInterval(timer);
  }, [
    liteApp,
    settings.autoRefreshEnabled,
    settings.autoRefreshInterval,
    appActive,
    webviewEpoch,
  ]);

  useEffect(() => {
    if (!clearDataRequested) {
      clearHandledRef.current = false;
      return;
    }
    if (clearHandledRef.current) return;
    clearHandledRef.current = true;
    const timer = setTimeout(() => {
      clearWebsiteData();
    }, 500);
    return () => clearTimeout(timer);
  }, [clearDataRequested, clearWebsiteData, webviewEpoch]);

  useEffect(() => {
    if (!liteApp?.id) return;
    return runWhenIdle(() => {
      void db.touchLiteAppOpened(liteApp.id);
    });
  }, [liteApp?.id]);

  useEffect(() => {
    if (!currentUrl || currentUrl.startsWith('about:')) return;
    let cancelIdle: (() => void) | undefined;
    const timer = setTimeout(() => {
      cancelIdle = runWhenIdle(() => {
        void db.recordHistory({
          title: pageTitle,
          url: currentUrl,
          liteAppId: liteApp?.id ?? null,
        });
      });
    }, 1200);
    return () => {
      clearTimeout(timer);
      cancelIdle?.();
    };
  }, [currentUrl, pageTitle, liteApp?.id]);

  const onNavChange = useCallback((nav: WebViewNavigation) => {
    setCurrentUrl(nav.url);
    setCanGoBack(nav.canGoBack);
    setCanGoForward(nav.canGoForward);
    if (nav.title) setPageTitle(nav.title);
  }, []);

  const onLoadStart = useCallback(() => {
    // Thin chrome progress only — never cover the page (esp. back/forward).
    setLoading(true);
  }, []);

  const onLoadEnd = useCallback(() => {
    setLoading(false);
  }, []);

  const onShouldStartLoadWithRequest = useCallback(
    (request: { url: string }) => {
      const target = request.url;
      if (
        !target ||
        target.startsWith('about:') ||
        target.startsWith('data:') ||
        target.startsWith('blob:')
      ) {
        return true;
      }

      if (settings.externalLinks !== 'browser' || !liteApp) {
        return true;
      }

      if (isSameSiteUrl(siteOrigin, target)) {
        return true;
      }

      // External domain → system browser (Android ACTION_VIEW via Linking)
      Linking.openURL(target).catch(() => {
        showToast('Could not open link');
      });
      return false;
    },
    [settings.externalLinks, liteApp, siteOrigin]
  );

  const toggleBookmark = async () => {
    if (matchedBookmark) {
      await removeBookmark(matchedBookmark.id);
      return;
    }
    await addBookmark({ title: pageTitle, url: currentUrl });
  };

  const openLiteAppSettings = () => {
    if (!liteApp) return;
    setSettingsOpen(true);
  };

  const exitFullScreen = useCallback(async () => {
    if (!liteApp) return;
    await updateLiteApp(liteApp.id, {
      settings: { ...settings, fullScreenMode: false },
    });
    showToast('Full screen turned off');
  }, [liteApp, settings, updateLiteApp]);

  const saveLiteApp = async (input: {
    name: string;
    url: string;
    addToHomeScreen: boolean;
  }) => {
    const app = await addLiteApp({
      name: input.name || pageTitle || getDisplayNameFromUrl(input.url),
      url: input.url || currentUrl,
    });
    if (!app) return;

    setSheetOpen(false);
    showToast(`${app.name} added`);
    if (input.addToHomeScreen) {
      await pinLiteAppToHome(app);
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {!isFullScreen ? (
        <BrowserChrome
          title={pageTitle || getHostname(currentUrl)}
          canGoBack={canGoBack}
          canGoForward={canGoForward}
          loading={loading}
          isBookmarked={Boolean(matchedBookmark)}
          showAddLiteApp={showAddLiteApp}
          showSettings={Boolean(liteApp)}
          onClose={closeBrowser}
          onBack={() => webRef.current?.goBack()}
          onForward={() => webRef.current?.goForward()}
          onReload={() => {
            setError(null);
            webRef.current?.reload();
          }}
          onToggleBookmark={toggleBookmark}
          onOpenSettings={liteApp ? openLiteAppSettings : undefined}
          onAddLiteApp={
            showAddLiteApp ? () => setSheetOpen(true) : undefined
          }
        />
      ) : (
        <FullScreenControls
          onClose={closeBrowser}
          onExitFullScreen={exitFullScreen}
          onOpenSettings={openLiteAppSettings}
        />
      )}

      {error ? (
        <View style={styles.errorWrap}>
          <Text style={[styles.errorTitle, { color: colors.text }]}>
            Couldn’t load page
          </Text>
          <Text style={{ color: colors.textSecondary, textAlign: 'center' }}>
            {error}
          </Text>
          <Text
            onPress={() => {
              setError(null);
              webRef.current?.reload();
            }}
            style={[styles.retry, { color: colors.primary }]}
          >
            Tap to retry
          </Text>
        </View>
      ) : (
        <WebView
          key={`wv-${liteApp?.id ?? 'guest'}-${webviewEpoch}`}
          ref={webRef}
          source={{ uri: initialUrl }}
          userAgent={userAgent}
          onNavigationStateChange={onNavChange}
          onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
          onLoadStart={onLoadStart}
          onLoadEnd={onLoadEnd}
          onError={(e) => {
            setLoading(false);
            setError(e.nativeEvent.description || 'Unknown error');
          }}
          onHttpError={(e) => {
            if (e.nativeEvent.statusCode >= 400) {
              setError(`HTTP ${e.nativeEvent.statusCode}`);
            }
          }}
          // Avoid full-screen spinner on every history navigation — keeps back/forward smooth.
          startInLoadingState={false}
          allowsBackForwardNavigationGestures
          setSupportMultipleWindows={false}
          thirdPartyCookiesEnabled={
            settings.cookiesEnabled && !settings.blockThirdPartyCookies
          }
          sharedCookiesEnabled={settings.cookiesEnabled}
          incognito={!settings.cookiesEnabled}
          cacheEnabled={settings.cookiesEnabled && !settings.dataSaverEnabled}
          mediaPlaybackRequiresUserAction={dataSaver.disableVideoAutoplay}
          {...(Platform.OS === 'android'
            ? { forceDarkOn: settings.theme === 'dark' }
            : null)}
          injectedJavaScript={webViewInjection || undefined}
          injectedJavaScriptBeforeContentLoaded={webViewInjection || undefined}
          style={styles.webview}
        />
      )}

      <CreateLiteAppSheet
        visible={showAddLiteApp && sheetOpen}
        initialName={
          pageTitle || getDisplayNameFromUrl(currentUrl)
        }
        initialUrl={currentUrl}
        onCancel={() => setSheetOpen(false)}
        onConfirm={saveLiteApp}
      />

      <LiteAppSettingsDrawer
        visible={settingsOpen}
        app={liteApp}
        onClose={() => setSettingsOpen(false)}
        onClearWebsiteData={() => clearWebsiteData()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  errorWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
    gap: spacing.sm,
  },
  errorTitle: {
    ...typography.title,
  },
  retry: {
    ...typography.body,
    fontWeight: '700',
    marginTop: spacing.md,
  },
});
