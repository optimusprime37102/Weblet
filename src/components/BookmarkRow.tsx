import React, { useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Bookmark } from '@/types';
import { radius, spacing, typography } from '@/theme';
import { useApp } from '@/context/AppContext';
import { getHostname } from '@/utils/url';

type Props = {
  bookmark: Bookmark;
  onPress: () => void;
  onDelete: () => void;
};

export function BookmarkRow({ bookmark, onPress, onDelete }: Props) {
  const { colors } = useApp();
  const [failed, setFailed] = useState(false);

  return (
    <Pressable
      onPress={onPress}
      onLongPress={() =>
        Alert.alert('Remove bookmark?', bookmark.title, [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Remove', style: 'destructive', onPress: onDelete },
        ])
      }
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: colors.surfaceSolid,
          borderColor: colors.border,
        },
        pressed && { opacity: 0.85 },
      ]}
    >
      <View
        style={[
          styles.icon,
          { backgroundColor: colors.iconBg, borderColor: colors.border },
        ]}
      >
        {!failed && bookmark.favicon ? (
          <Image
            source={{ uri: bookmark.favicon }}
            style={styles.favicon}
            onError={() => setFailed(true)}
          />
        ) : (
          <Ionicons name="link" size={16} color={colors.primary} />
        )}
      </View>
      <View style={styles.meta}>
        <Text numberOfLines={1} style={[styles.title, { color: colors.text }]}>
          {bookmark.title}
        </Text>
        <Text
          numberOfLines={1}
          style={[styles.url, { color: colors.textSecondary }]}
        >
          {getHostname(bookmark.url)}
        </Text>
      </View>
      <Pressable onPress={onDelete} hitSlop={10} style={styles.delete}>
        <Ionicons name="trash-outline" size={18} color={colors.danger} />
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: spacing.sm,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  favicon: {
    width: 22,
    height: 22,
    borderRadius: 4,
  },
  meta: {
    flex: 1,
  },
  title: {
    ...typography.body,
    fontWeight: '600',
  },
  url: {
    ...typography.caption,
    marginTop: 2,
  },
  delete: {
    padding: spacing.xs,
  },
});
