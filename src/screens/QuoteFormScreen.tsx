import { extractBackendValidationError, sendChatMessage, startGuidedQuote } from '../services/api';
import React, { useState, useEffect } from "react";
import type { GuidedStepResponse } from '../services/api';
import { GuidedStepRenderer } from '../components/form-components/GuidedStepRenderer';
import { LoadingBubble } from "../components/chatbot/messages/LoadingBubble";
import type { CardFieldConfig as ConfirmationFieldConfig } from '../components/chatbot/messages/ConfirmationCard';

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
  let nextStep: GuidedStepResponse | null = extractGuidedStep(res);
  let isComplete = extractIsComplete(res);

  // Some backends mark the quote flow as `complete: true` but still return a follow-up
  // guided step (e.g., payment). If a step is present, keep rendering it.
  if (isComplete && !nextStep) return { complete: true, step: null };

  // Payment transition: some backends return an informational `proceed_to_payment` step first,
  // and only return the real payment UI step (`payment_method`) on the next call.
  // Auto-advance once so the user immediately sees payment options/amount.
  if (nextStep?.type === 'proceed_to_payment') {
    const extractPremiumAmount = (): number | null => {
      const candidates: unknown[] = [
        (nextStep as unknown as Record<string, unknown>)['premium_amount'],
        (nextStep as unknown as Record<string, unknown>)['amount'],
        (nextStep as unknown as Record<string, unknown>)['premium'],
        (nextStep as unknown as Record<string, unknown>)['monthly_premium'],
      ];

      // Also try the already-collected quote data from earlier steps.
      if (data && typeof data === 'object') {
        const d = data as Record<string, unknown>;
        candidates.push(
          d['premium_amount'],
          d['amount'],
          d['premium'],
          d['monthly_premium'],
          d['annual_premium'],
        );
      }
      const maybeData = (nextStep as unknown as Record<string, unknown>)['data'];
      if (maybeData && typeof maybeData === 'object' && maybeData !== null) {
        candidates.push(
          (maybeData as Record<string, unknown>)['premium_amount'],
          (maybeData as Record<string, unknown>)['amount'],
          (maybeData as Record<string, unknown>)['premium'],
          (maybeData as Record<string, unknown>)['monthly_premium'],
        );
      }

      for (const raw of candidates) {
        if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
        if (typeof raw === 'string') {
          const n = Number(raw);
          if (Number.isFinite(n)) return n;
        }
      }
      return null;
    };

    const quoteId = typeof nextStep.quote_id === 'string' && nextStep.quote_id.trim()
      ? nextStep.quote_id.trim()
      : undefined;

    const premiumAmount = extractPremiumAmount();

    const followUpPayload: Record<string, unknown> = {
      ...(quoteId ? { quote_id: quoteId } : {}),
      ...(premiumAmount != null ? { premium_amount: premiumAmount } : {}),
    };
    try {
      res = await sendNext(followUpPayload);
      nextStep = extractGuidedStep(res);
      isComplete = extractIsComplete(res);
      if (isComplete && !nextStep) return { complete: true, step: null };
    } catch {
      // If follow-up fails, fall back to rendering the proceed_to_payment step.
    }
  }

  // If backend asks again for a form we already have filled, auto-submit it.
  // Guarded to avoid infinite loops.
  for (let attempts = 0; attempts < 2; attempts += 1) {
    if (!nextStep || nextStep.type !== 'form') break;
    const autoPayload = buildFormPayloadIfComplete(nextStep, data);
    if (!autoPayload) break;

    res = await sendNext(autoPayload);
    nextStep = extractGuidedStep(res);
    isComplete = extractIsComplete(res);
    if (isComplete && !nextStep) return { complete: true, step: null };
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

const titleCaseFromSnake = (raw: string): string => {
  const cleaned = String(raw ?? '').trim();
  if (!cleaned) return '';
  return cleaned
    .split('_')
    .filter(Boolean)
    .map((w) => {
      const lower = w.toLowerCase();
      if (lower === 'id') return 'ID';
      if (lower === 'dob') return 'DOB';
      if (lower === 'ugx') return 'UGX';
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(' ');
};

const buildFormLevelErrorFromFieldErrors = (
  message: string | undefined,
  fieldErrors: Record<string, string>
): string => {
  const headline = (typeof message === 'string' && message.trim()) ? message.trim() : 'Please correct the highlighted fields.';
  const keys = Object.keys(fieldErrors).filter((k) => k && !k.startsWith('_'));
  if (keys.length === 0) return headline;
  const details = keys
    .slice(0, 8)
    .map((k) => `- ${titleCaseFromSnake(k) || k}: ${fieldErrors[k]}`)
    .join('\n');
  const more = keys.length > 8 ? `\n- …and ${keys.length - 8} more` : '';
  return `${headline}\n${details}${more}`;
};

const appendMissingFieldsFromFieldErrors = (
  step: GuidedStepResponse | null,
  message: string | undefined,
  fieldErrors: Record<string, string>
): GuidedStepResponse | null => {
  if (!step || step.type !== 'form') return null;

  const existing = new Set(
    (step.fields ?? [])
      .map((f) => String(f.name ?? '').trim())
      .filter(Boolean)
  );

  const missingKeys = Object.keys(fieldErrors)
    .map((k) => String(k ?? '').trim())
    .filter((k) => k && !k.startsWith('_') && !existing.has(k));

  if (missingKeys.length === 0) return null;

  return {
    ...step,
    message: (typeof message === 'string' && message.trim()) ? message : step.message,
    fields: [
      ...(step.fields ?? []),
      ...missingKeys.map((name) => ({
        name,
        label: titleCaseFromSnake(name) || name,
        type: 'text',
        required: true,
        placeholder: '',
      })),
    ],
  } as GuidedStepResponse;
};

const buildFormStepFromFieldErrors = (
  message: string | undefined,
  fieldErrors: Record<string, string>
): GuidedStepResponse => {
  const keys = Object.keys(fieldErrors)
    .map((k) => String(k ?? '').trim())
    .filter((k) => k && !k.startsWith('_'));

  return {
    type: 'form',
    message: (typeof message === 'string' && message.trim())
      ? message
      : 'Please provide the required details.',
    fields: keys.map((name) => ({
      name,
      label: titleCaseFromSnake(name) || name,
      type: 'text',
      required: true,
      placeholder: '',
    })),
  } as GuidedStepResponse;
};

const buildConfirmationFieldTypeHintsFromStep = (
  step: GuidedStepResponse | null
): Record<string, ConfirmationFieldConfig> => {
  if (!step) return {};

  if (step.type === 'radio') {
    const key = step.question_id && step.question_id.trim() ? step.question_id : '';
    if (!key) return {};
    return {
      [key]: {
        name: key,
        label: typeof step.message === 'string' && step.message.trim() ? step.message : key,
        type: 'radio',
        options: (step.options ?? []).map((o) => ({ label: o.label, value: o.id })),
      },
    };
  }

  if (step.type === 'yes_no_details') {
    const key = step.question_id && step.question_id.trim() ? step.question_id : '';
    if (!key) return {};
    const next: Record<string, ConfirmationFieldConfig> = {
      [key]: {
        name: key,
        label: typeof step.message === 'string' && step.message.trim() ? step.message : key,
        type: 'radio',
        options: (step.options ?? []).map((o) => ({ label: o.label, value: o.id })),
      },
    };
    if (step.details_field?.name) {
      const detailsKey = step.details_field.name;
      next[detailsKey] = {
        name: detailsKey,
        label: step.details_field.label ?? detailsKey,
        type: 'text',
      };
    }
    return next;
  }

  return {};
};

const toStoredStringValue = (value: unknown): string => {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) {
    return value
      .map((v) => (v == null ? '' : String(v)).trim())
      .filter(Boolean)
      .join(', ');
  }
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return String(value);
};

const mergeFormDataForSummary = (
  prev: Record<string, unknown>,
  payload: Record<string, unknown>
): Record<string, unknown> => {
  const next: Record<string, unknown> = { ...prev };
  for (const [key, rawValue] of Object.entries(payload)) {
    const k = String(key ?? '').trim();
    if (!k) continue;
    if (k === 'action') continue;
    if (k.startsWith('_')) continue;
    next[k] = toStoredStringValue(rawValue);
  }
  return next;
};

interface QuoteFormScreenProps {
  selectedProduct?: string | null;
  userId?: string | null;
  sessionId?: string | null;
  onFormSubmitted?: () => void;
  embedded?: boolean;
}

interface QuoteFormScreenProps {
  selectedProduct?: string | null;
  userId?: string | null;
  sessionId?: string | null;
  onFormSubmitted?: () => void;
  embedded?: boolean;
  onFormStepActive?: (active: boolean) => void;
}

const QuoteFormScreen: React.FC<QuoteFormScreenProps> = ({ selectedProduct, userId, sessionId, onFormSubmitted, embedded = false, onFormStepActive }) => {
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
  const [paStepHistory, setPaStepHistory] = useState<GuidedStepResponse[]>([]);
  const [paLoading, setPaLoading] = useState(false);
  const [paComplete, setPaComplete] = useState(false);
  const [paFieldErrors, setPaFieldErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [paPendingAction, setPaPendingAction] = useState<string | null>(null);

  const getGuidedStepKey = (step: GuidedStepResponse | null): string => {
    if (!step) return '';
    if (step.type === 'form') {
      const fields = (step.fields ?? []).map((f) => `${String(f.name ?? '')}:${String(f.type ?? '')}`).join('|');
      return `form:${fields}`;
    }
    return step.type;
  };

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
  const [serenicarePendingAction, setSerenicarePendingAction] = useState<string | null>(null);

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

  const shouldConfirmMotorBeforeSubmit = (step: GuidedStepResponse | null): boolean => {
    if (!step || step.type !== 'form') return false;
    const fields = step.fields ?? [];
    return fields.some((f) => {
      const name = String(f.name ?? '').trim().toLowerCase();
      const label = String(f.label ?? '').trim().toLowerCase();
      // Motor Private final field is "car usage".
      return (
        name === 'car_usage' ||
        name === 'carusage' ||
        name.includes('car_usage') ||
        label.includes('car usage')
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
    setPaStepHistory([]);
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

    const mergedSerenicareData = mergeFormDataForSummary(serenicareFormData, normalizedPayload);
    setSerenicareFormData(mergedSerenicareData);

    setSerenicareLoading(true);
    setSerenicareFieldErrors({});
    try {
      const normalizedToSend = serenicarePendingAction
        ? { ...normalizedPayload, action: serenicarePendingAction }
        : normalizedPayload;
      const res = await sendChatMessage({
        session_id: sid,
        user_id: userId,
        form_data: normalizedToSend,
      });
      if (res?.session_id && res.session_id !== sid) setSerenicareSessionId(res.session_id);

      setSerenicarePendingAction(null);

      const resolved = await resolveNextStepWithAutoAdvance(
        res,
        (formData) => sendChatMessage({ session_id: sid, user_id: userId, form_data: formData }),
        mergedSerenicareData
      );

      if (!resolved || resolved.complete || !resolved.step) {
        setSerenicareComplete(true);
        setSerenicareStepPayload(null);
        onFormSubmitted?.();
        return;
      }

      setSerenicareStepPayload(resolved.step);
    } catch (err) {
      const validation = extractBackendValidationError(err);
      if (validation?.fieldErrors) {
        setSerenicareFieldErrors({
          ...validation.fieldErrors,
          _error: buildFormLevelErrorFromFieldErrors(validation.message, validation.fieldErrors),
        });
        const attemptedAction = payload && typeof payload['action'] === 'string' ? (payload['action'] as string) : null;
        if (attemptedAction) setSerenicarePendingAction(attemptedAction);
        return;
      }

      setSerenicareFieldErrors((prev) => ({
        ...prev,
        _error: extractErrorDetail(err) ?? 'Failed to submit. Please try again.',
      }));
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

    const mergedPaData = mergeFormDataForSummary(formData, payload);
    setFormData(mergedPaData);

    setPaLoading(true);
    setPaFieldErrors({});
    try {
      // Send the full accumulated payload (previous values + current normalized fields).
      // Some backends validate the full schema on each submit and return missing-field errors
      // for fields that weren't included in the current step payload.
      const payloadToSend = paPendingAction
        ? { ...mergedPaData, ...payload, action: paPendingAction }
        : { ...mergedPaData, ...payload };
      const res = await sendChatMessage({
        session_id: sid,
        user_id: userId,
        form_data: payloadToSend
      });
      if (res?.session_id && res.session_id !== sid) setPaSessionId(res.session_id);

      setPaPendingAction(null);

      const resolved = await resolveNextStepWithAutoAdvance(
        res,
        (formData) => sendChatMessage({ session_id: sid, user_id: userId, form_data: formData }),
        mergedPaData
      );

      if (!resolved || resolved.complete || !resolved.step) {
        setPaComplete(true);
        setPaStepPayload(null);
        onFormSubmitted?.();
        return;
      }

      // Keep a lightweight history so the user can go back
      // (useful when backend moves from Physical Address -> NOK step).
      setPaStepHistory((prev) => {
        if (!paStepPayload) return prev;
        const prevKey = getGuidedStepKey(paStepPayload);
        const nextKey = getGuidedStepKey(resolved.step);
        if (!prevKey || !nextKey || prevKey === nextKey) return prev;
        return [...prev, paStepPayload];
      });
      setPaStepPayload(resolved.step);
    } catch (err) {
      const validation = extractBackendValidationError(err);
      if (validation?.fieldErrors) {
        setPaFieldErrors({
          ...validation.fieldErrors,
          _error: buildFormLevelErrorFromFieldErrors(validation.message, validation.fieldErrors),
        });

        // If we're currently on a non-form step (e.g. premium summary) and the user clicked an
        // action like "Proceed", the backend may respond with required-field errors.
        // Switch into a simple field-entry step so those fields render.
        if (paStepPayload && paStepPayload.type !== 'form') {
          const nextFormStep = buildFormStepFromFieldErrors(validation.message, validation.fieldErrors);
          setPaStepHistory((prev) => {
            const prevKey = getGuidedStepKey(paStepPayload);
            const last = prev.length > 0 ? prev[prev.length - 1] : null;
            const lastKey = getGuidedStepKey(last);
            if (!prevKey || prevKey === lastKey) return prev;
            return [...prev, paStepPayload];
          });
          setPaStepPayload(nextFormStep);
        }

        // If the backend validates future fields (e.g. next-of-kin) before sending the next step,
        // append the missing fields onto the current PA form so the user can complete them.
        const augmented = appendMissingFieldsFromFieldErrors(
          paStepPayload,
          validation.message,
          validation.fieldErrors
        );
        if (augmented) {
          // Preserve Back navigation when we append new fields (e.g., NOK fields)
          // onto the current step.
          setPaStepHistory((prev) => {
            if (!paStepPayload) return prev;
            const prevKey = getGuidedStepKey(paStepPayload);
            const last = prev.length > 0 ? prev[prev.length - 1] : null;
            const lastKey = getGuidedStepKey(last);
            if (!prevKey || prevKey === lastKey) return prev;
            return [...prev, paStepPayload];
          });
          setPaStepPayload(augmented);
        }

        const attemptedAction = payload && typeof payload['action'] === 'string' ? (payload['action'] as string) : null;
        if (attemptedAction) setPaPendingAction(attemptedAction);
        return;
      }

      setPaFieldErrors((prev) => ({
        ...prev,
        _error: extractErrorDetail(err) ?? 'Failed to submit. Please try again.',
      }));
    } finally {
      setPaLoading(false);
    }
  };

  const handlePaBack = () => {
    setPaStepHistory((prev) => {
      if (prev.length === 0) return prev;
      const next = prev.slice(0, -1);
      const last = prev[prev.length - 1];
      setPaStepPayload(last ?? null);
      setPaFieldErrors({});
      setPaPendingAction(null);
      return next;
    });
  };

  const handlePaEditDetails = () => {
    // For backend-provided confirmation steps, the backend "edit" action isn't reliable.
    // Instead, jump back to the most recent *form* step so the user can edit their inputs.
    setPaStepHistory((prev) => {
      for (let i = prev.length - 1; i >= 0; i -= 1) {
        const candidate = prev[i];
        if (candidate && typeof candidate === 'object' && (candidate as GuidedStepResponse).type === 'form') {
          setPaStepPayload(candidate);
          setPaFieldErrors({});
          setPaPendingAction(null);
          return prev.slice(0, i);
        }
      }

      // Fallback: go back one step if no form step is found.
      if (prev.length > 0) {
        const last = prev[prev.length - 1];
        setPaStepPayload(last ?? null);
        setPaFieldErrors({});
        setPaPendingAction(null);
        return prev.slice(0, -1);
      }
      return prev;
    });
  };


  // --- Backend-driven Motor Private guided flow state ---
  const [motorSessionId, setMotorSessionId] = useState<string | null>(sessionId ?? null);
  const [motorStepPayload, setMotorStepPayload] = useState<GuidedStepResponse | null>(null);
  const [motorLoading, setMotorLoading] = useState(false);
  const [motorComplete, setMotorComplete] = useState(false);
  const [motorFieldErrors, setMotorFieldErrors] = useState<Record<string, string>>({});
  const [motorFormData, setMotorFormData] = useState<Record<string, unknown>>({});
  const [motorPendingAction, setMotorPendingAction] = useState<string | null>(null);
  const [motorConfirmationFieldTypes, setMotorConfirmationFieldTypes] = useState<Record<string, ConfirmationFieldConfig>>({});

  // Start or resume backend-driven Motor Private flow
  useEffect(() => {
    if (!isMotorPrivate || !userId) return;
    setMotorLoading(true);
    setMotorComplete(false);
    setMotorFieldErrors({});
    setMotorFormData({});
    setMotorConfirmationFieldTypes({});
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

    // Capture field metadata from the current step so the confirmation card can render
    // radio/yes-no controls (instead of falling back to text inputs).
    setMotorConfirmationFieldTypes((prev) => ({
      ...prev,
      ...buildConfirmationFieldTypeHintsFromStep(motorStepPayload),
    }));

    const mergedMotorData = mergeFormDataForSummary(motorFormData, payload);
    setMotorFormData(mergedMotorData);

    setMotorLoading(true);
    setMotorFieldErrors({});
    try {
      const payloadToSend = motorPendingAction ? { ...payload, action: motorPendingAction } : payload;
      const res = await sendChatMessage({
        session_id: sid,
        user_id: userId,
        form_data: payloadToSend
      });
      if (res?.session_id && res.session_id !== sid) setMotorSessionId(res.session_id);

      setMotorPendingAction(null);

      const resolved = await resolveNextStepWithAutoAdvance(
        res,
        (formData) => sendChatMessage({ session_id: sid, user_id: userId, form_data: formData }),
        mergedMotorData
      );

      if (!resolved || resolved.complete || !resolved.step) {
        setMotorComplete(true);
        setMotorStepPayload(null);
        onFormSubmitted?.();
        return;
      }

      setMotorStepPayload(resolved.step);
    } catch (err) {
      const validation = extractBackendValidationError(err);
      if (validation?.fieldErrors) {
        setMotorFieldErrors({
          ...validation.fieldErrors,
          _error: buildFormLevelErrorFromFieldErrors(validation.message, validation.fieldErrors),
        });
        const attemptedAction = payload && typeof payload['action'] === 'string' ? (payload['action'] as string) : null;
        if (attemptedAction) setMotorPendingAction(attemptedAction);
        return;
      }

      setMotorFieldErrors((prev) => ({
        ...prev,
        _error: extractErrorDetail(err) ?? 'Failed to submit. Please try again.',
      }));
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
  const [travelPendingAction, setTravelPendingAction] = useState<string | null>(null);
  const [travelConsentIds, setTravelConsentIds] = useState<string[]>([]);

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
    setTravelConsentIds([]);
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

  useEffect(() => {
    if (!travelStepPayload || travelStepPayload.type !== 'consent') return;
    const ids = (travelStepPayload.consents ?? [])
      .map((c) => String(c?.id ?? '').trim())
      .filter(Boolean);
    setTravelConsentIds(ids);
  }, [travelStepPayload]);

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

    const mergedTravelData = mergeFormDataForSummary(travelFormData, payload);
    setTravelFormData(mergedTravelData);

    setTravelLoading(true);
    setTravelFieldErrors({});
    try {
      const coerceStoredBool = (raw: unknown): boolean => {
        if (typeof raw === 'boolean') return raw;
        if (typeof raw === 'number') return raw !== 0;
        const s = raw == null ? '' : String(raw).trim().toLowerCase();
        return s === 'true' || s === '1' || s === 'yes' || s === 'on';
      };

      // Travel consent can be represented as a dedicated `consent` step.
      // If validation errors occur after consent, the backend may require consent flags to be
      // present along with subsequent personal-detail fields; carry them forward explicitly.
      const carriedConsents: Record<string, unknown> = {};
      for (const id of travelConsentIds) {
        if (!id) continue;
        if (Object.prototype.hasOwnProperty.call(payload, id)) continue;
        carriedConsents[id] = coerceStoredBool(mergedTravelData[id]);
      }

      const basePayload = {
        ...carriedConsents,
        ...payload,
      };
      const payloadToSend = travelPendingAction ? { ...basePayload, action: travelPendingAction } : basePayload;
      const res = await sendChatMessage({
        session_id: sid,
        user_id: userId,
        form_data: payloadToSend,
      });

      if (res?.session_id && res.session_id !== sid) setTravelSessionId(res.session_id);

      const resolved = await resolveNextStepWithAutoAdvance(
        res,
        (formData) => sendChatMessage({ session_id: sid, user_id: userId, form_data: formData }),
        mergedTravelData
      );

      if (!resolved || resolved.complete || !resolved.step) {
        setTravelComplete(true);
        setTravelStepPayload(null);
        onFormSubmitted?.();
        return;
      }

      setTravelPendingAction(null);
      setTravelStepPayload(resolved.step);
    } catch (err) {
      const validation = extractBackendValidationError(err);
      if (validation?.fieldErrors) {
        const fieldErrorKeys = Object.keys(validation.fieldErrors)
          .map((k) => String(k ?? '').trim())
          .filter(Boolean);

        const isConsentOrTermsKey = (key: string): boolean => {
          if (!key) return false;
          if (key === 'terms_and_conditions_agreed') return true;
          return travelConsentIds.includes(key);
        };

        // If we're on a consent step:
        // - keep rendering the consent card when backend only complains about consents/terms
        // - otherwise switch to a generated form so required personal details render
        if (travelStepPayload?.type === 'consent') {
          const hasNonConsentErrors = fieldErrorKeys.some((k) => !isConsentOrTermsKey(k) && !k.startsWith('_'));
          if (hasNonConsentErrors) {
            setTravelStepPayload(buildFormStepFromFieldErrors(validation.message, validation.fieldErrors));
          }
        } else {
          // Some Travel flows return validation errors for required personal details immediately
          // after consent. Convert those field errors into a renderable form step so the user can
          // provide the missing details.
          const nextStep = travelStepPayload?.type === 'form'
            ? (appendMissingFieldsFromFieldErrors(travelStepPayload, validation.message, validation.fieldErrors) ?? travelStepPayload)
            : buildFormStepFromFieldErrors(validation.message, validation.fieldErrors);
          setTravelStepPayload(nextStep);
        }
        setTravelFieldErrors({
          ...validation.fieldErrors,
          _error: buildFormLevelErrorFromFieldErrors(validation.message, validation.fieldErrors),
        });
        const attemptedAction = payload && typeof payload['action'] === 'string' ? (payload['action'] as string) : null;
        if (attemptedAction) setTravelPendingAction(attemptedAction);
        return;
      }

      setTravelFieldErrors((prev) => ({
        ...prev,
        _error: extractErrorDetail(err) ?? 'Failed to submit. Please try again.',
      }));
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
        onBack={paStepHistory.length > 0 ? handlePaBack : undefined}
        onEditDetails={paStepHistory.length > 0 ? handlePaEditDetails : undefined}
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
        confirmationFieldTypeHints={motorConfirmationFieldTypes}
        // Motor final form step contains "car usage"; show Review -> confirmation card there.
        confirmOnFormSubmit={shouldConfirmMotorBeforeSubmit(motorStepPayload)}
        confirmOnPremiumSummaryActions={false}
      />
    );
  }

  // Render logic for TravelPlus only (backend-driven)
  if (isTravelSurePlus) {
    if (travelComplete) {
      if (onFormStepActive) onFormStepActive(false);
      return null;
    }
    if (travelLoading && !travelStepPayload) {
      if (onFormStepActive) onFormStepActive(false);
      return <LoadingBubble />;
    }
    if (!travelStepPayload) {
      if (onFormStepActive) onFormStepActive(false);
      return <LoadingBubble />;
    }
    // If the current step is a form, notify parent to disable input
    if (onFormStepActive) onFormStepActive(travelStepPayload.type === 'form');
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
