import React, { useMemo, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '@/context/AppContext';
import { getFaviconUrl } from '@/services/favicon';
import {
  getDisplayNameFromUrl,
  isValidHttpUrl,
  normalizeUrl,
} from '@/utils/url';
import { radius, spacing, typography } from '@/theme';

export default function AddAppScreen() {
  const { colors, addLiteApp, setPendingHomeShortcut } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [urlInput, setUrlInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [saving, setSaving] = useState(false);

  const previewUrl = useMemo(() => {
    const normalized = normalizeUrl(urlInput);
    return isValidHttpUrl(normalized) ? normalized : '';
  }, [urlInput]);

  const previewName =
    nameInput.trim() ||
    (previewUrl ? getDisplayNameFromUrl(previewUrl) : 'New Lite App');

  const onSave = async () => {
    if (!previewUrl) {
      Alert.alert('Invalid URL', 'Enter a valid website address.');
      return;
    }

    setSaving(true);
    try {
      const app = await addLiteApp({
        name: nameInput.trim() || undefined,
        url: previewUrl,
      });
      if (app) {
        setPendingHomeShortcut(app);
        router.back();
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View
        style={[
          styles.header,
          {
            paddingTop: Math.max(insets.top, spacing.md),
            borderBottomColor: colors.border,
            backgroundColor: colors.surfaceSolid,
          },
        ]}
      >
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="close" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Add Lite App
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.body}>
        <View
          style={[
            styles.preview,
            {
              backgroundColor: colors.surfaceSolid,
              borderColor: colors.border,
            },
          ]}
        >
          <View
            style={[
              styles.previewIcon,
              { backgroundColor: colors.iconBg, borderColor: colors.border },
            ]}
          >
            {previewUrl ? (
              <Image
                source={{ uri: getFaviconUrl(previewUrl) }}
                style={styles.favicon}
              />
            ) : (
              <Ionicons name="globe-outline" size={28} color={colors.textMuted} />
            )}
          </View>
          <Text style={[styles.previewName, { color: colors.text }]}>
            {previewName}
          </Text>
          <Text style={{ color: colors.textSecondary, ...typography.caption }}>
            {previewUrl || 'Enter a URL to preview'}
          </Text>
        </View>

        <Text style={[styles.label, { color: colors.textSecondary }]}>URL</Text>
        <TextInput
          value={urlInput}
          onChangeText={setUrlInput}
          placeholder="https://example.com"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          style={[
            styles.input,
            {
              color: colors.text,
              backgroundColor: colors.surfaceSolid,
              borderColor: colors.border,
            },
          ]}
        />

        <Text style={[styles.label, { color: colors.textSecondary }]}>
          Name (optional)
        </Text>
        <TextInput
          value={nameInput}
          onChangeText={setNameInput}
          placeholder="App name"
          placeholderTextColor={colors.textMuted}
          style={[
            styles.input,
            {
              color: colors.text,
              backgroundColor: colors.surfaceSolid,
              borderColor: colors.border,
            },
          ]}
        />

        <Pressable
          onPress={onSave}
          disabled={saving || !previewUrl}
          style={({ pressed }) => [
            styles.saveBtn,
            {
              backgroundColor: colors.primary,
              opacity: saving || !previewUrl ? 0.5 : pressed ? 0.85 : 1,
            },
          ]}
        >
          <Text style={styles.saveLabel}>
            {saving ? 'Saving…' : 'Add Lite App'}
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    ...typography.title,
  },
  body: {
    padding: spacing.lg,
  },
  preview: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    borderRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: spacing.xl,
  },
  previewIcon: {
    width: 72,
    height: 72,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: spacing.md,
  },
  favicon: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  previewName: {
    ...typography.title,
    marginBottom: 4,
  },
  label: {
    ...typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: spacing.sm,
  },
  input: {
    ...typography.body,
    height: 50,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  saveBtn: {
    height: 52,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  saveLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
