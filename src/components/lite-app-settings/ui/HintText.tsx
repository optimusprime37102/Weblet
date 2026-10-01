import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { useApp } from '@/context/AppContext';
import { spacing, typography } from '@/theme';

export function HintText({ children }: { children: React.ReactNode }) {
  const { colors } = useApp();
  return (
    <Text style={[styles.hint, { color: colors.textMuted }]}>{children}</Text>
  );
}

const styles = StyleSheet.create({
  hint: {
    ...typography.caption,
    marginTop: spacing.md,
    lineHeight: 16,
    paddingHorizontal: spacing.xs,
  },
});
