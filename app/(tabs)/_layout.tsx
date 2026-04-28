import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { router, Tabs } from 'expo-router';

import { BottomTabBar, TabVariant } from '@/components/ui/bottom-tab-bar';
import { SavedLinksProvider } from '@/context/saved-links-context';
import { FoldersProvider } from '@/context/folders-context';

const ROUTE_TO_TAB: Record<string, TabVariant> = {
  '(home)': 'home',
  '(folder)': 'folder',
};

const TAB_TO_HREF: Record<string, string> = {
  home: '/(tabs)/(home)',
  folder: '/(tabs)/(folder)',
};

const HIDDEN_STACK_SCREENS = new Set(['folder-name', 'folder-url-select', 'folder-add-url', 'add-link']);

function CustomTabBar({ state }: BottomTabBarProps) {
  const activeRoute = state.routes[state.index];
  const activeRouteName = activeRoute?.name ?? '(home)';

  // 중첩 Stack의 현재 화면이 탭바 숨김 대상이면 렌더링하지 않음
  const nestedState = activeRoute?.state;
  const nestedScreen = nestedState?.routes[nestedState.index ?? 0]?.name ?? '';
  if (HIDDEN_STACK_SCREENS.has(nestedScreen)) return null;

  const activeTab = ROUTE_TO_TAB[activeRouteName] ?? 'home';

  function handleTabPress(tab: TabVariant) {
    if (tab === 'addLink') {
      router.push('/(tabs)/(home)/add-link');
      return;
    }

    const href = TAB_TO_HREF[tab];
    if (href) {
      router.navigate(href as any);
    }
  }

  return <BottomTabBar activeTab={activeTab} onTabPress={handleTabPress} />;
}

export default function TabLayout() {
  return (
    <SavedLinksProvider>
      <FoldersProvider>
      <Tabs
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{ headerShown: false }}
      >
        <Tabs.Screen name="(home)" />
        <Tabs.Screen name="(folder)" />
        {/* 개발용: 탭에서 숨김, 딥링크(linclean:///(explore))로 접근 가능 */}
        <Tabs.Screen name="(explore)" options={{ href: null }} />
      </Tabs>
      </FoldersProvider>
    </SavedLinksProvider>
  );
}
