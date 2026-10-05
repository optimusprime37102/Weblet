import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '@/context/AppContext';
import { prefetchCatalog } from '@/services/catalog';
import { radius, spacing, typography } from '@/theme';

const FAB_HEIGHT = 50;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateOwn: () => void;
  onReadyMade: () => void;
};

export function CreateFab({
  open,
  onOpenChange,
  onCreateOwn,
  onReadyMade,
}: Props) {
  const { colors } = useApp();

  // Warm catalog while the menu is open so Ready-made paints instantly.
  useEffect(() => {
    if (open) void prefetchCatalog();
  }, [open]);

  // Tab screen content already sits above the tab bar — keep FAB just above it.
  const fabBottom = spacing.sm;
  const menuBottom = fabBottom + FAB_HEIGHT + spacing.md;

  return (
    <View pointerEvents="box-none" style={styles.root}>
      {open ? (
        <Pressable
          style={[styles.backdrop, { backgroundColor: 'rgba(12, 8, 10, 0.72)' }]}
          onPress={() => onOpenChange(false)}
        />
      ) : null}

      {open ? (
        <View
          pointerEvents="box-none"
          style={[styles.menuAnchor, { bottom: menuBottom }]}
        >
          <View style={styles.menu}>
            <MenuItem
              label="Create Your Own"
              icon="create-outline"
              onPress={() => {
                // Navigate first so menu teardown doesn't delay the transition.
                onCreateOwn();
                onOpenChange(false);
              }}
            />
            <MenuItem
              label="Ready-made Lite Apps"
              icon="apps-outline"
              onPress={() => {
                onReadyMade();
                onOpenChange(false);
              }}
            />
          </View>
        </View>
      ) : null}

      <View
        pointerEvents="box-none"
        style={[styles.fabAnchor, { bottom: fabBottom }]}
      >
        <Pressable
          onPress={() => onOpenChange(!open)}
          style={({ pressed }) => [
            styles.fab,
            {
              backgroundColor: colors.primary,
              opacity: pressed ? 0.88 : 1,
              shadowColor: colors.primary,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel={open ? 'Close create menu' : 'Create Lite App'}
        >
          <Ionicons name={open ? 'close' : 'add'} size={22} color="#FFFFFF" />
          <Text style={styles.fabLabel}>Create</Text>
        </Pressable>
      </View>
    </View>
  );
}

function MenuItem({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}) {
  const { colors } = useApp();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.menuRow,
        { opacity: pressed ? 0.82 : 1 },
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Text style={styles.menuLabel}>{label}</Text>
      <View
        style={[
          styles.menuIcon,
          {
            backgroundColor: '#FFFFFF',
            shadowColor: colors.shadow,
          },
        ]}
      >
        <Ionicons name={icon} size={20} color={colors.primary} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFill,
    zIndex: 30,
  },
  fabAnchor: {
    position: 'absolute',
    right: spacing.lg,
  },
  fab: {
    height: FAB_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    borderRadius: radius.full,
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  fabLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  menuAnchor: {
    position: 'absolute',
    right: spacing.lg,
    alignItems: 'flex-end',
  },
  menu: {
    gap: spacing.md,
    alignItems: 'flex-end',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  menuLabel: {
    ...typography.body,
    fontWeight: '700',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
});
