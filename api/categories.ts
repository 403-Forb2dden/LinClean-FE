import {
  authenticatedApiRequest,
  type ApiRequestOptions,
  type ClerkTokenGetter,
} from '@/api/api-client';

export type CategoryResponse = {
  id: number;
  name: string;
  displayOrder: number;
  linkCount: number;
  createdAt: string;
};

export type CategoryListResponse = {
  items: CategoryResponse[];
};

export type CategoryCreateRequest = {
  name: string;
  linkIds?: number[];
};

export type CategoryRenameResponse = {
  id: number;
  name: string;
};

type CategoryRequestOptions = Pick<ApiRequestOptions, 'signal'>;

export function createCategory(
  getToken: ClerkTokenGetter,
  body: CategoryCreateRequest,
  options: CategoryRequestOptions = {},
) {
  return authenticatedApiRequest<CategoryResponse>(getToken, '/api/v1/categories', {
    ...options,
    method: 'POST',
    body,
  });
}

export function fetchCategories(
  getToken: ClerkTokenGetter,
  options: CategoryRequestOptions = {},
) {
  return authenticatedApiRequest<CategoryListResponse>(
    getToken,
    '/api/v1/categories',
    options,
  );
}

export function renameCategory(getToken: ClerkTokenGetter, id: number, name: string) {
  return authenticatedApiRequest<CategoryRenameResponse>(
    getToken,
    `/api/v1/categories/${encodeURIComponent(String(id))}`,
    {
      method: 'PATCH',
      body: { name },
    },
  );
}

export function deleteCategory(getToken: ClerkTokenGetter, id: number) {
  return authenticatedApiRequest<void>(
    getToken,
    `/api/v1/categories/${encodeURIComponent(String(id))}`,
    { method: 'DELETE' },
  );
}
