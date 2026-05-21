import { useAuth } from '@clerk/expo';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { fetchNoticeDetail, type NoticeDetailResponse } from '@/api/notices';
import { AppIcon } from '@/components/ui/app-icon';
import { Button } from '@/components/ui/button';
import { Colors, Typography } from '@/constants/theme';

type NoticeDetailState =
  | { status: 'loading'; data: null; message: null }
  | { status: 'success'; data: NoticeDetailResponse; message: null }
  | { status: 'error'; data: null; message: string };

export default function NoticeDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const noticeId = useMemo(() => parseNoticeId(id), [id]);
  const [state, setState] = useState<NoticeDetailState>({
    status: 'loading',
    data: null,
    message: null,
  });
  const getTokenRef = useRef(getToken);

  useEffect(() => {
    getTokenRef.current = getToken;
  }, [getToken]);

  const loadNotice = useCallback(
    async (signal?: AbortSignal) => {
      if (!isLoaded) {
        return;
      }

      if (!isSignedIn) {
        setState({
          status: 'error',
          data: null,
          message: '공지사항을 보려면 로그인이 필요합니다.',
        });
        return;
      }

      if (noticeId == null) {
        setState({
          status: 'error',
          data: null,
          message: '공지사항 정보를 확인할 수 없습니다.',
        });
        return;
      }

      setState({ status: 'loading', data: null, message: null });

      try {
        const data = await fetchNoticeDetail(() => getTokenRef.current(), noticeId, { signal });
        setState({ status: 'success', data, message: null });
      } catch (error) {
        if (isAbortError(error)) {
          return;
        }

        setState({
          status: 'error',
          data: null,
          message: error instanceof Error ? error.message : '공지사항을 불러오지 못했습니다.',
        });
      }
    },
    [isLoaded, isSignedIn, noticeId],
  );

  useEffect(() => {
    const controller = new AbortController();

    void loadNotice(controller.signal);

    return () => controller.abort();
  }, [loadNotice]);

  const title = state.data?.title ?? '공지사항';

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
          <Text style={styles.stateText}>공지사항을 불러오는 중입니다.</Text>
        </View>
      )}

      {state.status === 'error' && (
        <View style={styles.centerContent}>
          <Text style={styles.errorTitle}>공지사항을 불러올 수 없습니다.</Text>
          <Text style={styles.stateText}>{state.message}</Text>
          <Button label="다시 시도" variant="secondary" onPress={() => void loadNotice()} />
        </View>
      )}

      {state.status === 'success' && (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.noticeHeader}>
            <View style={styles.titleRow}>
              {state.data.isPinned && (
                <View style={styles.pinnedBadge}>
                  <Text style={styles.pinnedText}>공지</Text>
                </View>
              )}
              <Text style={styles.noticeTitle}>{state.data.title}</Text>
            </View>
            <Text style={styles.noticeDate}>작성일: {formatDate(state.data.createdAt)}</Text>
            <Text style={styles.noticeDate}>수정일: {formatDate(state.data.updatedAt)}</Text>
          </View>

          <Text style={styles.contentText}>{state.data.content}</Text>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function parseNoticeId(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number(raw);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
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
  noticeHeader: {
    backgroundColor: Colors.brand.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.brand.line,
    paddingHorizontal: 18,
    paddingVertical: 18,
    gap: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  pinnedBadge: {
    backgroundColor: Colors.brand.softMint,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 2,
  },
  pinnedText: {
    ...Typography.bold12,
    color: Colors.brand.primaryDeep,
  },
  noticeTitle: {
    ...Typography.section,
    color: Colors.brand.text,
    flex: 1,
    lineHeight: 26,
  },
  noticeDate: {
    ...Typography.summary,
    color: Colors.brand.textHint,
  },
  contentText: {
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
