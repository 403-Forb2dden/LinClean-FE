import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, Typography } from '@/constants/theme';
import { KakaoIcon } from '@/components/ui/kakao-icon';

const IMG_WORDMARK = require('@/assets/images/login_wordmark.png');

export default function LoginScreen() {
  const insets = useSafeAreaInsets();

  const handleKakaoLogin = () => {
    // TODO: 카카오 OAuth 구현
    router.replace('/(tabs)/(home)');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.logoSection}>
        <Image source={IMG_WORDMARK} style={styles.wordmark} contentFit="contain" />
        <Text style={styles.subtitle}>
          {'링크를 안전하게 저장하고\n필요할 때 바로 꺼내보세요'}
        </Text>
      </View>

      <View style={styles.bottomSection}>
        <Pressable
          onPress={handleKakaoLogin}
          style={({ pressed }) => [styles.kakaoButton, pressed && styles.kakaoButtonPressed]}
        >
          <KakaoIcon size={24} color={Colors.kakao.icon} />
          <Text style={styles.kakaoButtonText}>카카오톡으로 시작하기</Text>
        </Pressable>

        <Text style={styles.terms}>
          가입 시 서비스 약관 및 개인정보 처리방침에 동의한 것으로 간주합니다.
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
    gap: 12,
    paddingBottom: 16,
  },
  kakaoButton: {
    height: 56,
    backgroundColor: Colors.kakao.button,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  kakaoButtonPressed: {
    opacity: 0.85,
  },
  kakaoButtonText: {
    ...Typography.section,
    color: Colors.kakao.icon,
  },
  terms: {
    ...Typography.url,
    color: Colors.brand.textHint,
    textAlign: 'center',
  },
});
