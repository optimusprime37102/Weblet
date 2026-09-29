import React, { useRef, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Header } from '@/components/Header';
import { SearchBar } from '@/components/SearchBar';
import { LiteAppGrid } from '@/components/LiteAppGrid';
import { CreateFab } from '@/components/CreateFab';
import { HomeScreenDialog } from '@/components/HomeScreenDialog';
import { ManageLiteAppDialog } from '@/components/ManageLiteAppDialog';
import { useApp } from '@/context/AppContext';
import { pinLiteAppToHome } from '@/services/homeShortcut';
import { spacing, typography } from '@/theme';
import { normalizeUrl } from '@/utils/url';
import type { LiteApp } from '@/types';

export default function LiteAppsScreen() {
  const {
    colors,
    liteApps,
    removeLiteApp,
    pendingHomeShortcut,
    setPendingHomeShortcut,
  } = useApp();
  const router = useRouter();
  const searchRef = useRef<TextInput>(null);
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [manageApp, setManageApp] = useState<LiteApp | null>(null);

  const openBrowser = (url: string, title?: string) => {
    const target = normalizeUrl(url);
    if (!target) return;
    router.push({
      pathname: '/browser',
      params: { url: target, title: title ?? '' },
    });
  };

  const isEmpty = liteApps.length === 0;

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <Header onSearchPress={() => searchRef.current?.focus()} />
      <SearchBar
        ref={searchRef}
        value={query}
        onChangeText={setQuery}
        onSubmitQuery={(value) => {
          openBrowser(value);
          setQuery('');
        }}
      />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          isEmpty && styles.contentEmpty,
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: colors.text }]}>Lite Apps</Text>

        {isEmpty ? (
          <View style={styles.emptyBody}>
            <Text style={[styles.emptyHint, { color: colors.textSecondary }]}>
              Tap Create to add your first Lite App
            </Text>
          </View>
        ) : (
          <LiteAppGrid
            apps={liteApps}
            onOpenApp={(app) => openBrowser(app.url, app.name)}
            onLongPressApp={setManageApp}
          />
        )}
      </ScrollView>

      <CreateFab
        open={menuOpen}
        onOpenChange={setMenuOpen}
        onCreateOwn={() => router.push('/add-app')}
        onReadyMade={() => router.push('/ready-made')}
      />

      <ManageLiteAppDialog
        app={manageApp}
        visible={!!manageApp}
        onCancel={() => setManageApp(null)}
        onOpen={() => {
          if (!manageApp) return;
          const app = manageApp;
          setManageApp(null);
          openBrowser(app.url, app.name);
        }}
        onAddToHomeScreen={() => {
          if (!manageApp) return;
          setPendingHomeShortcut(manageApp);
          setManageApp(null);
        }}
        onRemove={() => {
          if (!manageApp) return;
          removeLiteApp(manageApp.id);
          setManageApp(null);
        }}
      />

      <HomeScreenDialog
        app={pendingHomeShortcut}
        visible={!!pendingHomeShortcut}
        onCancel={() => setPendingHomeShortcut(null)}
        onAddAutomatically={async () => {
          if (pendingHomeShortcut) {
            await pinLiteAppToHome(pendingHomeShortcut);
          }
          setPendingHomeShortcut(null);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xxxl + 80,
  },
  contentEmpty: {
    flexGrow: 1,
  },
  title: {
    ...typography.brand,
    fontSize: 28,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  emptyBody: {
    flex: 1,
    minHeight: 220,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
  },
  emptyHint: {
    ...typography.body,
    textAlign: 'center',
  },
});
