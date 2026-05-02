import { router, Stack, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, Typography } from '@/constants/theme';
import { ResultStatusIcon } from '@/components/ui/result-status-icon';

export default function ScanResultBlockScreen() {
  const { url } = useLocalSearchParams<{ url: string }>();

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: '검사 결과',
          headerBackTitle: '',
          headerStyle: { backgroundColor: Colors.brand.background },
          headerTitleStyle: { ...Typography.title, color: Colors.brand.text },
          headerTintColor: Colors.brand.text,
          headerShadowVisible: false,
        }}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* 차단 배지 */}
        <View style={styles.badgeArea}>
          <ResultStatusIcon variant="block" label="차단" />
        </View>

        {/* 결과 텍스트 */}
        <Text style={styles.resultTitle}>차단된 위험 링크입니다.</Text>
        <Text style={styles.resultSubtitle}>
          {'고위험 신호가 감지되었습니다.\n해당 링크는 저장할 수 없습니다.'}
        </Text>

        {/* 검사 대상 카드 */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>검사 대상</Text>
          <Text style={styles.cardUrl} numberOfLines={1} ellipsizeMode="tail">
            {url}
          </Text>
        </View>

        {/* 확인 버튼 */}
        <View style={styles.buttonArea}>
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={() => router.dismissAll()}
            activeOpacity={0.8}
          >
            <Text style={styles.confirmButtonText}>확인</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: Colors.brand.background,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
    alignItems: 'center',
  },

  badgeArea: {
    alignItems: 'center',
    marginBottom: 32,
  },

  resultTitle: {
    ...Typography.display,
    color: Colors.brand.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  resultSubtitle: {
    ...Typography.body,
    color: Colors.brand.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },

  card: {
    width: '100%',
    backgroundColor: Colors.light.background,
    borderRadius: 16,
    padding: 16,
    gap: 6,
    marginBottom: 40,
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

  buttonArea: {
    width: '100%',
  },
  confirmButton: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.brand.textWarning,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    ...Typography.section,
    color: '#FFFFFF',
  },
});
