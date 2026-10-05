import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '@/context/AppContext';
import { radius, spacing, typography } from '@/theme';

type Props = {
  onExitFullScreen: () => void;
  onClose: () => void;
  onOpenSettings?: () => void;
};

export function FullScreenControls({
  onExitFullScreen,
  onClose,
  onOpenSettings,
}: Props) {
  const { colors } = useApp();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(progress, {
      toValue: open ? 1 : 0,
      useNativeDriver: true,
      friction: 8,
      tension: 80,
    }).start();
  }, [open, progress]);

  const collapse = useCallback(() => setOpen(false), []);
  const toggle = useCallback(() => setOpen((value) => !value), []);

  const panelStyle = {
    opacity: progress,
    transform: [
      {
        translateX: progress.interpolate({
          inputRange: [0, 1],
          outputRange: [12, 0],
        }),
      },
      {
        scale: progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0.94, 1],
        }),
      },
    ],
  };

  return (
    <View pointerEvents="box-none" style={styles.root}>
      {open ? (
        <Pressable
          style={styles.backdrop}
          onPress={collapse}
          accessibilityRole="button"
          accessibilityLabel="Dismiss controls"
        />
      ) : null}

      <View
        pointerEvents="box-none"
        style={[
          styles.anchor,
          { top: Math.max(insets.top + 160, 200) },
        ]}
      >
        {open ? (
          <Animated.View
            pointerEvents="box-none"
            style={[
              styles.panel,
              {
                backgroundColor: colors.surfaceSolid,
                borderColor: colors.border,
                shadowColor: colors.shadow,
              },
              panelStyle,
            ]}
          >
            <Pressable
              onPress={() => {
                collapse();
                onClose();
              }}
              style={({ pressed }) => [
                styles.actionBtn,
                {
                  backgroundColor: colors.backgroundSecondary,
                  opacity: pressed ? 0.75 : 1,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <Ionicons name="close" size={18} color={colors.text} />
              <Text style={[styles.actionLabel, { color: colors.text }]}>
                Close
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                collapse();
                onExitFullScreen();
              }}
              style={({ pressed }) => [
                styles.actionBtn,
                styles.exitBtn,
                {
                  backgroundColor: colors.primarySoft,
                  borderColor: colors.primary,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Exit full screen"
            >
              <Ionicons
                name="contract-outline"
                size={16}
                color={colors.primary}
              />
              <Text style={[styles.actionLabel, { color: colors.primary }]}>
                Exit Full Screen
              </Text>
            </Pressable>

            {onOpenSettings ? (
              <Pressable
                onPress={() => {
                  collapse();
                  onOpenSettings();
                }}
                style={({ pressed }) => [
                  styles.actionBtn,
                  {
                    backgroundColor: colors.backgroundSecondary,
                    opacity: pressed ? 0.75 : 1,
                  },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Settings"
              >
                <Ionicons
                  name="settings-outline"
                  size={18}
                  color={colors.text}
                />
                <Text style={[styles.actionLabel, { color: colors.text }]}>
                  Settings
                </Text>
              </Pressable>
            ) : null}
          </Animated.View>
        ) : null}

        <Pressable
          onPress={toggle}
          style={({ pressed }) => [
            styles.handle,
            {
              backgroundColor: colors.primary,
              borderColor: colors.primary,
              shadowColor: colors.shadow,
              opacity: pressed ? 0.55 : 0.72,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel={open ? 'Hide controls' : 'Show controls'}
        >
          <Ionicons
            name={open ? 'chevron-forward' : 'menu'}
            size={18}
            color="#FFFFFF"
          />
        </Pressable>
      </View>
    </View>
  );
}

const HANDLE_WIDTH = 34;
const HANDLE_HEIGHT = 54;

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  anchor: {
    position: 'absolute',
    right: 0,
    width: HANDLE_WIDTH,
    height: HANDLE_HEIGHT,
  },
  handle: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: HANDLE_WIDTH,
    height: HANDLE_HEIGHT,
    borderTopLeftRadius: radius.lg,
    borderBottomLeftRadius: radius.lg,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    borderWidth: StyleSheet.hairlineWidth,
    borderRightWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: -2, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  panel: {
    position: 'absolute',
    right: HANDLE_WIDTH + spacing.sm,
    top: 0,
    padding: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    gap: spacing.xs,
    minWidth: 168,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 6,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
  },
  exitBtn: {
    borderWidth: StyleSheet.hairlineWidth,
  },
  actionLabel: {
    ...typography.caption,
    fontWeight: '700',
    fontSize: 13,
  },
});
