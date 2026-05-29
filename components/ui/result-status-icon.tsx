import { StyleSheet, View, Text } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Colors, Typography } from '@/constants/theme';

type Variant = 'safe' | 'caution' | 'danger' | 'block';

interface ResultStatusIconProps {
  variant: Variant;
  label?: string;
  icon?: boolean;
  disabled?: boolean;
  size?: 'default' | 'large';
  compact?: boolean;
}

const VARIANT_CONFIG = {
  safe: {
    iconName: 'shield-check' as const,
    iconColor: Colors.brand.verdict.safe.accent,
    glowColor: Colors.brand.verdict.safe.background,
    chipBackground: Colors.brand.verdict.safe.accent,
    chipTextColor: Colors.brand.text,
  },
  caution: {
    iconName: 'shield-alert' as const,
    iconColor: Colors.brand.verdict.caution.accent,
    glowColor: Colors.brand.verdict.caution.background,
    chipBackground: Colors.brand.verdict.caution.accent,
    chipTextColor: Colors.brand.text,
  },
  danger: {
    iconName: 'shield-remove' as const,
    iconColor: Colors.brand.textWarning,
    glowColor: '#F5C8C8',
    chipBackground: Colors.brand.textWarning,
    chipTextColor: Colors.light.background,
  },
  block: {
    iconName: 'shield-remove' as const,
    iconColor: Colors.brand.textWarning,
    glowColor: '#F5C8C8',
    chipBackground: Colors.brand.textWarning,
    chipTextColor: Colors.light.background,
  },
};

export function ResultStatusIcon({
  variant,
  label,
  icon = true,
  disabled = false,
  size = 'default',
  compact = false,
}: ResultStatusIconProps) {
  const config = VARIANT_CONFIG[variant];
  const isLarge = size === 'large';
  const isCompactLarge = isLarge && compact;

  return (
    <View
      style={[
        styles.container,
        isLarge && styles.containerLarge,
        isCompactLarge && styles.containerLargeCompact,
        disabled && styles.disabled,
      ]}
    >
      {/* 외부 글로우 레이어 */}
      <View
        style={[
          styles.glowOuter,
          isLarge && styles.glowOuterLarge,
          isCompactLarge && styles.glowOuterLargeCompact,
          { backgroundColor: config.glowColor, opacity: disabled ? 0.3 : 0.15 },
        ]}
      />
      {/* 내부 글로우 레이어 */}
      <View
        style={[
          styles.glowInner,
          isLarge && styles.glowInnerLarge,
          isCompactLarge && styles.glowInnerLargeCompact,
          { backgroundColor: config.glowColor, opacity: disabled ? 0.3 : 0.3 },
        ]}
      />

      {/* 방패 아이콘 뱃지 */}
      <View
        style={[
          styles.badge,
          isLarge && styles.badgeLarge,
          isCompactLarge && styles.badgeLargeCompact,
          { borderColor: config.iconColor, opacity: disabled ? 0.4 : 1 },
        ]}
      >
        {icon && (
          <MaterialCommunityIcons
            name={config.iconName}
            size={isCompactLarge ? 52 : isLarge ? 68 : 32}
            color={config.iconColor}
          />
        )}
      </View>

      {/* 하단 상태 칩 */}
      {label && (
        <View
          style={[
            styles.chip,
            isLarge && styles.chipLarge,
            isCompactLarge && styles.chipLargeCompact,
            { backgroundColor: config.chipBackground, opacity: disabled ? 0.4 : 1 },
          ]}
        >
          <Text
            style={[
              styles.chipLabel,
              isLarge && styles.chipLabelLarge,
              isCompactLarge && styles.chipLabelLargeCompact,
              { color: config.chipTextColor },
            ]}
          >
            {label}
          </Text>
        </View>
      )}
    </View>
  );
}

const CONTAINER_SIZE = 108;
const BADGE_SIZE = 56;
const GLOW_OUTER_SIZE = CONTAINER_SIZE;
const GLOW_INNER_SIZE = 80;
const LARGE_CONTAINER_SIZE = 216;
const LARGE_BADGE_SIZE = 136;
const COMPACT_LARGE_CONTAINER_SIZE = 168;
const COMPACT_LARGE_BADGE_SIZE = 104;

const styles = StyleSheet.create({
  container: {
    width: CONTAINER_SIZE,
    height: CONTAINER_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  containerLarge: {
    width: LARGE_CONTAINER_SIZE,
    height: LARGE_CONTAINER_SIZE,
  },
  containerLargeCompact: {
    width: COMPACT_LARGE_CONTAINER_SIZE,
    height: COMPACT_LARGE_CONTAINER_SIZE,
  },
  disabled: {
    opacity: 0.5,
  },
  glowOuter: {
    position: 'absolute',
    width: GLOW_OUTER_SIZE,
    height: GLOW_OUTER_SIZE,
    borderRadius: GLOW_OUTER_SIZE / 2,
  },
  glowOuterLarge: {
    width: LARGE_CONTAINER_SIZE,
    height: LARGE_CONTAINER_SIZE,
    borderRadius: LARGE_CONTAINER_SIZE / 2,
  },
  glowOuterLargeCompact: {
    width: COMPACT_LARGE_CONTAINER_SIZE,
    height: COMPACT_LARGE_CONTAINER_SIZE,
    borderRadius: COMPACT_LARGE_CONTAINER_SIZE / 2,
  },
  glowInner: {
    position: 'absolute',
    width: GLOW_INNER_SIZE,
    height: GLOW_INNER_SIZE,
    borderRadius: GLOW_INNER_SIZE / 2,
  },
  glowInnerLarge: {
    width: LARGE_BADGE_SIZE,
    height: LARGE_BADGE_SIZE,
    borderRadius: LARGE_BADGE_SIZE / 2,
  },
  glowInnerLargeCompact: {
    width: COMPACT_LARGE_BADGE_SIZE,
    height: COMPACT_LARGE_BADGE_SIZE,
    borderRadius: COMPACT_LARGE_BADGE_SIZE / 2,
  },
  badge: {
    width: BADGE_SIZE,
    height: BADGE_SIZE,
    borderRadius: BADGE_SIZE / 2,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.brand.overlayInverseSubtle,
  },
  badgeLarge: {
    width: LARGE_BADGE_SIZE,
    height: LARGE_BADGE_SIZE,
    borderRadius: LARGE_BADGE_SIZE / 2,
  },
  badgeLargeCompact: {
    width: COMPACT_LARGE_BADGE_SIZE,
    height: COMPACT_LARGE_BADGE_SIZE,
    borderRadius: COMPACT_LARGE_BADGE_SIZE / 2,
  },
  chip: {
    position: 'absolute',
    bottom: 0,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 99,
  },
  chipLarge: {
    paddingHorizontal: 20,
    paddingVertical: 6,
  },
  chipLargeCompact: {
    paddingHorizontal: 16,
    paddingVertical: 5,
  },
  chipLabel: {
    ...Typography.caption,
  },
  chipLabelLarge: {
    ...Typography.summary,
    fontWeight: '700',
  },
  chipLabelLargeCompact: {
    ...Typography.bold12,
  },
});
