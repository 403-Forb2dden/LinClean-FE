import {
  ApiError,
  authenticatedApiRequest,
  type ApiRequestOptions,
  type ClerkTokenGetter,
} from '@/api/api-client';

const NOTICE_MAX_ATTEMPTS = 3;
const NOTICE_RETRY_DELAY_MS = 500;

export interface NoticeListItemResponse {
  id: number;
  title: string;
  isPinned: boolean;
  createdAt: string;
}

export interface NoticeCursorPageResponse {
  items: NoticeListItemResponse[];
  nextCursor: string | null;
  hasNext: boolean;
}

export interface NoticeDetailResponse {
  id: number;
  title: string;
  content: string;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FetchNoticesOptions extends Pick<ApiRequestOptions, 'signal'> {
  cursor?: string | null;
  size?: number;
}

type NoticeRequestOptions = Pick<ApiRequestOptions, 'signal'>;

export function fetchNotices(
  getToken: ClerkTokenGetter,
  { cursor, size = 20, signal }: FetchNoticesOptions = {},
) {
  const params = new URLSearchParams({ size: String(size) });
  const abortSignal = signal ?? undefined;

  if (cursor) {
    params.set('cursor', cursor);
  }

  return requestWithRetry(() =>
    authenticatedApiRequest<NoticeCursorPageResponse>(
      getToken,
      `/api/v1/notices?${params.toString()}`,
      { method: 'GET', signal: abortSignal },
    ),
    abortSignal,
  );
}

export function fetchNoticeDetail(
  getToken: ClerkTokenGetter,
  noticeId: number,
  options: NoticeRequestOptions = {},
) {
  const signal = options.signal ?? undefined;

  return requestWithRetry(() =>
    authenticatedApiRequest<NoticeDetailResponse>(
      getToken,
      `/api/v1/notices/${encodeURIComponent(String(noticeId))}`,
      { method: 'GET', ...options, signal },
    ),
    signal,
  );
}

async function requestWithRetry<T>(
  request: () => Promise<T>,
  signal?: AbortSignal,
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= NOTICE_MAX_ATTEMPTS; attempt += 1) {
    try {
      return await request();
    } catch (error) {
      lastError = error;

      if (signal?.aborted || !shouldRetryNoticeRequest(error) || attempt === NOTICE_MAX_ATTEMPTS) {
        throw error;
      }

      await delay(NOTICE_RETRY_DELAY_MS * attempt, signal);
    }
  }

  throw lastError;
}

function shouldRetryNoticeRequest(error: unknown) {
  if (isAbortError(error)) {
    return false;
  }

  if (error instanceof ApiError) {
    return error.status === 408 || error.status === 429 || error.status >= 500;
  }

  return error instanceof TypeError;
}

function delay(ms: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const timeoutId = setTimeout(resolve, ms);

    if (!signal) {
      return;
    }

    signal.addEventListener(
      'abort',
      () => {
        clearTimeout(timeoutId);
        reject(new DOMException('Aborted', 'AbortError'));
      },
      { once: true },
    );
  });
}

function isAbortError(error: unknown) {
  return typeof error === 'object' && error !== null && 'name' in error && error.name === 'AbortError';
}
