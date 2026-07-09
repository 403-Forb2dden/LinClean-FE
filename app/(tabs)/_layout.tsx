import { useAuth } from '@clerk/expo';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Redirect, router, Tabs } from 'expo-router';
import { useEffect, useRef, useState } from 'react';

import { ShareIntentRouter } from '@/components/share-intent-router';
import { AppLoadingScreen } from '@/components/ui/app-loading-screen';
import { BottomTabBar, type TabVariant } from '@/components/ui/bottom-tab-bar';
import { FoldersProvider } from '@/context/folders-context';
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

type NestedRoute = {
  name?: string;
  state?: {
    index?: number;
    routes?: NestedRoute[];
  };
};

function getActiveNestedRouteName(route?: NestedRoute): string | undefined {
  const nestedState = route?.state;

  if (!nestedState?.routes?.length) {
    return route?.name;
  }

  const nestedIndex = nestedState.index ?? 0;
  return getActiveNestedRouteName(nestedState.routes[nestedIndex]);
}

function CustomTabBar({ state }: BottomTabBarProps) {
  const activeRoute = state.routes[state.index];
  const activeRouteName = activeRoute?.name ?? '(home)';
  const activeTab = ROUTE_TO_TAB[activeRouteName] ?? 'home';
  const isScanningRoute = getActiveNestedRouteName(activeRoute as NestedRoute) === 'scanning';

  function handleTabPress(tab: TabVariant) {
    if (isScanningRoute) {
      return;
    }

    const href = TAB_TO_HREF[tab];
    if (href) {
      router.navigate(href as any);
    }
  }

  return (
    <BottomTabBar
      activeTab={activeTab}
      onTabPress={handleTabPress}
      home={{ disabled: isScanningRoute }}
      addLink={{ disabled: isScanningRoute }}
      folder={{ disabled: isScanningRoute }}
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
          router.replace('/(auth)/login');
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isLoaded, isSignedIn, sessionId]);

  if (!isLoaded) {
    return <AppLoadingScreen />;
  }

  if (!isSignedIn) {
    return <Redirect href="/login" />;
  }

  if (!hasSyncedMember) {
    return <AppLoadingScreen />;
  }

  return (
    <SavedLinksProvider>
      <FoldersProvider>
        <ShareIntentRouter />
        <Tabs
          tabBar={(props) => <CustomTabBar {...props} />}
          screenOptions={{ headerShown: false }}
        >
          <Tabs.Screen name="(home)" />
          <Tabs.Screen name="(folder)" />
          <Tabs.Screen name="(explore)" options={{ href: null }} />
        </Tabs>
      </FoldersProvider>
    </SavedLinksProvider>
  );
}
