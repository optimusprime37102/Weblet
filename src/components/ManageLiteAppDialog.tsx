import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import type { LiteApp } from '@/types';
import { radius, spacing, typography } from '@/theme';
import { useApp } from '@/context/AppContext';

type Props = {
  app: LiteApp | null;
  visible: boolean;
  onCancel: () => void;
  onOpen: () => void;
  onAddToHomeScreen: () => void;
  onRemove: () => void;
};

export function ManageLiteAppDialog({
  app,
  visible,
  onCancel,
  onOpen,
  onAddToHomeScreen,
  onRemove,
}: Props) {
  const { colors, isDark } = useApp();

  if (!app) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
      statusBarTranslucent
    >
      <Pressable
        style={[styles.backdrop, { backgroundColor: colors.overlay }]}
        onPress={onCancel}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={[
            styles.card,
            {
              backgroundColor: isDark ? '#1C2434' : '#FFFFFF',
              shadowColor: colors.shadow,
            },
          ]}
        >
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
            {app.name}
          </Text>
          <Text
            style={[styles.subtitle, { color: colors.textSecondary }]}
            numberOfLines={1}
          >
            {app.url}
          </Text>
          <Text style={[styles.hint, { color: colors.textMuted }]}>
            Manage this Lite App
          </Text>

          <View style={styles.actions}>
            <Action label="CANCEL" onPress={onCancel} color={colors.primary} />
            <Action label="OPEN" onPress={onOpen} color={colors.primary} />
            <Action
              label="ADD TO HOME SCREEN"
              onPress={onAddToHomeScreen}
              color={colors.primary}
            />
            <Action label="REMOVE" onPress={onRemove} color={colors.danger} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function Action({
  label,
  onPress,
  color,
}: {
  label: string;
  onPress: () => void;
  color: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={6}
      style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
    >
      <Text style={[styles.action, { color }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    borderRadius: radius.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    shadowOpacity: 0.22,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  title: {
    ...typography.title,
    fontSize: 18,
    marginBottom: 4,
  },
  subtitle: {
    ...typography.caption,
    marginBottom: spacing.sm,
  },
  hint: {
    ...typography.body,
    marginBottom: spacing.lg,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: spacing.lg,
    paddingTop: spacing.sm,
  },
  action: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
