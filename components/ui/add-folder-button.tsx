import { StyleSheet, Text, TouchableOpacity, type TouchableOpacityProps } from 'react-native';

import { Colors, Typography } from '@/constants/theme';
import { useGuardedPress } from '@/utils/press-guard';

export interface AddFolderButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  label?: string;
  icon?: boolean;
  disabled?: boolean;
}

export function AddFolderButton({
  label = '폴더 추가',
  icon = true,
  disabled = false,
  onPress,
  ...rest
}: AddFolderButtonProps) {
  const guardedOnPress = useGuardedPress(onPress, { disabled });

  return (
    <TouchableOpacity
      style={[styles.base, disabled && styles.disabled]}
      onPress={guardedOnPress}
      disabled={disabled}
      activeOpacity={0.75}
      {...rest}
    >
      {icon && (
        <Text style={[styles.icon, disabled && styles.iconDisabled]}>+</Text>
      )}
      <Text style={[styles.label, disabled && styles.labelDisabled]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.brand.line,
    backgroundColor: Colors.brand.surface,
    gap: 2,
  },
  disabled: {
    borderColor: Colors.brand.line,
    backgroundColor: Colors.brand.softMint,
  },
  icon: {
    ...Typography.section,
    color: Colors.brand.primary,
    lineHeight: 20,
  },
  iconDisabled: {
    color: Colors.brand.textHint,
  },
  label: {
    ...Typography.caption,
    color: Colors.brand.text,
  },
  labelDisabled: {
    color: Colors.brand.textHint,
  },
});
