import { Pressable, StyleSheet, Text } from 'react-native';
import { Colors, Typography } from '@/constants/theme';
import { useGuardedPress } from '@/utils/press-guard';
import { IconSymbol } from './icon-symbol';

type Variant = 'delete' | 'erase';

interface ActionIconButtonProps {
  variant: Variant;
  label?: string;
  icon?: boolean;
  disabled?: boolean;
  onPress?: () => void;
}

const ICON_NAME: Record<Variant, 'trash' | 'eraser'> = {
  delete: 'trash',
  erase: 'eraser',
};

export function ActionIconButton({
  variant,
  label,
  icon = true,
  disabled = false,
  onPress,
}: ActionIconButtonProps) {
  const iconColor = disabled ? Colors.brand.textHint : Colors.brand.primary;
  const labelColor = disabled ? Colors.brand.textHint : Colors.brand.textSecondary;
  const showIcon = icon;
  const showLabel = Boolean(label);
  const guardedOnPress = useGuardedPress(onPress, { disabled });

  return (
    <Pressable
      onPress={guardedOnPress}
      style={({ pressed }) => [
        styles.container,
        pressed && !disabled && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
    >
      {showIcon && (
        <IconSymbol name={ICON_NAME[variant]} size={18} color={iconColor} />
      )}
      {showLabel && (
        <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pressed: {
    opacity: 0.6,
  },
  label: {
    ...Typography.caption,
  },
});
