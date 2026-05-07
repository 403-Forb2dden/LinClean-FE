import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors, Typography } from '@/constants/theme';

type Variant = 'checked' | 'unchecked';

interface CheckIconProps {
  variant?: Variant;
  checked?: boolean;
  label?: string;
  icon?: boolean;
  disabled?: boolean;
  onPress?: () => void;
}

function CheckMark({ color }: { color: string }) {
  return (
    <View style={[styles.checkmark, { borderColor: color }]} />
  );
}

function CheckIconGraphic({ checked, disabled }: { checked: boolean; disabled: boolean }) {
  const bgColor = disabled
    ? Colors.brand.line
    : checked
      ? Colors.brand.primary
      : Colors.brand.text;

  return (
    <View style={[styles.iconCircle, { backgroundColor: bgColor }]}>
      {checked && <CheckMark color={disabled ? Colors.brand.textHint : Colors.light.background} />}
    </View>
  );
}

export function CheckIcon({
  variant,
  checked,
  label,
  icon = true,
  disabled = false,
  onPress,
}: CheckIconProps) {
  const isChecked = checked ?? variant === 'checked';
  const labelColor = disabled ? Colors.brand.textHint : Colors.brand.textSecondary;

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [
        styles.container,
        pressed && !disabled && styles.pressed,
      ]}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: isChecked, disabled }}
    >
      {icon && <CheckIconGraphic checked={isChecked} disabled={disabled} />}
      {Boolean(label) && (
        <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
      )}
    </Pressable>
  );
}

const ICON_SIZE = 24;
const CHECKMARK_THICKNESS = 2;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pressed: {
    opacity: 0.6,
  },
  iconCircle: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: ICON_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    width: 5,
    height: 9,
    borderBottomWidth: CHECKMARK_THICKNESS,
    borderRightWidth: CHECKMARK_THICKNESS,
    borderColor: 'white',
    transform: [{ rotate: '45deg' }, { translateY: -2 }],
  },
  label: {
    ...Typography.caption,
  },
});
