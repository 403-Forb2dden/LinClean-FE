import { useAuth } from '@clerk/expo';
import { Redirect } from 'expo-router';

import { AppLoadingScreen } from '@/components/ui/app-loading-screen';

export default function IndexScreen() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return <AppLoadingScreen />;
  }

  return <Redirect href={isSignedIn ? '/(tabs)/(home)' : '/login'} />;
}
