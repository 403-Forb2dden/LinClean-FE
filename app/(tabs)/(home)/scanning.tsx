import LottieView from 'lottie-react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, Typography } from '@/constants/theme';

// TODO: 백엔드 연동 시 POST /api/v1/analyses 호출 후 폴링으로 결과 확인
// Request: { original_url }
// Response: { analysis_id, status, verdict, score, summary }
// verdict: 'safe' → scan-result(allowed), 'caution'/'danger' → 별도 결과 화면
// API 명세: Draft of the specification.md > POST /analyses, GET /analyses/{analysisId} 참고

export default function ScanningScreen() {
  const { url } = useLocalSearchParams<{ url: string }>();

  useEffect(() => {
    // TODO: 실제 백엔드 분석 요청으로 교체
    // verdict에 따라 화면 분기:
    //   safe    → '/(tabs)/(home)/scan-result'
    //   caution → '/(tabs)/(home)/scan-result-caution'
    //   block   → '/(tabs)/(home)/scan-result-block'
    const timer = setTimeout(() => {
      router.replace({ pathname: '/(tabs)/(home)/scan-result', params: { url } });
    }, 3000);
    return () => clearTimeout(timer);
  }, [url]);

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: '링크 검사 중',
          headerBackTitle: '',
          headerStyle: { backgroundColor: Colors.brand.background },
          headerTitleStyle: { ...Typography.title, color: Colors.brand.text },
          headerTintColor: Colors.brand.text,
          headerShadowVisible: false,
        }}
      />
      <View style={styles.container}>
        {/* Lottie 애니메이션 + 가운데 점 */}
        <View style={styles.animationWrapper}>
          <LottieView
            source={require('@/assets/animations/scanning.json')}
            autoPlay
            loop
            style={styles.animation}
          />
          <View style={styles.dotsOverlay}>
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </View>

        {/* 텍스트 */}
        <Text style={styles.title}>보안 검사 중입니다</Text>
        <Text style={styles.subtitle}>약 5–10초 정도 소요돼요</Text>

        {/* 검사 대상 카드 */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>검사 대상</Text>
          <Text style={styles.cardUrl} numberOfLines={1} ellipsizeMode="tail">
            {url}
          </Text>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.brand.background,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  animationWrapper: {
    width: 280,
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  animation: {
    width: 280,
    height: 280,
    position: 'absolute',
  },
  dotsOverlay: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.brand.textHint,
  },
  title: {
    ...Typography.display,
    color: Colors.brand.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.brand.textSecondary,
    textAlign: 'center',
    marginBottom: 40,
  },
  card: {
    width: '100%',
    backgroundColor: Colors.brand.surface,
    borderRadius: 16,
    padding: 16,
    gap: 6,
  },
  cardLabel: {
    ...Typography.caption,
    color: Colors.brand.textHint,
  },
  cardUrl: {
    ...Typography.body,
    fontWeight: '700',
    color: Colors.brand.text,
  },
});
