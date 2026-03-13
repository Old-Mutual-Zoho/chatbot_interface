
import { useState, useCallback } from 'react';
import { getGeneralInformation } from '../services/api';
import type { GeneralInformation } from '../services/api';

// Universal normalization: lowercase, trim, spaces to hyphens
const toGeneralInfoProductKey = (product: string): string => {
  return product.replace(/\s+/g, '-').toLowerCase().trim();
};


export function useGeneralInformation(product: string | null) {
  const [info, setInfo] = useState<GeneralInformation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetches general info for the currently-selected product.
  // NOTE: we accept an optional override because click-time values are often the freshest.
  const fetchInfo = useCallback(async (productOverride?: string | null) => {
    const effectiveProduct = productOverride ?? product;
    if (!effectiveProduct) {
      return { data: null as GeneralInformation | null, error: null as string | null };
    }

    const productKey = toGeneralInfoProductKey(effectiveProduct);
    setLoading(true);
    setError(null);
    try {
      const data = await getGeneralInformation(productKey);
      setInfo(data);
      return { data, error: null };
    } catch (e) {
      const err = e as { response?: { data?: { detail?: string } }, message?: string };
      const message = err?.response?.data?.detail || err?.message || 'Failed to fetch general information';
      setError(message);
      return { data: null, error: message };
    } finally {
      setLoading(false);
    }
  }, [product]);

  return { info, loading, error, fetchInfo };
}
