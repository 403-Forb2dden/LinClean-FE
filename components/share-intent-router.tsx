import { useAuth } from '@clerk/expo';
import { router, useSegments } from 'expo-router';
import { useShareIntentContext } from 'expo-share-intent';
import { useEffect, useRef } from 'react';

import { getSharedUrlFromIntent } from '@/utils/shared-url';

export function ShareIntentRouter() {
  const { isLoaded, isSignedIn } = useAuth();
  const segments = useSegments();
  const { error, hasShareIntent, isReady, resetShareIntent, shareIntent } =
    useShareIntentContext();
  const handledUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (error) {
      console.warn('Failed to read share intent.', error);
    }
  }, [error]);

  useEffect(() => {
    if (!hasShareIntent) {
      handledUrlRef.current = null;
      return;
    }

    if (!isLoaded || !isReady) {
      return;
    }

    if (!isSignedIn) {
      return;
    }

    if (segments[0] !== '(tabs)') {
      return;
    }

    const sharedUrl = getSharedUrlFromIntent(shareIntent);

    if (!sharedUrl) {
      resetShareIntent(true);
      return;
    }

    if (handledUrlRef.current === sharedUrl) {
      return;
    }

    handledUrlRef.current = sharedUrl;
    router.replace({
      pathname: '/(tabs)/(home)/add-link',
      params: { sharedUrl },
    });
    resetShareIntent(true);
  }, [hasShareIntent, isLoaded, isReady, isSignedIn, resetShareIntent, segments, shareIntent]);

  return null;
}
