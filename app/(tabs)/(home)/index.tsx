import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { AppIcon } from '@/components/ui/app-icon';
import { CardLink } from '@/components/ui/card-link';
import { FolderContextMenu } from '@/components/ui/folder-context-menu';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { SectionHeader } from '@/components/ui/section-header';
import { TitleEditModal } from '@/components/ui/title-edit-modal';
import { Toast } from '@/components/ui/toast';
import {
  fetchVerdictStatistics,
  type AnalysisVerdict,
  type VerdictStatisticsResponse,
} from '@/api/analyses';
import { Colors, Typography } from '@/constants/theme';
import { useFolders } from '@/context/folders-context';
import { getSavedLinkErrorMessage, useSavedLinks, type SavedLink } from '@/context/saved-links-context';
import type { AnchorPosition } from '@/components/ui/folder-card';

type SecurityStatusItem = {
  verdict: AnalysisVerdict;
  label: string;
  summary: string;
};

type StatisticsViewStatus = 'loading' | 'error' | 'empty' | 'ready';

const SECURITY_STATUS_ITEMS: SecurityStatusItem[] = [
  { verdict: 'safe', label: '안전', summary: '문제 없음' },
  { verdict: 'caution', label: '주의', summary: '확인 필요' },
  { verdict: 'danger', label: '위험', summary: '접근 주의' },
];

const STATISTICS_STATUS_LABELS: Record<Exclude<StatisticsViewStatus, 'ready'>, string> = {
  loading: '조회 중',
  error: '불러오지 못했어요',
  empty: '기록 없음',
};

const EMPTY_STATISTICS: VerdictStatisticsResponse = {
  safe: 0,
  caution: 0,
  danger: 0,
};

export default function HomeScreen() {
  const { savedLinkToast: savedLinkToastParam } = useLocalSearchParams<{
    savedLinkToast?: string | string[];
  }>();
  const { links, toggleBookmark, deleteLink, updateTitle } = useSavedLinks();
  const { refreshFolders } = useFolders();
  const [menuState, setMenuState] = useState<{ visible: boolean; anchor?: AnchorPosition; linkId?: number }>({ visible: false });
  const [editingLink, setEditingLink] = useState<SavedLink | null>(null);
  const [saveToastVisible, setSaveToastVisible] = useState(false);
  const [deleteToastVisible, setDeleteToastVisible] = useState(false);
  const [titleToastVisible, setTitleToastVisible] = useState(false);
  const [statistics, setStatistics] = useState<VerdictStatisticsResponse>(EMPTY_STATISTICS);
  const [isStatisticsLoading, setIsStatisticsLoading] = useState(true);
  const [statisticsErrorMessage, setStatisticsErrorMessage] = useState('');
  const lastToastParamRef = useRef<string | undefined>(undefined);
  const savedLinkToast = typeof savedLinkToastParam === 'string' ? savedLinkToastParam : undefined;
  const statisticsStatus = getStatisticsViewStatus(
    statistics,
    isStatisticsLoading,
    statisticsErrorMessage,
  );
  const statisticsStatusLabel = statisticsStatus === 'ready'
    ? ''
    : STATISTICS_STATUS_LABELS[statisticsStatus];

  // 최근 저장한 링크 — createdAt 내림차순 상위 3개
  const recentLinks = links.slice(0, 3);

  useEffect(() => {
    if (!savedLinkToast || lastToastParamRef.current === savedLinkToast) {
      return;
    }

    lastToastParamRef.current = savedLinkToast;
    setSaveToastVisible(true);
  }, [savedLinkToast]);

  useEffect(() => {
    const abortController = new AbortController();

    async function loadStatistics() {
      setIsStatisticsLoading(true);
      setStatisticsErrorMessage('');

      try {
        const response = await fetchVerdictStatistics({ signal: abortController.signal });
        setStatistics(response);
      } catch {
        if (abortController.signal.aborted) {
          return;
        }

        setStatistics(EMPTY_STATISTICS);
        setStatisticsErrorMessage('불러오지 못했어요');
      } finally {
        if (!abortController.signal.aborted) {
          setIsStatisticsLoading(false);
        }
      }
    }

    void loadStatistics();

    return () => {
      abortController.abort();
    };
  }, []);

  const handleMore = (id: number, anchor: AnchorPosition) => {
    setMenuState({ visible: true, anchor, linkId: id });
  };

  const selectedLink = links.find((l) => l.id === menuState.linkId);

  const handleBookmark = useCallback(
    async (id: number) => {
      try {
        await toggleBookmark(id);
      } catch (error) {
        Alert.alert(
          '북마크 변경 실패',
          getSavedLinkErrorMessage(error, '북마크 상태를 변경하지 못했습니다. 잠시 후 다시 시도해주세요.'),
        );
      }
    },
    [toggleBookmark],
  );

  const handleDelete = useCallback(
    (id: number) => {
      Alert.alert('링크 삭제', '저장한 링크를 삭제할까요?', [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteLink(id);
              await refreshFolders();
              setDeleteToastVisible(true);
            } catch (error) {
              Alert.alert(
                '삭제 실패',
                getSavedLinkErrorMessage(error, '링크를 삭제하지 못했습니다. 잠시 후 다시 시도해주세요.'),
              );
            }
          },
        },
      ]);
    },
    [deleteLink, refreshFolders],
  );

  const openTitleModal = useCallback((link: SavedLink) => {
    setEditingLink(link);
  }, []);

  const handleTitleConfirm = useCallback(async (id: number, title: string) => {
    await updateTitle(id, title);
    setTitleToastVisible(true);
  }, [updateTitle]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* 상단 헤더 */}
        <View style={styles.header}>
          <View style={styles.wordmark}>
            <IconSymbol
              name="checkmark.shield.fill"
              size={30}
              color={Colors.brand.primary}
            />
            <Text style={styles.brandText}>LinClean</Text>
          </View>
          <AppIcon name="settings" size={28} label="설정" onPress={() => router.push('/(tabs)/(home)/settings')} />
        </View>

        {/* 서브타이틀 */}
        <Text style={styles.subtitle}>오늘도 안전하게 정리해요</Text>

        {/* 보안 등급별 링크 현황 */}
        <View style={styles.section}>
          <SectionHeader
            label="보안 등급별 링크 현황"
            rightSlot={
              statisticsStatusLabel ? (
                <Text style={styles.sectionStatus}>{statisticsStatusLabel}</Text>
              ) : undefined
            }
          />
          <View style={styles.statCardGroup}>
            {SECURITY_STATUS_ITEMS.map((item) => {
              const colors = Colors.brand.verdict[item.verdict];
              const countLabel = getStatisticsCountLabel(
                item.verdict,
                statistics,
                statisticsStatus,
              );
              const summary = getStatisticsSummary(item, statisticsStatus);

              return (
                <View
                  key={item.verdict}
                  style={[
                    styles.statCard,
                    { backgroundColor: colors.background, borderColor: colors.accent },
                  ]}
                >
                  <View style={styles.statCardHeader}>
                    <View style={[styles.statIndicator, { backgroundColor: colors.accent }]} />
                    <Text style={[styles.statLabel, { color: colors.text }]}>{item.label}</Text>
                  </View>
                  <Text
                    style={[styles.statCount, { color: colors.text }]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                  >
                    {countLabel}
                  </Text>
                  <Text style={[styles.statSummary, { color: colors.text }]} numberOfLines={1}>
                    {summary}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* 최근 저장한 링크 */}
        <View style={styles.section}>
          <SectionHeader
            label="최근 저장한 링크"
            onViewAll={() => router.push('/saved-links')}
          />
          <View style={styles.linkList}>
            {recentLinks.map((link) => (
              <CardLink
                key={link.id}
                verdict={link.verdict}
                title={link.title}
                originalUrl={link.originalUrl}
                finalUrl={link.finalUrl}
                bookmarked={link.isBookmarked}
                onBookmark={() => {
                  void handleBookmark(link.id);
                }}
                onMore={(anchor) => handleMore(link.id, anchor)}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      <FolderContextMenu
        visible={menuState.visible}
        anchor={menuState.anchor}
        items={[
          {
            label: '제목 수정',
            onPress: () => selectedLink && openTitleModal(selectedLink),
          },
          {
            label: '링크 삭제',
            onPress: () => menuState.linkId != null && handleDelete(menuState.linkId),
            destructive: true,
          },
        ]}
        onDismiss={() => setMenuState({ visible: false })}
      />

      <TitleEditModal
        editingLink={editingLink}
        onConfirm={handleTitleConfirm}
        onClose={() => setEditingLink(null)}
      />

      <Toast
        visible={saveToastVisible}
        message="링크가 저장되었습니다."
        placement="top"
        topOffset={96}
        onHide={() => setSaveToastVisible(false)}
      />
      <Toast
        visible={deleteToastVisible}
        message="링크가 삭제되었습니다."
        placement="top"
        topOffset={96}
        onHide={() => setDeleteToastVisible(false)}
      />
      <Toast
        visible={titleToastVisible}
        message="제목이 수정되었습니다."
        placement="top"
        topOffset={96}
        onHide={() => setTitleToastVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.brand.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 25,
    paddingBottom: 32,
    gap: 24,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
  },
  wordmark: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brandText: {
    ...Typography.displayMedium,
    color: Colors.brand.primary,
  },

  subtitle: {
    ...Typography.caption,
    color: Colors.brand.textSecondary,
    marginTop: -16,
  },

  section: {
    gap: 12,
  },

  sectionStatus: {
    ...Typography.bold12,
    color: Colors.brand.textHint,
  },

  statCardGroup: {
    backgroundColor: Colors.brand.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.brand.line,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minHeight: 112,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  statCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statLabel: {
    ...Typography.bold12,
  },
  statCount: {
    ...Typography.title,
    lineHeight: 30,
  },
  statSummary: {
    ...Typography.regular12,
  },

  linkList: {
    gap: 12,
  },
});

function getStatisticsViewStatus(
  statistics: VerdictStatisticsResponse,
  isLoading: boolean,
  errorMessage: string,
): StatisticsViewStatus {
  if (isLoading) {
    return 'loading';
  }

  if (errorMessage) {
    return 'error';
  }

  if (SECURITY_STATUS_ITEMS.every((item) => statistics[item.verdict] === 0)) {
    return 'empty';
  }

  return 'ready';
}

function getStatisticsCountLabel(
  verdict: AnalysisVerdict,
  statistics: VerdictStatisticsResponse,
  status: StatisticsViewStatus,
) {
  return status === 'loading' || status === 'error'
    ? '-'
    : String(statistics[verdict]);
}

function getStatisticsSummary(item: SecurityStatusItem, status: StatisticsViewStatus) {
  if (status === 'loading') {
    return '집계 중';
  }

  if (status === 'error') {
    return '확인 불가';
  }

  if (status === 'empty') {
    return '기록 없음';
  }

  return item.summary;
}
