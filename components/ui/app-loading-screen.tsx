import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Colors } from '@/constants/theme';

export function AppLoadingScreen() {
  return (
    <View style={styles.container}>
      <ActivityIndicator color={Colors.brand.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.brand.background,
  },
});