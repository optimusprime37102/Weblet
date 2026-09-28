import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { radius, spacing, typography } from '@/theme';
import { useApp } from '@/context/AppContext';

type HeaderProps = {
  onMenuPress?: () => void;
  onSearchPress?: () => void;
  showSearch?: boolean;
};

export function Header({
  onMenuPress,
  onSearchPress,
  showSearch = true,
}: HeaderProps) {
  const { colors, setDrawerOpen } = useApp();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.wrap,
        {
          paddingTop: Math.max(insets.top, spacing.md),
          backgroundColor: colors.background,
        },
      ]}
    >
      <View style={styles.row}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open menu"
          onPress={() => {
            setDrawerOpen(true);
            onMenuPress?.();
          }}
          style={[styles.iconBtn, { backgroundColor: colors.surfaceSolid }]}
        >
          <Ionicons name="menu" size={22} color={colors.text} />
        </Pressable>

        <View style={styles.titleBlock}>
          <Text style={[styles.brand, { color: colors.text }]}>Weblet</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Lite Apps Browser
          </Text>
        </View>

        {showSearch ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Focus search"
            onPress={onSearchPress}
            style={[styles.iconBtn, { backgroundColor: colors.surfaceSolid }]}
          >
            <Ionicons name="search" size={20} color={colors.text} />
          </Pressable>
        ) : (
          <View style={styles.iconBtnGhost} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  iconBtnGhost: {
    width: 42,
    height: 42,
  },
  titleBlock: {
    flex: 1,
  },
  brand: {
    ...typography.brand,
  },
  subtitle: {
    ...typography.subtitle,
    marginTop: 1,
  },
});
