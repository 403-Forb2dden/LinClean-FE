import { Stack } from 'expo-router/stack';

import { AnalysisResultCacheProvider } from '@/context/analysis-result-cache-context';

export default function HomeLayout() {
  return (
    <AnalysisResultCacheProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </AnalysisResultCacheProvider>
  );
}
