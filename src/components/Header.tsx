import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { radius, spacing, typography } from '@/theme';
import { useApp } from '@/context/AppContext';

export function Header() {
  const { colors } = useApp();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.wrap,
        {
          paddingTop: insets.top + spacing.lg,
          backgroundColor: colors.background,
        },
      ]}
    >
      <View style={styles.row}>
        <View
          style={[
            styles.mark,
            {
              backgroundColor: colors.primarySoft,
              borderColor: colors.border,
            },
          ]}
        >
          <Image
            source={require('../../assets/app-icon.png')}
            style={styles.markImage}
          />
        </View>
        <View style={styles.copy}>
          <Text style={[styles.brand, { color: colors.text }]}>Weblet</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Lite Apps Browser
          </Text>
        </View>
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
  mark: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  markImage: {
    width: 44,
    height: 44,
  },
  copy: {
    flex: 1,
    gap: 1,
  },
  brand: {
    ...typography.brand,
    letterSpacing: -0.6,
  },
  subtitle: {
    ...typography.subtitle,
  },
});
