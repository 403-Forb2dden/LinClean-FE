import { useRef } from 'react';
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Colors, ComponentTokens, Typography } from '@/constants/theme';
import { useGuardedPress } from '@/utils/press-guard';
import { IconSymbol } from './icon-symbol';

type FolderCardVariant = 'tabbed' | 'plain';

const FOLDER_CARD = ComponentTokens.folderCard;

export interface AnchorPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FolderCardProps {
  folderName: string;
  urlCount: number;
  width?: number;
  onPress?: () => void;
  onMorePress?: (anchor: AnchorPosition) => void;
  disabled?: boolean;
  icon?: boolean;
  variant?: FolderCardVariant;
}

export function FolderCard({
  folderName,
  urlCount,
  width,
  onPress,
  onMorePress,
  disabled = false,
  icon = true,
  variant = 'tabbed',
}: FolderCardProps) {
  const moreRef = useRef<View>(null);
  const cardWidth = width ?? FOLDER_CARD.defaultWidth;
  const guardedOnPress = useGuardedPress(onPress, { disabled });
  const guardedOnMorePress = useGuardedPress(onMorePress, { disabled });
  const isTabbed = variant === 'tabbed';
  const isCompact = cardWidth <= FOLDER_CARD.defaultWidth;
  const cardHeight = isCompact ? FOLDER_CARD.compact.height : FOLDER_CARD.height;
  const bodyTop = isCompact ? FOLDER_CARD.compact.bodyTop : FOLDER_CARD.bodyTop;
  const bodyMinHeight = isCompact ? FOLDER_CARD.compact.bodyMinHeight : FOLDER_CARD.bodyMinHeight;
  const tabWidth = isCompact ? FOLDER_CARD.compact.tabWidth : FOLDER_CARD.tabWidth;
  const horizontalPadding = isCompact ? FOLDER_CARD.compact.horizontalPadding : FOLDER_CARD.horizontalPadding;
  const verticalPadding = isCompact ? FOLDER_CARD.compact.verticalPadding : FOLDER_CARD.verticalPadding;
  const menuSize = isCompact ? FOLDER_CARD.compact.menuSize : FOLDER_CARD.menuSize;

  const handleMorePress = () => {
    moreRef.current?.measure((_fx, _fy, measuredWidth, measuredHeight, px, py) => {
      guardedOnMorePress?.({ x: px, y: py, width: measuredWidth, height: measuredHeight });
    });
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.root,
        { width: cardWidth },
        isTabbed
          ? [styles.rootTabbed, { height: cardHeight, paddingTop: bodyTop }]
          : [styles.rootPlain, { minHeight: bodyMinHeight }],
        pressed && !disabled && styles.pressed,
      ]}
      onPress={guardedOnPress}
      accessibilityRole="button"
      accessibilityLabel={`${folderName} 폴더, ${urlCount}개`}
      accessibilityState={{ disabled }}
    >
      {isTabbed ? (
        <View
          style={[
            styles.tab,
            {
              width: tabWidth,
              height: bodyTop,
            },
            disabled && styles.tabDisabled,
          ]}
        />
      ) : null}
      <View
        style={[
          styles.body,
          {
            width: cardWidth,
            minHeight: bodyMinHeight,
            paddingHorizontal: horizontalPadding,
            paddingVertical: verticalPadding,
          },
          disabled && styles.bodyDisabled,
          !isTabbed && styles.bodyPlain,
        ]}
      >
        <View style={styles.header}>
          <Text style={[styles.count, disabled && styles.countDisabled]}>{urlCount}개</Text>
          {icon ? (
            <View ref={moreRef} collapsable={false}>
              <TouchableOpacity
                onPress={handleMorePress}
                disabled={disabled}
                hitSlop={{
                  top: FOLDER_CARD.touchHitSlop,
                  bottom: FOLDER_CARD.touchHitSlop,
                  left: FOLDER_CARD.touchHitSlop,
                  right: FOLDER_CARD.touchHitSlop,
                }}
                activeOpacity={0.7}
                style={styles.moreButton}
              >
                <IconSymbol
                  name="ellipsis"
                  size={menuSize}
                  color={disabled ? Colors.brand.textHint : Colors.brand.textHint}
                />
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
        <Text
          style={[
            styles.folderName,
            isCompact && styles.folderNameCompact,
            disabled && styles.folderNameDisabled,
          ]}
          numberOfLines={FOLDER_CARD.folderNameLines}
        >
          {folderName}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flexShrink: 0,
  },
  rootTabbed: {},
  rootPlain: {},
  tab: {
    position: 'absolute',
    top: FOLDER_CARD.origin,
    left: FOLDER_CARD.tabLeft,
    borderTopLeftRadius: FOLDER_CARD.tabRadius,
    borderTopRightRadius: FOLDER_CARD.tabRadius,
    borderWidth: FOLDER_CARD.borderWidth,
    borderBottomWidth: FOLDER_CARD.hiddenBorderWidth,
    borderColor: Colors.brand.line,
    backgroundColor: Colors.brand.softMint,
  },
  tabDisabled: {
    backgroundColor: Colors.brand.softMint,
    borderColor: Colors.brand.line,
  },
  body: {
    flex: 1,
    justifyContent: 'space-between',
    borderRadius: FOLDER_CARD.radius,
    borderWidth: FOLDER_CARD.borderWidth,
    borderColor: Colors.brand.line,
    backgroundColor: Colors.brand.folderCard.body,
    overflow: 'hidden',
  },
  bodyPlain: {
    flex: 0,
  },
  bodyDisabled: {
    borderColor: Colors.brand.line,
    backgroundColor: Colors.brand.folderCard.body,
  },
  pressed: {
    transform: [{ scale: FOLDER_CARD.pressedScale }],
  },
  header: {
    minHeight: FOLDER_CARD.compact.menuSize,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: FOLDER_CARD.headerGap,
  },
  count: {
    ...Typography.body,
    color: Colors.brand.textSecondary,
  },
  countDisabled: {
    color: Colors.brand.textHint,
  },
  moreButton: {
    width: FOLDER_CARD.menuSize,
    height: FOLDER_CARD.menuSize,
    alignItems: 'center',
    justifyContent: 'center',
  },
  folderName: {
    ...Typography.title,
    color: Colors.brand.text,
  },
  folderNameCompact: {
    ...Typography.section,
  },
  folderNameDisabled: {
    color: Colors.brand.textHint,
  },
});
