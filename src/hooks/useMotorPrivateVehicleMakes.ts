import { useState, useCallback } from 'react';
import { getMotorPrivateVehicleMakes } from '../services/api';
import type { VehicleMakeOption } from '../services/api';

export function useMotorPrivateVehicleMakes() {
  const [options, setOptions] = useState<VehicleMakeOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVehicleMakes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const opts = await getMotorPrivateVehicleMakes();
      setOptions(opts);
    } catch (e) {
      const err = e as { response?: { data?: { detail?: string } }, message?: string };
      setError(err?.response?.data?.detail || err?.message || 'Failed to fetch vehicle makes');
    } finally {
      setLoading(false);
    }
  }, []);

  return { options, loading, error, fetchVehicleMakes };
}
