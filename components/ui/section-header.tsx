import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, Typography } from '@/constants/theme';

interface SectionHeaderProps {
  label: string;
  onViewAll?: () => void;
  viewAllLabel?: string;
}

export function SectionHeader({ label, onViewAll, viewAllLabel = '전체보기' }: SectionHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      {onViewAll && (
        <TouchableOpacity onPress={onViewAll} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.viewAll}>{viewAllLabel}</Text>
        </TouchableOpacity>
      )}
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
    ...Typography.section,
    color: Colors.brand.text,
  },
  viewAll: {
    ...Typography.caption,
    color: Colors.brand.primaryDeep,
  },
});
