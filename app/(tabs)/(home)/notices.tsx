import { useAuth } from '@clerk/expo';
import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { fetchNotices, type NoticeListItemResponse } from '@/api/notices';
import { AppIcon } from '@/components/ui/app-icon';
import { Button } from '@/components/ui/button';
import { Colors, Typography } from '@/constants/theme';

const NOTICE_PAGE_SIZE = 20;

interface LoadNoticesOptions {
  cursor?: string | null;
  refresh?: boolean;
  signal?: AbortSignal;
}

export default function NoticesScreen() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [notices, setNotices] = useState<NoticeListItemResponse[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasNext, setHasNext] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const getTokenRef = useRef(getToken);

  useEffect(() => {
    getTokenRef.current = getToken;
  }, [getToken]);

  const loadNotices = useCallback(
    async ({ cursor = null, refresh = false, signal }: LoadNoticesOptions = {}) => {
      if (!isLoaded) {
        return;
      }

      if (!isSignedIn) {
        setErrorMessage('공지사항을 보려면 로그인이 필요합니다.');
        setIsInitialLoading(false);
        return;
      }

      if (cursor) {
        setIsLoadingMore(true);
      } else if (refresh) {
        setIsRefreshing(true);
      } else {
        setIsInitialLoading(true);
      }

      setErrorMessage(null);

      try {
        const page = await fetchNotices(() => getTokenRef.current(), {
          cursor,
          size: NOTICE_PAGE_SIZE,
          signal,
        });

        setNotices((current) => (cursor ? [...current, ...page.items] : page.items));
        setNextCursor(page.nextCursor);
        setHasNext(page.hasNext);
      } catch (error) {
        if (isAbortError(error)) {
          return;
        }

        setErrorMessage(error instanceof Error ? error.message : '공지사항을 불러오지 못했습니다.');
      } finally {
        if (signal?.aborted) {
          return;
        }

        setIsInitialLoading(false);
        setIsRefreshing(false);
        setIsLoadingMore(false);
      }
    },
    [isLoaded, isSignedIn],
  );

  useEffect(() => {
    const controller = new AbortController();

    void loadNotices({ signal: controller.signal });

    return () => controller.abort();
  }, [loadNotices]);

  const handleRefresh = useCallback(() => {
    void loadNotices({ refresh: true });
  }, [loadNotices]);

  const handleLoadMore = useCallback(() => {
    if (!hasNext || !nextCursor || isInitialLoading || isRefreshing || isLoadingMore) {
      return;
    }

    void loadNotices({ cursor: nextCursor });
  }, [hasNext, isInitialLoading, isLoadingMore, isRefreshing, loadNotices, nextCursor]);

  const renderNotice = useCallback(
    ({ item, index }: { item: NoticeListItemResponse; index: number }) => (
      <TouchableOpacity
        style={[styles.noticeItem, index < notices.length - 1 && styles.noticeItemBorder]}
        activeOpacity={0.7}
        onPress={() =>
          router.push({
            pathname: '/(tabs)/(home)/notice-detail' as any,
            params: { id: String(item.id) },
          })
        }
      >
        <View style={styles.noticeTop}>
          {item.isPinned && (
            <View style={styles.pinnedBadge}>
              <Text style={styles.pinnedText}>공지</Text>
            </View>
          )}
          <Text style={styles.noticeTitle}>{item.title}</Text>
        </View>
        <Text style={styles.noticeDate}>{formatDate(item.createdAt)}</Text>
      </TouchableOpacity>
    ),
    [notices.length],
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <AppIcon name="back" onPress={() => router.back()} />
        <Text style={styles.title}>공지사항</Text>
        <View style={styles.headerSpacer} />
      </View>

      {isInitialLoading && (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={Colors.brand.primary} />
          <Text style={styles.stateText}>공지사항을 불러오는 중입니다.</Text>
        </View>
      )}

      {!isInitialLoading && errorMessage && notices.length === 0 && (
        <View style={styles.centerContent}>
          <Text style={styles.errorTitle}>공지사항을 불러올 수 없습니다.</Text>
          <Text style={styles.stateText}>{errorMessage}</Text>
          <Button label="다시 시도" variant="secondary" onPress={() => void loadNotices()} />
        </View>
      )}

      {!isInitialLoading && (!errorMessage || notices.length > 0) && (
        <View style={styles.listCard}>
          <FlatList
            data={notices}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderNotice}
            contentContainerStyle={notices.length === 0 && styles.emptyListContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                tintColor={Colors.brand.primary}
                colors={[Colors.brand.primary]}
              />
            }
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.4}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptyText}>공지사항이 없습니다.</Text>
              </View>
            }
            ListFooterComponent={
              isLoadingMore ? (
                <View style={styles.footerLoading}>
                  <ActivityIndicator color={Colors.brand.primary} />
                </View>
              ) : null
            }
          />
          {errorMessage && notices.length > 0 && (
            <Text style={styles.inlineError}>{errorMessage}</Text>
          )}
        </View>
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
  listCard: {
    flex: 1,
    marginHorizontal: 24,
    marginTop: 8,
    marginBottom: 24,
    backgroundColor: Colors.brand.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.brand.line,
    overflow: 'hidden',
  },
  emptyListContent: {
    flexGrow: 1,
  },
  noticeItem: {
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 6,
  },
  noticeItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.brand.line,
  },
  noticeTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  pinnedBadge: {
    backgroundColor: Colors.brand.softMint,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  pinnedText: {
    ...Typography.bold12,
    color: Colors.brand.primaryDeep,
  },
  noticeTitle: {
    ...Typography.profile,
    color: Colors.brand.text,
    flex: 1,
  },
  noticeDate: {
    ...Typography.summary,
    color: Colors.brand.textHint,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.brand.textHint,
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
  footerLoading: {
    paddingVertical: 16,
  },
  inlineError: {
    ...Typography.caption,
    color: Colors.brand.textWarning,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
});
