import { sendChatMessage, startGuidedQuote } from '../services/api';
import React, { useState, useEffect } from "react";
import type { GuidedStepResponse } from '../services/api';
import { GuidedStepRenderer } from '../components/form-components/GuidedStepRenderer';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const getProp = (value: unknown, key: string): unknown =>
  isRecord(value) ? value[key] : undefined;

const extractGuidedStep = (res: unknown): GuidedStepResponse | null => {
  const responseObj = getProp(res, 'response');

  const candidatePaths: unknown[] = [
    getProp(responseObj, 'response'),
    responseObj,
  ];

  for (const candidate of candidatePaths) {
    if (!isRecord(candidate)) continue;
    const typeValue = candidate['type'];
    if (typeof typeValue === 'string') {
      return candidate as GuidedStepResponse;
    }
  }

  return null;
};

const extractIsComplete = (res: unknown): boolean => {
  const responseObj = getProp(res, 'response');
  const completeValue = getProp(responseObj, 'complete') ?? getProp(res, 'complete');
  return completeValue === true;
};

interface QuoteFormScreenProps {
  selectedProduct?: string | null;
  userId?: string | null;
  sessionId?: string | null;
  onFormSubmitted?: () => void;
  embedded?: boolean;
}

const QuoteFormScreen: React.FC<QuoteFormScreenProps> = ({ selectedProduct, userId, sessionId, onFormSubmitted, embedded = false }) => {
  // Normalize product name for Motor Private
  const isMotorPrivate =
    selectedProduct === 'Motor Private Insurance' ||
    selectedProduct === 'Motor Private' ||
    selectedProduct === 'motor_private';

  const normalizedSelectedProduct = selectedProduct
    ?.toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();

  const isTravelSurePlus =
    normalizedSelectedProduct === 'travelsureplus' ||
    normalizedSelectedProduct === 'travelplus' ||
    normalizedSelectedProduct === 'travelinsurance';
    

  // --- Backend-driven Personal Accident guided flow state ---
  const [paSessionId, setPaSessionId] = useState<string | null>(sessionId ?? null);
  const [paStepPayload, setPaStepPayload] = useState<GuidedStepResponse | null>(null);
  const [paLoading, setPaLoading] = useState(false);
  const [paComplete, setPaComplete] = useState(false);
  const [paFieldErrors, setPaFieldErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<Record<string, unknown>>({});

  // Start or resume backend-driven PA flow
  useEffect(() => {
    if (selectedProduct !== 'Personal Accident' || !userId) return;
    setPaLoading(true);
    setPaComplete(false);
    setPaFieldErrors({});
    setFormData({});
    (async () => {
      try {
        // Try to start or resume the guided quote flow
        const response = await startGuidedQuote({
          user_id: userId,
          flow_name: 'personal_accident',
          session_id: paSessionId ?? undefined,
          initial_data: undefined
        });
        if (response?.session_id) setPaSessionId(response.session_id);
        setPaStepPayload(response?.response ?? null);
      } catch {
        setPaStepPayload(null);
      } finally {
        setPaLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProduct, userId]);

  // Input change handler for GuidedStepRenderer
  const handlePaChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    setPaFieldErrors(prev => {
      if (!prev[name]) return prev;
      const copy = { ...prev };
      delete copy[name];
      return copy;
    });
  };

  // Step submission handler for GuidedStepRenderer
  const handlePaSubmit = async (payload: Record<string, unknown>) => {
    const sid = paSessionId ?? sessionId;
    if (!sid || !userId) return;
    setPaLoading(true);
    setPaFieldErrors({});
    try {
      const res = await sendChatMessage({
        session_id: sid,
        user_id: userId,
        form_data: payload
      });
      if (res?.session_id && res.session_id !== sid) setPaSessionId(res.session_id);
      if (res?.response?.complete) {
        setPaComplete(true);
        setPaStepPayload(null);
        onFormSubmitted?.();
        return;
      }
      const nextStep = res?.response?.response ?? null;
      if (!nextStep) {
        setPaComplete(true);
        setPaStepPayload(null);
        onFormSubmitted?.();
        return;
      }
      setPaStepPayload(nextStep);
    } catch {
      // Optionally handle field errors from backend here
      // setPaFieldErrors(e?.fieldErrors || {});
    } finally {
      setPaLoading(false);
    }
  };


  // --- Backend-driven Motor Private guided flow state ---
  const [motorSessionId, setMotorSessionId] = useState<string | null>(sessionId ?? null);
  const [motorStepPayload, setMotorStepPayload] = useState<GuidedStepResponse | null>(null);
  const [motorLoading, setMotorLoading] = useState(false);
  const [motorComplete, setMotorComplete] = useState(false);
  const [motorFieldErrors, setMotorFieldErrors] = useState<Record<string, string>>({});
  const [motorFormData, setMotorFormData] = useState<Record<string, unknown>>({});

  // Start or resume backend-driven Motor Private flow
  useEffect(() => {
    if (!isMotorPrivate || !userId) return;
    setMotorLoading(true);
    setMotorComplete(false);
    setMotorFieldErrors({});
    setMotorFormData({});
    (async () => {
      try {
        const response = await startGuidedQuote({
          user_id: userId,
          flow_name: 'motor_private',
          session_id: motorSessionId ?? undefined,
          initial_data: undefined
        });
        if (response?.session_id) setMotorSessionId(response.session_id);
        if (!response || !response.response || (typeof response.response === 'string' && response.response === 'Not Found')) {
          setMotorStepPayload(null);
          setMotorComplete(true);
        } else {
          setMotorStepPayload(response.response);
        }
      } catch {
        setMotorStepPayload(null);
        setMotorComplete(true);
      } finally {
        setMotorLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProduct, userId]);

  // Input change handler for GuidedStepRenderer (Motor Private)
  const handleMotorChange = (name: string, value: string) => {
    setMotorFormData(prev => ({ ...prev, [name]: value }));
    setMotorFieldErrors(prev => {
      if (!prev[name]) return prev;
      const copy = { ...prev };
      delete copy[name];
      return copy;
    });
  };

  // Step submission handler for GuidedStepRenderer (Motor Private)
  const handleMotorSubmit = async (payload: Record<string, unknown>) => {
    const sid = motorSessionId ?? sessionId;
    if (!sid || !userId) return;
    setMotorLoading(true);
    setMotorFieldErrors({});
    try {
      const res = await sendChatMessage({
        session_id: sid,
        user_id: userId,
        form_data: payload
      });
      if (res?.session_id && res.session_id !== sid) setMotorSessionId(res.session_id);
      if (res?.response?.complete) {
        setMotorComplete(true);
        setMotorStepPayload(null);
        onFormSubmitted?.();
        return;
      }
      const nextStep = res?.response?.response ?? null;
      if (!nextStep) {
        setMotorComplete(true);
        setMotorStepPayload(null);
        onFormSubmitted?.();
        return;
      }
      setMotorStepPayload(nextStep);
    } catch {
      // Optionally handle field errors from backend here
      // setMotorFieldErrors(err?.fieldErrors || {});
    } finally {
      setMotorLoading(false);
    }
  };


  // --- Travel Insurance guided flow state (same architecture as Motor/PA) ---
  const [travelSessionId, setTravelSessionId] = useState<string | null>(sessionId ?? null);
  const [travelStepPayload, setTravelStepPayload] = useState<GuidedStepResponse | null>(null);
  const [travelLoading, setTravelLoading] = useState(false);
  const [travelComplete, setTravelComplete] = useState(false);
  const [travelFieldErrors, setTravelFieldErrors] = useState<Record<string, string>>({});
  const [travelFormData, setTravelFormData] = useState<Record<string, unknown>>({});

  // If a parent sessionId arrives later, seed travelSessionId once (same pattern as ChatScreen).
  useEffect(() => {
    if (!sessionId) return;
    setTravelSessionId((prev) => prev ?? sessionId);
  }, [sessionId]);

  // Start or resume Travel flow via /chat/start-guided (backend returns step payload)
  useEffect(() => {
    if (!isTravelSurePlus || !userId) return;
    if (travelLoading || travelComplete || travelStepPayload) return;
    setTravelLoading(true);
    setTravelComplete(false);
    setTravelFieldErrors({});
    setTravelFormData({});
    (async () => {
      try {
        const response = await startGuidedQuote({
          user_id: userId,
          flow_name: 'travel_insurance',
          session_id: travelSessionId ?? undefined,
          initial_data: undefined,
        });
        if (response?.session_id) setTravelSessionId(response.session_id);
        setTravelStepPayload(response?.response ?? null);
      } catch {
        setTravelStepPayload(null);
      } finally {
        setTravelLoading(false);
      }
    })();
  }, [isTravelSurePlus, userId, travelSessionId, travelLoading, travelComplete, travelStepPayload]);

  const handleTravelChange = (name: string, value: string) => {
    setTravelFormData(prev => ({ ...prev, [name]: value }));
    setTravelFieldErrors(prev => {
      if (!prev[name]) return prev;
      const copy = { ...prev };
      delete copy[name];
      return copy;
    });
  };

  const handleTravelSubmit = async (payload: Record<string, unknown>) => {
    const sid = travelSessionId ?? sessionId;
    if (!sid || !userId) return;
    setTravelLoading(true);
    setTravelFieldErrors({});
    try {
      const res = await sendChatMessage({
        session_id: sid,
        user_id: userId,
        form_data: payload,
      });

      if (res?.session_id && res.session_id !== sid) setTravelSessionId(res.session_id);

      const isComplete = extractIsComplete(res);
      if (isComplete) {
        setTravelComplete(true);
        setTravelStepPayload(null);
        onFormSubmitted?.();
        return;
      }

      const nextStep = extractGuidedStep(res);
      if (!nextStep) {
        setTravelComplete(true);
        setTravelStepPayload(null);
        onFormSubmitted?.();
        return;
      }

      setTravelStepPayload(nextStep);
    } catch {
      // Optionally handle field errors from backend here
      // setTravelFieldErrors(err?.fieldErrors || {});
    } finally {
      setTravelLoading(false);
    }
  };

  // Render logic for Personal Accident only (backend-driven)
  if (selectedProduct === 'Personal Accident') {
    if (paLoading) {
      return <div>Loading...</div>;
    }
    if (paComplete) {
      return (
        <div className="w-full rounded-2xl p-6 border border-gray-200 bg-white">
          <p className="text-gray-900 font-medium">Thank you! Your quote has been submitted.</p>
          <button
            type="button"
            onClick={() => {
              setFormData({});
              setPaStepPayload(null);
              setPaComplete(false);
              setPaFieldErrors({});
              setPaSessionId(sessionId ?? null);
            }}
            className="mt-4 px-4 py-2 rounded-lg border border-primary text-primary hover:bg-green-50"
          >
            Start over
          </button>
        </div>
      );
    }
    if (!paStepPayload) {
      // If not loading and no step, treat as complete (success)
      if (!paLoading) {
        return (
          <div className="w-full rounded-2xl p-6 border border-gray-200 bg-white">
            <p className="text-gray-900 font-medium">Thank you! Your quote has been submitted.</p>
            <button
              type="button"
              onClick={() => {
                setFormData({});
                setPaStepPayload(null);
                setPaComplete(false);
                setPaFieldErrors({});
                setPaSessionId(sessionId ?? null);
              }}
              className="mt-4 px-4 py-2 rounded-lg border border-primary text-primary hover:bg-green-50"
            >
              Start over
            </button>
          </div>
        );
      }
      return <div>Loading...</div>;
    }
    return (
      <GuidedStepRenderer
        step={paStepPayload}
        values={formData as Record<string, string>}
        errors={paFieldErrors}
        onChange={handlePaChange}
        onSubmit={handlePaSubmit}
        loading={paLoading}
      />
    );
  }
  // Render logic for Motor Private only (backend-driven)
  if (isMotorPrivate) {
    if (motorLoading) {
      return <div>Loading...</div>;
    }
    if (motorComplete) {
      return (
        <div className="w-full rounded-2xl p-6 border border-gray-200 bg-white">
          <p className="text-gray-900 font-medium">Thank you! Your quote has been submitted.</p>
          <button
            type="button"
            onClick={() => {
              setMotorFormData({});
              setMotorStepPayload(null);
              setMotorComplete(false);
              setMotorFieldErrors({});
              setMotorSessionId(sessionId ?? null);
            }}
            className="mt-4 px-4 py-2 rounded-lg border border-primary text-primary hover:bg-green-50"
          >
            Start over
          </button>
        </div>
      );
    }
    if (!motorStepPayload) {
      // If not loading and no step, treat as complete (success)
      if (!motorLoading) {
        return (
          <div className="w-full rounded-2xl p-6 border border-gray-200 bg-white">
            <p className="text-gray-900 font-medium">Thank you! Your quote has been submitted.</p>
            <button
              type="button"
              onClick={() => {
                setMotorFormData({});
                setMotorStepPayload(null);
                setMotorComplete(false);
                setMotorFieldErrors({});
                setMotorSessionId(sessionId ?? null);
              }}
              className="mt-4 px-4 py-2 rounded-lg border border-primary text-primary hover:bg-green-50"
            >
              Start over
            </button>
          </div>
        );
      }
      return <div>Loading...</div>;
    }
    return (
      <GuidedStepRenderer
        step={motorStepPayload}
        values={motorFormData as Record<string, string>}
        errors={motorFieldErrors}
        onChange={handleMotorChange}
        onSubmit={handleMotorSubmit}
        loading={motorLoading}
      />
    );
  }

  // Render logic for TravelPlus only (backend-driven)
  if (isTravelSurePlus) {
    if (travelComplete) {
      return null;
    }
    if (travelLoading) {
      return <div>Loading...</div>;
    }
    if (!travelStepPayload) return <div>Loading...</div>;
    return (
      <GuidedStepRenderer
        step={travelStepPayload}
        values={travelFormData as Record<string, string>}
        errors={travelFieldErrors}
        onChange={handleTravelChange}
        onSubmit={handleTravelSubmit}
        loading={travelLoading}
      />
    );
  }


  // Show prompt if no product is selected
  if (!selectedProduct) {
    return (
      <div className={embedded ? "w-full" : "flex flex-col h-full bg-white"}>
        <div className={embedded ? "px-3 sm:px-4 py-3" : "p-4 mt-12"}>
          <p className="text-center text-gray-600 mb-1 text-sm">
            Please select a product to continue.
          </p>
        </div>
      </div>
    );
  }  
  return null;
};

export default QuoteFormScreen;
