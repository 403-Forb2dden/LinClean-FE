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
}

const VARIANT_CONFIG = {
  safe: {
    iconName: 'shield-check' as const,
    iconColor: Colors.brand.primary,
    glowColor: Colors.brand.softMint,
    chipBackground: Colors.brand.primary,
    chipTextColor: Colors.brand.text,
  },
  caution: {
    iconName: 'shield-alert' as const,
    iconColor: Colors.brand.textCaution,
    glowColor: '#F5ECC8',
    chipBackground: Colors.brand.textCaution,
    chipTextColor: Colors.brand.text,
  },
  danger: {
    iconName: 'shield-remove' as const,
    iconColor: Colors.brand.textWarning,
    glowColor: '#F5C8C8',
    chipBackground: Colors.brand.textWarning,
    chipTextColor: Colors.brand.text,
  },
  block: {
    iconName: 'shield-remove' as const,
    iconColor: Colors.brand.textWarning,
    glowColor: '#F5C8C8',
    chipBackground: Colors.brand.textWarning,
    chipTextColor: Colors.brand.text,
  },
};

export function ResultStatusIcon({
  variant,
  label,
  icon = true,
  disabled = false,
  size = 'default',
}: ResultStatusIconProps) {
  const config = VARIANT_CONFIG[variant];
  const isLarge = size === 'large';

  return (
    <View style={[styles.container, isLarge && styles.containerLarge, disabled && styles.disabled]}>
      {/* 외부 글로우 레이어 */}
      <View style={[styles.glowOuter, isLarge && styles.glowOuterLarge, { backgroundColor: config.glowColor, opacity: disabled ? 0.3 : 0.15 }]} />
      {/* 내부 글로우 레이어 */}
      <View style={[styles.glowInner, isLarge && styles.glowInnerLarge, { backgroundColor: config.glowColor, opacity: disabled ? 0.3 : 0.3 }]} />

      {/* 방패 아이콘 뱃지 */}
      <View style={[styles.badge, isLarge && styles.badgeLarge, { borderColor: config.iconColor, opacity: disabled ? 0.4 : 1 }]}>
        {icon && (
          <MaterialCommunityIcons
            name={config.iconName}
            size={isLarge ? 68 : 32}
            color={config.iconColor}
          />
        )}
      </View>

      {/* 하단 상태 칩 */}
      {label && (
        <View style={[styles.chip, isLarge && styles.chipLarge, { backgroundColor: config.chipBackground, opacity: disabled ? 0.4 : 1 }]}>
          <Text style={[styles.chipLabel, isLarge && styles.chipLabelLarge, { color: config.chipTextColor }]}>{label}</Text>
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
  badge: {
    width: BADGE_SIZE,
    height: BADGE_SIZE,
    borderRadius: BADGE_SIZE / 2,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  badgeLarge: {
    width: LARGE_BADGE_SIZE,
    height: LARGE_BADGE_SIZE,
    borderRadius: LARGE_BADGE_SIZE / 2,
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
  chipLabel: {
    ...Typography.caption,
  },
  chipLabelLarge: {
    ...Typography.summary,
    fontWeight: '700',
  },
});
