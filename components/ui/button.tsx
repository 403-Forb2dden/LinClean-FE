import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type TouchableOpacityProps,
} from 'react-native';

import { Colors, Typography } from '@/constants/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'large' | 'medium' | 'small';

export interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  loading?: boolean;
}

export function Button({
  label,
  variant = 'primary',
  size = 'medium',
  icon,
  iconPosition = 'left',
  disabled = false,
  loading = false,
  onPress,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.base,
        styles[`size_${size}` as keyof typeof styles],
        styles[`variant_${variant}` as keyof typeof styles],
        isDisabled && styles[`variant_${variant}_disabled` as keyof typeof styles],
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.75}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? '#fff' : Colors.brand.primary}
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <View style={styles.iconLeft}>{icon}</View>
          )}
          <Text
            style={[
              styles.label,
              styles[`label_${size}` as keyof typeof styles],
              styles[`label_${variant}` as keyof typeof styles],
              isDisabled && styles[`label_${variant}_disabled` as keyof typeof styles],
            ]}
          >
            {label}
          </Text>
          {icon && iconPosition === 'right' && (
            <View style={styles.iconRight}>{icon}</View>
          )}
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },

  // --- Size variants ---
  size_large: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 18,
  },
  size_medium: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  size_small: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },

  // --- Color variants ---
  variant_primary: {
    backgroundColor: Colors.brand.primary,
    borderColor: Colors.brand.primary,
  },
  variant_primary_disabled: {
    backgroundColor: Colors.brand.softMint,
    borderColor: Colors.brand.softMint,
  },
  variant_secondary: {
    backgroundColor: 'transparent',
    borderColor: Colors.brand.primary,
  },
  variant_secondary_disabled: {
    borderColor: Colors.brand.line,
  },
  variant_ghost: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  variant_ghost_disabled: {},

  // --- Label base ---
  label: {
    textAlign: 'center',
  },

  // --- Label sizes ---
  label_large: {
    ...Typography.body,
    fontWeight: '700',
  },
  label_medium: {
    ...Typography.summary,
    fontWeight: '700',
  },
  label_small: {
    ...Typography.caption,
  },

  // --- Label colors per variant ---
  label_primary: {
    color: '#fff',
  },
  label_primary_disabled: {
    color: Colors.brand.textHint,
  },
  label_secondary: {
    color: Colors.brand.primary,
  },
  label_secondary_disabled: {
    color: Colors.brand.textHint,
  },
  label_ghost: {
    color: Colors.brand.primary,
  },
  label_ghost_disabled: {
    color: Colors.brand.textHint,
  },

  // --- Icon spacing ---
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});
