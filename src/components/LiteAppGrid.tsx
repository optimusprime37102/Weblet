import React, { useCallback, useMemo } from 'react';
import { FlatList, StyleSheet, useWindowDimensions } from 'react-native';
import type { LiteApp } from '@/types';
import type { MenuAnchor } from '@/components/ManageLiteAppDialog';
import { AddAppTile, LiteAppIcon } from '@/components/LiteAppIcon';
import { spacing } from '@/theme';

const NUM_COLUMNS = 4;

type GridItem =
  | { type: 'app'; app: LiteApp }
  | { type: 'add' };

type Props = {
  apps: LiteApp[];
  onOpenApp: (app: LiteApp) => void;
  onLongPressApp?: (app: LiteApp, anchor: MenuAnchor) => void;
  onAddApp?: () => void;
  ListHeaderComponent?: React.ReactElement | null;
  contentContainerStyle?: object;
  ListEmptyComponent?: React.ReactElement | null;
};

export function LiteAppGrid({
  apps,
  onOpenApp,
  onLongPressApp,
  onAddApp,
  ListHeaderComponent,
  contentContainerStyle,
  ListEmptyComponent,
}: Props) {
  const { width } = useWindowDimensions();
  const itemWidth = useMemo(() => width / NUM_COLUMNS, [width]);

  const data = useMemo<GridItem[]>(() => {
    const items: GridItem[] = apps.map((app) => ({ type: 'app', app }));
    if (onAddApp) items.push({ type: 'add' });
    return items;
  }, [apps, onAddApp]);

  const keyExtractor = useCallback((item: GridItem) => {
    return item.type === 'app' ? item.app.id : 'add-tile';
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: GridItem }) => {
      if (item.type === 'add') {
        return (
          <AddAppTile onPress={onAddApp!} style={{ width: itemWidth }} />
        );
      }
      return (
        <LiteAppIcon
          app={item.app}
          style={{ width: itemWidth }}
          onPress={() => onOpenApp(item.app)}
          onLongPress={(anchor) => onLongPressApp?.(item.app, anchor)}
        />
      );
    },
    [itemWidth, onAddApp, onLongPressApp, onOpenApp]
  );

  return (
    <FlatList
      data={data}
      keyExtractor={keyExtractor}
      numColumns={NUM_COLUMNS}
      renderItem={renderItem}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={ListEmptyComponent}
      contentContainerStyle={contentContainerStyle}
      showsVerticalScrollIndicator={false}
      initialNumToRender={24}
      maxToRenderPerBatch={24}
      windowSize={7}
      removeClippedSubviews
      columnWrapperStyle={data.length > 0 ? styles.row : undefined}
    />
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: spacing.sm,
  },
});
