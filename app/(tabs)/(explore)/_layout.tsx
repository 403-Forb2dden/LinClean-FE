import { Stack } from 'expo-router/stack';

export default function ExploreLayout() {
  return (
    <Stack
      screenOptions={{
        headerTransparent: true,
        headerShadowVisible: false,
        headerLargeTitle: true,
        headerBackButtonDisplayMode: 'minimal',
      }}
    />
  );
}
