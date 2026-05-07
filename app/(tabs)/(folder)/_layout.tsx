import { Stack } from 'expo-router';

import { FoldersProvider } from '@/context/folders-context';
import { SavedLinksProvider } from '@/context/saved-links-context';

export default function FolderLayout() {
  return (
    <SavedLinksProvider>
      <FoldersProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </FoldersProvider>
    </SavedLinksProvider>
  );
}
