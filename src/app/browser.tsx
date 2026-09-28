import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { WebView, type WebViewNavigation } from 'react-native-webview';
import { BrowserChrome } from '@/components/BrowserChrome';
import { useApp } from '@/context/AppContext';
import { getDisplayNameFromUrl, getHostname, normalizeUrl } from '@/utils/url';
import { spacing, typography } from '@/theme';

export default function BrowserScreen() {
  const params = useLocalSearchParams<{ url?: string; title?: string }>();
  const router = useRouter();
  const { colors, bookmarks, addBookmark, removeBookmark, addLiteApp } =
    useApp();
  const webRef = useRef<WebView>(null);

  const initialUrl = useMemo(
    () => normalizeUrl(params.url ?? 'https://www.google.com'),
    [params.url]
  );

  const [currentUrl, setCurrentUrl] = useState(initialUrl);
  const [pageTitle, setPageTitle] = useState(
    params.title || getDisplayNameFromUrl(initialUrl)
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);

  const matchedBookmark = bookmarks.find(
    (b) => b.url.replace(/\/$/, '') === currentUrl.replace(/\/$/, '')
  );

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

  const saveLiteApp = async () => {
    const app = await addLiteApp({
      name: pageTitle || getDisplayNameFromUrl(currentUrl),
      url: currentUrl,
    });
    if (app) {
      Alert.alert('Saved', `${app.name} was added to your Lite Apps.`);
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
        onClose={() => router.back()}
        onBack={() => webRef.current?.goBack()}
        onForward={() => webRef.current?.goForward()}
        onReload={() => {
          setError(null);
          webRef.current?.reload();
        }}
        onToggleBookmark={toggleBookmark}
        onAddLiteApp={saveLiteApp}
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
