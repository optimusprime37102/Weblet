import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
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
  showSettings?: boolean;
  onClose: () => void;
  onBack: () => void;
  onForward: () => void;
  onReload: () => void;
  onToggleBookmark: () => void;
  onAddLiteApp?: () => void;
  onOpenSettings?: () => void;
};

export function BrowserChrome({
  title,
  canGoBack,
  canGoForward,
  loading,
  isBookmarked,
  showAddLiteApp = true,
  showSettings = false,
  onClose,
  onBack,
  onForward,
  onReload,
  onToggleBookmark,
  onAddLiteApp,
  onOpenSettings,
}: Props) {
  const { colors } = useApp();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.wrap,
        {
          paddingTop: insets.top + spacing.md,
          backgroundColor: colors.background,
          borderBottomColor: colors.border,
        },
      ]}
    >
      {/* Title row — primary focus */}
      <View style={styles.titleRow}>
        <IconButton
          icon="close"
          label="Close"
          color={colors.text}
          background={colors.surfaceSolid}
          border={colors.border}
          onPress={onClose}
        />

        <View
          style={[
            styles.titleBar,
            {
              backgroundColor: colors.surfaceSolid,
              borderColor: colors.border,
              shadowColor: colors.shadow,
            },
          ]}
        >
          {loading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <View
              style={[
                styles.globeWrap,
                { backgroundColor: colors.primarySoft },
              ]}
            >
              <Ionicons name="globe-outline" size={14} color={colors.primary} />
            </View>
          )}
          <Text
            numberOfLines={1}
            style={[styles.title, { color: colors.text }]}
          >
            {title}
          </Text>
        </View>

        {showSettings && onOpenSettings ? (
          <IconButton
            icon="settings-outline"
            label="Settings"
            color={colors.text}
            background={colors.surfaceSolid}
            border={colors.border}
            onPress={onOpenSettings}
          />
        ) : (
          <View style={styles.sideSpacer} />
        )}
      </View>

      {/* Tools row — compact actions */}
      <View style={styles.toolsRow}>
        <View
          style={[
            styles.navCluster,
            {
              backgroundColor: colors.surfaceSolid,
              borderColor: colors.border,
            },
          ]}
        >
          <ToolButton
            icon="chevron-back"
            label="Back"
            color={colors.text}
            disabled={!canGoBack}
            onPress={onBack}
          />
          <View style={[styles.sep, { backgroundColor: colors.border }]} />
          <ToolButton
            icon="chevron-forward"
            label="Forward"
            color={colors.text}
            disabled={!canGoForward}
            onPress={onForward}
          />
          <View style={[styles.sep, { backgroundColor: colors.border }]} />
          <ToolButton
            icon="reload"
            label="Reload"
            color={colors.text}
            onPress={onReload}
          />
        </View>

        <View style={styles.toolsEnd}>
          <IconButton
            icon={isBookmarked ? 'bookmark' : 'bookmark-outline'}
            label={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
            color={isBookmarked ? colors.primary : colors.text}
            background={
              isBookmarked ? colors.primarySoft : colors.surfaceSolid
            }
            border={colors.border}
            onPress={onToggleBookmark}
            size="sm"
          />

          {showAddLiteApp && onAddLiteApp ? (
            <Pressable
              onPress={onAddLiteApp}
              style={({ pressed }) => [
                styles.addChip,
                {
                  backgroundColor: colors.primarySoft,
                  borderColor: colors.primary,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Add Lite App"
            >
              <Ionicons name="add-circle" size={16} color={colors.primary} />
              <Text style={[styles.addLabel, { color: colors.primary }]}>
                Lite App
              </Text>
            </Pressable>
          ) : null}
        </View>
      </View>

      {loading ? (
        <View
          pointerEvents="none"
          style={[styles.progress, { backgroundColor: colors.primary }]}
        />
      ) : null}
    </View>
  );
}

function IconButton({
  icon,
  label,
  color,
  background,
  border,
  onPress,
  size = 'md',
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  background: string;
  border: string;
  onPress: () => void;
  size?: 'sm' | 'md';
}) {
  const dim = size === 'sm' ? 36 : 40;
  return (
    <Pressable
      onPress={onPress}
      hitSlop={6}
      style={({ pressed }) => [
        {
          width: dim,
          height: dim,
          borderRadius: radius.full,
          backgroundColor: background,
          borderColor: border,
          borderWidth: StyleSheet.hairlineWidth,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: pressed ? 0.7 : 1,
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Ionicons name={icon} size={size === 'sm' ? 18 : 20} color={color} />
    </Pressable>
  );
}

function ToolButton({
  icon,
  label,
  color,
  onPress,
  disabled = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={4}
      style={({ pressed }) => [
        styles.toolBtn,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
    >
      <Ionicons name={icon} size={20} color={color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
    overflow: 'hidden',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  titleBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    height: 40,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    minWidth: 0,
  },
  globeWrap: {
    width: 24,
    height: 24,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    ...typography.body,
    fontSize: 15,
    fontWeight: '600',
  },
  sideSpacer: {
    width: 40,
    height: 40,
  },
  toolsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  navCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 36,
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 2,
  },
  toolBtn: {
    width: 38,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sep: {
    width: StyleSheet.hairlineWidth,
    height: 16,
  },
  toolsEnd: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  addChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    height: 36,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
  },
  addLabel: {
    ...typography.caption,
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.3,
  },
  pressed: {
    opacity: 0.7,
  },
  progress: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 2,
  },
});
