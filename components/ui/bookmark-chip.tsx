import { Pressable, StyleSheet, Text, View } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Typography } from '@/constants/theme';

export type BookmarkChipVariant = 'active' | 'inactive';

interface BookmarkChipProps {
  variant?: BookmarkChipVariant;
  label?: string;
  icon?: boolean;
  disabled?: boolean;
  onPress?: () => void;
}

export function BookmarkChip({
  variant = 'inactive',
  label = '북마크',
  icon = true,
  disabled = false,
  onPress,
}: BookmarkChipProps) {
  const isActive = variant === 'active';

  const containerStyle = disabled
    ? styles.chipDisabled
    : isActive
      ? styles.chipActive
      : styles.chipInactive;

  const textColor = disabled
    ? Colors.brand.textHint
    : isActive
      ? Colors.brand.text
      : Colors.brand.textSecondary;

  const iconColor = disabled
    ? Colors.brand.textHint
    : isActive
      ? Colors.brand.text
      : Colors.brand.textSecondary;

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [
        styles.chip,
        containerStyle,
        pressed && !disabled && styles.chipPressed,
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled, selected: isActive }}
      accessibilityLabel={`${label} 필터 ${isActive ? '활성' : '비활성'}`}
    >
      {icon && (
        <IconSymbol
          name={isActive ? 'bookmark.fill' : 'bookmark'}
          size={14}
          color={iconColor}
        />
      )}
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 100,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  chipInactive: {
    backgroundColor: Colors.light.background,
    borderColor: Colors.brand.line,
  },
  chipActive: {
    backgroundColor: Colors.brand.softMint,
    borderColor: Colors.brand.softMint,
  },
  chipDisabled: {
    backgroundColor: Colors.brand.background,
    borderColor: Colors.brand.line,
  },
  chipPressed: {
    opacity: 0.7,
  },
  label: {
    ...Typography.caption,
  },
});
