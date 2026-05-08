import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { router, Tabs } from 'expo-router';

import { BottomTabBar, type TabVariant } from '@/components/ui/bottom-tab-bar';
import { SavedLinksProvider } from '@/context/saved-links-context';

const ROUTE_TO_TAB: Record<string, TabVariant> = {
  '(home)': 'home',
  '(folder)': 'folder',
};

const TAB_TO_HREF: Partial<Record<TabVariant, string>> = {
  home: '/(tabs)/(home)',
  addLink: '/(tabs)/(home)/add-link',
  folder: '/(tabs)/(folder)',
};

function CustomTabBar({ state }: BottomTabBarProps) {
  const activeRoute = state.routes[state.index];
  const activeRouteName = activeRoute?.name ?? '(home)';
  const activeTab = ROUTE_TO_TAB[activeRouteName] ?? 'home';

  function handleTabPress(tab: TabVariant) {
    const href = TAB_TO_HREF[tab];
    if (href) {
      router.navigate(href as any);
    }
  }

  return (
    <BottomTabBar
      activeTab={activeTab}
      onTabPress={handleTabPress}
    />
  );
}

export default function TabLayout() {
  return (
    <SavedLinksProvider>
      <Tabs
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{ headerShown: false }}
      >
        <Tabs.Screen name="(home)" />
        <Tabs.Screen name="(folder)" />
        <Tabs.Screen name="(explore)" options={{ href: null }} />
      </Tabs>
    </SavedLinksProvider>
  );
}
