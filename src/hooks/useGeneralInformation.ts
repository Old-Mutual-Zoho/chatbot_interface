import { useState, useCallback } from 'react';
import { getGeneralInformation } from '../services/api';
import type { GeneralInformation } from '../services/api';

export function useGeneralInformation(sessionId: string | null, product: string | null) {
  const [info, setInfo] = useState<GeneralInformation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInfo = useCallback(async () => {
    if (!sessionId || !product) return null;
    setLoading(true);
    setError(null);
    try {
      const data = await getGeneralInformation(sessionId, product);
      setInfo(data);
      return data;
    } catch (e) {
      const err = e as { response?: { data?: { detail?: string } }, message?: string };
      setError(err?.response?.data?.detail || err?.message || 'Failed to fetch general information');
      return null;
    } finally {
      setLoading(false);
    }
  }, [sessionId, product]);

  return { info, loading, error, fetchInfo };
}
