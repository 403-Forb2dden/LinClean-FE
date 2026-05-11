import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SocialLoginButton, type SocialLoginProvider } from '@/components/ui/social-login-button';
import { Colors, Typography } from '@/constants/theme';

const IMG_WORDMARK = require('@/assets/images/login_wordmark.png');

type ClerkOAuthStrategy = 'oauth_google' | 'oauth_apple';

const OAUTH_STRATEGY_BY_PROVIDER: Record<SocialLoginProvider, ClerkOAuthStrategy> = {
  google: 'oauth_google',
  apple: 'oauth_apple',
};

export default function LoginScreen() {
  const insets = useSafeAreaInsets();

  const handleClerkOAuthLogin = (provider: SocialLoginProvider) => {
    const strategy = OAUTH_STRATEGY_BY_PROVIDER[provider];

    // TODO: Clerk useOAuth({ strategy }) 연동 후 startOAuthFlow 결과에 따라 라우팅 처리
    void strategy;
    router.replace('/(tabs)/(home)');
  };

  const handleGoogleLogin = () => handleClerkOAuthLogin('google');
  const handleAppleLogin = () => handleClerkOAuthLogin('apple');

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.logoSection}>
        <Image source={IMG_WORDMARK} style={styles.wordmark} contentFit="contain" />
        <Text style={styles.subtitle}>
          {'링크를 안전하게 저장하고\n필요할 때 바로 꺼내보세요'}
        </Text>
      </View>

      <View style={styles.bottomSection}>
        <SocialLoginButton
          provider="google"
          label="Google로 계속하기"
          onPress={handleGoogleLogin}
        />
        <SocialLoginButton
          provider="apple"
          label="Apple로 계속하기"
          onPress={handleAppleLogin}
        />

        <Text style={styles.terms}>
          계속 진행하면 서비스 이용약관 및 개인정보 처리방침에 동의하는 것으로 간주됩니다.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.brand.background,
    paddingHorizontal: 24,
  },
  logoSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  wordmark: {
    width: 284,
    height: 80,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.brand.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
  },
  bottomSection: {
    gap: 10,
    paddingBottom: 16,
  },
  terms: {
    ...Typography.url,
    color: Colors.brand.textHint,
    textAlign: 'center',
    lineHeight: 18,
  },
});
