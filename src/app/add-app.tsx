import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { WebView, type WebViewNavigation } from 'react-native-webview';
import { CreateLiteAppSheet } from '@/components/CreateLiteAppSheet';
import { useApp } from '@/context/AppContext';
import { pinLiteAppToHome } from '@/services/homeShortcut';
import {
  getDisplayNameFromUrl,
  isValidHttpUrl,
  normalizeUrl,
} from '@/utils/url';
import { showToast } from '@/utils/toast';
import { radius, spacing, typography } from '@/theme';

function firstParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? '';
  return value ?? '';
}

export default function AddAppScreen() {
  const params = useLocalSearchParams<{
    url?: string | string[];
    hideAdd?: string | string[];
  }>();
  const { colors, addLiteApp } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const webRef = useRef<WebView>(null);
  const inputRef = useRef<TextInput>(null);

  const hideAdd = firstParam(params.hideAdd) === '1';
  const initialUrl = useMemo(
    () => normalizeUrl(firstParam(params.url)),
    [params.url]
  );

  const [query, setQuery] = useState(initialUrl);
  const [activeUrl, setActiveUrl] = useState<string | null>(
    initialUrl && isValidHttpUrl(initialUrl) ? initialUrl : null
  );
  const [currentUrl, setCurrentUrl] = useState(
    initialUrl && isValidHttpUrl(initialUrl) ? initialUrl : ''
  );
  const [pageTitle, setPageTitle] = useState(
    initialUrl && isValidHttpUrl(initialUrl)
      ? getDisplayNameFromUrl(initialUrl)
      : ''
  );
  const [loading, setLoading] = useState(Boolean(activeUrl));
  const [sheetOpen, setSheetOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const browsing = Boolean(activeUrl);
  const showAddButton = browsing && !hideAdd;

  const goToQuery = useCallback((value: string) => {
    const target = normalizeUrl(value);
    if (!target || !isValidHttpUrl(target)) return;
    setQuery(target);
    setActiveUrl(target);
    setCurrentUrl(target);
    setPageTitle(getDisplayNameFromUrl(target));
    setLoading(true);
  }, []);

  const onNavChange = useCallback((nav: WebViewNavigation) => {
    setCurrentUrl(nav.url);
    setQuery(nav.url);
    if (nav.title) setPageTitle(nav.title);
  }, []);

  const onConfirmCreate = async (input: {
    name: string;
    url: string;
    addToHomeScreen: boolean;
  }) => {
    const url = normalizeUrl(input.url);
    if (!url || !isValidHttpUrl(url)) {
      showToast('Enter a valid URL');
      return;
    }

    setSaving(true);
    try {
      const app = await addLiteApp({
        name: input.name,
        url,
      });
      if (!app) {
        showToast('Could not create Lite App');
        return;
      }

      setSheetOpen(false);
      showToast(`${app.name} added`);

      if (input.addToHomeScreen) {
        await pinLiteAppToHome(app);
      }

      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(tabs)');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + spacing.lg,
            backgroundColor: colors.surfaceSolid,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Pressable
          onPress={() => router.back()}
          style={styles.backBtn}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>

        <View
          style={[
            styles.searchBar,
            {
              backgroundColor: colors.backgroundSecondary,
              borderColor: colors.border,
            },
          ]}
        >
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            ref={inputRef}
            value={query}
            onChangeText={setQuery}
            placeholder="Search or type URL"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="go"
            keyboardType="url"
            autoFocus={!browsing}
            onSubmitEditing={() => goToQuery(query)}
            style={[styles.searchInput, { color: colors.text }]}
          />
          <Pressable
            onPress={() => goToQuery(query)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Go"
          >
            <Ionicons name="arrow-forward" size={18} color={colors.textMuted} />
          </Pressable>
        </View>

        {showAddButton ? (
          <Pressable
            onPress={() => setSheetOpen(true)}
            style={({ pressed }) => [
              styles.addBtn,
              {
                backgroundColor: colors.primarySoft,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Add Lite App"
          >
            <Ionicons
              name="add-circle-outline"
              size={18}
              color={colors.primary}
            />
            <Text style={[styles.addLabel, { color: colors.primary }]}>
              Lite App
            </Text>
          </Pressable>
        ) : null}
      </View>

      {browsing && activeUrl ? (
        <View style={styles.browser}>
          {loading ? (
            <View
              style={[styles.loadingBar, { backgroundColor: colors.primary }]}
            />
          ) : null}
          <WebView
            ref={webRef}
            source={{ uri: activeUrl }}
            onNavigationStateChange={onNavChange}
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => setLoading(false)}
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
        </View>
      ) : (
        <View style={styles.empty}>
          <View
            style={[
              styles.emptyIcon,
              { backgroundColor: colors.primarySoft },
            ]}
          >
            <Ionicons name="globe-outline" size={36} color={colors.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            {hideAdd
              ? 'Search or type a URL'
              : 'Search any site to add as a Lite App'}
          </Text>
          <Text style={[styles.emptyHint, { color: colors.textSecondary }]}>
            {hideAdd
              ? 'Enter a website address or search term above to browse.'
              : 'Type a website address or search term above, then tap Lite App when the page loads.'}
          </Text>
        </View>
      )}

      {!hideAdd ? (
        <CreateLiteAppSheet
          visible={sheetOpen}
          initialName={
            pageTitle && pageTitle !== currentUrl
              ? pageTitle
              : getDisplayNameFromUrl(currentUrl || activeUrl || '')
          }
          initialUrl={currentUrl || activeUrl || ''}
          onCancel={() => {
            if (!saving) setSheetOpen(false);
          }}
          onConfirm={onConfirmCreate}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    height: 44,
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.md,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    paddingVertical: 0,
  },
  addBtn: {
    height: 34,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
  },
  addLabel: {
    ...typography.caption,
    fontWeight: '700',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxxl,
    gap: spacing.md,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  emptyTitle: {
    ...typography.title,
    textAlign: 'center',
  },
  emptyHint: {
    ...typography.body,
    textAlign: 'center',
    lineHeight: 22,
  },
  browser: {
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
  loadingBar: {
    height: 2,
    width: '100%',
  },
});
