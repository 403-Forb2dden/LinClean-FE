import { useAuth } from '@clerk/expo';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Redirect, router, Tabs } from 'expo-router';
import { useEffect, useRef, useState } from 'react';

import { BottomTabBar, type TabVariant } from '@/components/ui/bottom-tab-bar';
import { SavedLinksProvider } from '@/context/saved-links-context';
import { syncAuthenticatedMember } from '@/services/auth-api';

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
  const { getToken, isLoaded, isSignedIn, sessionId, signOut } = useAuth();
  const [hasSyncedMember, setHasSyncedMember] = useState(false);
  const syncedSessionIdRef = useRef<string | null>(null);
  const getTokenRef = useRef(getToken);
  const signOutRef = useRef(signOut);

  useEffect(() => {
    getTokenRef.current = getToken;
  }, [getToken]);

  useEffect(() => {
    signOutRef.current = signOut;
  }, [signOut]);

  useEffect(() => {
    let isMounted = true;

    if (!isLoaded) {
      return undefined;
    }

    if (!isSignedIn) {
      syncedSessionIdRef.current = null;
      setHasSyncedMember(false);
      return undefined;
    }

    if (!sessionId) {
      setHasSyncedMember(false);
      return undefined;
    }

    if (syncedSessionIdRef.current === sessionId) {
      setHasSyncedMember(true);
      return undefined;
    }

    setHasSyncedMember(false);

    syncAuthenticatedMember(() => getTokenRef.current())
      .then(() => {
        if (isMounted) {
          syncedSessionIdRef.current = sessionId;
          setHasSyncedMember(true);
        }
      })
      .catch(async (error) => {
        console.error(error);

        try {
          await signOutRef.current();
        } catch (signOutError) {
          console.error(signOutError);
        }

        if (isMounted) {
          syncedSessionIdRef.current = null;
          setHasSyncedMember(false);
          router.replace('/login' as any);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isLoaded, isSignedIn, sessionId]);

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    return <Redirect href="/login" />;
  }

  if (!hasSyncedMember) {
    return null;
  }

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
