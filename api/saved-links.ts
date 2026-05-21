import {
  authenticatedApiRequest,
  type ApiRequestOptions,
  type ClerkTokenGetter,
} from '@/api/api-client';

export type SavedLinkVerdict = 'safe' | 'caution' | 'danger';

export type SavedLinkResponse = {
  id: number;
  analysisId: string;
  categoryId: number | null;
  originalUrl: string;
  finalUrl: string | null;
  title: string;
  description?: string | null;
  verdict: SavedLinkVerdict;
  isBookmarked: boolean;
  createdAt: string;
};

export type SavedLinkListResponse = {
  items: SavedLinkResponse[];
  hasNext: boolean;
  nextCursor: string | null;
};

export type SavedLinkCreateRequest = {
  analysisId: string;
  categoryId: number | null;
  title: string;
  description?: string | null;
};

export type SavedLinkListQuery = {
  categoryId?: number | null;
  bookmarked?: boolean;
  cursor?: string | null;
  size?: number;
};

export type BookmarkToggleResponse = {
  id: number;
  isBookmarked: boolean;
};

export type CategoryUpdateResponse = {
  id: number;
  categoryId: number | null;
};

export type SavedLinkTitleUpdateResponse = {
  id: number;
  title: string;
};

type SavedLinkRequestOptions = Pick<ApiRequestOptions, 'signal'>;

export function createSavedLink(
  getToken: ClerkTokenGetter,
  body: SavedLinkCreateRequest,
  options: SavedLinkRequestOptions = {},
) {
  return authenticatedApiRequest<SavedLinkResponse>(getToken, '/api/v1/saved-links', {
    ...options,
    method: 'POST',
    body,
  });
}

export function fetchSavedLinks(
  getToken: ClerkTokenGetter,
  query: SavedLinkListQuery = {},
  options: SavedLinkRequestOptions = {},
) {
  return authenticatedApiRequest<SavedLinkListResponse>(
    getToken,
    `/api/v1/saved-links${buildSavedLinkQuery(query)}`,
    options,
  );
}

export function deleteSavedLink(getToken: ClerkTokenGetter, id: number) {
  return authenticatedApiRequest<void>(
    getToken,
    `/api/v1/saved-links/${encodeURIComponent(String(id))}`,
    { method: 'DELETE' },
  );
}

export function toggleSavedLinkBookmark(getToken: ClerkTokenGetter, id: number) {
  return authenticatedApiRequest<BookmarkToggleResponse>(
    getToken,
    `/api/v1/saved-links/${encodeURIComponent(String(id))}/bookmark`,
    { method: 'PATCH' },
  );
}

export function updateSavedLinkCategory(
  getToken: ClerkTokenGetter,
  id: number,
  categoryId: number | null,
) {
  return authenticatedApiRequest<CategoryUpdateResponse>(
    getToken,
    `/api/v1/saved-links/${encodeURIComponent(String(id))}/category`,
    {
      method: 'PATCH',
      body: { categoryId },
    },
  );
}

export function updateSavedLinkTitle(getToken: ClerkTokenGetter, id: number, title: string) {
  return authenticatedApiRequest<SavedLinkTitleUpdateResponse>(
    getToken,
    `/api/v1/saved-links/${encodeURIComponent(String(id))}/title`,
    {
      method: 'PATCH',
      body: { title },
    },
  );
}

function buildSavedLinkQuery(query: SavedLinkListQuery) {
  const params = new URLSearchParams();

  if (query.categoryId != null) {
    params.set('categoryId', String(query.categoryId));
  }

  if (query.bookmarked != null) {
    params.set('bookmarked', String(query.bookmarked));
  }

  if (query.cursor) {
    params.set('cursor', query.cursor);
  }

  if (query.size != null) {
    params.set('size', String(query.size));
  }

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}
