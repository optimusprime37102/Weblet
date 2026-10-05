import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LiteAppSettingsPanel } from '@/components/lite-app-settings';
import { useApp } from '@/context/AppContext';
import { radius, spacing, typography } from '@/theme';

function firstParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? '';
  return value ?? '';
}

export default function LiteAppSettingsScreen() {
  const params = useLocalSearchParams<{ appId?: string | string[] }>();
  const appId = firstParam(params.appId);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, liteApps } = useApp();

  const app = useMemo(
    () => liteApps.find((item) => item.id === appId) ?? null,
    [liteApps, appId]
  );

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + spacing.lg,
            backgroundColor: colors.surfaceSolid,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Pressable
          onPress={() => router.back()}
          hitSlop={10}
          style={[styles.iconBtn, { backgroundColor: colors.backgroundSecondary }]}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
          Lite App Settings
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {!app ? (
        <View style={styles.missing}>
          <Text style={[styles.missingTitle, { color: colors.text }]}>
            Lite App not found
          </Text>
          <Text style={{ color: colors.textSecondary, textAlign: 'center' }}>
            It may have been removed.
          </Text>
        </View>
      ) : (
        <LiteAppSettingsPanel
          app={app}
          contentContainerStyle={{
            paddingBottom: insets.bottom + spacing.xxxl,
          }}
          onClearWebsiteData={() => {
            router.replace({
              pathname: '/browser',
              params: {
                url: app.url,
                title: app.name,
                appId: app.id,
                clearData: '1',
              },
            });
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSpacer: {
    width: 42,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    ...typography.title,
    fontSize: 17,
  },
  missing: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
    gap: spacing.sm,
  },
  missingTitle: {
    ...typography.title,
  },
});
