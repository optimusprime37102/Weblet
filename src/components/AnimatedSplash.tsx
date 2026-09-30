import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  cancelAnimation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

/** Deep ink — distinct from the bright OS splash red. */
const BG = '#120E10';
const GLOW = 'rgba(249, 52, 62, 0.28)';
const TRACK = 'rgba(255, 255, 255, 0.12)';
const BAR = '#FF5A5F';
const BAR_GLOW = 'rgba(255, 90, 95, 0.55)';
const TEXT = '#FFF7F7';
const MUTED = 'rgba(255, 247, 247, 0.62)';
const LABEL = 'rgba(255, 247, 247, 0.42)';

const LOAD_DURATION_MS = 4000;
const EXIT_FADE_MS = 480;

type Props = {
  ready: boolean;
  onFinish: () => void;
};

export function AnimatedSplash({ ready, onFinish }: Props) {
  const progress = useSharedValue(0);
  const pulse = useSharedValue(0);
  const iconLift = useSharedValue(0);
  const titleLift = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  const footerOpacity = useSharedValue(0);
  const exitOpacity = useSharedValue(1);
  const [barDone, setBarDone] = useState(false);
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    contentOpacity.value = withTiming(1, {
      duration: 480,
      easing: Easing.out(Easing.cubic),
    });

    iconLift.value = withDelay(
      80,
      withTiming(1, { duration: 780, easing: Easing.out(Easing.cubic) })
    );

    titleLift.value = withDelay(
      220,
      withTiming(1, { duration: 720, easing: Easing.out(Easing.cubic) })
    );

    footerOpacity.value = withDelay(
      360,
      withTiming(1, { duration: 520, easing: Easing.out(Easing.cubic) })
    );

    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 1600, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    );

    // Fill 0% → 100% over exactly 4 seconds from splash start.
    progress.value = 0;
    progress.value = withTiming(
      1,
      { duration: LOAD_DURATION_MS, easing: Easing.inOut(Easing.cubic) },
      (finished) => {
        if (finished) runOnJS(setBarDone)(true);
      }
    );

    const started = Date.now();
    const tick = setInterval(() => {
      const p = Math.min(
        100,
        Math.round(((Date.now() - started) / LOAD_DURATION_MS) * 100)
      );
      setPercent(p);
      if (p >= 100) clearInterval(tick);
    }, 50);

    return () => {
      clearInterval(tick);
      cancelAnimation(iconLift);
      cancelAnimation(titleLift);
      cancelAnimation(pulse);
      cancelAnimation(progress);
      cancelAnimation(footerOpacity);
    };
  }, [
    contentOpacity,
    footerOpacity,
    iconLift,
    pulse,
    progress,
    titleLift,
  ]);

  useEffect(() => {
    if (!ready || !barDone) return;

    exitOpacity.value = withTiming(
      0,
      { duration: EXIT_FADE_MS, easing: Easing.out(Easing.cubic) },
      (finished) => {
        if (finished) runOnJS(onFinish)();
      }
    );
  }, [ready, barDone, exitOpacity, onFinish]);

  const rootStyle = useAnimatedStyle(() => ({
    opacity: exitOpacity.value * contentOpacity.value,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(pulse.value, [0, 1], [0.9, 1.14]) }],
    opacity: interpolate(pulse.value, [0, 1], [0.32, 0.7]),
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(iconLift.value, [0, 1], [22, 0]) },
      { scale: interpolate(iconLift.value, [0, 1], [0.88, 1]) },
    ],
    opacity: interpolate(iconLift.value, [0, 1], [0.35, 1]),
  }));

  const titleStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(titleLift.value, [0, 1], [16, 0]) },
    ],
    opacity: interpolate(titleLift.value, [0, 1], [0, 1]),
  }));

  const footerStyle = useAnimatedStyle(() => ({
    opacity: footerOpacity.value,
    transform: [
      { translateY: interpolate(footerOpacity.value, [0, 1], [12, 0]) },
    ],
  }));

  const barStyle = useAnimatedStyle(() => ({
    width: `${interpolate(progress.value, [0, 1], [0, 100])}%`,
  }));

  const tipStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.02, 1], [0, 1, 1]),
  }));

  return (
    <Animated.View style={[styles.root, rootStyle]} pointerEvents="auto">
      <LinearGradient
        colors={['#5A1A1E', '#2A1216', '#120E10', '#0A0809']}
        locations={[0, 0.32, 0.68, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.gradient}
      />

      <View style={styles.center}>
        <Animated.View style={[styles.glow, glowStyle]} />
        <Animated.View style={[styles.iconWrap, iconStyle]}>
          <Image
            source={require('../../assets/app-icon.png')}
            style={styles.icon}
            resizeMode="cover"
          />
        </Animated.View>

        <Animated.View style={[styles.titleBlock, titleStyle]}>
          <Text style={styles.brand}>Weblet</Text>
          <Text style={styles.tagline}>Lite Apps Browser</Text>
        </Animated.View>
      </View>

      <Animated.View style={[styles.footer, footerStyle]}>
        <View style={styles.metaRow}>
          <Text style={styles.loading}>Loading your lite apps</Text>
          <Text style={styles.percent}>{percent}%</Text>
        </View>

        <View style={styles.track}>
          <Animated.View style={[styles.bar, barStyle]}>
            <Animated.View style={[styles.barTip, tipStyle]} />
          </Animated.View>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFill,
    backgroundColor: BG,
    zIndex: 100,
  },
  gradient: {
    ...StyleSheet.absoluteFill,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingBottom: 72,
  },
  glow: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: GLOW,
  },
  iconWrap: {
    width: 124,
    height: 124,
    borderRadius: 32,
    overflow: 'hidden',
    marginBottom: 26,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    shadowColor: '#F9343E',
    shadowOpacity: 0.4,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 12 },
    elevation: 18,
  },
  icon: {
    width: '100%',
    height: '100%',
  },
  titleBlock: {
    alignItems: 'center',
  },
  brand: {
    color: TEXT,
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -0.8,
    marginBottom: 8,
  },
  tagline: {
    color: MUTED,
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: '18%',
    alignItems: 'center',
    paddingHorizontal: 0,
  },
  metaRow: {
    width: '70%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  loading: {
    color: LABEL,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  percent: {
    color: TEXT,
    fontSize: 13,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  track: {
    width: '70%',
    height: 6,
    borderRadius: 99,
    backgroundColor: TRACK,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  bar: {
    height: '100%',
    borderRadius: 99,
    backgroundColor: BAR,
    minWidth: 0,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  barTip: {
    width: 18,
    height: '100%',
    borderRadius: 99,
    backgroundColor: '#FFD0D2',
    shadowColor: BAR_GLOW,
    shadowOpacity: 1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
});
