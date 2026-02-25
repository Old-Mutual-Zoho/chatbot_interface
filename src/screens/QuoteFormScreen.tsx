import { sendChatMessage, startGuidedQuote } from '../services/api';
import React, { useState, useEffect } from "react";
import type { GuidedStepResponse } from '../services/api';
import { GuidedStepRenderer } from '../components/form-components/GuidedStepRenderer';
import { LoadingBubble } from "../components/chatbot/messages/LoadingBubble";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const getProp = (value: unknown, key: string): unknown =>
  isRecord(value) ? value[key] : undefined;

const extractGuidedStep = (res: unknown): GuidedStepResponse | null => {
  // Backends sometimes nest the step as `response.response` (or deeper).
  // Walk down a few `response` layers until we find an object with a `type`.
  const tryUnwrap = (value: unknown): GuidedStepResponse | null => {
    let current: unknown = value;
    for (let i = 0; i < 6; i += 1) {
      if (!isRecord(current)) return null;
      const typeValue = current['type'];
      if (typeof typeValue === 'string') return current as GuidedStepResponse;
      current = current['response'];
    }
    return null;
  };

  return (
    tryUnwrap(getProp(res, 'response')) ||
    tryUnwrap(res)
  );
};

const extractIsComplete = (res: unknown): boolean => {
  const responseObj = getProp(res, 'response');
  const completeValue = getProp(responseObj, 'complete') ?? getProp(res, 'complete');
  return completeValue === true;
};

const isEmptyValue = (value: unknown): boolean => {
  if (value == null) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  return false;
};

const buildFormPayloadIfComplete = (
  step: GuidedStepResponse,
  data: Record<string, unknown>
): Record<string, unknown> | null => {
  if (step.type !== 'form') return null;

  const payload: Record<string, unknown> = {};
  for (const f of step.fields ?? []) {
    const raw = data[f.name];
    if (f.required && isEmptyValue(raw)) {
      return null;
    }

    const t = String(f.type ?? '').toLowerCase();
    const rawStr = raw == null ? '' : String(raw);

    if (t === 'number' || t === 'integer') {
      const trimmed = rawStr.trim();
      if (!trimmed) {
        payload[f.name] = '';
      } else {
        const n = t === 'integer' ? Number.parseInt(trimmed, 10) : Number(trimmed);
        payload[f.name] = Number.isFinite(n) ? n : trimmed;
      }
      continue;
    }

    if (t === 'checkbox-group') {
      const trimmed = rawStr.trim();
      payload[f.name] = trimmed
        ? trimmed.split(',').map((s) => s.trim()).filter(Boolean)
        : [];
      continue;
    }

    payload[f.name] = raw;
  }

  return payload;
};

const resolveNextStepWithAutoAdvance = async (
  initialRes: unknown,
  sendNext: (payload: Record<string, unknown>) => Promise<unknown>,
  data: Record<string, unknown>
): Promise<{ complete: boolean; step: GuidedStepResponse | null } | null> => {
  let res: unknown = initialRes;
  let isComplete = extractIsComplete(res);
  if (isComplete) return { complete: true, step: null };

  let nextStep: GuidedStepResponse | null = extractGuidedStep(res);

  // If backend asks again for a form we already have filled, auto-submit it.
  // Guarded to avoid infinite loops.
  for (let attempts = 0; attempts < 2; attempts += 1) {
    if (!nextStep || nextStep.type !== 'form') break;
    const autoPayload = buildFormPayloadIfComplete(nextStep, data);
    if (!autoPayload) break;

    res = await sendNext(autoPayload);
    isComplete = extractIsComplete(res);
    if (isComplete) return { complete: true, step: null };
    nextStep = extractGuidedStep(res);
  }

  return { complete: false, step: nextStep };
};

const extractErrorDetail = (err: unknown): string | null => {
  if (!isRecord(err)) return null;
  const response = err['response'];
  if (isRecord(response)) {
    const data = response['data'];
    if (isRecord(data) && typeof data['detail'] === 'string') return data['detail'];
    if (typeof response['statusText'] === 'string') return response['statusText'];
  }
  if (typeof err['message'] === 'string') return err['message'];
  return null;
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

  const isPersonalAccident = normalizedSelectedProduct === 'personalaccident';

  const isSerenicare = normalizedSelectedProduct === 'serenicare';

  const isTravelSurePlus =
    normalizedSelectedProduct === 'travelsureplus' ||
    normalizedSelectedProduct === 'travelplus' ||
    normalizedSelectedProduct === 'travelinsurance' ||
    // Some UIs send a generic "Travel" label/key.
    normalizedSelectedProduct === 'travel';
    

  // --- Backend-driven Personal Accident guided flow state ---
  const [paSessionId, setPaSessionId] = useState<string | null>(sessionId ?? null);
  const [paStepPayload, setPaStepPayload] = useState<GuidedStepResponse | null>(null);
  const [paLoading, setPaLoading] = useState(false);
  const [paComplete, setPaComplete] = useState(false);
  const [paFieldErrors, setPaFieldErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<Record<string, unknown>>({});

  // --- Backend-driven Serenicare guided flow state ---
  // Serenicare must not depend on (or reuse) the parent chat session.
  // Let the backend create a dedicated guided session for this flow.
  const [serenicareSessionId, setSerenicareSessionId] = useState<string | null>(null);
  const [serenicareStepPayload, setSerenicareStepPayload] = useState<GuidedStepResponse | null>(null);
  const [serenicareLoading, setSerenicareLoading] = useState(false);
  const [serenicareComplete, setSerenicareComplete] = useState(false);
  const [serenicareFieldErrors, setSerenicareFieldErrors] = useState<Record<string, string>>({});
  const [serenicareFormData, setSerenicareFormData] = useState<Record<string, unknown>>({});
  const [serenicareError, setSerenicareError] = useState<string | null>(null);

  const shouldConfirmBeforeSubmit = (step: GuidedStepResponse | null): boolean => {
    if (!step || step.type !== 'form') return false;
    const fields = step.fields ?? [];
    return fields.some((f) => {
      const name = String(f.name ?? '').toLowerCase();
      const label = String(f.label ?? '').toLowerCase();
      // Detect the “final field” step (e.g. Cover Limit Amount) without hard-coding product names.
      return (
        name.includes('coverlimit') ||
        name.includes('cover_limit') ||
        (label.includes('cover') && label.includes('limit'))
      );
    });
  };

  // Start or resume backend-driven PA flow
  useEffect(() => {
    if (!isPersonalAccident || !userId) return;
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

  // Start or resume backend-driven Serenicare flow
  useEffect(() => {
    if (!isSerenicare || !userId) return;
    setSerenicareLoading(true);
    setSerenicareComplete(false);
    setSerenicareFieldErrors({});
    setSerenicareFormData({});
    setSerenicareError(null);
    (async () => {
      try {
        const response = await startGuidedQuote({
          user_id: userId,
          flow_name: 'serenicare',
          session_id: serenicareSessionId ?? undefined,
          initial_data: undefined,
        });
        if (response?.session_id) setSerenicareSessionId(response.session_id);
        if (!response || !response.response || (typeof response.response === 'string' && response.response === 'Not Found')) {
          setSerenicareStepPayload(null);
          setSerenicareError('Failed to start Serenicare quote.');
          return;
        }
        setSerenicareStepPayload(response.response);
      } catch (err) {
        setSerenicareStepPayload(null);
        setSerenicareError(extractErrorDetail(err) ?? 'Failed to start Serenicare quote.');
      } finally {
        setSerenicareLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProduct, userId]);

  const handleSerenicareChange = (name: string, value: string) => {
    setSerenicareFormData((prev) => ({ ...prev, [name]: value }));
    setSerenicareFieldErrors((prev) => {
      if (!prev[name]) return prev;
      const copy = { ...prev };
      delete copy[name];
      return copy;
    });
  };

  const handleSerenicareSubmit = async (payload: Record<string, unknown>) => {
    const sid = serenicareSessionId ?? sessionId;
    if (!sid || !userId) return;

    const normalizedPayload: Record<string, unknown> = (() => {
      const step = serenicareStepPayload;
      if (!step) return payload;

      // Serenicare backend flow expects specific keys for some non-form steps.
      if (step.type === 'checkbox') {
        // Serenicare optional benefits step expects `optional_benefits`.
        const maybeRisky = payload['risky_activities'];
        if (payload['optional_benefits'] === undefined && Array.isArray(maybeRisky)) {
          return { ...payload, optional_benefits: maybeRisky };
        }
      }

      if (step.type === 'radio') {
        // Serenicare medical conditions step expects `has_condition: boolean`.
        const choice = payload['medical_conditions'];
        if (payload['has_condition'] === undefined && (choice === 'yes' || choice === 'no')) {
          return { ...payload, has_condition: choice === 'yes' };
        }
      }

      return payload;
    })();

    setSerenicareLoading(true);
    setSerenicareFieldErrors({});
    try {
      const res = await sendChatMessage({
        session_id: sid,
        user_id: userId,
        form_data: normalizedPayload,
      });
      if (res?.session_id && res.session_id !== sid) setSerenicareSessionId(res.session_id);

      const resolved = await resolveNextStepWithAutoAdvance(
        res,
        (formData) => sendChatMessage({ session_id: sid, user_id: userId, form_data: formData }),
        serenicareFormData
      );

      if (!resolved || resolved.complete || !resolved.step) {
        setSerenicareComplete(true);
        setSerenicareStepPayload(null);
        onFormSubmitted?.();
        return;
      }

      setSerenicareStepPayload(resolved.step);
    } catch {
      // Optionally handle field errors from backend here
      // setSerenicareFieldErrors(err?.fieldErrors || {});
    } finally {
      setSerenicareLoading(false);
    }
  };

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

      const resolved = await resolveNextStepWithAutoAdvance(
        res,
        (formData) => sendChatMessage({ session_id: sid, user_id: userId, form_data: formData }),
        formData
      );

      if (!resolved || resolved.complete || !resolved.step) {
        setPaComplete(true);
        setPaStepPayload(null);
        onFormSubmitted?.();
        return;
      }

      setPaStepPayload(resolved.step);
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

      const resolved = await resolveNextStepWithAutoAdvance(
        res,
        (formData) => sendChatMessage({ session_id: sid, user_id: userId, form_data: formData }),
        motorFormData
      );

      if (!resolved || resolved.complete || !resolved.step) {
        setMotorComplete(true);
        setMotorStepPayload(null);
        onFormSubmitted?.();
        return;
      }

      setMotorStepPayload(resolved.step);
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

      const resolved = await resolveNextStepWithAutoAdvance(
        res,
        (formData) => sendChatMessage({ session_id: sid, user_id: userId, form_data: formData }),
        travelFormData
      );

      if (!resolved || resolved.complete || !resolved.step) {
        setTravelComplete(true);
        setTravelStepPayload(null);
        onFormSubmitted?.();
        return;
      }

      setTravelStepPayload(resolved.step);
    } catch {
      // Optionally handle field errors from backend here
      // setTravelFieldErrors(err?.fieldErrors || {});
    } finally {
      setTravelLoading(false);
    }
  };

  // Render logic for Personal Accident only (backend-driven)
  if (isPersonalAccident) {
    if (paLoading && !paStepPayload) {
      return <LoadingBubble />;
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
      return <LoadingBubble />;
    }
    return (
      <GuidedStepRenderer
        step={paStepPayload}
        values={formData as Record<string, string>}
        errors={paFieldErrors}
        onChange={handlePaChange}
        onSubmit={handlePaSubmit}
        loading={paLoading}
        confirmOnFormSubmit={shouldConfirmBeforeSubmit(paStepPayload)}
      />
    );
  }

  // Render logic for Serenicare only (backend-driven)
  if (isSerenicare) {
    if (serenicareLoading && !serenicareStepPayload) {
      return <LoadingBubble />;
    }
    if (serenicareError) {
      return (
        <div className="w-full rounded-2xl p-6 border border-gray-200 bg-white">
          <p className="text-gray-900 font-medium">Unable to start Serenicare quote.</p>
          <p className="text-sm text-gray-600 mt-1">{serenicareError}</p>
          <button
            type="button"
            onClick={() => {
              setSerenicareFormData({});
              setSerenicareStepPayload(null);
              setSerenicareComplete(false);
              setSerenicareFieldErrors({});
              setSerenicareError(null);
              setSerenicareSessionId(sessionId ?? null);
            }}
            className="mt-4 px-4 py-2 rounded-lg border border-primary text-primary hover:bg-green-50"
          >
            Start over
          </button>
        </div>
      );
    }
    if (serenicareComplete) {
      return (
        <div className="w-full rounded-2xl p-6 border border-gray-200 bg-white">
          <p className="text-gray-900 font-medium">Thank you! Your quote has been submitted.</p>
          <button
            type="button"
            onClick={() => {
              setSerenicareFormData({});
              setSerenicareStepPayload(null);
              setSerenicareComplete(false);
              setSerenicareFieldErrors({});
              setSerenicareError(null);
              setSerenicareSessionId(sessionId ?? null);
            }}
            className="mt-4 px-4 py-2 rounded-lg border border-primary text-primary hover:bg-green-50"
          >
            Start over
          </button>
        </div>
      );
    }
    if (!serenicareStepPayload) {
      return <LoadingBubble />;
    }
    return (
      <GuidedStepRenderer
        step={serenicareStepPayload}
        values={serenicareFormData as Record<string, string>}
        errors={serenicareFieldErrors}
        onChange={handleSerenicareChange}
        onSubmit={handleSerenicareSubmit}
        loading={serenicareLoading}
        confirmOnFormSubmit={shouldConfirmBeforeSubmit(serenicareStepPayload)}
      />
    );
  }
  // Render logic for Motor Private only (backend-driven)
  if (isMotorPrivate) {
    if (motorLoading && !motorStepPayload) {
      return <LoadingBubble />;
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
      return <LoadingBubble />;
    }
    return (
      <GuidedStepRenderer
        step={motorStepPayload}
        values={motorFormData as Record<string, string>}
        errors={motorFieldErrors}
        onChange={handleMotorChange}
        onSubmit={handleMotorSubmit}
        loading={motorLoading}
        confirmOnFormSubmit={shouldConfirmBeforeSubmit(motorStepPayload)}
      />
    );
  }

  // Render logic for TravelPlus only (backend-driven)
  if (isTravelSurePlus) {
    if (travelComplete) {
      return null;
    }
    if (travelLoading && !travelStepPayload) {
      return <LoadingBubble />;
    }
    if (!travelStepPayload) return <LoadingBubble />;
    return (
      <GuidedStepRenderer
        step={travelStepPayload}
        values={travelFormData as Record<string, string>}
        errors={travelFieldErrors}
        onChange={handleTravelChange}
        onSubmit={handleTravelSubmit}
        loading={travelLoading}
        confirmOnFormSubmit={shouldConfirmBeforeSubmit(travelStepPayload)}
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


  // If we get here, the user selected a product but we don't yet have a guided quote flow wired up
  // for it. Return a small, friendly card instead of rendering nothing.
  return (
    <div className={embedded ? "w-full" : "flex flex-col h-full bg-white"}>
      <div className="w-full rounded-2xl p-6 border border-gray-200 bg-white">
        <p className="text-gray-900 font-medium">Quote form not available yet.</p>
        <p className="text-sm text-gray-600 mt-1">
          We don&apos;t currently have a guided quote form for <span className="font-medium">{selectedProduct}</span>.
        </p>
      </div>
    </div>
  );
};

export default QuoteFormScreen;
