import { publicApiRequest } from '@/api/api-client';

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

export async function fetchTerms(type: TermsType, signal?: AbortSignal): Promise<TermsResponse> {
  const terms = await publicApiRequest<TermsResponse>(`/api/v1/terms/${type}`, {
    method: 'GET',
    signal,
  });

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
