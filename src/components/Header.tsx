import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { spacing, typography } from '@/theme';
import { useApp } from '@/context/AppContext';

export function Header() {
  const { colors } = useApp();
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
      <Text style={[styles.brand, { color: colors.text }]}>Weblet</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Lite Apps Browser
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  brand: {
    ...typography.brand,
  },
  subtitle: {
    ...typography.subtitle,
    marginTop: 1,
  },
});
