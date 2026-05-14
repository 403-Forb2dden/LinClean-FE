import { StyleSheet, Text, View } from 'react-native';
import { Colors, Typography } from '@/constants/theme';

interface ScanResultReasonProps {
  reason: string;
}

export function ScanResultReason({ reason }: ScanResultReasonProps) {
  const normalizedReason = reason.trim();

  if (!normalizedReason) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>판정 이유</Text>
      <Text style={styles.reason} numberOfLines={4}>
        {normalizedReason}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: Colors.light.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.brand.line,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    marginBottom: 24,
  },
  label: {
    ...Typography.caption,
    color: Colors.brand.textHint,
  },
  reason: {
    ...Typography.body,
    color: Colors.brand.textSecondary,
    lineHeight: 24,
  },
});
