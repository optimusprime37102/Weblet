import React, { useEffect } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useApp } from '@/context/AppContext';
import { radius, spacing } from '@/theme';

type ShimmerBoxProps = {
  width: number | `${number}%`;
  height: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
  /** Shared sweep progress so one catalog skeleton doesn't spawn dozens of animations. */
  progress: SharedValue<number>;
};

function ShimmerBox({
  width,
  height,
  borderRadius = radius.md,
  style,
  progress,
}: ShimmerBoxProps) {
  const { colors, isDark } = useApp();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -80 + progress.value * 220 }],
  }));

  const base = isDark ? 'rgba(255,247,247,0.08)' : 'rgba(40,18,22,0.07)';
  const highlight = isDark
    ? 'rgba(255,247,247,0.18)'
    : 'rgba(255,255,255,0.75)';

  return (
    <View
      style={[
        styles.box,
        {
          width,
          height,
          borderRadius,
          backgroundColor: base,
        },
        style,
      ]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Animated.View style={[styles.sweep, animatedStyle]}>
        <LinearGradient
          colors={['transparent', highlight, 'transparent']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.gradient}
        />
      </Animated.View>
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          {
            borderRadius,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: colors.border,
          },
        ]}
      />
    </View>
  );
}

type CatalogShimmerProps = {
  sections?: number;
  tilesPerSection?: number;
};

/** Lightweight skeleton — one shared animation, few tiles. */
export function CatalogShimmer({
  sections = 2,
  tilesPerSection = 3,
}: CatalogShimmerProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      -1,
      false
    );
  }, [progress]);

  return (
    <View style={styles.catalog} accessibilityLabel="Loading ready-made apps">
      {Array.from({ length: sections }).map((_, sectionIndex) => (
        <View key={`shim-section-${sectionIndex}`} style={styles.section}>
          <View style={styles.sectionHeader}>
            <ShimmerBox
              width={110}
              height={18}
              borderRadius={radius.sm}
              progress={progress}
            />
            <ShimmerBox
              width={72}
              height={14}
              borderRadius={radius.sm}
              progress={progress}
            />
          </View>
          <View style={styles.grid}>
            {Array.from({ length: tilesPerSection }).map((__, tileIndex) => (
              <View
                key={`shim-tile-${sectionIndex}-${tileIndex}`}
                style={styles.tile}
              >
                <ShimmerBox
                  width={58}
                  height={58}
                  borderRadius={radius.lg}
                  style={styles.tileIcon}
                  progress={progress}
                />
                <ShimmerBox
                  width="70%"
                  height={12}
                  borderRadius={radius.sm}
                  progress={progress}
                />
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    overflow: 'hidden',
  },
  sweep: {
    ...StyleSheet.absoluteFill,
    width: 80,
  },
  gradient: {
    flex: 1,
  },
  catalog: {
    flex: 1,
    paddingTop: spacing.lg,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.sm,
  },
  tile: {
    width: '33.333%',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
    marginBottom: spacing.xl,
  },
  tileIcon: {
    marginBottom: spacing.sm,
  },
});
