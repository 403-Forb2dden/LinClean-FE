import { useAuth } from '@clerk/expo';
import { Redirect } from 'expo-router';
import { Stack } from 'expo-router/stack';

export default function AuthLayout() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return null;
  }

  if (isSignedIn) {
    return <Redirect href="/(tabs)/(home)" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }} />
  );
}
