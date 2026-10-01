import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '@/context/AppContext';
import { radius, spacing, typography } from '@/theme';

type Option<T extends string> = {
  value: T;
  label: string;
  caption: string;
  icon: keyof typeof Ionicons.glyphMap;
};

type Props<T extends string> = {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
};

export function OptionRows<T extends string>({
  options,
  value,
  onChange,
}: Props<T>) {
  const { colors } = useApp();

  return (
    <View>
      {options.map((option, index) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            style={[
              styles.row,
              index > 0 && {
                borderTopWidth: StyleSheet.hairlineWidth,
                borderTopColor: colors.border,
              },
            ]}
          >
            <View
              style={[
                styles.iconWrap,
                {
                  backgroundColor: active
                    ? colors.primarySoft
                    : colors.surfaceMuted,
                },
              ]}
            >
              <Ionicons
                name={option.icon}
                size={18}
                color={active ? colors.primary : colors.textSecondary}
              />
            </View>
            <View style={styles.text}>
              <Text style={[styles.label, { color: colors.text }]}>
                {option.label}
              </Text>
              <Text style={[styles.caption, { color: colors.textSecondary }]}>
                {option.caption}
              </Text>
            </View>
            <Ionicons
              name={active ? 'radio-button-on' : 'radio-button-off'}
              size={22}
              color={active ? colors.primary : colors.textMuted}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
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
    fontWeight: '600',
  },
  caption: {
    ...typography.caption,
    lineHeight: 16,
  },
});
