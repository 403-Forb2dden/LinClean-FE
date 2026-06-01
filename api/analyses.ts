import {
  authenticatedApiRequest,
  publicApiRequest,
  type ApiRequestOptions,
  type ClerkTokenGetter,
} from '@/api/api-client';

export type AnalysisStatus = 'queued' | 'succeeded' | 'failed';
export type AnalysisVerdict = 'safe' | 'caution' | 'danger';

export type AnalysisReason = {
  code: string;
  stage: number;
  weight: number;
  message: string;
};

export type AnalysisResponse = {
  analysisId: string;
  status: AnalysisStatus;
  originalUrl?: string;
  finalUrl?: string;
  verdict?: AnalysisVerdict;
  score?: number;
  summary?: string;
  reasons?: AnalysisReason[];
  analyzedAt?: string;
  elapsedMs?: number;
  errorCode?: string;
  errorStage?: number;
  errorMessage?: string;
  contentAnalysisError?: string;
};

export type VerdictStatisticsResponse = Record<AnalysisVerdict, number>;

type AnalysisRequestOptions = Pick<ApiRequestOptions, 'signal'>;

export function requestAnalysis(
  getToken: ClerkTokenGetter,
  url: string,
  options: AnalysisRequestOptions = {},
) {
  return authenticatedApiRequest<AnalysisResponse>(getToken, '/api/v1/analyses', {
    ...options,
    method: 'POST',
    body: { url },
  });
}

export function fetchAnalysis(
  getToken: ClerkTokenGetter,
  analysisId: string,
  options: AnalysisRequestOptions = {},
) {
  return authenticatedApiRequest<AnalysisResponse>(
    getToken,
    `/api/v1/analyses/${encodeURIComponent(analysisId)}`,
    options,
  );
}

export function fetchVerdictStatistics(options: AnalysisRequestOptions = {}) {
  return publicApiRequest<VerdictStatisticsResponse>(
    '/api/v1/analyses/statistics',
    options,
  );
}
