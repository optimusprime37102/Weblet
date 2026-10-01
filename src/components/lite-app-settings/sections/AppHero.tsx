import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useApp } from '@/context/AppContext';
import type { LiteApp } from '@/types';
import { radius, spacing, typography } from '@/theme';

export function AppHero({ app }: { app: LiteApp }) {
  const { colors } = useApp();

  return (
    <View
      style={[
        styles.hero,
        {
          backgroundColor: colors.surfaceSolid,
          borderColor: colors.border,
        },
      ]}
    >
      <View
        style={[
          styles.icon,
          {
            backgroundColor: colors.iconBg,
            borderColor: colors.border,
          },
        ]}
      >
        {app.favicon ? (
          <Image source={{ uri: app.favicon }} style={styles.favicon} />
        ) : (
          <Text style={[styles.fallback, { color: colors.primary }]}>
            {app.name.charAt(0).toUpperCase()}
          </Text>
        )}
      </View>
      <View style={styles.text}>
        <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
          {app.name}
        </Text>
        <Text
          style={[styles.url, { color: colors.textSecondary }]}
          numberOfLines={1}
        >
          {app.url.replace(/^https?:\/\//, '')}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: spacing.md,
  },
  icon: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  favicon: {
    width: 32,
    height: 32,
  },
  fallback: {
    fontSize: 20,
    fontWeight: '700',
  },
  text: {
    flex: 1,
    gap: 2,
  },
  name: {
    ...typography.title,
    fontSize: 17,
  },
  url: {
    ...typography.caption,
  },
});
