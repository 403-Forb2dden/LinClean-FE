import { createContext, type ReactNode, useCallback, useContext, useRef } from 'react';

import type { AnalysisResponse } from '@/api/analyses';

type AnalysisResultCacheContextValue = {
  getAnalysisResult: (analysisId?: string | null) => AnalysisResponse | null;
  setAnalysisResult: (analysis: AnalysisResponse) => void;
  clearAnalysisResult: (analysisId: string) => void;
};

const AnalysisResultCacheContext = createContext<AnalysisResultCacheContextValue | null>(null);

export function AnalysisResultCacheProvider({ children }: { children: ReactNode }) {
  const cacheRef = useRef(new Map<string, AnalysisResponse>());

  const getAnalysisResult = useCallback((analysisId?: string | null) => {
    if (!analysisId) {
      return null;
    }

    return cacheRef.current.get(analysisId) ?? null;
  }, []);

  const setAnalysisResult = useCallback((analysis: AnalysisResponse) => {
    cacheRef.current.set(analysis.analysisId, analysis);
  }, []);

  const clearAnalysisResult = useCallback((analysisId: string) => {
    cacheRef.current.delete(analysisId);
  }, []);

  return (
    <AnalysisResultCacheContext.Provider
      value={{ getAnalysisResult, setAnalysisResult, clearAnalysisResult }}
    >
      {children}
    </AnalysisResultCacheContext.Provider>
  );
}

export function useAnalysisResultCache() {
  const context = useContext(AnalysisResultCacheContext);

  if (!context) {
    throw new Error('useAnalysisResultCache must be used within AnalysisResultCacheProvider');
  }

  return context;
}
