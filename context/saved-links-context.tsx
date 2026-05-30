import { useAuth } from '@clerk/expo';
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

import {
  createSavedLink,
  deleteSavedLink,
  fetchSavedLinks,
  toggleSavedLinkBookmark,
  updateSavedLinkCategory,
  updateSavedLinkTitle,
  type SavedLinkCreateRequest,
  type SavedLinkListQuery,
  type SavedLinkResponse,
} from '@/api/saved-links';
import { getSiteName } from '@/utils/analysis-result-display';

const DEFAULT_PAGE_SIZE = 50;
const LOGIN_REQUIRED_MESSAGE =
  '로그인 상태를 확인할 수 없습니다. 다시 로그인한 뒤 시도해주세요.';
const NETWORK_REQUEST_FAILED_MESSAGE =
  '네트워크 연결 상태를 확인한 뒤 다시 시도해주세요.';

export interface SavedLink extends SavedLinkResponse {
  description: string;
  siteName: string;
}

interface SavedLinksContextValue {
  links: SavedLink[];
  isLoading: boolean;
  isLoadingMore: boolean;
  errorMessage: string;
  bookmarkingLinkIds: ReadonlySet<number>;
  hasNext: boolean;
  nextCursor: string | null;
  refreshLinks: (query?: SavedLinkListQuery) => Promise<void>;
  loadMoreLinks: () => Promise<void>;
  addLink: (request: SavedLinkCreateRequest) => Promise<SavedLink>;
  toggleBookmark: (id: number) => Promise<void>;
  deleteLink: (id: number) => Promise<void>;
  updateTitle: (id: number, title: string) => Promise<void>;
  assignCategory: (ids: number[], categoryId: number | null) => Promise<void>;
}

const SavedLinksContext = createContext<SavedLinksContextValue | null>(null);

export function SavedLinksProvider({ children }: { children: React.ReactNode }) {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [links, setLinks] = useState<SavedLink[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [bookmarkingLinkIds, setBookmarkingLinkIds] = useState<ReadonlySet<number>>(
    () => new Set(),
  );
  const [hasNext, setHasNext] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const lastQueryRef = useRef<SavedLinkListQuery>({ size: DEFAULT_PAGE_SIZE });
  const getTokenRef = useRef(getToken);
  const bookmarkingLinkIdsRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    getTokenRef.current = getToken;
  }, [getToken]);

  const refreshLinks = useCallback(
    async (query: SavedLinkListQuery = {}) => {
      if (!isLoaded) {
        return;
      }

      if (!isSignedIn) {
        setLinks([]);
        setErrorMessage(LOGIN_REQUIRED_MESSAGE);
        setHasNext(false);
        setNextCursor(null);
        return;
      }

      const nextQuery = { size: DEFAULT_PAGE_SIZE, ...query, cursor: null };
      lastQueryRef.current = nextQuery;
      setIsLoading(true);
      setErrorMessage('');

      try {
        const response = await fetchSavedLinks(() => getTokenRef.current(), nextQuery);
        setLinks(response.items.map(normalizeSavedLink));
        setHasNext(response.hasNext);
        setNextCursor(response.nextCursor);
      } catch (error) {
        setErrorMessage(getSavedLinkErrorMessage(error, '저장한 링크를 불러오지 못했습니다.'));
      } finally {
        setIsLoading(false);
      }
    },
    [isLoaded, isSignedIn],
  );

  const loadMoreLinks = useCallback(async () => {
    if (!isLoaded || !isSignedIn || !hasNext || !nextCursor || isLoadingMore) {
      return;
    }

    setIsLoadingMore(true);
    setErrorMessage('');

    try {
      const response = await fetchSavedLinks(() => getTokenRef.current(), {
        ...lastQueryRef.current,
        cursor: nextCursor,
      });

      setLinks((prev) => mergeLinks(prev, response.items.map(normalizeSavedLink)));
      setHasNext(response.hasNext);
      setNextCursor(response.nextCursor);
    } catch (error) {
      setErrorMessage(getSavedLinkErrorMessage(error, '저장한 링크를 더 불러오지 못했습니다.'));
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasNext, isLoaded, isLoadingMore, isSignedIn, nextCursor]);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (!isSignedIn) {
      setLinks([]);
      setHasNext(false);
      setNextCursor(null);
      setErrorMessage('');
      return;
    }

    void refreshLinks();
  }, [isLoaded, isSignedIn, refreshLinks]);

  const addLink = useCallback(async (request: SavedLinkCreateRequest) => {
    const savedLink = normalizeSavedLink(
      await createSavedLink(() => getTokenRef.current(), request),
    );
    setLinks((prev) => [savedLink, ...prev.filter((link) => link.id !== savedLink.id)]);
    return savedLink;
  }, []);

  const toggleBookmark = useCallback(async (id: number) => {
    if (bookmarkingLinkIdsRef.current.has(id)) {
      return;
    }

    bookmarkingLinkIdsRef.current.add(id);
    setBookmarkingLinkIds(new Set(bookmarkingLinkIdsRef.current));

    const previousIsBookmarked = links.find((link) => link.id === id)?.isBookmarked;
    setLinks((prev) =>
      prev.map((link) =>
        link.id === id ? { ...link, isBookmarked: !link.isBookmarked } : link,
      ),
    );

    try {
      const response = await toggleSavedLinkBookmark(() => getTokenRef.current(), id);
      setLinks((prev) =>
        prev.map((link) =>
          link.id === id ? { ...link, isBookmarked: response.isBookmarked } : link,
        ),
      );
    } catch (error) {
      if (previousIsBookmarked != null) {
        setLinks((prev) =>
          prev.map((link) =>
            link.id === id ? { ...link, isBookmarked: previousIsBookmarked } : link,
          ),
        );
      }

      throw error;
    } finally {
      bookmarkingLinkIdsRef.current.delete(id);
      setBookmarkingLinkIds(new Set(bookmarkingLinkIdsRef.current));
    }
  }, [links]);

  const deleteLink = useCallback(async (id: number) => {
    const previousLinks = links;
    setLinks((prev) => prev.filter((link) => link.id !== id));

    try {
      await deleteSavedLink(() => getTokenRef.current(), id);
    } catch (error) {
      setLinks(previousLinks);
      throw error;
    }
  }, [links]);

  const updateTitle = useCallback(async (id: number, title: string) => {
    const previousLinks = links;
    setLinks((prev) =>
      prev.map((link) => (link.id === id ? { ...link, title } : link)),
    );

    try {
      const response = await updateSavedLinkTitle(() => getTokenRef.current(), id, title);
      setLinks((prev) =>
        prev.map((link) =>
          link.id === id ? { ...link, title: response.title } : link,
        ),
      );
    } catch (error) {
      setLinks(previousLinks);
      throw error;
    }
  }, [links]);

  const assignCategory = useCallback(async (ids: number[], categoryId: number | null) => {
    if (ids.length === 0) {
      return;
    }

    const previousLinks = links;
    setLinks((prev) =>
      prev.map((link) => (ids.includes(link.id) ? { ...link, categoryId } : link)),
    );

    try {
      const responses = await Promise.all(
        ids.map((id) => updateSavedLinkCategory(() => getTokenRef.current(), id, categoryId)),
      );

      setLinks((prev) =>
        prev.map((link) => {
          const response = responses.find((item) => item.id === link.id);
          return response ? { ...link, categoryId: response.categoryId } : link;
        }),
      );
    } catch (error) {
      setLinks(previousLinks);
      throw error;
    }
  }, [links]);

  return (
    <SavedLinksContext.Provider
      value={{
        links,
        isLoading,
        isLoadingMore,
        errorMessage,
        bookmarkingLinkIds,
        hasNext,
        nextCursor,
        refreshLinks,
        loadMoreLinks,
        addLink,
        toggleBookmark,
        deleteLink,
        updateTitle,
        assignCategory,
      }}
    >
      {children}
    </SavedLinksContext.Provider>
  );
}

export function useSavedLinks(): SavedLinksContextValue {
  const ctx = useContext(SavedLinksContext);
  if (!ctx) throw new Error('useSavedLinks must be used within SavedLinksProvider');
  return ctx;
}

export function getSavedLinkErrorMessage(error: unknown, fallbackMessage: string) {
  if (error instanceof Error) {
    if (error.message === 'Missing Clerk session token') {
      return LOGIN_REQUIRED_MESSAGE;
    }

    if (error.message === 'Network request failed') {
      return NETWORK_REQUEST_FAILED_MESSAGE;
    }

    if (error.message) {
      return error.message;
    }
  }

  return fallbackMessage;
}

function normalizeSavedLink(link: SavedLinkResponse): SavedLink {
  const displayUrl = link.finalUrl ?? link.originalUrl;

  return {
    ...link,
    finalUrl: link.finalUrl ?? null,
    categoryId: link.categoryId ?? null,
    description: link.description ?? '',
    siteName: getSiteName(displayUrl),
  };
}

function mergeLinks(previousLinks: SavedLink[], nextLinks: SavedLink[]) {
  const linkMap = new Map<number, SavedLink>();

  [...previousLinks, ...nextLinks].forEach((link) => {
    linkMap.set(link.id, link);
  });

  return [...linkMap.values()];
}
