import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useApp } from '@/context/AppContext';
import { radius, spacing } from '@/theme';

export function SettingCard({ children }: { children: React.ReactNode }) {
  const { colors } = useApp();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surfaceSolid,
          borderColor: colors.border,
        },
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    padding: spacing.md,
  },
});
