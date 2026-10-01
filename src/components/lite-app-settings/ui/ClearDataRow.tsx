import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '@/context/AppContext';
import { radius, spacing, typography } from '@/theme';

type Props = {
  onPress: () => void;
};

export function ClearDataRow({ onPress }: Props) {
  const { colors } = useApp();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={[styles.iconWrap, { backgroundColor: colors.dangerSoft }]}>
        <Ionicons name="trash-outline" size={18} color={colors.danger} />
      </View>
      <View style={styles.text}>
        <Text style={[styles.label, { color: colors.danger }]}>
          Clear Website Data
        </Text>
        <Text style={[styles.caption, { color: colors.textSecondary }]}>
          Removes cookies and cache. May sign you out.
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  pressed: {
    opacity: 0.7,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flex: 1,
    gap: 2,
  },
  label: {
    ...typography.body,
    fontWeight: '700',
  },
  caption: {
    ...typography.caption,
    lineHeight: 16,
  },
});
