import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { radius, spacing, typography } from '@/theme';
import { useApp } from '@/context/AppContext';

type Props = {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message?: string;
};

export function EmptyState({
  icon = 'apps-outline',
  title,
  message,
}: Props) {
  const { colors } = useApp();

  return (
    <View style={styles.wrap}>
      <View
        style={[
          styles.iconCircle,
          { backgroundColor: colors.primarySoft },
        ]}
      >
        <Ionicons name={icon} size={28} color={colors.primary} />
      </View>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {message ? (
        <Text style={[styles.message, { color: colors.textSecondary }]}>
          {message}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.xxxl,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.title,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  message: {
    ...typography.body,
    textAlign: 'center',
    lineHeight: 22,
  },
});
