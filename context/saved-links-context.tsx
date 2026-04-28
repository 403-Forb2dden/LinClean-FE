import { createContext, useCallback, useContext, useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────
// ERD: SAVED_LINK JOIN ANALYSIS / API 명세 4.2 응답 구조 기반

export interface SavedLink {
  id: number;
  analysisId: string;
  categoryId: number | null;
  originalUrl: string;
  finalUrl: string | null;
  title: string;
  description: string;
  siteName: string;
  verdict: 'safe' | 'caution' | 'danger';
  isBookmarked: boolean;
  createdAt: string;
}

interface SavedLinksContextValue {
  links: SavedLink[];
  addLink: (link: SavedLink) => void;
  toggleBookmark: (id: number) => void;
  deleteLink: (id: number) => void;
  assignCategory: (ids: number[], categoryId: number) => void;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
// 실제 구현 시 GET /api/v1/saved-links 응답으로 교체

const MOCK_LINKS: SavedLink[] = [
  {
    id: 1,
    analysisId: 'a1b2c3d4-0001-0001-0001-000000000001',
    categoryId: 1,
    originalUrl: 'https://blog.naver.com/food1',
    finalUrl: 'https://blog.naver.com/food1',
    title: '용인시장 맛집 Top 100',
    description: '요약된 한줄짜리 글~',
    siteName: 'NAVER',
    verdict: 'safe',
    isBookmarked: false,
    createdAt: '2026-04-24T10:00:00Z',
  },
  {
    id: 2,
    analysisId: 'a1b2c3d4-0002-0002-0002-000000000002',
    categoryId: 1,
    originalUrl: 'https://blog.naver.com/food2',
    finalUrl: 'https://blog.naver.com/food2',
    title: '명지대학교 맛집',
    description: '요약된 한줄짜리 글~',
    siteName: 'NAVER',
    verdict: 'safe',
    isBookmarked: true,
    createdAt: '2026-04-24T09:00:00Z',
  },
  {
    id: 3,
    analysisId: 'a1b2c3d4-0003-0003-0003-000000000003',
    categoryId: 2,
    originalUrl: 'https://blog.naver.com/study1',
    finalUrl: 'https://blog.naver.com/study1',
    title: '알고리즘 이론',
    description: '요약된 한줄짜리 글~',
    siteName: 'NAVER',
    verdict: 'safe',
    isBookmarked: false,
    createdAt: '2026-04-24T08:00:00Z',
  },
  {
    id: 4,
    analysisId: 'a1b2c3d4-0004-0004-0004-000000000004',
    categoryId: 2,
    originalUrl: 'https://velog.io/typescript',
    finalUrl: 'https://velog.io/typescript',
    title: 'TypeScript 완전 정복',
    description: '요약된 한줄짜리 글~',
    siteName: 'Velog',
    verdict: 'safe',
    isBookmarked: true,
    createdAt: '2026-04-23T10:00:00Z',
  },
  {
    id: 5,
    analysisId: 'a1b2c3d4-0005-0005-0005-000000000005',
    categoryId: null,
    originalUrl: 'https://www.notion.so/LinClean',
    finalUrl: 'https://www.notion.so/LinClean',
    title: 'LinClean 기획서',
    description: '요약된 한줄짜리 글~',
    siteName: 'Notion',
    verdict: 'caution',
    isBookmarked: true,
    createdAt: '2026-04-23T08:00:00Z',
  },
  {
    id: 6,
    analysisId: 'a1b2c3d4-0006-0006-0006-000000000006',
    categoryId: 3,
    originalUrl: 'https://blog.naver.com/invest1',
    finalUrl: 'https://blog.naver.com/invest1',
    title: '주식 투자 꿀팁 모음',
    description: '요약된 한줄짜리 글~',
    siteName: 'NAVER',
    verdict: 'safe',
    isBookmarked: false,
    createdAt: '2026-04-22T10:00:00Z',
  },
  {
    id: 7,
    analysisId: 'a1b2c3d4-0007-0007-0007-000000000007',
    categoryId: 2,
    originalUrl: 'https://youtube.com/rn',
    finalUrl: 'https://youtube.com/rn',
    title: 'React Native 강의',
    description: '요약된 한줄짜리 글~',
    siteName: 'YouTube',
    verdict: 'safe',
    isBookmarked: true,
    createdAt: '2026-04-22T08:00:00Z',
  },
  {
    id: 8,
    analysisId: 'a1b2c3d4-0008-0008-0008-000000000008',
    categoryId: null,
    originalUrl: 'https://github.com/expo-router',
    finalUrl: 'https://github.com/expo-router',
    title: 'Expo Router 공식 문서',
    description: '요약된 한줄짜리 글~',
    siteName: 'GitHub',
    verdict: 'safe',
    isBookmarked: false,
    createdAt: '2026-04-21T10:00:00Z',
  },
];

// ─── Context ──────────────────────────────────────────────────────────────────

const SavedLinksContext = createContext<SavedLinksContextValue | null>(null);

export function SavedLinksProvider({ children }: { children: React.ReactNode }) {
  const [links, setLinks] = useState<SavedLink[]>(MOCK_LINKS);

  const addLink = useCallback((link: SavedLink) => {
    // TODO: 백엔드 연동 시 POST /api/v1/saved-links { analysisId } 호출 후 응답으로 교체
    setLinks((prev) => [link, ...prev]);
  }, []);

  const toggleBookmark = useCallback((id: number) => {
    // 실제 구현 시 PATCH /api/v1/saved-links/{id}/bookmark 호출
    setLinks((prev) =>
      prev.map((link) =>
        link.id === id ? { ...link, isBookmarked: !link.isBookmarked } : link
      )
    );
  }, []);

  const deleteLink = useCallback((id: number) => {
    // 실제 구현 시 DELETE /api/v1/saved-links/{id} 호출
    setLinks((prev) => prev.filter((link) => link.id !== id));
  }, []);

  const assignCategory = useCallback((ids: number[], categoryId: number) => {
    // 실제 구현 시 ids.forEach → PATCH /api/v1/saved-links/{id} { categoryId } 호출
    setLinks((prev) =>
      prev.map((link) =>
        ids.includes(link.id) ? { ...link, categoryId } : link
      )
    );
  }, []);

  return (
    <SavedLinksContext.Provider value={{ links, addLink, toggleBookmark, deleteLink, assignCategory }}>
      {children}
    </SavedLinksContext.Provider>
  );
}

export function useSavedLinks(): SavedLinksContextValue {
  const ctx = useContext(SavedLinksContext);
  if (!ctx) throw new Error('useSavedLinks must be used within SavedLinksProvider');
  return ctx;
}
