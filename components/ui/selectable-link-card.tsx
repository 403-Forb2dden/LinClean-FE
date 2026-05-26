import { StyleSheet, View } from 'react-native';

import { Colors } from '@/constants/theme';
import type { SavedLink } from '@/context/saved-links-context';
import { CardLink } from './card-link';
import { SelectionCircle } from './selection-circle';

interface SelectableLinkCardProps {
  link: SavedLink;
  selected: boolean;
  onToggle: (id: number) => void;
}

export function SelectableLinkCard({ link, selected, onToggle }: SelectableLinkCardProps) {
  return (
    <View style={styles.selectableCard}>
      <View style={styles.cardLayer}>
        <CardLink
          verdict={link.verdict}
          title={link.title}
          originalUrl={link.originalUrl}
          finalUrl={link.finalUrl}
          bookmarked={link.isBookmarked}
          icon={false}
          onPress={() => onToggle(link.id)}
        />
        {selected && (
          <View style={styles.selectedOverlay} pointerEvents="none" />
        )}
      </View>
      <View style={styles.checkOverlay} pointerEvents="none">
        <SelectionCircle selected={selected} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  selectableCard: {
    position: 'relative',
  },
  cardLayer: {
    position: 'relative',
    borderRadius: 22,
    overflow: 'hidden',
  },
  selectedOverlay: {
    position: 'absolute',
    inset: 0,
    borderRadius: 22,
    backgroundColor: Colors.brand.overlaySelected,
  },
  checkOverlay: {
    position: 'absolute',
    right: 16,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    zIndex: 10,
    elevation: 10,
  },
});
