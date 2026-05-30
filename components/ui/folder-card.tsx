import { useRef } from 'react';
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Colors, Typography } from '@/constants/theme';
import { useGuardedPress } from '@/utils/press-guard';
import { IconSymbol } from './icon-symbol';

type FolderCardVariant = 'tabbed' | 'plain';

const DEFAULT_CARD_WIDTH = 144;
const CARD_HEIGHT = 128;
const CARD_BODY_TOP = 16;
const CARD_BODY_MIN_HEIGHT = 112;
const CARD_TAB_WIDTH = 72;
const CARD_TAB_HEIGHT = 30;
const CARD_TAB_LEFT = 10;
const CARD_HORIZONTAL_PADDING = 14;
const CARD_VERTICAL_PADDING = 18;
const CARD_MENU_SIZE = 22;
const CARD_RADIUS = 12;
const TAB_RADIUS = 8;
const TOUCH_HIT_SLOP = 8;
const COMPACT_CARD_HEIGHT = 116;
const COMPACT_CARD_BODY_TOP = 14;
const COMPACT_CARD_BODY_MIN_HEIGHT = 102;
const COMPACT_CARD_TAB_WIDTH = 64;
const COMPACT_CARD_TAB_HEIGHT = 26;
const COMPACT_CARD_HORIZONTAL_PADDING = 12;
const COMPACT_CARD_VERTICAL_PADDING = 14;
const COMPACT_CARD_MENU_SIZE = 20;

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
  const cardWidth = width ?? DEFAULT_CARD_WIDTH;
  const guardedOnPress = useGuardedPress(onPress, { disabled });
  const guardedOnMorePress = useGuardedPress(onMorePress, { disabled });
  const isTabbed = variant === 'tabbed';
  const isCompact = cardWidth <= DEFAULT_CARD_WIDTH;
  const cardHeight = isCompact ? COMPACT_CARD_HEIGHT : CARD_HEIGHT;
  const bodyTop = isCompact ? COMPACT_CARD_BODY_TOP : CARD_BODY_TOP;
  const bodyMinHeight = isCompact ? COMPACT_CARD_BODY_MIN_HEIGHT : CARD_BODY_MIN_HEIGHT;
  const tabWidth = isCompact ? COMPACT_CARD_TAB_WIDTH : CARD_TAB_WIDTH;
  const tabHeight = isCompact ? COMPACT_CARD_TAB_HEIGHT : CARD_TAB_HEIGHT;
  const horizontalPadding = isCompact ? COMPACT_CARD_HORIZONTAL_PADDING : CARD_HORIZONTAL_PADDING;
  const verticalPadding = isCompact ? COMPACT_CARD_VERTICAL_PADDING : CARD_VERTICAL_PADDING;
  const menuSize = isCompact ? COMPACT_CARD_MENU_SIZE : CARD_MENU_SIZE;

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
              height: tabHeight,
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
                hitSlop={{ top: TOUCH_HIT_SLOP, bottom: TOUCH_HIT_SLOP, left: TOUCH_HIT_SLOP, right: TOUCH_HIT_SLOP }}
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
          numberOfLines={2}
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
    top: 0,
    left: CARD_TAB_LEFT,
    borderTopLeftRadius: TAB_RADIUS,
    borderTopRightRadius: TAB_RADIUS,
    borderWidth: 1,
    borderBottomWidth: 0,
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
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    borderColor: Colors.brand.line,
    backgroundColor: Colors.brand.surface,
    overflow: 'hidden',
  },
  bodyPlain: {
    flex: 0,
  },
  bodyDisabled: {
    borderColor: Colors.brand.line,
    backgroundColor: Colors.brand.surface,
  },
  pressed: {
    opacity: 0.82,
  },
  header: {
    minHeight: COMPACT_CARD_MENU_SIZE,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  count: {
    ...Typography.body,
    color: Colors.brand.textSecondary,
  },
  countDisabled: {
    color: Colors.brand.textHint,
  },
  moreButton: {
    width: CARD_MENU_SIZE,
    height: CARD_MENU_SIZE,
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
