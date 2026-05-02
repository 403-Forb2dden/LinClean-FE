import { useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors, Typography } from '@/constants/theme';
import type { AnchorPosition } from './folder-card';
import { IconSymbol } from './icon-symbol';

export type CardLinkVariant = 'default' | 'no-icon' | 'disabled';

export interface CardLinkProps {
  label: string;
  title: string;
  summary: string;
  url: string;
  bookmarked?: boolean;
  icon?: boolean;
  disabled?: boolean;
  onBookmark?: () => void;
  onMore?: (anchor: AnchorPosition) => void;
  onPress?: () => void;
}

export function CardLink({
  label,
  title,
  summary,
  url,
  bookmarked = false,
  icon = true,
  disabled = false,
  onBookmark,
  onMore,
  onPress,
}: CardLinkProps) {
  const moreRef = useRef<View>(null);

  const handleMorePress = () => {
    moreRef.current?.measure((_fx, _fy, width, height, px, py) => {
      onMore?.({ x: px, y: py, width, height });
    });
  };

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [
        styles.card,
        disabled && styles.cardDisabled,
        pressed && !disabled && styles.cardPressed,
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
    >
      <View style={styles.topRow}>
        <Text style={[styles.label, disabled && styles.textDisabled]}>{label}</Text>
        {icon && (
          <View style={styles.iconRow}>
            <Pressable
              onPress={disabled ? undefined : onBookmark}
              hitSlop={8}
              style={({ pressed }) => pressed && !disabled && styles.pressed}
            >
              <IconSymbol
                name={bookmarked ? 'bookmark.fill' : 'bookmark'}
                size={20}
                color={bookmarked ? Colors.brand.primary : disabled ? Colors.brand.textHint : Colors.brand.textSecondary}
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
        {title}
      </Text>

      <Text
        style={[styles.summary, disabled && styles.textDisabled]}
        numberOfLines={1}
      >
        {summary}
      </Text>

      <Text
        style={[styles.url, disabled && styles.textDisabled]}
        numberOfLines={1}
      >
        {url}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.brand.line,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 4,
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
    marginBottom: 4,
  },
  iconRow: {
    flexDirection: 'row',
    gap: 8,
  },

  label: {
    ...Typography.caption,
    color: Colors.brand.textSecondary,
  },
  title: {
    ...Typography.section,
    color: Colors.brand.text,
  },
  summary: {
    ...Typography.summary,
    color: Colors.brand.textSecondary,
  },
  url: {
    ...Typography.url,
    color: Colors.brand.textHint,
  },

  textDisabled: {
    color: Colors.brand.textHint,
  },
  pressed: {
    opacity: 0.6,
  },
});
