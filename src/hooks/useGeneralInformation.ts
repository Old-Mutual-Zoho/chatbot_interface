import { useState, useCallback } from 'react';
import { getGeneralInformation } from '../services/api';
import type { GeneralInformation } from '../services/api';

const GENERAL_INFO_PRODUCT_KEY_MAP: Record<string, string> = {
  // Display labels / common UI values
  'Personal Accident': 'personal_accident',
  'Serenicare': 'serenicare',
  'Motor Private Insurance': 'motor_private',
  'Motor Private': 'motor_private',
  'Travel Sure Plus': 'travel',
  'Travel Insurance': 'travel',
  'Travel': 'travel',

  // Backend keys / normalized
  personal_accident: 'personal_accident',
  serenicare: 'serenicare',
  motor_private: 'motor_private',
  travel: 'travel',
};

const GENERAL_INFO_ALLOWED_KEYS = new Set([
  'motor_private',
  'serenicare',
  'personal_accident',
  'travel',
]);

const toGeneralInfoProductKey = (product: string): string | null => {
  const normalized = product.replace(/\s+/g, '_').toLowerCase().trim();
  const mapped =
    GENERAL_INFO_PRODUCT_KEY_MAP[product] ??
    GENERAL_INFO_PRODUCT_KEY_MAP[normalized] ??
    normalized;

  return GENERAL_INFO_ALLOWED_KEYS.has(mapped) ? mapped : null;
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
    if (!productKey) {
      setError('Unsupported product key for General Information.');
      return { data: null, error: 'Unsupported product key for General Information.' };
    }

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
