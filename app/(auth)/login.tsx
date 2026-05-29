import { useAuth, useSSO } from '@clerk/expo';
import * as AuthSession from 'expo-auth-session';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useShareIntentContext } from 'expo-share-intent';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ApiError } from '@/api/api-client';
import { SocialLoginButton } from '@/components/ui/social-login-button';
import { Colors, Typography } from '@/constants/theme';
import { syncAuthenticatedMember } from '@/services/auth-api';
import { showAlert } from '@/utils/guarded-alert';
import { getSharedUrlFromIntent } from '@/utils/shared-url';

const IMG_WORDMARK = require('@/assets/images/login_wordmark.png');
const CLERK_REDIRECT_URL = AuthSession.makeRedirectUri({
  scheme: 'linclean',
  path: 'sso-callback',
});
const MEMBER_SYNC_RETRY_DELAYS_MS = [200, 500, 1000];

WebBrowser.maybeCompleteAuthSession();

type LoginNotice = 'withdrawal-complete' | 'session-expired';

const LOGIN_NOTICE_ALERTS: Record<LoginNotice, { title: string; message: string }> = {
  'withdrawal-complete': {
    title: '회원탈퇴 완료',
    message: '회원탈퇴가 완료되었습니다.',
  },
  'session-expired': {
    title: '세션 만료',
    message: '현재 세션이 유효하지 않아 로그인 화면으로 이동합니다.',
  },
};

function delay(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { getToken, signOut } = useAuth();
  const { startSSOFlow } = useSSO();
  const { hasShareIntent, resetShareIntent, shareIntent } = useShareIntentContext();
  const { notice } = useLocalSearchParams<{ notice?: LoginNotice }>();
  const shownNoticeRef = useRef<LoginNotice | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    if (!notice || shownNoticeRef.current === notice) {
      return;
    }

    const alert = LOGIN_NOTICE_ALERTS[notice];
    if (!alert) {
      return;
    }

    shownNoticeRef.current = notice;
    showAlert(alert.title, alert.message);
  }, [notice]);

  const handleGoogleLogin = async () => {
    if (isSigningIn) {
      return;
    }

    setIsSigningIn(true);
    let sessionActivated = false;

    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: 'oauth_google',
        redirectUrl: CLERK_REDIRECT_URL,
      });

      if (!createdSessionId || !setActive) {
        return;
      }

      await setActive({ session: createdSessionId });
      sessionActivated = true;
      await syncAuthenticatedMemberAfterSso();
      navigateAfterSuccessfulLogin();
    } catch (error) {
      console.error(error);

      if (sessionActivated) {
        try {
          await signOut();
        } catch (signOutError) {
          console.error(signOutError);
        }
      }

      showAlert(
        '로그인 실패',
        '계정 연결 중 서버와 통신하지 못했습니다. 잠시 후 다시 시도해주세요.'
      );
    } finally {
      setIsSigningIn(false);
    }
  };

  function navigateAfterSuccessfulLogin() {
    const sharedUrl = hasShareIntent ? getSharedUrlFromIntent(shareIntent) : null;

    if (hasShareIntent) {
      resetShareIntent(true);
    }

    if (sharedUrl) {
      router.replace({
        pathname: '/(tabs)/(home)/add-link',
        params: { sharedUrl },
      });
    } else {
      router.replace('/(tabs)/(home)');
    }
  }

  async function syncAuthenticatedMemberAfterSso() {
    let lastError: unknown;

    for (const retryDelayMs of MEMBER_SYNC_RETRY_DELAYS_MS) {
      await delay(retryDelayMs);

      try {
        return await syncAuthenticatedMember(() => getToken({ skipCache: true }));
      } catch (error) {
        lastError = error;

        if (!(error instanceof ApiError) || error.status !== 401) {
          throw error;
        }
      }
    }

    throw lastError;
  }

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
          label={isSigningIn ? 'Google 로그인 중...' : 'Google로 계속하기'}
          onPress={handleGoogleLogin}
          disabled={isSigningIn}
        />

        <Text style={styles.terms}>
          계속 진행하면 서비스 이용약관 및 개인정보 처리방침에 동의하는 것으로 간주합니다.
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
