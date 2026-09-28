import React, { useRef, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '@/components/Header';
import { SearchBar } from '@/components/SearchBar';
import { LiteAppGrid } from '@/components/LiteAppGrid';
import { useApp } from '@/context/AppContext';
import { radius, spacing, typography } from '@/theme';
import { normalizeUrl } from '@/utils/url';
import type { LiteApp } from '@/types';

export default function LiteAppsScreen() {
  const { colors, liteApps, removeLiteApp } = useApp();
  const router = useRouter();
  const searchRef = useRef<TextInput>(null);
  const [query, setQuery] = useState('');

  const openBrowser = (url: string, title?: string) => {
    const target = normalizeUrl(url);
    if (!target) return;
    router.push({
      pathname: '/browser',
      params: { url: target, title: title ?? '' },
    });
  };

  const handleLongPress = (app: LiteApp) => {
    Alert.alert(app.name, 'Manage this Lite App', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Open',
        onPress: () => openBrowser(app.url, app.name),
      },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => removeLiteApp(app.id),
      },
    ]);
  };

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
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.panel,
            {
              backgroundColor: colors.surfaceSolid,
              borderColor: colors.border,
              shadowColor: colors.shadow,
            },
          ]}
        >
          <View style={styles.panelHeader}>
            <Text style={[styles.panelTitle, { color: colors.text }]}>
              Your Lite Apps
            </Text>
            <Pressable
              onPress={() => router.push('/add-app')}
              hitSlop={8}
              style={[styles.closeHint, { backgroundColor: colors.surfaceMuted }]}
            >
              <Ionicons name="add" size={16} color={colors.textSecondary} />
            </Pressable>
          </View>

          <LiteAppGrid
            apps={liteApps}
            onOpenApp={(app) => openBrowser(app.url, app.name)}
            onLongPressApp={handleLongPress}
            onAddApp={() => router.push('/add-app')}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  panel: {
    marginHorizontal: spacing.lg,
    borderRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  panelTitle: {
    ...typography.title,
  },
  closeHint: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
