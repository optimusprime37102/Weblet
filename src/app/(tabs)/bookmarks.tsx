import React, { useMemo, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BookmarkRow } from '@/components/BookmarkRow';
import { EmptyState } from '@/components/EmptyState';
import { useApp } from '@/context/AppContext';
import { radius, spacing, typography } from '@/theme';

export default function BookmarksScreen() {
  const { colors, bookmarks, removeBookmark } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState('');

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return bookmarks;
    return bookmarks.filter(
      (b) =>
        b.title.toLowerCase().includes(q) || b.url.toLowerCase().includes(q)
    );
  }, [bookmarks, filter]);

  return (
    <View
      style={[
        styles.screen,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top + spacing.lg,
        },
      ]}
    >
      <Text style={[styles.title, { color: colors.text }]}>Bookmarks</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Saved pages from your browsing sessions
      </Text>

      <View
        style={[
          styles.search,
          {
            backgroundColor: colors.surfaceSolid,
            borderColor: colors.border,
          },
        ]}
      >
        <Ionicons name="search" size={18} color={colors.textMuted} />
        <TextInput
          value={filter}
          onChangeText={setFilter}
          placeholder="Filter bookmarks"
          placeholderTextColor={colors.textMuted}
          style={[styles.input, { color: colors.text }]}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="bookmark-outline"
            title="No bookmarks yet"
            message="Open any site and tap the bookmark icon in the browser toolbar."
          />
        }
        renderItem={({ item }) => (
          <BookmarkRow
            bookmark={item}
            onPress={() =>
              router.push({
                pathname: '/browser',
                params: { url: item.url, title: item.title },
              })
            }
            onDelete={() => removeBookmark(item.id)}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  title: {
    ...typography.brand,
    marginBottom: 4,
  },
  subtitle: {
    ...typography.body,
    marginBottom: spacing.lg,
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    height: 46,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  input: {
    flex: 1,
    ...typography.body,
    paddingVertical: 0,
  },
  list: {
    paddingBottom: spacing.xxxl,
    flexGrow: 1,
  },
});
