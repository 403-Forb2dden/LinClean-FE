import type { ReactNode } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Colors, Typography } from '@/constants/theme';
import { useGuardedPress } from '@/utils/press-guard';

interface SectionHeaderProps {
  label: string;
  compact?: boolean;
  onViewAll?: () => void;
  viewAllLabel?: string;
  rightSlot?: ReactNode;
}

export function SectionHeader({
  label,
  compact = false,
  onViewAll,
  viewAllLabel = '전체보기',
  rightSlot,
}: SectionHeaderProps) {
  const guardedOnViewAll = useGuardedPress(onViewAll);

  return (
    <View style={styles.container}>
      <Text style={[styles.label, compact && styles.labelCompact]}>{label}</Text>
      {rightSlot ?? (onViewAll && (
        <TouchableOpacity onPress={guardedOnViewAll} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.viewAll}>{viewAllLabel}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    ...Typography.sectionTitle,
    color: Colors.brand.text,
  },
  labelCompact: {
    ...Typography.section,
  },
  viewAll: {
    ...Typography.caption,
    color: Colors.brand.primaryDeep,
  },
});
