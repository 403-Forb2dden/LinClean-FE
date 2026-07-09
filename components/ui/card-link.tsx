import { useRef } from 'react';
import { Linking, Pressable, StyleSheet, Text, View, type GestureResponderEvent } from 'react-native';
import { Colors, Typography } from '@/constants/theme';
import { showAlert } from '@/utils/guarded-alert';
import { useGuardedPress } from '@/utils/press-guard';
import type { AnchorPosition } from './folder-card';
import { IconSymbol } from './icon-symbol';

export type CardLinkVariant = 'default' | 'no-icon' | 'disabled';
export type LinkVerdict = 'safe' | 'caution' | 'danger';

export interface CardLinkProps {
  label?: string | null;
  title?: string | null;
  summary?: string | null;
  originalUrl?: string | null;
  finalUrl?: string | null;
  verdict?: LinkVerdict | null;
  bookmarked?: boolean;
  icon?: boolean;
  disabled?: boolean;
  bookmarkDisabled?: boolean;
  onBookmark?: () => void | Promise<void>;
  onMore?: (anchor: AnchorPosition) => void;
  onPress?: () => void;
}

const VERDICT_LABELS: Record<LinkVerdict, string> = {
  safe: '안전',
  caution: '주의',
  danger: '위험',
};

const VERDICT_COLORS: Record<LinkVerdict, { background: string; text: string }> = Colors.brand.verdict;

function getFirstText(...values: (string | null | undefined)[]) {
  return values.find((value) => value?.trim())?.trim();
}

export function CardLink({
  label,
  title,
  summary,
  originalUrl,
  finalUrl,
  verdict,
  bookmarked = false,
  icon = true,
  disabled = false,
  bookmarkDisabled = false,
  onBookmark,
  onMore,
  onPress,
}: CardLinkProps) {
  const moreRef = useRef<View>(null);
  const displayUrl = getFirstText(finalUrl, originalUrl) ?? 'URL 정보 없음';
  const displayTitle = getFirstText(title, summary) ?? '제목 없음';
  const openUrl = getFirstText(finalUrl, originalUrl);
  const normalizedVerdict = verdict && verdict in VERDICT_LABELS ? verdict : undefined;
  const statusLabel = normalizedVerdict ? VERDICT_LABELS[normalizedVerdict] : (getFirstText(label) ?? '결과 없음');
  const statusColors = normalizedVerdict ? VERDICT_COLORS[normalizedVerdict] : undefined;
  const isBookmarkDisabled = disabled || bookmarkDisabled;
  const guardedBookmark = useGuardedPress(onBookmark, { disabled: isBookmarkDisabled });
  const guardedMore = useGuardedPress(onMore, { disabled });

  const handleBookmarkPress = (event: GestureResponderEvent) => {
    event.stopPropagation();
    guardedBookmark?.();
  };

  const handleMorePress = (event: GestureResponderEvent) => {
    event.stopPropagation();

    const { pageX, pageY } = event.nativeEvent;
    const fallbackAnchor = { x: pageX, y: pageY, width: 1, height: 1 };

    if (!moreRef.current) {
      guardedMore?.(fallbackAnchor);
      return;
    }

    moreRef.current.measure((_fx, _fy, width, height, px, py) => {
      const measuredAnchor = { x: px, y: py, width, height };
      const anchor = Number.isFinite(px) && Number.isFinite(py) && width > 0 && height > 0
        ? measuredAnchor
        : fallbackAnchor;

      guardedMore?.(anchor);
    });
  };

  const handleCardPress = async () => {
    if (disabled) return;
    if (onPress) {
      onPress();
      return;
    }

    if (!openUrl) {
      showAlert('URL을 열 수 없어요', '저장된 URL 정보가 없습니다.');
      return;
    }

    try {
      await Linking.openURL(openUrl);
    } catch {
      showAlert('URL을 열 수 없어요', '잠시 후 다시 시도해주세요.');
    }
  };
  const guardedCardPress = useGuardedPress(handleCardPress, { disabled });

  return (
    <Pressable
      onPress={guardedCardPress}
      style={({ pressed }) => [
        styles.card,
        disabled && styles.cardDisabled,
        pressed && !disabled && styles.cardPressed,
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
    >
      <View style={styles.topRow}>
        <View
          style={[
            styles.statusBadge,
            statusColors && { backgroundColor: statusColors.background },
            disabled && styles.badgeDisabled,
          ]}
        >
          <Text
            style={[
              styles.statusLabel,
              statusColors && { color: statusColors.text },
              disabled && styles.textDisabled,
            ]}
          >
            {statusLabel}
          </Text>
        </View>
        {icon && (
          <View style={styles.iconRow}>
            <Pressable
              onPress={isBookmarkDisabled ? undefined : handleBookmarkPress}
              hitSlop={8}
              style={({ pressed }) => [
                pressed && !isBookmarkDisabled && styles.pressed,
                bookmarkDisabled && styles.bookmarkDisabled,
              ]}
              accessibilityRole="button"
              accessibilityState={{ disabled: isBookmarkDisabled }}
            >
              <IconSymbol
                name={bookmarked ? 'bookmark.fill' : 'bookmark'}
                size={18}
                color={bookmarked ? Colors.brand.primary : isBookmarkDisabled ? Colors.brand.textHint : Colors.brand.textSecondary}
              />
            </Pressable>
            <Pressable
              ref={moreRef}
              onPress={disabled ? undefined : handleMorePress}
              hitSlop={8}
              style={({ pressed }) => pressed && !disabled && styles.pressed}
            >
              <IconSymbol name="ellipsis" size={20} color={disabled ? Colors.brand.textHint : Colors.brand.textSecondary} />
            </Pressable>
          </View>
        )}
      </View>

      <Text
        style={[styles.title, disabled && styles.textDisabled]}
        numberOfLines={2}
      >
        {displayTitle}
      </Text>

      <Text
        style={[styles.url, disabled && styles.textDisabled]}
        numberOfLines={1}
      >
        {displayUrl}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.brand.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: Colors.brand.line,
    shadowColor: Colors.brand.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
    paddingHorizontal: 26,
    paddingTop: 12,
    paddingBottom: 20,
    gap: 10,
    minHeight: 100,
    justifyContent: 'space-between',
  },
  cardDisabled: {
    opacity: 0.45,
  },
  cardPressed: {
    opacity: 0.75,
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 22,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  statusBadge: {
    alignSelf: 'flex-start',
    borderRadius: 99,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: Colors.brand.line,
    shadowColor: Colors.brand.text,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.14,
    shadowRadius: 4,
    elevation: 3,
  },
  badgeDisabled: {
    backgroundColor: Colors.brand.line,
  },
  statusLabel: {
    ...Typography.bold12,
    color: Colors.brand.textSecondary,
  },
  title: {
    ...Typography.section,
    fontSize: 20,
    color: Colors.brand.text,
    lineHeight: 27,
  },
  url: {
    ...Typography.url,
    color: Colors.brand.textHint,
    lineHeight: 16,
    marginTop: 8,
  },

  textDisabled: {
    color: Colors.brand.textHint,
  },
  pressed: {
    opacity: 0.6,
  },
  bookmarkDisabled: {
    opacity: 0.45,
  },
});
