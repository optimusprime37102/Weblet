import React, { useEffect, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '@/context/AppContext';
import { getFaviconUrl } from '@/services/favicon';
import { getDisplayNameFromUrl } from '@/utils/url';
import { radius, spacing, typography } from '@/theme';

type Props = {
  visible: boolean;
  initialName: string;
  initialUrl: string;
  onCancel: () => void;
  onConfirm: (input: {
    name: string;
    url: string;
    addToHomeScreen: boolean;
  }) => void;
};

export function CreateLiteAppSheet({
  visible,
  initialName,
  initialUrl,
  onCancel,
  onConfirm,
}: Props) {
  const { colors, isDark } = useApp();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState(initialName);
  const [url, setUrl] = useState(initialUrl);
  const [addToHomeScreen, setAddToHomeScreen] = useState(true);

  useEffect(() => {
    if (!visible) return;
    setName(initialName || getDisplayNameFromUrl(initialUrl));
    setUrl(initialUrl);
    setAddToHomeScreen(true);
  }, [visible, initialName, initialUrl]);

  const favicon = url ? getFaviconUrl(url) : null;
  const sheetBg = isDark ? '#1A2332' : colors.surfaceSolid;
  const fieldBg = isDark ? '#121A27' : colors.backgroundSecondary;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onCancel}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable
          style={[styles.backdrop, { backgroundColor: colors.overlay }]}
          onPress={onCancel}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={[
              styles.sheet,
              {
                backgroundColor: sheetBg,
                paddingBottom: Math.max(insets.bottom, spacing.lg),
              },
            ]}
          >
            <Text style={[styles.title, { color: colors.text }]}>
              Create a Lite App
            </Text>

            <View style={styles.nameRow}>
              <OutlinedField
                label="Name your Lite App"
                value={name}
                onChangeText={setName}
                fieldBg={fieldBg}
                labelBg={sheetBg}
                borderColor={colors.borderStrong}
                textColor={colors.text}
                labelColor={colors.textSecondary}
                style={styles.nameField}
              />
              <View
                style={[
                  styles.iconPreview,
                  {
                    backgroundColor: colors.iconBg,
                    borderColor: colors.border,
                  },
                ]}
              >
                {favicon ? (
                  <Image source={{ uri: favicon }} style={styles.favicon} />
                ) : (
                  <Ionicons
                    name="globe-outline"
                    size={28}
                    color={colors.textMuted}
                  />
                )}
              </View>
            </View>

            <OutlinedField
              label="URL"
              value={url}
              onChangeText={setUrl}
              fieldBg={fieldBg}
              labelBg={sheetBg}
              borderColor={colors.borderStrong}
              textColor={colors.text}
              labelColor={colors.textSecondary}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />

            <Pressable
              onPress={() => setAddToHomeScreen((v) => !v)}
              style={styles.checkRow}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: addToHomeScreen }}
            >
              <View
                style={[
                  styles.checkbox,
                  {
                    borderColor: addToHomeScreen
                      ? colors.primary
                      : colors.borderStrong,
                    backgroundColor: addToHomeScreen
                      ? colors.primary
                      : 'transparent',
                  },
                ]}
              >
                {addToHomeScreen ? (
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                ) : null}
              </View>
              <Text style={[styles.checkLabel, { color: colors.text }]}>
                Add to Home Screen
              </Text>
            </Pressable>

            <View style={styles.actions}>
              <Pressable
                onPress={onCancel}
                hitSlop={8}
                style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
              >
                <Text style={[styles.cancelLabel, { color: colors.text }]}>
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                onPress={() =>
                  onConfirm({
                    name: name.trim() || getDisplayNameFromUrl(url),
                    url: url.trim(),
                    addToHomeScreen,
                  })
                }
                style={({ pressed }) => [
                  styles.okBtn,
                  {
                    backgroundColor: isDark ? '#2A3548' : colors.surfaceMuted,
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}
              >
                <Text style={[styles.okLabel, { color: colors.text }]}>OK</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function OutlinedField({
  label,
  value,
  onChangeText,
  fieldBg,
  labelBg,
  borderColor,
  textColor,
  labelColor,
  style,
  ...rest
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  fieldBg: string;
  labelBg: string;
  borderColor: string;
  textColor: string;
  labelColor: string;
  style?: StyleProp<ViewStyle>;
} & React.ComponentProps<typeof TextInput>) {
  return (
    <View style={[styles.fieldWrap, style]}>
      <Text
        style={[
          styles.fieldLabel,
          { color: labelColor, backgroundColor: labelBg },
        ]}
      >
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor={labelColor}
        style={[
          styles.fieldInput,
          {
            color: textColor,
            backgroundColor: fieldBg,
            borderColor,
          },
        ]}
        {...rest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    gap: spacing.lg,
  },
  title: {
    ...typography.title,
    fontSize: 20,
    marginBottom: spacing.xs,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  nameField: {
    flex: 1,
  },
  iconPreview: {
    width: 64,
    height: 64,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  favicon: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  fieldWrap: {
    position: 'relative',
  },
  fieldLabel: {
    position: 'absolute',
    top: -8,
    left: 12,
    zIndex: 1,
    paddingHorizontal: 4,
    ...typography.caption,
    fontSize: 11,
  },
  fieldInput: {
    ...typography.body,
    minHeight: 52,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkLabel: {
    ...typography.body,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.lg,
    marginTop: spacing.sm,
  },
  cancelLabel: {
    ...typography.body,
    fontWeight: '600',
  },
  okBtn: {
    paddingHorizontal: spacing.xl,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 72,
  },
  okLabel: {
    ...typography.body,
    fontWeight: '700',
  },
});
