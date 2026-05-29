import { StyleSheet, Text, TouchableOpacity, type StyleProp, type ViewStyle } from 'react-native';

import { Colors, Typography } from '@/constants/theme';
import { useGuardedPress } from '@/utils/press-guard';
import { IconSymbol } from './icon-symbol';

export interface FolderIconProps {
  active?: boolean;
  icon?: boolean;
  label?: string;
  disabled?: boolean;
  size?: number;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function FolderIcon({
  active = false,
  icon = true,
  label,
  disabled = false,
  size = 24,
  onPress,
  style,
}: FolderIconProps) {
  const iconColor = disabled
    ? Colors.brand.textHint
    : active
      ? Colors.brand.text
      : Colors.brand.textSecondary;

  const labelColor = disabled
    ? Colors.brand.textHint
    : active
      ? Colors.brand.text
      : Colors.brand.textSecondary;
  const guardedOnPress = useGuardedPress(onPress, { disabled });

  return (
    <TouchableOpacity
      onPress={guardedOnPress}
      disabled={disabled}
      activeOpacity={0.7}
      style={[styles.container, style]}
    >
      {icon && (
        <IconSymbol
          name={active ? 'folder.fill' : 'folder'}
          size={size}
          color={iconColor}
        />
      )}
      {label != null && (
        <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  label: {
    ...Typography.regular12,
  },
});
