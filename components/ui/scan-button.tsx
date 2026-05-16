import { StyleSheet, Text, TouchableOpacity, type StyleProp, type ViewStyle } from 'react-native';
import { Colors, Typography } from '@/constants/theme';
import { IconSymbol } from './icon-symbol';

interface ScanButtonProps {
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function ScanButton({ onPress, disabled = false, style }: ScanButtonProps) {
  const color = disabled ? Colors.brand.textHint : Colors.brand.primary;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      style={[styles.container, disabled && styles.containerDisabled, style]}
    >
      <IconSymbol name="magnifyingglass" size={22} color={color} />
      <Text style={[styles.label, { color }]}>검사 시작</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: Colors.brand.surface,
    borderWidth: 1.5,
    borderColor: Colors.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  containerDisabled: {
    borderColor: Colors.brand.line,
    backgroundColor: Colors.brand.background,
  },
  label: {
    ...Typography.bold12,
  },
});
