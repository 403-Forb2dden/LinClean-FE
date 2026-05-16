import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View, type PressableProps } from 'react-native';

import { Colors, Typography } from '@/constants/theme';

export type SocialLoginProvider = 'google' | 'apple';

const IMG_GOOGLE = require('@/assets/images/ic_google.png');

interface SocialLoginButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  provider: SocialLoginProvider;
  label: string;
}

export function SocialLoginButton({ provider, label, disabled, ...rest }: SocialLoginButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        styles[provider],
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
      {...rest}
    >
      <View style={styles.iconSlot}>
        {provider === 'google' ? <GoogleLogoIcon /> : <AppleLogoIcon />}
      </View>
      <Text style={[styles.label, styles[`${provider}Label`]]}>{label}</Text>
    </Pressable>
  );
}

function GoogleLogoIcon() {
  return <Image source={IMG_GOOGLE} style={styles.googleIcon} contentFit="contain" />;
}

function AppleLogoIcon() {
  return <FontAwesome name="apple" size={24} color={Colors.social.appleButtonText} />;
}

const styles = StyleSheet.create({
  base: {
    width: '100%',
    minHeight: 56,
    borderRadius: 12,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  google: {
    backgroundColor: Colors.social.buttonBackground,
    borderColor: Colors.social.buttonBorder,
  },
  apple: {
    backgroundColor: Colors.social.appleButtonBackground,
    borderColor: Colors.social.appleButtonBackground,
  },
  pressed: {
    opacity: 0.82,
  },
  disabled: {
    opacity: 0.5,
  },
  iconSlot: {
    position: 'absolute',
    left: 20,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIcon: {
    width: '100%',
    height: '100%',
  },
  label: {
    ...Typography.body,
    fontWeight: '700',
    textAlign: 'center',
  },
  googleLabel: {
    color: Colors.brand.text,
  },
  appleLabel: {
    color: Colors.social.appleButtonText,
  },
});
