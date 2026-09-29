import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { LiteApp } from '@/types';
import { radius, spacing, typography } from '@/theme';
import { useApp } from '@/context/AppContext';

type Props = {
  app: LiteApp | null;
  visible: boolean;
  onCancel: () => void;
  onAddAutomatically: () => void | Promise<void>;
};

export function HomeScreenDialog({
  app,
  visible,
  onCancel,
  onAddAutomatically,
}: Props) {
  const { colors, isDark } = useApp();
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setFailed(false);
    setBusy(false);
  }, [app?.id, visible]);

  if (!app) return null;

  const handleAdd = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await onAddAutomatically();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
      statusBarTranslucent
    >
      <View style={[styles.backdrop, { backgroundColor: colors.overlay }]}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: isDark ? '#1C2434' : '#FFFFFF',
              shadowColor: colors.shadow,
            },
          ]}
        >
          <Text style={[styles.title, { color: colors.text }]}>
            System Home Screen
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Touch & hold to place manually
          </Text>

          <View
            style={[
              styles.preview,
              {
                backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                borderColor: colors.border,
              },
            ]}
          >
            <View
              style={[
                styles.iconWrap,
                {
                  backgroundColor: colors.iconBg,
                  borderColor: colors.border,
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
            <Text style={[styles.appName, { color: colors.text }]}>
              {app.name}
            </Text>
            <Text style={[styles.sizeLabel, { color: colors.textMuted }]}>
              1 × 1
            </Text>
          </View>

          <View style={styles.actions}>
            <Pressable
              onPress={onCancel}
              disabled={busy}
              hitSlop={8}
              style={({ pressed }) => [{ opacity: pressed || busy ? 0.6 : 1 }]}
            >
              <Text style={[styles.action, { color: colors.primary }]}>
                CANCEL
              </Text>
            </Pressable>
            <Pressable
              onPress={handleAdd}
              disabled={busy}
              hitSlop={8}
              style={({ pressed }) => [
                styles.addRow,
                { opacity: pressed || busy ? 0.6 : 1 },
              ]}
            >
              {busy ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Text style={[styles.action, { color: colors.primary }]}>
                  ADD AUTOMATICALLY
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
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
    shadowOpacity: 0.25,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  title: {
    ...typography.title,
    fontSize: 20,
    marginBottom: 4,
  },
  subtitle: {
    ...typography.caption,
    marginBottom: spacing.lg,
  },
  preview: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: spacing.xxl,
    marginBottom: spacing.lg,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: spacing.md,
  },
  favicon: {
    width: 44,
    height: 44,
    borderRadius: 10,
  },
  fallback: {
    fontSize: 28,
    fontWeight: '700',
  },
  appName: {
    ...typography.body,
    fontWeight: '700',
    marginBottom: 4,
  },
  sizeLabel: {
    ...typography.caption,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: spacing.xl,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  addRow: {
    minWidth: 140,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  action: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
});
