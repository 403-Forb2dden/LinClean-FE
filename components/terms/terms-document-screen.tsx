import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { fetchTerms, type TermsResponse, type TermsType } from '@/api/terms';
import { AppIcon } from '@/components/ui/app-icon';
import { Button } from '@/components/ui/button';
import { Colors, Typography } from '@/constants/theme';

interface TermsDocumentScreenProps {
  type: TermsType;
  fallbackTitle: string;
}

type LoadState =
  | { status: 'loading'; data: null; message: null }
  | { status: 'success'; data: TermsResponse; message: null }
  | { status: 'error'; data: null; message: string };

export function TermsDocumentScreen({ type, fallbackTitle }: TermsDocumentScreenProps) {
  const [state, setState] = useState<LoadState>({
    status: 'loading',
    data: null,
    message: null,
  });

  const loadTerms = useCallback(
    async (signal?: AbortSignal) => {
      setState({ status: 'loading', data: null, message: null });

      try {
        const data = await fetchTerms(type, signal);
        setState({ status: 'success', data, message: null });
      } catch (error) {
        if (isAbortError(error)) {
          return;
        }

        setState({
          status: 'error',
          data: null,
          message: error instanceof Error ? error.message : '약관 정보를 불러오지 못했습니다.',
        });
      }
    },
    [type],
  );

  useEffect(() => {
    const controller = new AbortController();

    void loadTerms(controller.signal);

    return () => controller.abort();
  }, [loadTerms]);

  const title = state.data?.title ?? fallbackTitle;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <AppIcon name="back" onPress={() => router.back()} />
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {state.status === 'loading' && (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={Colors.brand.primary} />
          <Text style={styles.stateText}>약관 정보를 불러오는 중입니다.</Text>
        </View>
      )}

      {state.status === 'error' && (
        <View style={styles.centerContent}>
          <Text style={styles.errorTitle}>약관 정보를 불러올 수 없습니다.</Text>
          <Text style={styles.stateText}>{state.message}</Text>
          <Button label="다시 시도" variant="secondary" onPress={() => void loadTerms()} />
        </View>
      )}

      {state.status === 'success' && (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.updated}>최종 업데이트: {formatDate(state.data.updatedAt)}</Text>
          <Text style={styles.body}>{state.data.content}</Text>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function isAbortError(error: unknown) {
  return typeof error === 'object' && error !== null && 'name' in error && error.name === 'AbortError';
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}.${month}.${day}`;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.brand.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  title: {
    ...Typography.section,
    color: Colors.brand.text,
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 28,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 40,
    gap: 20,
  },
  updated: {
    ...Typography.caption,
    color: Colors.brand.textHint,
  },
  body: {
    ...Typography.body,
    color: Colors.brand.textSecondary,
    lineHeight: 24,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 14,
  },
  errorTitle: {
    ...Typography.profile,
    color: Colors.brand.text,
    textAlign: 'center',
  },
  stateText: {
    ...Typography.summary,
    color: Colors.brand.textSecondary,
    lineHeight: 20,
    textAlign: 'center',
  },
});
