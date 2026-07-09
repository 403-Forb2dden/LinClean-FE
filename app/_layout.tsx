import { ClerkProvider } from '@clerk/expo';
import { tokenCache } from '@clerk/expo/token-cache';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { ShareIntentProvider } from 'expo-share-intent';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { PressBlocker } from '@/components/ui/press-blocker';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error('Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY');
}

const clerkPublishableKey = publishableKey;

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ShareIntentProvider options={{ scheme: 'linclean', resetOnBackground: false }}>
      <ClerkProvider publishableKey={clerkPublishableKey} tokenCache={tokenCache}>
        <GestureHandlerRootView style={styles.root}>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack screenOptions={{ contentStyle: { backgroundColor: Colors.brand.background } }}>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="sso-callback" options={{ headerShown: false }} />
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
            </Stack>
            <StatusBar style="dark" backgroundColor={Colors.brand.background} translucent={false} />
          </ThemeProvider>
          <PressBlocker />
        </GestureHandlerRootView>
      </ClerkProvider>
    </ShareIntentProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.brand.background,
  },
});
