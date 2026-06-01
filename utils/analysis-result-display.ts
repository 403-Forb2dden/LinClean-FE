import type { AnalysisResponse, AnalysisVerdict } from '@/api/analyses';

const DEFAULT_CONTENT_ANALYSIS_ERROR_MESSAGE =
  '페이지 내용을 가져오지 못했어요. 사이트 접속이 제한되었거나 일시적으로 응답하지 않을 수 있습니다.';

export function getRouteParam(value: string | string[] | undefined) {
  return typeof value === 'string' ? value : undefined;
}

export function getAnalysisDisplayUrl(analysis: AnalysisResponse | null, fallbackUrl?: string) {
  return analysis?.originalUrl ?? fallbackUrl ?? '';
}

export function getAnalysisFinalUrl(analysis: AnalysisResponse | null, fallbackUrl: string) {
  return analysis?.finalUrl ?? fallbackUrl;
}

export function getAnalysisReasonText(
  analysis: AnalysisResponse | null,
  fallbackReason: string,
) {
  const summary = analysis?.summary?.trim();

  if (summary) {
    return summary;
  }

  const reasonMessages =
    analysis?.reasons
      ?.map((reason) => reason.message.trim())
      .filter((message) => message.length > 0) ?? [];

  if (reasonMessages.length > 0) {
    return reasonMessages.join('\n');
  }

  return fallbackReason;
}

export function getContentAnalysisErrorText(analysis: AnalysisResponse | null) {
  const contentAnalysisError = analysis?.contentAnalysisError?.trim();

  if (!contentAnalysisError) {
    return '';
  }

  if (isTechnicalErrorCode(contentAnalysisError)) {
    return DEFAULT_CONTENT_ANALYSIS_ERROR_MESSAGE;
  }

  return `페이지 내용을 가져오지 못했어요. ${contentAnalysisError}`;
}

export function getAnalysisResultPath(verdict: AnalysisVerdict) {
  switch (verdict) {
    case 'safe':
      return '/(tabs)/(home)/scan-result';
    case 'caution':
      return '/(tabs)/(home)/scan-result-caution';
    case 'danger':
      return '/(tabs)/(home)/scan-result-block';
  }
}

export function getSiteName(url: string) {
  try {
    return new URL(url).hostname;
  } catch {
    return '정보 없음';
  }
}

function isTechnicalErrorCode(value: string) {
  return /^[A-Z0-9_]+$/.test(value) || /^[a-z0-9_]+$/.test(value);
}
