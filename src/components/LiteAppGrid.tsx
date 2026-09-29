import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { LiteApp } from '@/types';
import { AddAppTile, LiteAppIcon } from '@/components/LiteAppIcon';
import { spacing } from '@/theme';

type Props = {
  apps: LiteApp[];
  onOpenApp: (app: LiteApp) => void;
  onLongPressApp?: (app: LiteApp) => void;
  onAddApp?: () => void;
};

export function LiteAppGrid({
  apps,
  onOpenApp,
  onLongPressApp,
  onAddApp,
}: Props) {
  return (
    <View style={styles.grid}>
      {apps.map((app) => (
        <LiteAppIcon
          key={app.id}
          app={app}
          onPress={() => onOpenApp(app)}
          onLongPress={() => onLongPressApp?.(app)}
        />
      ))}
      {onAddApp ? <AddAppTile onPress={onAddApp} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.md,
  },
});
