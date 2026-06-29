import { useAuth } from '@clerk/expo';
import { useCallback, useEffect, useRef, useState } from 'react';

import { fetchAnalysis, type AnalysisResponse } from '@/api/analyses';
import { ApiError } from '@/api/api-client';
import { useAnalysisResultCache } from '@/context/analysis-result-cache-context';

const LOGIN_REQUIRED_MESSAGE =
  '로그인 상태를 확인할 수 없습니다. 다시 로그인한 뒤 시도해주세요.';

export function useAnalysisResult(analysisId?: string) {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const { getAnalysisResult, setAnalysisResult } = useAnalysisResultCache();
  const cachedAnalysis = getAnalysisResult(analysisId);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(cachedAnalysis);
  const [isLoading, setIsLoading] = useState(Boolean(analysisId && !cachedAnalysis));
  const [errorMessage, setErrorMessage] = useState('');
  const getTokenRef = useRef(getToken);

  useEffect(() => {
    getTokenRef.current = getToken;
  }, [getToken]);

  const loadAnalysis = useCallback(
    async (signal?: AbortSignal) => {
      if (!analysisId) {
        setAnalysis(null);
        setIsLoading(false);
        setErrorMessage('');
        return;
      }

      const nextCachedAnalysis = getAnalysisResult(analysisId);

      if (nextCachedAnalysis) {
        setAnalysis(nextCachedAnalysis);
        setIsLoading(false);
        setErrorMessage('');
        return;
      }

      if (!isLoaded) {
        return;
      }

      if (!isSignedIn) {
        setAnalysis(null);
        setIsLoading(false);
        setErrorMessage(LOGIN_REQUIRED_MESSAGE);
        return;
      }

      setAnalysis(null);
      setIsLoading(true);
      setErrorMessage('');

      try {
        const nextAnalysis = await fetchAnalysis(
          () => getTokenRef.current(),
          analysisId,
          { signal },
        );

        if (signal?.aborted) {
          return;
        }

        setAnalysis(nextAnalysis);
        setAnalysisResult(nextAnalysis);
      } catch (error) {
        if (signal?.aborted) {
          return;
        }

        if (isAbortError(error)) {
          return;
        }

        setErrorMessage(getAnalysisResultErrorMessage(error));
      } finally {
        if (!signal?.aborted) {
          setIsLoading(false);
        }
      }
    },
    [analysisId, getAnalysisResult, isLoaded, isSignedIn, setAnalysisResult],
  );

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (!analysisId) {
      setAnalysis(null);
      setIsLoading(false);
      setErrorMessage('');
      return;
    }

    if (cachedAnalysis) {
      setAnalysis(cachedAnalysis);
      setIsLoading(false);
      setErrorMessage('');
      return;
    }

    const abortController = new AbortController();

    void loadAnalysis(abortController.signal);

    return () => abortController.abort();
  }, [analysisId, cachedAnalysis, isLoaded, loadAnalysis]);

  return {
    analysis,
    isLoading,
    errorMessage,
    refetch: loadAnalysis,
  };
}

function getAnalysisResultErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 401 || error.status === 403) {
      return LOGIN_REQUIRED_MESSAGE;
    }

    return error.message || '분석 결과를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.';
  }

  if (error instanceof Error) {
    if (error.message === 'Missing Clerk session token') {
      return LOGIN_REQUIRED_MESSAGE;
    }

    if (error.message) {
      return error.message;
    }
  }

  return '분석 결과를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.';
}

function isAbortError(error: unknown) {
  return typeof error === 'object' && error !== null && 'name' in error && error.name === 'AbortError';
}
