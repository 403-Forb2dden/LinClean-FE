import type { AnalysisResponse } from '@/api/analyses';

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

export function getSiteName(url: string) {
  try {
    return new URL(url).hostname;
  } catch {
    return '정보 없음';
  }
}
