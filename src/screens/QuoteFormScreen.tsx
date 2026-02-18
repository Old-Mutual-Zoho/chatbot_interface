import { getFormDraft, getSessionState, sendChatMessage, startGuidedQuote } from '../services/api';
import React, { useState, useEffect, useMemo, useRef } from "react";
import type { GuidedStepResponse, StartGuidedResponse } from '../services/api';
import CardForm from '../components/form-components/CardForm';
import { GuidedStepRenderer } from '../components/form-components/GuidedStepRenderer';
import { getProductFormSteps } from '../utils/getProductFormSteps';

interface QuoteFormScreenProps {
  selectedProduct?: string | null;
  userId?: string | null;
  sessionId?: string | null;
  onFormSubmitted?: () => void;
  embedded?: boolean;
}
const QuoteFormScreen: React.FC<QuoteFormScreenProps> = ({ selectedProduct, userId, sessionId, onFormSubmitted, embedded = false }) => {
  // Returns description for a given form step title
  const getDescriptionForTitle = (title: string | undefined) => {
    const normalized = (title ?? "").trim().toLowerCase();
    if (normalized === "get a quote") {
      return "Provide a few details so we can tailor your quote.";
    }
    return undefined;
  };

  // Step state and form data
  const [step, setStep] = useState<number>(0);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const submitLockRef = useRef(false);

  // --- Backend-driven Personal Accident guided flow state ---
  const FLOW_NAME_PA = 'personal_accident';
  // Unified backend-driven product detection
  const backendDrivenProducts = [
    'Personal Accident',
    'Motor Private Insurance',
    // Add more backend-driven product names here as needed
  ];
  const isBackendDrivenProduct = backendDrivenProducts.includes(selectedProduct ?? '');
  const isBackendDrivenPA = selectedProduct === 'Personal Accident';
  const [paSessionId, setPaSessionId] = useState<string | null>(sessionId ?? null);
  const [paStepPayload, setPaStepPayload] = useState<GuidedStepResponse | null>(null);
  const [paLoading, setPaLoading] = useState(false);
  const [paComplete, setPaComplete] = useState(false);
  const [paFieldErrors, setPaFieldErrors] = useState<Record<string, string>>({});

  // --- Backend-driven Motor Private guided flow state ---
  const FLOW_NAME_MOTOR = 'motor_private';
  const isBackendDrivenMotor = selectedProduct === 'Motor Private Insurance';
  const [motorSessionId, setMotorSessionId] = useState<string | null>(sessionId ?? null);
  const [motorStepPayload, setMotorStepPayload] = useState<GuidedStepResponse | null>(null);
  const [motorLoading, setMotorLoading] = useState(false);
  const [motorComplete, setMotorComplete] = useState(false);
  const [motorFieldErrors, setMotorFieldErrors] = useState<Record<string, string>>({});

  // Compute steps for selected product
  const steps = useMemo(() => {
    if (!selectedProduct) return [];
    return getProductFormSteps(selectedProduct);
  }, [selectedProduct]);

  // Handle field value change
  const handleChange = (name: string, value: string) => {
    const computeInclusiveDayCount = (startIso?: string, endIso?: string) => {
      if (!startIso || !endIso) return "";
      const startT = Date.parse(startIso);
      const endT = Date.parse(endIso);
      if (Number.isNaN(startT) || Number.isNaN(endT)) return "";
      const start = new Date(startT);
      const end = new Date(endT);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      const diffMs = end.getTime() - start.getTime();
      if (diffMs < 0) return "";
      const days = Math.floor(diffMs / (24 * 60 * 60 * 1000)) + 1;
      return String(days);
    };

    setFormData((prev: Record<string, string>) => {
      const next = { ...prev, [name]: value };

      if (selectedProduct === "Travel Sure Plus") {
        // Departure country is fixed
        if (name === "departureCountry") {
          next.departureCountry = "Uganda";
        }

        // Traveller DOB capture
        if (name === "whoAreYouCovering") {
          const groupLike = value === "group" || value === "myself_and_someone_else";
          if (groupLike) {
            // Ensure at least one traveller slot so the user can fill DOB immediately.
            if (!next.travellers) {
              next.travellers = JSON.stringify([{}]);
            }
            // Clear single-field DOB when switching to group-like
            next.travellerDob = "";
          } else {
            // Switching to single-traveller flow
            next.travellers = "";
          }
        }

        if (name === "travellerDob") {
          next.travellers = JSON.stringify([{ dob: value }]);
        }

        if (name === "travellers") {
          try {
            const parsed = value ? JSON.parse(value) : [];
            const count = Array.isArray(parsed) ? parsed.length : 0;
            next.numberOfTravellers = count > 0 ? String(count) : "";
          } catch {
            next.numberOfTravellers = "";
          }
        }

        // If we have a single-traveller DOB mapped into travellers, keep count in sync.
        if (name === "travellerDob") {
          next.numberOfTravellers = value ? "1" : "";
        }

        const startIso = name === "travelStartDate" ? value : next.travelStartDate;
        const endIso = name === "travelEndDate" ? value : next.travelEndDate;
        const days = computeInclusiveDayCount(startIso, endIso);
        next.durationOfTravel = days;
      }

      return next;
    });

    // Guided PA: clear backend field error as the user edits.
    if (isBackendDrivenPA) {
      setPaFieldErrors((prev) => {
        if (!prev[name]) return prev;
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  // Reset PA state when product/session changes
  useEffect(() => {
    setPaSessionId(sessionId ?? null);
    setPaStepPayload(null);
    setPaLoading(false);
    setPaComplete(false);
    setPaFieldErrors({});
  }, [selectedProduct, sessionId]);

  // Start backend-driven PA flow (prefer draft if present)
  useEffect(() => {
    if (!isBackendDrivenPA) return;
    if (!userId) return;

    const sid = paSessionId ?? sessionId;
    if (!sid) return;

    let cancelled = false;
    (async () => {
      setPaLoading(true);
      try {
        // Only try fetching a draft if the backend indicates this session is already in a PA guided flow.
        // This avoids an expected-but-noisy 404 when there is no draft yet.
        try {
          const state = await getSessionState(sid);
          const shouldTryDraft = state?.mode === 'guided' && state?.current_flow === FLOW_NAME_PA;

          if (shouldTryDraft) {
            const draft = await getFormDraft(sid, FLOW_NAME_PA);
            if (cancelled) return;
            setPaSessionId(draft.session_id);

            // Best-effort flatten: backend may store nested keys, keep simple string values.
            const flat: Record<string, string> = {};
            const cd = draft.collected_data ?? {};
            Object.entries(cd).forEach(([k, v]) => {
              if (v == null) return;
              if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
                flat[k] = String(v);
              }
            });
            setFormData((prev) => ({ ...prev, ...flat }));
          }
        } catch {
          // ignore session-state/draft probe failures; we'll still start the flow below.
        }

        // No schema-refetch endpoint; start (or resume) to get the current step payload.
        const startRes = await startGuidedQuote({
          user_id: userId,
          flow_name: FLOW_NAME_PA,
          session_id: sid,
          initial_data: { product_id: 'Personal Accident' },
        });
        if (cancelled) return;
        // Always follow the backend's session_id in case it creates/returns a new session.
        const typedStart = startRes as StartGuidedResponse;
        if (typedStart?.session_id && typedStart.session_id !== sid) {
          setPaSessionId(typedStart.session_id);
        }
        setPaStepPayload(typedStart.response ?? null);
      } catch (e) {
        console.error('Failed to start Personal Accident flow:', e);
      } finally {
        if (!cancelled) setPaLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isBackendDrivenPA, paSessionId, sessionId, userId]);

  // Start backend-driven Motor Private flow 
  useEffect(() => {
    if (!isBackendDrivenMotor) return;
    if (!userId) return;

    const sid = motorSessionId ?? sessionId;
    if (!sid) return;

    let cancelled = false;
    (async () => {
      setMotorLoading(true);
      try {
        // Only try fetching a draft if the backend indicates this session is already in a Motor guided flow.
        // This avoids an expected-but-noisy 404 when there is no draft yet.
        try {
          const state = await getSessionState(sid);
          console.debug('Motor getSessionState:', { sid, state });
          const shouldTryDraft = state?.mode === 'guided' && state?.current_flow === FLOW_NAME_MOTOR;

          if (shouldTryDraft) {
            const draft = await getFormDraft(sid, FLOW_NAME_MOTOR);
            console.debug('Motor getFormDraft:', { sid, draft });
            if (cancelled) return;
            setMotorSessionId(draft.session_id);

            // Best-effort flatten: backend may store nested keys, keep simple string values.
            const flat: Record<string, string> = {};
            const cd = draft.collected_data ?? {};
            Object.entries(cd).forEach(([k, v]) => {
              if (v == null) return;
              if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
                flat[k] = String(v);
              }
            });
            setFormData((prev) => ({ ...prev, ...flat }));
          }
        } catch (err) {
          console.debug('Motor session-state/draft probe failed:', err);
          // ignore session-state/draft probe failures; we'll still start the flow below.
        }

        // No schema-refetch endpoint; start (or resume) to get the current step payload.
        const startRes = await startGuidedQuote({
          user_id: userId,
          flow_name: FLOW_NAME_MOTOR,
          session_id: sid,
          initial_data: { product_id: 'Motor Private Insurance' },
        });
        console.debug('Motor startGuidedQuote:', {
          user_id: userId,
          flow_name: FLOW_NAME_MOTOR,
          session_id: sid,
          initial_data: { product_id: 'Motor Private Insurance' },
          startRes,
        });
        if (cancelled) return;
        // Always follow the backend's session_id in case it creates/returns a new session.
        const typedStart = startRes as StartGuidedResponse;
        if (typedStart?.session_id && typedStart.session_id !== sid) {
          setMotorSessionId(typedStart.session_id);
        }
        setMotorStepPayload(typedStart.response ?? null);
      } catch (e) {
        // Log error details and any available response data
        if (e && typeof e === 'object' && 'response' in e) {
          // @ts-expect-error: e.response is likely an AxiosError
          console.error('Failed to start Motor Private flow:', e, e.response?.data);
        } else {
          console.error('Failed to start Motor Private flow:', e);
        }
      } finally {
        if (!cancelled) setMotorLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isBackendDrivenMotor, motorSessionId, sessionId, userId]);

  // Ensure guided PA form steps have stable keys in state (avoid undefined dropping).
  useEffect(() => {
    if (!isBackendDrivenPA) return;
    if (!paStepPayload) return;
    if (paStepPayload.type !== 'form') return;
    const stepFields = paStepPayload.fields;
    if (!Array.isArray(stepFields) || stepFields.length === 0) return;

    setFormData((prev) => {
      const next = { ...prev };
      let changed = false;
      for (const f of stepFields) {
        const name = f?.name;
        if (typeof name !== 'string' || !name) continue;
        if (next[name] === undefined) {
          next[name] = "";
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [isBackendDrivenPA, paStepPayload]);

  // Handle next/submit action
  const handleNext = async () => {
    // Backend-driven PA: submit each step to /chat/message
    if (isBackendDrivenPA) {
      // Now handled inline in JSX
      return;
    }

    if (step < steps.length - 1) {
      setStep((prev) => prev + 1);
      return;
    }

    // Last step: block double-submit (double-clicks, retries after success)
    if (hasSubmitted || isSubmitting || submitLockRef.current) {
      return;
    }
    submitLockRef.current = true;
    setIsSubmitting(true);

    const flowNameByProduct: Record<string, string> = {
      "Travel Sure Plus": "travel_sure_plus",
      "Personal Accident": "personal_accident",
      "Serenicare": "serenicare",
      "Motor Private Insurance": "motor_private",
    };

    const flow_name = selectedProduct ? flowNameByProduct[selectedProduct] : undefined;
    if (!flow_name) {
      setHasSubmitted(true);
      setIsSubmitting(false);
      onFormSubmitted?.();
      return;
    }

    try {
      const user_id = userId || '';
      const product_id = selectedProduct ? String(selectedProduct) : '';
      const initial_data = {
        product_id,
        ...formData,
      };
      await startGuidedQuote({ user_id, flow_name, initial_data });
      setHasSubmitted(true);
    } catch (error) {
      console.error('Form submission error:', error);
      // Allow retry if submission failed.
      submitLockRef.current = false;
    } finally {
      setIsSubmitting(false);
      onFormSubmitted?.();
    }
  };

  // Handle back action
  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const isLastStep = step === steps.length - 1;
  const submitDisabled = isLastStep && (isSubmitting || hasSubmitted);


  // Show prompt if no product is selected or (for static products) if no steps are available
  if (!selectedProduct || (!isBackendDrivenProduct && steps.length === 0)) {
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

  // Backend-driven Personal Accident rendering
  if (isBackendDrivenPA) {
    return (
      <div className={embedded ? "w-full" : "flex flex-col h-full bg-white"}>
        <div className={embedded ? "px-3 sm:px-4 py-3" : "p-4 mt-12"}>
          {paLoading && !paStepPayload ? (
            <p className="text-center text-gray-600 text-sm">Loading...</p>
          ) : paComplete ? (
            <div className="w-full rounded-2xl p-6 border border-gray-200 bg-white">
              <p className="text-gray-900 font-medium">Thank you! Your quote has been submitted.</p>
              <button
                type="button"
                onClick={() => {
                  setFormData({});
                  setPaStepPayload(null);
                  setPaComplete(false);
                }}
                className="mt-4 px-4 py-2 rounded-lg border border-primary text-primary hover:bg-green-50"
              >
                Start over
              </button>
            </div>
          ) : (
            <GuidedStepRenderer
              step={paStepPayload}
              values={formData}
              errors={paFieldErrors}
              onClearError={(name) => {
                setPaFieldErrors((prev) => {
                  if (!prev[name]) return prev;
                  const copy = { ...prev };
                  delete copy[name];
                  return copy;
                });
              }}
              onChange={handleChange}
              onSubmit={async (payload) => {
                const sid = paSessionId ?? sessionId;
                if (!sid || !userId) return;
                setPaLoading(true);
                try {
                  setPaFieldErrors({});
                  const res = await sendChatMessage({
                    session_id: sid,
                    user_id: userId,
                    form_data: payload,
                  });
                  if (res?.session_id && res.session_id !== sid) {
                    setPaSessionId(res.session_id);
                  }
                  if (res?.response?.complete) {
                    setPaComplete(true);
                    onFormSubmitted?.();
                    return;
                  }
                  const next = res?.response?.response;
                  if (next) {
                    setPaStepPayload(next);
                  }
                } catch (e: unknown) {
                  const err = e as { response?: { status?: number; data?: unknown } };
                  const status = err?.response?.status;
                  const data = err?.response?.data as Record<string, unknown> | undefined;
                  let fieldErrors: unknown = undefined;
                  if (data && typeof data === 'object') {
                    if ('detail' in data && typeof data.detail === 'object' && data.detail !== null && 'field_errors' in (data.detail as object)) {
                      fieldErrors = (data.detail as { field_errors?: unknown }).field_errors;
                    } else if ('field_errors' in data) {
                      fieldErrors = (data as { field_errors?: unknown }).field_errors;
                    }
                  }
                  if (status === 422 && fieldErrors && typeof fieldErrors === 'object') {
                    const normalized: Record<string, string> = {};
                    Object.entries(fieldErrors as Record<string, unknown>).forEach(([k, v]) => {
                      if (v == null) return;
                      normalized[k] = Array.isArray(v) ? String(v[0] ?? '') : String(v);
                    });
                    setPaFieldErrors(normalized);
                  }
                } finally {
                  setPaLoading(false);
                }
              }}
              onBack={undefined}
              loading={paLoading}
              titleFallback="Personal Accident"
            />
          )}
        </div>
      </div>
    );
  }

  // Backend-driven Motor rendering
  if (isBackendDrivenMotor) {
    return (
      <div className={embedded ? "w-full" : "flex flex-col h-full bg-white"}>
        <div className={embedded ? "px-3 sm:px-4 py-3" : "p-4 mt-12"}>
          {motorLoading && !motorStepPayload ? (
            <p className="text-center text-gray-600 text-sm">Loading...</p>
          ) : motorComplete ? (
            <div className="w-full rounded-2xl p-6 border border-gray-200 bg-white">
              <p className="text-gray-900 font-medium">Thank you! Your quote has been submitted.</p>
              <button
                type="button"
                onClick={() => {
                  setFormData({});
                  setMotorStepPayload(null);
                  setMotorComplete(false);
                }}
                className="mt-4 px-4 py-2 rounded-lg border border-primary text-primary hover:bg-green-50"
              >
                Start over
              </button>
            </div>
          ) : (
            <GuidedStepRenderer
              step={motorStepPayload}
              values={formData}
              errors={motorFieldErrors}
              onClearError={(name) => {
                setMotorFieldErrors((prev) => {
                  if (!prev[name]) return prev;
                  const copy = { ...prev };
                  delete copy[name];
                  return copy;
                });
              }}
              onChange={handleChange}
              onSubmit={async (payload) => {
                const sid = motorSessionId ?? sessionId;
                if (!sid || !userId) return;
                setMotorLoading(true);
                try {
                  setMotorFieldErrors({});
                  const res = await sendChatMessage({
                    session_id: sid,
                    user_id: userId,
                    form_data: payload,
                  });
                  if (res?.session_id && res.session_id !== sid) {
                    setMotorSessionId(res.session_id);
                  }
                  if (res?.response?.complete) {
                    setMotorComplete(true);
                    onFormSubmitted?.();
                    return;
                  }
                  const next = res?.response?.response;
                  if (next) {
                    setMotorStepPayload(next);
                  }
                } catch (e: unknown) {
                  const err = e as { response?: { status?: number; data?: unknown } };
                  const status = err?.response?.status;
                  const data = err?.response?.data as Record<string, unknown> | undefined;
                  let fieldErrors: unknown = undefined;
                  if (data && typeof data === 'object') {
                    if ('detail' in data && typeof data.detail === 'object' && data.detail !== null && 'field_errors' in (data.detail as object)) {
                      fieldErrors = (data.detail as { field_errors?: unknown }).field_errors;
                    } else if ('field_errors' in data) {
                      fieldErrors = (data as { field_errors?: unknown }).field_errors;
                    }
                  }
                  if (status === 422 && fieldErrors && typeof fieldErrors === 'object') {
                    const normalized: Record<string, string> = {};
                    Object.entries(fieldErrors as Record<string, unknown>).forEach(([k, v]) => {
                      if (v == null) return;
                      normalized[k] = Array.isArray(v) ? String(v[0] ?? '') : String(v);
                    });
                    setMotorFieldErrors(normalized);
                  }
                } finally {
                  setMotorLoading(false);
                }
              }}
              onBack={undefined}
              loading={motorLoading}
              titleFallback="Motor Private Insurance"
            />
          )}
        </div>
      </div>
    );
  }

  const description = getDescriptionForTitle(steps[step]?.title);

  // Render current form step
  return (
    <div className={embedded ? "w-full" : "flex flex-col h-full bg-white"}>
      <div className={embedded ? "px-3 sm:px-4 py-3" : "p-4 mt-12"}>
        <CardForm
          title={steps[step].title}
          description={description}
          fields={steps[step].fields}
          values={{ ...formData, selectedProduct: selectedProduct || "" }}
          onChange={handleChange}
          onNext={handleNext}
          onBack={handleBack}
          showBack={step > 0}
          showNext={true}
          nextDisabled={submitDisabled}
          nextButtonLabel={isLastStep ? "Submit" : "Next"}
        />
      </div>
    </div>
  );
};

export default QuoteFormScreen;
