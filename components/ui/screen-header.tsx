import { StyleSheet, Text, View } from 'react-native';

import { Colors, Typography } from '@/constants/theme';
import { AppIcon } from './app-icon';

interface ScreenHeaderProps {
  title: string;
  onBack: () => void;
}

export function ScreenHeader({ title, onBack }: ScreenHeaderProps) {
  return (
    <View style={styles.header}>
      <AppIcon name="back" size={24} onPress={onBack} />
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  title: {
    ...Typography.pageTitle,
    color: Colors.brand.text,
    flexShrink: 1,
  },
});