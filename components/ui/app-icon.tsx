import {
  StyleSheet,
  Text,
  TouchableOpacity,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { Colors, Typography } from '@/constants/theme';
import { useGuardedPress } from '@/utils/press-guard';
import { IconSymbol, type IconSymbolName } from './icon-symbol';

export type AppIconName =
  | 'bookmark'
  | 'chevron-down'
  | 'chevron-right'
  | 'chevron-left'
  | 'pencil'
  | 'plus'
  | 'user'
  | 'back'
  | 'home'
  | 'more'
  | 'settings'
  | 'search';

const SYMBOL_MAP: Record<AppIconName, IconSymbolName> = {
  bookmark: 'bookmark.fill',
  'chevron-down': 'chevron.down',
  'chevron-right': 'chevron.right',
  'chevron-left': 'chevron.left',
  pencil: 'pencil',
  plus: 'plus',
  user: 'person.fill',
  back: 'chevron.left',
  home: 'house.fill',
  more: 'ellipsis',
  settings: 'gearshape.fill',
  search: 'magnifyingglass',
};

export interface AppIconProps {
  name: AppIconName;
  label?: string;
  icon?: boolean;
  disabled?: boolean;
  size?: number;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function AppIcon({
  name,
  label,
  icon = true,
  disabled = false,
  size = 24,
  onPress,
  style,
}: AppIconProps) {
  const iconColor = disabled ? Colors.brand.textHint : Colors.brand.text;
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
          name={SYMBOL_MAP[name]}
          size={size}
          color={iconColor}
        />
      )}
      {label != null && (
        <Text style={[styles.label, disabled && styles.labelDisabled]}>
          {label}
        </Text>
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
    ...Typography.caption,
    color: Colors.brand.text,
  },
  labelDisabled: {
    color: Colors.brand.textHint,
  },
});
