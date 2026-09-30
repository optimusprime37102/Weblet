import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { LiteApp } from '@/types';
import type { MenuAnchor } from '@/components/ManageLiteAppDialog';
import { AddAppTile, LiteAppIcon } from '@/components/LiteAppIcon';
import { spacing } from '@/theme';

type Props = {
  apps: LiteApp[];
  onOpenApp: (app: LiteApp) => void;
  onLongPressApp?: (app: LiteApp, anchor: MenuAnchor) => void;
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
          onLongPress={(anchor) => onLongPressApp?.(app, anchor)}
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
