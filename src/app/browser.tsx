import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { WebView, type WebViewNavigation } from 'react-native-webview';
import { BrowserChrome } from '@/components/BrowserChrome';
import { CreateLiteAppSheet } from '@/components/CreateLiteAppSheet';
import { useApp } from '@/context/AppContext';
import { exitAppCompletely } from '@/services/exitApp';
import { pinLiteAppToHome } from '@/services/homeShortcut';
import { getDisplayNameFromUrl, getHostname, normalizeUrl } from '@/utils/url';
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
  }>();
  const router = useRouter();
  const { colors, bookmarks, addBookmark, removeBookmark, addLiteApp } =
    useApp();
  const webRef = useRef<WebView>(null);

  const fromHome = firstParam(params.fromHome) === '1';
  const fromSearch = firstParam(params.fromSearch) === '1';
  // Cold = launched from shortcut while app was not already running → exit on X.
  // Warm (cold=0) = app was already open → X returns to Lite Apps home.
  const coldStart = firstParam(params.cold) === '1';
  const showAddLiteApp = !fromSearch && !fromHome;
  const initialUrl = useMemo(
    () => normalizeUrl(firstParam(params.url) || 'https://www.google.com'),
    [params.url]
  );

  const [currentUrl, setCurrentUrl] = useState(initialUrl);
  const [pageTitle, setPageTitle] = useState(
    firstParam(params.title) || getDisplayNameFromUrl(initialUrl)
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  const matchedBookmark = bookmarks.find(
    (b) => b.url.replace(/\/$/, '') === currentUrl.replace(/\/$/, '')
  );

  const closeBrowser = useCallback(() => {
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
  }, [fromHome, coldStart, router]);

  useEffect(() => {
    if (!fromHome) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (canGoBack) {
        webRef.current?.goBack();
        return true;
      }
      closeBrowser();
      return true;
    });
    return () => sub.remove();
  }, [fromHome, canGoBack, closeBrowser]);

  const onNavChange = useCallback((nav: WebViewNavigation) => {
    setCurrentUrl(nav.url);
    setCanGoBack(nav.canGoBack);
    setCanGoForward(nav.canGoForward);
    if (nav.title) setPageTitle(nav.title);
  }, []);

  const toggleBookmark = async () => {
    if (matchedBookmark) {
      await removeBookmark(matchedBookmark.id);
      return;
    }
    await addBookmark({ title: pageTitle, url: currentUrl });
  };

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
      <BrowserChrome
        title={pageTitle || getHostname(currentUrl)}
        canGoBack={canGoBack}
        canGoForward={canGoForward}
        loading={loading}
        isBookmarked={Boolean(matchedBookmark)}
        showAddLiteApp={showAddLiteApp}
        onClose={closeBrowser}
        onBack={() => webRef.current?.goBack()}
        onForward={() => webRef.current?.goForward()}
        onReload={() => {
          setError(null);
          webRef.current?.reload();
        }}
        onToggleBookmark={toggleBookmark}
        onAddLiteApp={
          showAddLiteApp ? () => setSheetOpen(true) : undefined
        }
      />

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
          ref={webRef}
          source={{ uri: initialUrl }}
          onNavigationStateChange={onNavChange}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          onError={(e) => {
            setLoading(false);
            setError(e.nativeEvent.description || 'Unknown error');
          }}
          onHttpError={(e) => {
            if (e.nativeEvent.statusCode >= 400) {
              setError(`HTTP ${e.nativeEvent.statusCode}`);
            }
          }}
          startInLoadingState
          renderLoading={() => (
            <View
              style={[
                styles.loading,
                { backgroundColor: colors.background },
              ]}
            >
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          )}
          allowsBackForwardNavigationGestures
          setSupportMultipleWindows={false}
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
  loading: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
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
