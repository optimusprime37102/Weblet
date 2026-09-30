import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { radius, spacing, typography } from '@/theme';
import { useApp } from '@/context/AppContext';

type Props = {
  title: string;
  canGoBack: boolean;
  canGoForward: boolean;
  loading: boolean;
  isBookmarked: boolean;
  showAddLiteApp?: boolean;
  onClose: () => void;
  onBack: () => void;
  onForward: () => void;
  onReload: () => void;
  onToggleBookmark: () => void;
  onAddLiteApp?: () => void;
};

export function BrowserChrome({
  title,
  canGoBack,
  canGoForward,
  loading,
  isBookmarked,
  showAddLiteApp = true,
  onClose,
  onBack,
  onForward,
  onReload,
  onToggleBookmark,
  onAddLiteApp,
}: Props) {
  const { colors } = useApp();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.wrap,
        {
          paddingTop: Math.max(insets.top, spacing.sm),
          backgroundColor: colors.surfaceSolid,
          borderBottomColor: colors.border,
        },
      ]}
    >
      <View style={styles.topRow}>
        <Pressable onPress={onClose} style={styles.iconBtn} hitSlop={8}>
          <Ionicons name="close" size={22} color={colors.text} />
        </Pressable>
        <Text
          numberOfLines={1}
          style={[styles.title, { color: colors.text }]}
        >
          {title}
        </Text>
        {loading ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <View style={{ width: 22 }} />
        )}
      </View>

      <View style={styles.actions}>
        <Pressable
          onPress={onBack}
          disabled={!canGoBack}
          style={[styles.iconBtn, !canGoBack && styles.disabled]}
        >
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </Pressable>
        <Pressable
          onPress={onForward}
          disabled={!canGoForward}
          style={[styles.iconBtn, !canGoForward && styles.disabled]}
        >
          <Ionicons name="chevron-forward" size={22} color={colors.text} />
        </Pressable>
        <Pressable onPress={onReload} style={styles.iconBtn}>
          <Ionicons name="reload" size={20} color={colors.text} />
        </Pressable>
        <Pressable onPress={onToggleBookmark} style={styles.iconBtn}>
          <Ionicons
            name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
            size={20}
            color={isBookmarked ? colors.primary : colors.text}
          />
        </Pressable>
        {showAddLiteApp && onAddLiteApp ? (
          <Pressable
            onPress={onAddLiteApp}
            style={[styles.addBtn, { backgroundColor: colors.primarySoft }]}
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
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    flex: 1,
    ...typography.body,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  iconBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
  },
  disabled: {
    opacity: 0.35,
  },
  addBtn: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.md,
    height: 34,
    borderRadius: radius.full,
  },
  addLabel: {
    ...typography.caption,
    fontWeight: '700',
  },
});
