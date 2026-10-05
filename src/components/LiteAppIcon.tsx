import React, { useRef, useState } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { LiteApp } from '@/types';
import type { MenuAnchor } from '@/components/ManageLiteAppDialog';
import { radius, spacing, typography } from '@/theme';
import { useApp } from '@/context/AppContext';

type Props = {
  app: LiteApp;
  onPress: () => void;
  onLongPress?: (anchor: MenuAnchor) => void;
  style?: StyleProp<ViewStyle>;
};

export function LiteAppIcon({ app, onPress, onLongPress, style }: Props) {
  const { colors } = useApp();
  const [failed, setFailed] = useState(false);
  const itemRef = useRef<View>(null);

  const handleLongPress = () => {
    if (!onLongPress) return;
    itemRef.current?.measureInWindow((x, y, width, height) => {
      onLongPress({ x, y, width, height });
    });
  };

  return (
    <Pressable
      ref={itemRef}
      onPress={onPress}
      onLongPress={handleLongPress}
      delayLongPress={280}
      style={({ pressed }) => [styles.item, style, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={`Open ${app.name}`}
    >
      <View
        style={[
          styles.iconWrap,
          {
            backgroundColor: colors.iconBg,
            borderColor: colors.border,
            shadowColor: colors.shadow,
          },
        ]}
      >
        {!failed && app.favicon ? (
          <Image
            source={{ uri: app.favicon }}
            style={styles.favicon}
            onError={() => setFailed(true)}
          />
        ) : (
          <Text style={[styles.fallback, { color: colors.primary }]}>
            {app.name.charAt(0).toUpperCase()}
          </Text>
        )}
      </View>
      <Text
        numberOfLines={1}
        style={[styles.label, { color: colors.textSecondary }]}
      >
        {app.name}
      </Text>
    </Pressable>
  );
}

export function AddAppTile({
  onPress,
  style,
}: {
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useApp();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.item, style, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel="Add Lite App"
    >
      <View
        style={[
          styles.iconWrap,
          styles.addWrap,
          {
            borderColor: colors.primary,
            backgroundColor: colors.primarySoft,
          },
        ]}
      >
        <Ionicons name="add" size={28} color={colors.primary} />
      </View>
      <Text style={[styles.label, { color: colors.primary }]}>Add App</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: {
    width: '25%',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
    marginBottom: spacing.xl,
    // FlatList grids often pass an explicit width override.
  },
  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.96 }],
  },
  iconWrap: {
    width: 58,
    height: 58,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
    marginBottom: spacing.sm,
  },
  addWrap: {
    borderStyle: 'dashed',
    borderWidth: 1.5,
    shadowOpacity: 0,
    elevation: 0,
  },
  favicon: {
    width: 34,
    height: 34,
    borderRadius: 8,
  },
  fallback: {
    fontSize: 22,
    fontWeight: '700',
  },
  label: {
    ...typography.label,
    textAlign: 'center',
    width: '100%',
  },
});
