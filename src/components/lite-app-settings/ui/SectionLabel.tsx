import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { useApp } from '@/context/AppContext';
import { spacing, typography } from '@/theme';

export function SectionLabel({ children }: { children: React.ReactNode }) {
  const { colors } = useApp();
  return (
    <Text style={[styles.section, { color: colors.textSecondary }]}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  section: {
    ...typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
});
