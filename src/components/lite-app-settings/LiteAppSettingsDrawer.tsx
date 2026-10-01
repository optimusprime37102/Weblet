import React, { useCallback, useEffect, useState } from 'react';
import {
  BackHandler,
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  Easing,
  Extrapolation,
  cancelAnimation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '@/context/AppContext';
import type { LiteApp } from '@/types';
import { BRAND_RED, radius, spacing, typography } from '@/theme';
import { LiteAppSettingsPanel } from './LiteAppSettingsPanel';

const SCREEN_WIDTH = Dimensions.get('window').width;
const DRAWER_WIDTH = Math.min(SCREEN_WIDTH * 0.92, 400);

const OPEN_SPRING = {
  damping: 28,
  stiffness: 240,
  mass: 0.9,
  overshootClamping: true,
};

const CLOSE_TIMING = {
  duration: 260,
  easing: Easing.bezier(0.4, 0, 0.2, 1),
};

type Props = {
  visible: boolean;
  app: LiteApp | null;
  onClose: () => void;
  onClearWebsiteData: () => void;
};

export function LiteAppSettingsDrawer({
  visible,
  app,
  onClose,
  onClearWebsiteData,
}: Props) {
  const { colors, isDark } = useApp();
  const insets = useSafeAreaInsets();
  const progress = useSharedValue(0);
  const [mounted, setMounted] = useState(false);

  const finishUnmount = useCallback(() => {
    setMounted(false);
  }, []);

  useEffect(() => {
    if (visible) {
      cancelAnimation(progress);
      progress.value = 0;
      setMounted(true);
      return;
    }

    if (!mounted) return;

    cancelAnimation(progress);
    progress.value = withTiming(0, CLOSE_TIMING, (finished) => {
      if (finished) runOnJS(finishUnmount)();
    });
  }, [visible, mounted, progress, finishUnmount]);

  const startOpenAnimation = useCallback(() => {
    cancelAnimation(progress);
    progress.value = 0;
    progress.value = withSpring(1, OPEN_SPRING);
  }, [progress]);

  useEffect(() => {
    if (!visible) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });
    return () => sub.remove();
  }, [visible, onClose]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      progress.value,
      [0, 1],
      [0, 1],
      Extrapolation.CLAMP
    ),
  }));

  const drawerStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      progress.value,
      [0, 1],
      [DRAWER_WIDTH, 0],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ translateX }],
      opacity: interpolate(
        progress.value,
        [0, 0.15, 1],
        [0.85, 1, 1],
        Extrapolation.CLAMP
      ),
    };
  });

  if (!mounted || !app) return null;

  const panelBg = isDark ? colors.surfaceSolid : colors.background;

  return (
    <Modal
      visible={mounted}
      transparent
      animationType="none"
      onRequestClose={onClose}
      onShow={startOpenAnimation}
      statusBarTranslucent
    >
      <View style={styles.root} pointerEvents="box-none">
        <Animated.View
          pointerEvents={visible ? 'auto' : 'none'}
          style={[
            styles.backdrop,
            { backgroundColor: colors.overlay },
            backdropStyle,
          ]}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        <Animated.View
          style={[
            styles.drawer,
            {
              width: DRAWER_WIDTH,
              backgroundColor: BRAND_RED,
              shadowColor: colors.shadow,
              borderLeftColor: colors.border,
            },
            drawerStyle,
          ]}
        >
          <View
            style={[
              styles.drawerInner,
              {
                backgroundColor: panelBg,
                marginTop: insets.top,
                paddingBottom: Math.max(insets.bottom, spacing.md),
              },
            ]}
          >
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
              <View style={styles.headerText}>
                <Text
                  style={[
                    styles.headerEyebrow,
                    { color: colors.textSecondary },
                  ]}
                >
                  Lite App
                </Text>
                <Text style={[styles.headerTitle, { color: colors.text }]}>
                  Settings
                </Text>
              </View>
              <Pressable
                onPress={onClose}
                style={({ pressed }) => [
                  styles.closeBtn,
                  {
                    backgroundColor: colors.surfaceSolid,
                    borderColor: colors.border,
                    opacity: pressed ? 0.75 : 1,
                  },
                ]}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Close settings"
              >
                <Ionicons name="close" size={20} color={colors.text} />
              </Pressable>
            </View>

            <LiteAppSettingsPanel
              app={app}
              contentContainerStyle={{
                paddingBottom: spacing.xxxl,
              }}
              onClearWebsiteData={() => {
                onClose();
                setTimeout(() => onClearWebsiteData(), 280);
              }}
            />
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  drawer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: radius.xl,
    borderBottomLeftRadius: radius.xl,
    borderLeftWidth: StyleSheet.hairlineWidth,
    shadowOpacity: 0.28,
    shadowRadius: 24,
    shadowOffset: { width: -8, height: 0 },
    elevation: 18,
    overflow: 'hidden',
  },
  drawerInner: {
    flex: 1,
    borderTopLeftRadius: radius.xl,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerText: {
    gap: 2,
  },
  headerEyebrow: {
    ...typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  headerTitle: {
    ...typography.title,
    fontSize: 20,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
