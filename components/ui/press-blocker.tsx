import { StyleSheet, View } from 'react-native';

import { useBlockingInteractionActive } from '@/utils/press-guard';

export function PressBlocker() {
  const isBlocking = useBlockingInteractionActive();

  if (!isBlocking) {
    return null;
  }

  return <View pointerEvents="auto" style={styles.blocker} />;
}

const styles = StyleSheet.create({
  blocker: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    elevation: 9999,
    zIndex: 9999,
  },
});
