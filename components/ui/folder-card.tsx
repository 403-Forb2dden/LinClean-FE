import { useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography } from '@/constants/theme';
import { useGuardedPress } from '@/utils/press-guard';
import { AppIcon } from './app-icon';

const DEFAULT_CARD_WIDTH = 144;

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
}

export function FolderCard({
  folderName,
  urlCount,
  width,
  onPress,
  onMorePress,
  disabled = false,
}: FolderCardProps) {
  const moreRef = useRef<View>(null);
  const cardWidth = width ?? DEFAULT_CARD_WIDTH;
  const guardedOnPress = useGuardedPress(onPress, { disabled });
  const guardedOnMorePress = useGuardedPress(onMorePress, { disabled });

  const handleMorePress = () => {
    moreRef.current?.measure((_fx, _fy, measuredWidth, measuredHeight, px, py) => {
      guardedOnMorePress?.({ x: px, y: py, width: measuredWidth, height: measuredHeight });
    });
  };

  return (
    <Pressable
      style={({ pressed }) => [styles.root, { width: cardWidth }, pressed && !disabled && styles.pressed]}
      onPress={guardedOnPress}
      accessibilityRole="button"
      accessibilityLabel={`${folderName} 폴더, ${urlCount}개`}
      accessibilityState={{ disabled }}
    >
      {disabled ? (
        <View style={[styles.shadow, styles.shadowDisabled]}>
          <View style={[styles.cardDisabled, { width: cardWidth }]}>
            <View style={styles.header}>
              <Text style={[styles.count, styles.countDisabled]}>{urlCount}개</Text>
              <View ref={moreRef} collapsable={false}>
                <AppIcon
                  name="more"
                  size={16}
                  disabled={disabled}
                  onPress={handleMorePress}
                />
              </View>
            </View>
            <Text style={[styles.folderName, styles.folderNameDisabled]} numberOfLines={2}>
              {folderName}
            </Text>
          </View>
        </View>
      ) : (
        <View style={[styles.shadow, styles.shadowActive]}>
          <LinearGradient
            colors={[Colors.brand.folderGradientStart, Colors.brand.folderGradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.card, { width: cardWidth }]}
          >
            <View style={styles.header}>
              <Text style={styles.count}>{urlCount}개</Text>
              <View ref={moreRef} collapsable={false}>
                <AppIcon
                  name="more"
                  size={16}
                  onPress={handleMorePress}
                />
              </View>
            </View>
            <Text style={styles.folderName} numberOfLines={2}>
              {folderName}
            </Text>
          </LinearGradient>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flexShrink: 0,
  },
  shadow: {
    borderRadius: 16,
    shadowColor: Colors.brand.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  shadowActive: {
    backgroundColor: Colors.brand.folderGradientEnd,
  },
  shadowDisabled: {
    backgroundColor: Colors.brand.softMint,
  },
  card: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    width: 144,
    minHeight: 96,
    justifyContent: 'space-between',
  },
  pressed: {
    opacity: 0.8,
  },
  cardDisabled: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    width: 144,
    minHeight: 96,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  count: {
    ...Typography.regular12,
    color: Colors.brand.textSecondary,
  },
  countDisabled: {
    color: Colors.brand.textHint,
  },
  folderName: {
    ...Typography.section,
    color: Colors.brand.text,
  },
  folderNameDisabled: {
    color: Colors.brand.textHint,
  },
});
