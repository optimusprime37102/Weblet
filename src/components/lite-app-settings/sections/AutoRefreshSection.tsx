import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useApp } from '@/context/AppContext';
import { AUTO_REFRESH_OPTIONS } from '@/services/liteAppSettings';
import type { AutoRefreshInterval, LiteAppSettings } from '@/types';
import { radius, spacing, typography } from '@/theme';
import { HintText, SectionLabel, SettingCard, ToggleRow } from '../ui';

type Props = {
  settings: LiteAppSettings;
  onChange: (patch: Partial<LiteAppSettings>) => void;
};

export function AutoRefreshSection({ settings, onChange }: Props) {
  const { colors, isDark } = useApp();

  return (
    <>
      <SectionLabel>Auto Refresh</SectionLabel>
      <SettingCard>
        <ToggleRow
          icon="refresh-outline"
          label="Auto Refresh"
          caption="Reload while this Lite App is open and active"
          value={settings.autoRefreshEnabled}
          onValueChange={(autoRefreshEnabled) =>
            onChange({ autoRefreshEnabled })
          }
        />
        {settings.autoRefreshEnabled ? (
          <>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <Text style={[styles.intervalLabel, { color: colors.textSecondary }]}>
              Interval
            </Text>
            <View style={styles.chipRow}>
              {AUTO_REFRESH_OPTIONS.map((option) => {
                const active = settings.autoRefreshInterval === option.value;
                return (
                  <Pressable
                    key={option.value}
                    onPress={() =>
                      onChange({
                        autoRefreshInterval:
                          option.value as AutoRefreshInterval,
                      })
                    }
                    style={[
                      styles.chip,
                      {
                        backgroundColor: active
                          ? colors.primarySoft
                          : isDark
                            ? colors.surfaceMuted
                            : colors.backgroundSecondary,
                        borderColor: active ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipLabel,
                        { color: active ? colors.primary : colors.text },
                      ]}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <HintText>
              Timer pauses when the app goes to the background.
            </HintText>
          </>
        ) : null}
      </SettingCard>
    </>
  );
}

const styles = StyleSheet.create({
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 6,
  },
  intervalLabel: {
    ...typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
  },
  chipLabel: {
    ...typography.caption,
    fontWeight: '700',
  },
});
