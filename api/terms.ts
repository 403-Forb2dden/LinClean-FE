import { Platform } from 'react-native';

const DEFAULT_API_BASE_URL =
  Platform.select({
    android: 'http://10.0.2.2:8080',
    default: 'http://localhost:8080',
  }) ?? 'http://localhost:8080';

const apiBaseUrl =
  process.env.EXPO_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ?? DEFAULT_API_BASE_URL;

export type TermsType = 'terms_of_service' | 'privacy_policy' | 'service_guide';
export type ContentFormat = 'markdown' | 'html' | 'plain_text';

const CONTENT_FORMATS: readonly ContentFormat[] = ['markdown', 'html', 'plain_text'];

export interface TermsResponse {
  type: TermsType;
  title: string;
  content: string;
  contentFormat: ContentFormat;
  effectiveAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  data: T;
}

interface ApiErrorResponse {
  code?: string;
  message?: string;
}

export async function fetchTerms(type: TermsType, signal?: AbortSignal): Promise<TermsResponse> {
  const response = await fetch(`${apiBaseUrl}/api/v1/terms/${type}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
    signal,
  });

  if (!response.ok) {
    let errorMessage = '약관 정보를 불러오지 못했습니다.';

    try {
      const error = (await response.json()) as ApiErrorResponse;
      errorMessage = error.message ?? errorMessage;
    } catch {
      // JSON 응답이 아닌 경우 기본 안내 문구를 사용합니다.
    }

    throw new Error(errorMessage);
  }

  const body = (await response.json()) as ApiResponse<TermsResponse> | TermsResponse;
  const terms = 'data' in body ? body.data : body;

  if (!terms?.title || !terms.content) {
    throw new Error('약관 정보를 불러오지 못했습니다.');
  }

  if (!isContentFormat(terms.contentFormat)) {
    throw new Error('지원하지 않는 약관 형식입니다.');
  }

  return terms;
}

function isContentFormat(value: unknown): value is ContentFormat {
  return typeof value === 'string' && CONTENT_FORMATS.includes(value as ContentFormat);
}
