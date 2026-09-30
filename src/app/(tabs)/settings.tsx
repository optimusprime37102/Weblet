import React from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '@/context/AppContext';
import type { ThemeMode } from '@/types';
import { radius, spacing, typography } from '@/theme';

const THEME_OPTIONS: Array<{
  value: ThemeMode;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}> = [
  { value: 'system', label: 'System', icon: 'phone-portrait-outline' },
  { value: 'light', label: 'Light', icon: 'sunny-outline' },
  { value: 'dark', label: 'Dark', icon: 'moon-outline' },
];

const QUICK_LINKS: Array<{
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  href: '/ready-made' | '/add-app';
}> = [
  { label: 'Ready-made Lite Apps', icon: 'grid-outline', href: '/ready-made' },
  { label: 'Create Your Own', icon: 'add-circle-outline', href: '/add-app' },
];

export default function SettingsScreen() {
  const {
    colors,
    themeMode,
    setThemeMode,
    liteApps,
    bookmarks,
    clearAllData,
  } = useApp();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const confirmClear = () => {
    Alert.alert(
      'Reset Weblet?',
      'This clears all Lite Apps and bookmarks.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => clearAllData(),
        },
      ]
    );
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[
        styles.content,
        { paddingTop: Math.max(insets.top, spacing.md) },
      ]}
    >
      <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Appearance, create apps, data, and about
      </Text>

      <Text style={[styles.section, { color: colors.textSecondary }]}>
        Create
      </Text>
      <View
        style={[
          styles.card,
          { backgroundColor: colors.surfaceSolid, borderColor: colors.border },
        ]}
      >
        {QUICK_LINKS.map((link, index) => (
          <Pressable
            key={link.href}
            onPress={() => router.push(link.href)}
            style={[
              styles.row,
              index < QUICK_LINKS.length - 1 && {
                borderBottomWidth: StyleSheet.hairlineWidth,
                borderBottomColor: colors.border,
              },
            ]}
          >
            <View style={styles.rowLeft}>
              <Ionicons name={link.icon} size={20} color={colors.text} />
              <Text style={[styles.rowLabel, { color: colors.text }]}>
                {link.label}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </Pressable>
        ))}
      </View>

      <Text style={[styles.section, { color: colors.textSecondary }]}>
        Appearance
      </Text>
      <View
        style={[
          styles.card,
          { backgroundColor: colors.surfaceSolid, borderColor: colors.border },
        ]}
      >
        {THEME_OPTIONS.map((option, index) => {
          const active = themeMode === option.value;
          return (
            <Pressable
              key={option.value}
              onPress={() => setThemeMode(option.value)}
              style={[
                styles.row,
                index < THEME_OPTIONS.length - 1 && {
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: colors.border,
                },
              ]}
            >
              <View style={styles.rowLeft}>
                <Ionicons name={option.icon} size={20} color={colors.text} />
                <Text style={[styles.rowLabel, { color: colors.text }]}>
                  {option.label}
                </Text>
              </View>
              <Ionicons
                name={active ? 'radio-button-on' : 'radio-button-off'}
                size={20}
                color={active ? colors.primary : colors.textMuted}
              />
            </Pressable>
          );
        })}
      </View>

      <Text style={[styles.section, { color: colors.textSecondary }]}>
        Data
      </Text>
      <View
        style={[
          styles.card,
          { backgroundColor: colors.surfaceSolid, borderColor: colors.border },
        ]}
      >
        <View style={[styles.row, styles.staticRow]}>
          <Text style={[styles.rowLabel, { color: colors.text }]}>Lite Apps</Text>
          <Text style={{ color: colors.textSecondary }}>{liteApps.length}</Text>
        </View>
        <View
          style={[
            styles.row,
            styles.staticRow,
            {
              borderTopWidth: StyleSheet.hairlineWidth,
              borderTopColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.rowLabel, { color: colors.text }]}>Bookmarks</Text>
          <Text style={{ color: colors.textSecondary }}>{bookmarks.length}</Text>
        </View>
        <Pressable
          onPress={confirmClear}
          style={[
            styles.row,
            {
              borderTopWidth: StyleSheet.hairlineWidth,
              borderTopColor: colors.border,
            },
          ]}
        >
          <View style={styles.rowLeft}>
            <Ionicons name="trash-outline" size={20} color={colors.danger} />
            <Text style={[styles.rowLabel, { color: colors.danger }]}>
              Reset all data
            </Text>
          </View>
        </Pressable>
      </View>

      <Text style={[styles.section, { color: colors.textSecondary }]}>
        About
      </Text>
      <View
        style={[
          styles.card,
          { backgroundColor: colors.surfaceSolid, borderColor: colors.border },
        ]}
      >
        <View style={[styles.row, styles.staticRow]}>
          <Text style={[styles.rowLabel, { color: colors.text }]}>Weblet</Text>
          <Text style={{ color: colors.textSecondary }}>v1.0.0</Text>
        </View>
        <Text
          style={[
            styles.about,
            {
              color: colors.textSecondary,
              borderTopColor: colors.border,
            },
          ]}
        >
          Turn websites into lightweight apps. Save space, reduce clutter, and
          keep your favorite sites one tap away.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  title: {
    ...typography.brand,
    marginBottom: 4,
  },
  subtitle: {
    ...typography.body,
    marginBottom: spacing.xl,
  },
  section: {
    ...typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  card: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  staticRow: {
    minHeight: 52,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  rowLabel: {
    ...typography.body,
    fontWeight: '600',
  },
  about: {
    ...typography.body,
    lineHeight: 22,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
