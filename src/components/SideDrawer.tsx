import React from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '@/context/AppContext';
import { radius, spacing, typography } from '@/theme';

const LINKS = [
  { label: 'Lite Apps', icon: 'apps-outline' as const, href: '/(tabs)' },
  { label: 'Bookmarks', icon: 'bookmark-outline' as const, href: '/(tabs)/bookmarks' },
  { label: 'Settings', icon: 'settings-outline' as const, href: '/(tabs)/settings' },
  { label: 'Ready-made', icon: 'grid-outline' as const, href: '/ready-made' },
  { label: 'Create Your Own', icon: 'add-circle-outline' as const, href: '/add-app' },
];

export function SideDrawer() {
  const { colors, drawerOpen, setDrawerOpen, liteApps, bookmarks } = useApp();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <Modal
      visible={drawerOpen}
      transparent
      animationType="fade"
      onRequestClose={() => setDrawerOpen(false)}
    >
      <View style={styles.root}>
        <Pressable
          style={[styles.overlay, { backgroundColor: colors.overlay }]}
          onPress={() => setDrawerOpen(false)}
        />
        <View
          style={[
            styles.panel,
            {
              backgroundColor: colors.surfaceSolid,
              paddingTop: insets.top + spacing.lg,
              paddingBottom: insets.bottom + spacing.lg,
            },
          ]}
        >
          <View style={styles.brandRow}>
            <View
              style={[styles.logo, { backgroundColor: colors.primarySoft }]}
            >
              <Ionicons name="planet" size={22} color={colors.primary} />
            </View>
            <View>
              <Text style={[styles.brand, { color: colors.text }]}>Weblet</Text>
              <Text style={{ color: colors.textSecondary, ...typography.caption }}>
                Turn sites into lite apps
              </Text>
            </View>
          </View>

          <View style={styles.stats}>
            <View style={[styles.stat, { backgroundColor: colors.surfaceMuted }]}>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {liteApps.length}
              </Text>
              <Text style={{ color: colors.textSecondary, ...typography.caption }}>
                Lite Apps
              </Text>
            </View>
            <View style={[styles.stat, { backgroundColor: colors.surfaceMuted }]}>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {bookmarks.length}
              </Text>
              <Text style={{ color: colors.textSecondary, ...typography.caption }}>
                Bookmarks
              </Text>
            </View>
          </View>

          <View style={styles.links}>
            {LINKS.map((link) => (
              <Pressable
                key={link.label}
                onPress={() => {
                  setDrawerOpen(false);
                  router.push(link.href as never);
                }}
                style={({ pressed }) => [
                  styles.link,
                  pressed && { backgroundColor: colors.primarySoft },
                ]}
              >
                <Ionicons name={link.icon} size={20} color={colors.text} />
                <Text style={[styles.linkLabel, { color: colors.text }]}>
                  {link.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={[styles.footer, { color: colors.textMuted }]}>
            Weblet v1.0 · Lightweight browsing
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: 'row',
  },
  overlay: {
    ...StyleSheet.absoluteFill,
  },
  panel: {
    width: '78%',
    maxWidth: 320,
    paddingHorizontal: spacing.lg,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 20,
    shadowOffset: { width: 4, height: 0 },
    elevation: 12,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  logo: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    ...typography.brand,
    fontSize: 20,
  },
  stats: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  stat: {
    flex: 1,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 2,
  },
  links: {
    gap: spacing.xs,
    flex: 1,
  },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
  },
  linkLabel: {
    ...typography.body,
    fontWeight: '600',
  },
  footer: {
    ...typography.caption,
    marginTop: spacing.lg,
  },
});
