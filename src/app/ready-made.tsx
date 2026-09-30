import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '@/context/AppContext';
import {
  getCatalogSections,
  type CatalogApp,
  type CatalogSection,
} from '@/services/catalog';
import { pinLiteAppToHome } from '@/services/homeShortcut';
import { radius, spacing, typography } from '@/theme';
import { showToast } from '@/utils/toast';

export default function ReadyMadeScreen() {
  const { colors, addLiteApp } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [addingId, setAddingId] = useState<string | null>(null);

  const sections = useMemo(() => getCatalogSections(query), [query]);

  const handleSelect = async (item: CatalogApp) => {
    if (addingId) return;
    setAddingId(item.id);
    try {
      const app = await addLiteApp({ name: item.name, url: item.url });
      if (!app) return;
      showToast(`${app.name} added`);
      await pinLiteAppToHome(app);
      router.back();
    } finally {
      setAddingId(null);
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            paddingTop: Math.max(insets.top, spacing.md),
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Pressable
          onPress={() => router.back()}
          hitSlop={10}
          style={[styles.iconBtn, { backgroundColor: colors.surfaceSolid }]}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>

        <View
          style={[
            styles.searchWrap,
            {
              backgroundColor: colors.surfaceSolid,
              borderColor: colors.border,
            },
          ]}
        >
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
            style={[styles.searchInput, { color: colors.text }]}
          />
        </View>
      </View>

      <FlatList
        data={sections}
        keyExtractor={(item) => item.category}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: Math.max(insets.bottom, spacing.xxl) },
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              No matches
            </Text>
            <Text style={{ color: colors.textSecondary, ...typography.body }}>
              Try another search term
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <CategorySection
            section={item}
            onSelect={handleSelect}
            busyId={addingId}
          />
        )}
      />
    </View>
  );
}

function CategorySection({
  section,
  onSelect,
  busyId,
}: {
  section: CatalogSection;
  onSelect: (app: CatalogApp) => void;
  busyId: string | null;
}) {
  const { colors } = useApp();

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {section.category}
        </Text>
        <Text style={[styles.sectionCount, { color: colors.textSecondary }]}>
          {section.apps.length} Lite Apps
        </Text>
      </View>

      <View style={styles.grid}>
        {section.apps.map((app) => (
          <CatalogTile
            key={app.id}
            app={app}
            disabled={busyId === app.id}
            onPress={() => onSelect(app)}
          />
        ))}
      </View>
    </View>
  );
}

function CatalogTile({
  app,
  onPress,
  disabled,
}: {
  app: CatalogApp;
  onPress: () => void;
  disabled?: boolean;
}) {
  const { colors } = useApp();
  const [failed, setFailed] = useState(false);

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.tile,
        (pressed || disabled) && styles.tilePressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`Add ${app.name}`}
    >
      <View
        style={[
          styles.tileIcon,
          {
            backgroundColor: colors.iconBg,
            borderColor: colors.border,
            shadowColor: colors.shadow,
          },
        ]}
      >
        {!failed ? (
          <Image
            source={{ uri: app.favicon }}
            style={styles.favicon}
            onError={() => setFailed(true)}
          />
        ) : (
          <Text style={[styles.fallback, { color: colors.primary }]}>
            {app.name.charAt(0).toUpperCase()}
          </Text>
        )}
      </View>
      <Text
        numberOfLines={2}
        style={[styles.tileLabel, { color: colors.textSecondary }]}
      >
        {app.name}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchWrap: {
    flex: 1,
    height: 44,
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    paddingVertical: 0,
  },
  list: {
    paddingTop: spacing.lg,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.title,
  },
  sectionCount: {
    ...typography.caption,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.sm,
  },
  tile: {
    width: '33.333%',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
    marginBottom: spacing.xl,
  },
  tilePressed: {
    opacity: 0.7,
    transform: [{ scale: 0.96 }],
  },
  tileIcon: {
    width: 58,
    height: 58,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
    marginBottom: spacing.sm,
  },
  favicon: {
    width: 34,
    height: 34,
    borderRadius: 8,
  },
  fallback: {
    fontSize: 22,
    fontWeight: '700',
  },
  tileLabel: {
    ...typography.label,
    textAlign: 'center',
    width: '100%',
  },
  empty: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
    gap: spacing.sm,
  },
  emptyTitle: {
    ...typography.title,
  },
});
