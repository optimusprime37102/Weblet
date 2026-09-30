import React, { useEffect, useMemo, useState } from 'react';
import {
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { LiteApp } from '@/types';
import { radius, spacing, typography } from '@/theme';
import { useApp } from '@/context/AppContext';

export type MenuAnchor = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type Props = {
  app: LiteApp | null;
  visible: boolean;
  anchor: MenuAnchor | null;
  onCancel: () => void;
  onOpen: () => void;
  onBookmark: () => void;
  onAddToHomeScreen: () => void;
  onRemove: () => void;
};

const MENU_WIDTH = 220;
const SCREEN_PAD = 12;

export function ManageLiteAppDialog({
  app,
  visible,
  anchor,
  onCancel,
  onOpen,
  onBookmark,
  onAddToHomeScreen,
  onRemove,
}: Props) {
  const { colors, isDark } = useApp();
  const [menuHeight, setMenuHeight] = useState(0);

  useEffect(() => {
    if (!visible) setMenuHeight(0);
  }, [visible]);

  const position = useMemo(() => {
    const { width: screenW, height: screenH } = Dimensions.get('window');
    if (!anchor) {
      return {
        top: screenH / 2 - 80,
        left: (screenW - MENU_WIDTH) / 2,
      };
    }

    let left = anchor.x + anchor.width / 2 - MENU_WIDTH / 2;
    left = Math.max(SCREEN_PAD, Math.min(left, screenW - MENU_WIDTH - SCREEN_PAD));

    const below = anchor.y + anchor.height + 6;
    const above = anchor.y - (menuHeight || 200) - 6;
    const fitsBelow = below + (menuHeight || 200) <= screenH - SCREEN_PAD;
    const top = fitsBelow
      ? below
      : Math.max(SCREEN_PAD, above);

    return { top, left };
  }, [anchor, menuHeight]);

  if (!app) return null;

  const sheetBg = isDark ? '#1C2434' : '#FFFFFF';
  const divider = colors.border;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
      statusBarTranslucent
    >
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <Pressable
          onPress={(e) => e.stopPropagation()}
          onLayout={(e) => setMenuHeight(e.nativeEvent.layout.height)}
          style={[
            styles.menu,
            {
              top: position.top,
              left: position.left,
              backgroundColor: sheetBg,
              shadowColor: colors.shadow,
              borderColor: divider,
            },
          ]}
        >
          <View style={[styles.header, { borderBottomColor: divider }]}>
            <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
              {app.name}
            </Text>
            <Text
              style={[styles.subtitle, { color: colors.textSecondary }]}
              numberOfLines={1}
            >
              {app.url}
            </Text>
          </View>

          <MenuItem
            icon="open-outline"
            label="Open"
            color={colors.text}
            onPress={onOpen}
          />
          <MenuItem
            icon="bookmark-outline"
            label="Bookmark it"
            color={colors.text}
            onPress={onBookmark}
          />
          <MenuItem
            icon="home-outline"
            label="Add to Home Screen"
            color={colors.text}
            onPress={onAddToHomeScreen}
          />
          <View style={[styles.separator, { backgroundColor: divider }]} />
          <MenuItem
            icon="trash-outline"
            label="Remove"
            color={colors.danger}
            onPress={onRemove}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function MenuItem({
  icon,
  label,
  color,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.item,
        pressed && styles.itemPressed,
      ]}
      accessibilityRole="menuitem"
      accessibilityLabel={label}
    >
      <Ionicons name={icon} size={18} color={color} />
      <Text style={[styles.itemLabel, { color }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.28)',
  },
  menu: {
    position: 'absolute',
    width: MENU_WIDTH,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: spacing.xs,
    shadowOpacity: 0.22,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
    overflow: 'hidden',
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.body,
    fontWeight: '700',
    marginBottom: 2,
  },
  subtitle: {
    ...typography.caption,
    fontSize: 11,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  itemPressed: {
    opacity: 0.65,
  },
  itemLabel: {
    ...typography.body,
    fontWeight: '600',
    flex: 1,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginVertical: spacing.xs,
    marginHorizontal: spacing.md,
  },
});
