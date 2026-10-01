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
import {
  ManageLiteAppDialog,
  type MenuAnchor,
} from '@/components/ManageLiteAppDialog';
import { useApp } from '@/context/AppContext';
import { pinLiteAppToHome } from '@/services/homeShortcut';
import { showToast } from '@/utils/toast';
import { radius, spacing, typography } from '@/theme';
import { normalizeUrl } from '@/utils/url';
import type { LiteApp } from '@/types';

export default function LiteAppsScreen() {
  const { colors, liteApps, removeLiteApp, addBookmark } = useApp();
  const router = useRouter();
  const searchRef = useRef<TextInput>(null);
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [manageApp, setManageApp] = useState<LiteApp | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<MenuAnchor | null>(null);

  const closeManageMenu = () => {
    setManageApp(null);
    setMenuAnchor(null);
  };

  const openBrowser = (app: LiteApp) => {
    router.push({
      pathname: '/browser',
      params: {
        url: app.url,
        title: app.name,
        appId: app.id,
      },
    });
  };

  const openHomeSearch = (value: string) => {
    const target = normalizeUrl(value);
    if (!target) return;
    router.push({
      pathname: '/add-app',
      params: { url: target, hideAdd: '1' },
    });
  };

  const openSettings = (app: LiteApp) => {
    router.push({
      pathname: '/lite-app-settings',
      params: { appId: app.id },
    });
  };

  const isEmpty = liteApps.length === 0;

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <Header />
      <SearchBar
        ref={searchRef}
        value={query}
        onChangeText={setQuery}
        onSubmitQuery={(value) => {
          openHomeSearch(value);
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
        <View style={[styles.titleAccent, { backgroundColor: colors.primary }]} />

        {isEmpty ? (
          <View style={styles.emptyBody}>
            <Text style={[styles.emptyHint, { color: colors.textSecondary }]}>
              Tap Create to add your first Lite App
            </Text>
          </View>
        ) : (
          <LiteAppGrid
            apps={liteApps}
            onOpenApp={(app) => openBrowser(app)}
            onLongPressApp={(app, anchor) => {
              setManageApp(app);
              setMenuAnchor(anchor);
            }}
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
        anchor={menuAnchor}
        onCancel={closeManageMenu}
        onOpen={() => {
          if (!manageApp) return;
          const app = manageApp;
          closeManageMenu();
          openBrowser(app);
        }}
        onSettings={() => {
          if (!manageApp) return;
          const app = manageApp;
          closeManageMenu();
          openSettings(app);
        }}
        onBookmark={async () => {
          if (!manageApp) return;
          const app = manageApp;
          closeManageMenu();
          await addBookmark({ title: app.name, url: app.url });
          showToast(`${app.name} bookmarked`);
        }}
        onAddToHomeScreen={async () => {
          if (!manageApp) return;
          const app = manageApp;
          closeManageMenu();
          await pinLiteAppToHome(app);
        }}
        onRemove={() => {
          if (!manageApp) return;
          removeLiteApp(manageApp.id);
          closeManageMenu();
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
    marginBottom: spacing.sm,
  },
  titleAccent: {
    width: 36,
    height: 3,
    borderRadius: radius.full,
    marginLeft: spacing.lg,
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
