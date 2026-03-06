import React, { useEffect, useMemo, useState, useRef } from "react";

import ConfirmationCard from "../chatbot/messages/ConfirmationCard";
import { PaymentLoadingScreen } from "../chatbot/messages/PaymentLoadingScreen";
import { MobileMoneyForm } from "../chatbot/messages/MobileMoneyForm";
import { PaymentMethodSelector, type PaymentMethod } from "../chatbot/messages/PaymentMethodSelector";

import CardForm, { type CardFieldConfig } from "./CardForm";

import type { CardFieldConfig as ConfirmationFieldConfig } from "../chatbot/messages/ConfirmationCard";

// ...existing code...
import type { GuidedStepResponse } from "../../services/api";

interface GuidedStepRendererProps {
  step: GuidedStepResponse | null;
  values: Record<string, string>;
  errors?: Record<string, string>;
  onClearError?: (name: string) => void;
  onChange: (name: string, value: string) => void;
  onSubmit: (payload: Record<string, unknown>) => void;
  onBack?: () => void;
  loading?: boolean;
  titleFallback?: string;
  confirmOnFormSubmit?: boolean;
  confirmationFieldTypeHints?: Record<string, ConfirmationFieldConfig>;
  confirmOnPremiumSummaryActions?: boolean;
}

export const GuidedStepRenderer: React.FC<GuidedStepRendererProps> = ({
  step,
  values,
  errors,
  onClearError,
  onChange,
  onSubmit,
  onBack,
  loading = false,
  titleFallback,
  confirmOnFormSubmit = false,
  confirmationFieldTypeHints,
  confirmOnPremiumSummaryActions = false,
}) => {
  // Confirmation summary state
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationData, setConfirmationData] = useState<Record<string, unknown> | null>(null);
  // Quote submission UX: after user submits the confirmation card, show thank-you first,
  // then keep the analyzing screen visible until the backend actually advances the step.
  const [awaitingQuoteResult, setAwaitingQuoteResult] = useState(false);
  const [submittedStepKey, setSubmittedStepKey] = useState<string | null>(null);
  const [quoteButtonDisabled, setQuoteButtonDisabled] = useState(false);
  // Ref to scroll to bottom after loading
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // Allow showing confirmation even if step is null, since we might be confirming after the last step.

  const humanizeKey = (key: string): string => {
    const s = String(key ?? '').trim();
    if (!s) return '';
    return s
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

  const isPaymentLikeFormStep = (s: Extract<GuidedStepResponse, { type: 'form' }>): boolean => {
    const fields = s.fields ?? [];
    const names = fields.map((f) => String(f.name ?? '').trim().toLowerCase()).filter(Boolean);
    const message = String(s.message ?? '').toLowerCase();

    const hasPaymentKeyword = message.includes('pay') || message.includes('payment') || message.includes('checkout');

    const hasPaymentMethod = names.some((n) => n === 'payment_method' || n === 'paymentmethod' || n.includes('payment_method'));
    const hasPhone = names.some((n) =>
      n === 'phone_number' ||
      n === 'phonenumber' ||
      n.includes('phone') ||
      n.includes('msisdn') ||
      n.includes('mobile')
    );

    const hasProvider = names.some((n) => n === 'provider' || n.includes('provider'));
    const hasAmount = names.some((n) => n.includes('amount') || n.includes('premium'));
    const hasOtpOrPin = names.some((n) => n.includes('otp') || n.includes('pin') || n.includes('verification'));
    const hasTxnRef = names.some((n) => n.includes('transaction') || n.includes('tx') || n.includes('reference'));

    // Payment steps should NEVER go through CardForm (progressive reveal),
    // because payment UI has its own dedicated components.
    // Be intentionally inclusive here to avoid misrouting payment fields.
    if (hasPaymentMethod) return true;
    if (hasProvider) return true;
    if (hasOtpOrPin) return true;
    if (hasTxnRef) return true;
    if (hasPhone && (hasPaymentKeyword || hasAmount)) return true;
    if (hasAmount && hasPaymentKeyword) return true;
    return false;
  };

  const normalizeOptions = (opts: unknown): Array<{ label: string; value: string }> => {
    if (!Array.isArray(opts)) return [];
    return opts
      .map((o) => {
        if (typeof o === "string") {
          const s = o.trim();
          return s ? { label: s, value: s } : null;
        }
        if (!o || typeof o !== 'object') return null;
        const rec = o as Record<string, unknown>;
        const rawLabel = rec['label'];
        const rawValue = rec['value'];
        const label = typeof rawLabel === 'string' ? rawLabel : (typeof rawValue === 'string' ? rawValue : '');
        const value = typeof rawValue === 'string' ? rawValue : (typeof rawLabel === 'string' ? rawLabel : '');
        const l = label.trim();
        const v = value.trim();
        if (!l || !v) return null;
        return { label: l, value: v };
      })
      .filter((x): x is { label: string; value: string } => !!x);
  };

  const buildConfirmationSummary = (
    allValues: Record<string, string>,
    currentPayload: Record<string, unknown>
  ): Record<string, unknown> => {
    const next: Record<string, unknown> = {};

    const addIfMeaningful = (key: string, value: unknown) => {
      const k = String(key ?? '').trim();
      if (!k) return;
      if (k.startsWith('_')) return;
      if (value == null) return;
      const s = String(value).trim();
      if (!s) return;
      next[k] = value;
    };

    for (const [k, v] of Object.entries(allValues ?? {})) {
      addIfMeaningful(k, v);
    }
    for (const [k, v] of Object.entries(currentPayload ?? {})) {
      addIfMeaningful(k, v);
    }
    return next;
  };

  const handlePremiumSummarySubmit = (payload: Record<string, unknown>) => {
    const payloadWithPremium: Record<string, unknown> = (() => {
      if (!step || step.type !== 'premium_summary') return payload;
      if (payload && payload['premium_amount'] != null) return payload;

      const raw = (step as unknown as Record<string, unknown>)['monthly_premium'] ?? (step as unknown as Record<string, unknown>)['annual_premium'];
      const premiumAmount = (() => {
        if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
        if (typeof raw === 'string') {
          const n = Number(raw);
          return Number.isFinite(n) ? n : null;
        }
        return null;
      })();

      return premiumAmount != null ? { ...payload, premium_amount: premiumAmount } : payload;
    })();

    if (!confirmOnPremiumSummaryActions) {
      onSubmit(payloadWithPremium);
      return;
    }
    setConfirmationData(buildConfirmationSummary(values, payloadWithPremium));
    setShowConfirmation(true);
  };

  const confirmationLabels = useMemo(() => {
    if (!confirmationData) return {} as Record<string, string>;
    const next: Record<string, string> = {};
    for (const key of Object.keys(confirmationData)) {
      next[key] = humanizeKey(key) || key;
    }
    return next;
  }, [confirmationData]);

  const confirmationFieldTypes = useMemo(() => {
    const next: Record<string, ConfirmationFieldConfig> = {
      ...(confirmationFieldTypeHints ?? {}),
    };
    if (!step || step.type !== 'form' || !Array.isArray(step.fields)) return next;
    for (const f of step.fields ?? []) {
      const name = String(f.name ?? '').trim();
      if (!name) continue;
      const label = typeof f.label === 'string' ? f.label : name;
      next[name] = {
        name,
        label,
        type: String(f.type ?? 'text'),
        required: Boolean(f.required),
        placeholder: typeof f.placeholder === 'string' ? f.placeholder : undefined,
        options: normalizeOptions(f.options),
      };
    }
    return next;
  }, [confirmationFieldTypeHints, step]);

  const getStepKey = (s: GuidedStepResponse | null): string => {
    if (!s) return "__null__";
    if (s.type !== "form") return s.type;
    const fieldKey = Array.isArray(s.fields)
      ? s.fields.map((f) => `${String(f.name)}:${String(f.type ?? "")}`).join("|")
      : "";
    return `form::${fieldKey}`;
  };

   // Modular handler: show loader, then return to chat
  const handleSubmitFromReview = () => {
    if (!confirmationData) return;

    // Only submit the fields that belong to the current backend step.
    // The confirmation card may show *all* accumulated values, but the backend
    // session already holds previous steps; sending extra keys can cause validation issues.
    const nextPayload: Record<string, unknown> = {};
    if (confirmationData && typeof confirmationData['action'] === 'string') {
      nextPayload['action'] = confirmationData['action'];
    }

    // Re-normalize the current step's fields (e.g., number inputs) in case the user
    // edited values on the confirmation card (which are strings).
    const payloadToSend: Record<string, unknown> = nextPayload;
    if (step && step.type === "form" && "fields" in step && Array.isArray(step.fields)) {
      for (const f of step.fields ?? []) {
        const raw = payloadToSend[f.name] ?? values[f.name] ?? "";
        const fromReview = (confirmationData as Record<string, unknown>)[f.name];
        const rawFromReview = fromReview ?? raw;
        const t = String(f.type ?? "").toLowerCase();
        const rawStr = rawFromReview == null ? "" : String(rawFromReview);

        if (t === "number" || t === "integer") {
          const trimmed = rawStr.trim();
          if (!trimmed) {
            payloadToSend[f.name] = "";
          } else {
            const n = t === "integer" ? Number.parseInt(trimmed, 10) : Number(trimmed);
            payloadToSend[f.name] = Number.isFinite(n) ? n : trimmed;
          }
          continue;
        }

        if (t === "checkbox-group") {
          const trimmed = rawStr.trim();
          payloadToSend[f.name] = trimmed
            ? trimmed.split(",").map((s) => s.trim()).filter(Boolean)
            : [];
          continue;
        }

        payloadToSend[f.name] = rawFromReview;
      }
    }

    setQuoteButtonDisabled(true);
    setSubmittedStepKey(getStepKey(step));
    setAwaitingQuoteResult(true);
    onSubmit(payloadToSend);
  };

  // Determine whether the backend has advanced to a new step since the user submitted.
  // Used to stop showing the analyzing screen without needing effect-driven state resets.
  const didAdvance = useMemo(() => {
    const currentKey = getStepKey(step);
    const submittedFromNullStep = submittedStepKey === "__null__";
    return submittedFromNullStep
      ? step != null
      : (!step || step.type !== "form" || (submittedStepKey != null && currentKey !== submittedStepKey));
  }, [step, submittedStepKey]);

  useEffect(() => {
    if (!awaitingQuoteResult) return;
    if (!didAdvance) return;
    // Scroll so the next step (e.g., premium summary) is in view.
    const t = window.setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
    return () => window.clearTimeout(t);
  }, [awaitingQuoteResult, didAdvance]);

  if (awaitingQuoteResult && !didAdvance) {
    return (
      <>
        <div className="flex w-full justify-start mb-2 animate-fade-in">
          <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-2 max-w-[80%] break-words">
            <div className="break-words whitespace-pre-wrap leading-relaxed text-base">
              Thank you! Your details have been submitted.
            </div>
          </div>
        </div>
        <PaymentLoadingScreen variant="quote" />
        <div ref={messagesEndRef} />
      </>
    );
  }

  if (showConfirmation && confirmationData && !didAdvance) {
    return (
      <>
        <ConfirmationCard
          data={confirmationData}
          labels={confirmationLabels}
          fieldTypes={confirmationFieldTypes}
          // ...existing code...
          onEdit={(values) => {
            setConfirmationData(values);
          }}
          confirmDisabled={quoteButtonDisabled}
          onGetQuote={handleSubmitFromReview}
        />
        <div ref={messagesEndRef} />
      </>
    );
  }



  if (!step) return null;

  const buildPayloadFromValues = () => {
    const payloadToSend: Record<string, unknown> = {};

    if (step.type !== "form" || !Array.isArray(step.fields)) {
      return { ...values } as Record<string, unknown>;
    }

    for (const f of step.fields ?? []) {
      const raw = values[f.name] ?? "";
      const t = String(f.type ?? "").toLowerCase();
      const rawStr = raw == null ? "" : String(raw);

      if (t === "number" || t === "integer") {
        const trimmed = rawStr.trim();
        if (!trimmed) {
          payloadToSend[f.name] = "";
        } else {
          const n = t === "integer" ? Number.parseInt(trimmed, 10) : Number(trimmed);
          payloadToSend[f.name] = Number.isFinite(n) ? n : trimmed;
        }
        continue;
      }

      if (t === "checkbox-group") {
        const trimmed = rawStr.trim();
        payloadToSend[f.name] = trimmed
          ? trimmed.split(",").map((s) => s.trim()).filter(Boolean)
          : [];
        continue;
      }

      payloadToSend[f.name] = raw;
    }

    return payloadToSend;
  };

  switch (step.type) {
      case "form":
        if (isPaymentLikeFormStep(step as Extract<GuidedStepResponse, { type: 'form' }>)) {
          return (
            <ProceedToPaymentStep
              step={step as unknown as ProceedToPaymentLikeStep}
              loading={loading}
              onSubmit={onSubmit}
            />
          );
        }

        // Backend-driven product form step: render fields using the existing CardForm.
        return (
          <CardForm
            title={String(titleFallback ?? "Quote Details")}
            description={step.message}
            fields={(step.fields ?? []).map((f) =>
              ({
                name: f.name,
                label: f.label,
                type: f.type,
                required: f.required,
                placeholder: f.placeholder,
                minLength: f.minLength,
                maxLength: f.maxLength,
                options: normalizeOptions(f.options),
                defaultValue: f.defaultValue,
              }) as CardFieldConfig
            )}
            values={values}
            externalErrors={errors}
            onClearExternalError={onClearError}
            onChange={onChange}
            showBack={!!onBack}
            onBack={onBack}
            nextButtonLabel={confirmOnFormSubmit ? "Review" : "Continue"}
            nextDisabled={loading}
            onNext={() => {
              const payloadToSend = buildPayloadFromValues();
              if (confirmOnFormSubmit) {
                setConfirmationData(buildConfirmationSummary(values, payloadToSend));
                setShowConfirmation(true);
                return;
              }
              onSubmit(payloadToSend);
            }}
          />
        );
    case "product_cards":
      return (
        <ProductCardsStep
          step={step as Extract<GuidedStepResponse, { type: "product_cards" }>}
          onSubmit={onSubmit}
          loading={loading}
        />
      );
    case "premium_summary":
      // A summary card showing prices and action buttons.
      return (
        <PremiumSummaryStep
          step={step as Extract<GuidedStepResponse, { type: "premium_summary" }>}
          onSubmit={handlePremiumSummarySubmit}
          loading={loading}
        />
      );
    case "confirmation":
      return (
        <BackendConfirmationStep
          step={step as Extract<GuidedStepResponse, { type: "confirmation" }>}
          loading={loading}
          onSubmit={(payload) => {
            const action = payload && typeof payload['action'] === 'string' ? String(payload['action']) : '';
            // For "confirm" we show the thank-you/analyzing screen until backend advances.
            if (action && action !== 'edit') {
              setQuoteButtonDisabled(true);
              setSubmittedStepKey(getStepKey(step));
              setAwaitingQuoteResult(true);
            }
            onSubmit(payload);
          }}
        />
      );
    case "yes_no_details":
      return (
        <CardForm
          title={String(titleFallback ?? "Quote Details")}
          description={step.message}
          fields={((): CardFieldConfig[] => {
            const choiceName = String(step.question_id ?? '').trim() || '_raw';
            const fields: CardFieldConfig[] = [
              {
                name: choiceName,
                label: "Select one",
                type: "radio",
                required: true,
                options: (step.options ?? []).map((o) => ({ label: o.label, value: o.id })),
              },
            ];

            if (step.details_field) {
              fields.push({
                name: step.details_field.name,
                label: step.details_field.label,
                type: "text",
                required: false,
                showIf: { field: choiceName, value: step.details_field.show_when },
              });
            }
            return fields;
          })()}
          values={values}
          externalErrors={errors}
          onClearExternalError={onClearError}
          onChange={onChange}
          showBack={!!onBack}
          onBack={onBack}
          nextButtonLabel="Continue"
          nextDisabled={loading}
          onNext={() => {
            const key = String(step.question_id ?? '').trim() || '_raw';
            const choice = String(values[key] ?? '').trim();
            const payload: Record<string, unknown> = { [key]: choice };
            if (step.details_field && choice === step.details_field.show_when) {
              const extra = String(values[step.details_field.name] ?? '').trim();
              if (extra) payload[step.details_field.name] = extra;
            }
            onSubmit(payload);
          }}
        />
      );
    case "checkbox":
      return (
        <CardForm
          title={String(titleFallback ?? "Quote Details")}
          description={step.message}
          fields={((): CardFieldConfig[] => {
            const selectedFieldName = step.field_name && step.field_name.trim() ? step.field_name : "risky_activities";
            const fields: CardFieldConfig[] = [
              {
                name: selectedFieldName,
                label: "Select all that apply",
                type: "checkbox-group",
                required: false,
                options: (step.options ?? []).map((o) => ({ label: o.label, value: o.id })),
              },
            ];

            if (step.other_field) {
              fields.push({
                name: step.other_field.name,
                label: step.other_field.label,
                type: "text",
                required: false,
              });
            }
            return fields;
          })()}
          values={values}
          externalErrors={errors}
          onClearExternalError={onClearError}
          onChange={onChange}
          showBack={!!onBack}
          onBack={onBack}
          nextButtonLabel="Continue"
          nextDisabled={loading}
          onNext={() => {
            const selectedFieldName = step.field_name && step.field_name.trim() ? step.field_name : "risky_activities";
            const raw = String(values[selectedFieldName] ?? '');
            const selected = raw
              ? raw.split(',').map((s) => s.trim()).filter(Boolean)
              : [];

            const payload: Record<string, unknown> = { [selectedFieldName]: selected };

            if (step.other_field) {
              const other = String(values[step.other_field.name] ?? '').trim();
              if (other) payload[step.other_field.name] = other;
            } else {
              const other = String(values['risky_activity_other'] ?? '').trim();
              if (other) payload['risky_activity_other'] = other;
            }

            onSubmit(payload);
          }}
        />
      );
    case "radio":
      return (
        <CardForm
          title={String(titleFallback ?? "Quote Details")}
          description={step.message}
          fields={((): CardFieldConfig[] => {
            const key = step.question_id && step.question_id.trim() ? step.question_id : "_raw";
            return [
              {
                name: key,
                label: "Select one",
                type: "radio",
                required: step.required ?? true,
                options: (step.options ?? []).map((o) => ({ label: o.label, value: o.id })),
              },
            ];
          })()}
          values={values}
          externalErrors={errors}
          onClearExternalError={onClearError}
          onChange={onChange}
          showBack={!!onBack}
          onBack={onBack}
          nextButtonLabel="Continue"
          nextDisabled={loading}
          onNext={() => {
            const key = step.question_id && step.question_id.trim() ? step.question_id : "_raw";
            onSubmit({ [key]: String(values[key] ?? '').trim() });
          }}
        />
      );
    case "options":
      return (
        <CardForm
          title={String(titleFallback ?? "Quote Details")}
          description={step.message ?? "Select an option"}
          fields={[
            {
              name: "_raw",
              label: "Select one",
              type: "radio",
              required: true,
              options: (step.options ?? []).map((o) => ({ label: o.label, value: o.id })),
            },
          ]}
          values={values}
          externalErrors={errors}
          onClearExternalError={onClearError}
          onChange={onChange}
          showBack={!!onBack}
          onBack={onBack}
          nextButtonLabel="Continue"
          nextDisabled={loading}
          onNext={() => {
            onSubmit({ _raw: String(values['_raw'] ?? '').trim() });
          }}
        />
      );
    case "file_upload":
      return (
        <CardForm
          title={String(titleFallback ?? "Quote Details")}
          description={step.message}
          fields={[
            {
              name: step.field_name,
              label: "Upload file",
              type: "file",
              required: true,
              accept: step.accept ?? "application/pdf",
            },
          ]}
          values={values}
          externalErrors={errors}
          onClearExternalError={onClearError}
          onChange={onChange}
          showBack={!!onBack}
          onBack={onBack}
          nextButtonLabel="Continue"
          nextDisabled={loading}
          onNext={() => {
            onSubmit({ [step.field_name]: String(values[step.field_name] ?? '').trim() });
          }}
        />
      );
    case "final_confirmation":
      // The last step: confirm / proceed.
      return <FinalConfirmationStep step={step as Extract<GuidedStepResponse, { type: "final_confirmation" }> } onSubmit={onSubmit} onBack={onBack} loading={loading} />;
    case "message":
      // Just show a message.
      return <MessageStep step={step as Extract<GuidedStepResponse, { type: "message" }> } />;
    case "payment_method":
      return (
        <BackendPaymentMethodStep
          step={step as Extract<GuidedStepResponse, { type: "payment_method" }>}
          loading={loading}
          onSubmit={onSubmit}
        />
      );
    case "proceed_to_payment":
      return (
        <ProceedToPaymentStep
          step={step as unknown as ProceedToPaymentLikeStep}
          loading={loading}
          onSubmit={onSubmit}
        />
      );
    default:
      return null;
  }
};

type ProceedToPaymentLikeStep = {
  message?: string;
  quote_id?: string;
  [k: string]: unknown;
};

const PremiumSummaryStep: React.FC<{
  step: Extract<GuidedStepResponse, { type: "premium_summary" }>;
  onSubmit: (payload: Record<string, unknown>) => void;
  loading: boolean;
}> = ({ step, onSubmit, loading }) => {
  return (
    <div className="w-full rounded-2xl p-6 border border-gray-200 bg-white">
      <h3 className="text-lg font-semibold text-primary mb-2">{step.message ?? "Your premium"}</h3>
      <p className="text-2xl font-bold text-gray-900">UGX {Number(step.monthly_premium ?? 0).toLocaleString()} / month</p>
      <p className="text-sm text-gray-600">UGX {Number(step.annual_premium ?? 0).toLocaleString()} / year</p>
      <div className="mt-3 text-sm text-gray-700">Cover limit: UGX {Number(step.cover_limit_ugx ?? 0).toLocaleString()}</div>

      {(step.benefits?.length ?? 0) > 0 && (
        <ul className="mt-4 list-disc list-inside text-sm text-gray-700">
          {step.benefits?.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {(step.actions ?? []).map((a) => (
          <button
            key={a.type}
            type="button"
            disabled={loading}
            onClick={() => onSubmit({ action: a.type })}
            className="px-4 py-2 rounded-lg border border-primary text-primary hover:bg-green-50 disabled:opacity-60"
          >
            {a.label}
          </button>
        ))}
      </div>
    </div>
  );
};

type BackendPaymentMethodOption = {
  id: string;
  label: string;
  providers?: string[];
  icon?: string;
};

const BackendPaymentMethodStep: React.FC<{
  step: Extract<GuidedStepResponse, { type: 'payment_method' }>;
  onSubmit: (payload: Record<string, unknown>) => void;
  loading: boolean;
}> = ({ step, onSubmit, loading }) => {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);

  const quoteId = (() => {
    const direct = typeof step.quote_id === 'string' ? step.quote_id : null;
    if (direct) return direct;
    const maybeData = (step as unknown as Record<string, unknown>)['data'];
    if (maybeData && typeof maybeData === 'object' && maybeData !== null) {
      const q = (maybeData as Record<string, unknown>)['quote_id'];
      if (typeof q === 'string') return q;
    }
    return null;
  })();

  const options: BackendPaymentMethodOption[] = Array.isArray(step.options)
    ? (step.options as BackendPaymentMethodOption[])
    : [];

  const premiumAmount = (() => {
    const candidates: unknown[] = [
      (step as unknown as Record<string, unknown>)['premium_amount'],
      step.amount,
      (step as unknown as Record<string, unknown>)['amount'],
    ];
    const maybeData = (step as unknown as Record<string, unknown>)['data'];
    if (maybeData && typeof maybeData === 'object' && maybeData !== null) {
      candidates.push(
        (maybeData as Record<string, unknown>)['premium_amount'],
        (maybeData as Record<string, unknown>)['amount'],
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
  })();

  const selectedOption = selectedOptionId
    ? options.find((o) => o.id === selectedOptionId) ?? null
    : null;

  const providers = Array.isArray(selectedOption?.providers)
    ? (selectedOption?.providers ?? []).filter((p) => typeof p === 'string' && p.trim())
    : [];

  const formatProviderId = (p: string): PaymentMethod | null => {
    const cleaned = p.trim().toUpperCase();
    if (cleaned === 'MTN') return 'MTN';
    if (cleaned === 'AIRTEL') return 'AIRTEL';
    if (cleaned === 'FLEXIPAY') return 'FLEXIPAY';
    return null;
  };

  const renderOptionButtons = () => {
    return (
      <div className="space-y-3">
        {options.map((opt) => {
          const isSelected = selectedOptionId === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              disabled={loading}
              onClick={() => {
                setSelectedOptionId(opt.id);
                setSelectedProvider(null);

                // For non-mobile-money paths, submit immediately and let backend drive the next step.
                if (opt.id !== 'mobile_money') {
                  const payload: Record<string, unknown> = {
                    action: opt.id,
                    payment_method: opt.id,
                  };
                  if (quoteId) payload.quote_id = quoteId;
                  if (premiumAmount != null) payload.premium_amount = premiumAmount;
                  onSubmit(payload);
                }
              }}
              className={[
                'w-full flex items-center gap-3 p-3 border-2 rounded-xl min-h-[48px] transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-60',
                isSelected ? 'border-primary bg-green-50' : 'border-gray-200 bg-white hover:border-primary',
              ].join(' ')}
            >
              <div
                className={[
                  'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0',
                  isSelected ? 'border-primary' : 'border-gray-300',
                ].join(' ')}
              >
                {isSelected ? <div className="w-2.5 h-2.5 rounded-full bg-primary" /> : null}
              </div>
              <span className="text-gray-900 font-medium text-sm flex-1 text-left">{opt.label}</span>
            </button>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return <PaymentLoadingScreen variant="payment" />;
  }

  // If the backend wants the user to pick a method, keep the same payment-card design.
  return (
    <div className="flex justify-start mb-4 mt-4 w-full">
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200 w-full">
        <div className="px-5 py-3 bg-green-50 border-b border-green-100">
          <p className="text-gray-700 text-sm font-medium">
            {step.message ?? 'Choose your payment method'}
          </p>
          {typeof step.amount === 'number' ? (
            <p className="text-gray-700 text-xs mt-1">Amount: UGX {Number(step.amount).toLocaleString()}</p>
          ) : null}
        </div>

        <div className="px-5 py-4">
          {selectedOptionId == null ? (
            renderOptionButtons()
          ) : selectedOptionId === 'mobile_money' && selectedProvider == null ? (
            // Mobile money: use provider selection, then show the existing phone-number form.
            <div className="space-y-3">
              {(providers.length > 0 ? providers : ['MTN', 'Airtel']).map((p) => {
                const providerId = formatProviderId(p);
                const display = p.trim();
                const isSelected = selectedProvider === display;
                return (
                  <button
                    key={display}
                    type="button"
                    disabled={loading || providerId == null}
                    onClick={() => {
                      if (!providerId) return;
                      setSelectedProvider(display);
                    }}
                    className={[
                      'w-full flex items-center gap-3 p-3 border-2 rounded-xl min-h-[48px] transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-60',
                      isSelected ? 'border-primary bg-green-50' : 'border-gray-200 bg-white hover:border-primary',
                    ].join(' ')}
                  >
                    <div
                      className={[
                        'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0',
                        isSelected ? 'border-primary' : 'border-gray-300',
                      ].join(' ')}
                    >
                      {isSelected ? <div className="w-2.5 h-2.5 rounded-full bg-primary" /> : null}
                    </div>
                    <span className="text-gray-900 font-medium text-sm flex-1 text-left">{display}</span>
                  </button>
                );
              })}

              <button
                type="button"
                disabled={loading}
                onClick={() => {
                  setSelectedOptionId(null);
                  setSelectedProvider(null);
                }}
                className="w-full text-sm text-primary underline underline-offset-2"
              >
                Change method
              </button>
            </div>
          ) : selectedOptionId === 'mobile_money' && selectedProvider != null ? (
            <MobileMoneyForm
              isLoading={loading}
              onSubmitPayment={(phoneNumber) => {
                const providerId = formatProviderId(selectedProvider) ?? formatProviderId(selectedProvider.toUpperCase());
                const payload: Record<string, unknown> = {
                  action: 'mobile_money',
                  payment_method: 'mobile_money',
                  provider: providerId ?? selectedProvider,
                  phone_number: phoneNumber,
                };
                if (quoteId) payload.quote_id = quoteId;
                if (premiumAmount != null) payload.premium_amount = premiumAmount;
                onSubmit(payload);
              }}
            />
          ) : (
            <div className="text-sm text-gray-700">
              {selectedOption?.label ?? 'Proceeding...'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ProceedToPaymentStep: React.FC<{
  step: ProceedToPaymentLikeStep;
  onSubmit: (payload: Record<string, unknown>) => void;
  loading: boolean;
}> = ({ step, onSubmit, loading }) => {
  const [method, setMethod] = useState<PaymentMethod | null>(null);

  const quoteId = (() => {
    const direct = typeof step.quote_id === 'string' ? step.quote_id : null;
    if (direct) return direct;
    const maybeData = (step as unknown as Record<string, unknown>)['data'];
    if (maybeData && typeof maybeData === 'object' && maybeData !== null) {
      const q = (maybeData as Record<string, unknown>)['quote_id'];
      if (typeof q === 'string') return q;
    }
    return null;
  })();

  const premiumAmount = (() => {
    const candidates: unknown[] = [
      (step as unknown as Record<string, unknown>)['premium_amount'],
      (step as unknown as Record<string, unknown>)['amount'],
      (step as unknown as Record<string, unknown>)['premium'],
      (step as unknown as Record<string, unknown>)['monthly_premium'],
    ];
    const maybeData = (step as unknown as Record<string, unknown>)['data'];
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
  })();

  if (loading) {
    return <PaymentLoadingScreen variant="payment" />;
  }

  return (
    <div className="w-full">
      {step.message ? (
        <div className="w-full rounded-2xl p-4 border border-gray-200 bg-white">
          <p className="text-gray-900 text-sm">{step.message}</p>
        </div>
      ) : null}

      {method == null ? (
        <PaymentMethodSelector
          onSelectMethod={(m) => {
            setMethod(m);
          }}
        />
      ) : method === 'FLEXIPAY' ? (
        <div className="w-full rounded-2xl p-4 border border-gray-200 bg-white mt-4">
          <p className="text-gray-900 text-sm">
            FlexiPay is coming soon. Please use MTN or Airtel Mobile Money for now.
          </p>
        </div>
      ) : (
        <MobileMoneyForm
          isLoading={loading}
          onSubmitPayment={(phoneNumber) => {
            const payload: Record<string, unknown> = {
              payment_method: method,
              phone_number: phoneNumber,
            };
            if (quoteId) payload.quote_id = quoteId;
            if (premiumAmount != null) payload.premium_amount = premiumAmount;
            onSubmit(payload);
          }}
        />
      )}
    </div>
  );
};

const ProductCardsStep: React.FC<{
  step: Extract<GuidedStepResponse, { type: "product_cards" }>;
  onSubmit: (payload: Record<string, unknown>) => void;
  loading: boolean;
}> = ({ step, onSubmit, loading }) => {
  return (
    <div className="w-full rounded-2xl p-6 border border-gray-200 bg-white">
      <p className="font-medium text-gray-900 mb-4">{step.message ?? "Select an option"}</p>
      <div className="flex flex-col gap-3">
        {(step.products ?? []).map((p) => (
          <button
            key={p.id}
            type="button"
            disabled={loading}
            onClick={() => {
              const action = p.action && p.action.trim() ? p.action : 'select_cover';
              onSubmit({ action, cover_id: p.id, product_id: p.id });
            }}
            className="w-full text-left px-4 py-3 rounded-xl border border-gray-200 hover:border-primary/40 hover:bg-primary/5 disabled:opacity-60"
          >
            <div className="font-semibold text-gray-900">{p.label}</div>
            {p.description ? <div className="text-sm text-gray-600 mt-1">{p.description}</div> : null}
          </button>
        ))}
      </div>
    </div>
  );
};

// CardForm and FormStep removed as card payments are no longer supported.

const BackendConfirmationStep: React.FC<{
  step: Extract<GuidedStepResponse, { type: "confirmation" }>;
  onSubmit: (payload: Record<string, unknown>) => void;
  loading: boolean;
}> = ({ step, onSubmit, loading }) => {
  const summary = (step.summary && typeof step.summary === 'object')
    ? (step.summary as Record<string, Record<string, unknown>>)
    : {};

  const sections = Object.entries(summary);
  const actions = step.actions ?? [];

  const formatValue = (value: unknown): string => {
    if (value == null) return '—';
    if (typeof value === 'string') {
      const s = value.trim();
      return s ? s : '—';
    }
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    try {
      const s = JSON.stringify(value);
      return s && s !== '{}' ? s : '—';
    } catch {
      return String(value);
    }
  };

  return (
    <div className="w-full rounded-2xl p-6 border border-gray-200 bg-white">
      <p className="font-medium text-gray-900 mb-4">{step.message ?? "Please review your details"}</p>

      {sections.length > 0 ? (
        <div className="flex flex-col gap-4">
          {sections.map(([sectionName, fields]) => (
            <div key={sectionName} className="rounded-xl border border-gray-200 p-4">
              <div className="font-semibold text-gray-900 mb-3">{sectionName}</div>
              <div className="flex flex-col gap-2">
                {Object.entries(fields ?? {}).map(([k, v]) => (
                  <div key={k} className="flex items-start justify-between gap-3">
                    <div className="text-sm text-gray-600">{k}</div>
                    <div className="text-sm text-gray-900 text-right break-words">{formatValue(v)}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      <div className="flex gap-2 mt-5 flex-wrap">
        {actions.length > 0 ? (
          actions.map((a) => (
            <button
              key={a.type}
              type="button"
              disabled={loading}
              onClick={() => onSubmit({ action: a.type })}
              className={
                a.type === 'edit'
                  ? "px-4 py-2 rounded-lg border border-primary text-primary hover:bg-green-50 disabled:opacity-60"
                  : "px-4 py-2 rounded-lg bg-primary text-white hover:opacity-95 disabled:opacity-60"
              }
            >
              {a.label}
            </button>
          ))
        ) : (
          <button
            type="button"
            disabled={loading}
            onClick={() => onSubmit({ action: 'confirm' })}
            className="px-4 py-2 rounded-lg bg-primary text-white hover:opacity-95 disabled:opacity-60"
          >
            Confirm
          </button>
        )}
      </div>
    </div>
  );
};

const FinalConfirmationStep: React.FC<{
  step: Extract<GuidedStepResponse, { type: "final_confirmation" }>;
  onSubmit: (payload: Record<string, unknown>) => void;
  onBack?: () => void;
  loading: boolean;
}> = ({ step, onSubmit, onBack, loading }) => {
  // Some flows give us multiple buttons to show here.
  // If not provided, we show one default confirm button.
  const actions = step.actions ?? [];
  return (
    <div className="w-full rounded-2xl p-6 border border-gray-200 bg-white">
      <p className="font-medium text-gray-900 mb-3">{step.message ?? "Review and confirm"}</p>
      <div className="flex gap-2 mt-4">
        {onBack && (
          <button type="button" onClick={onBack} disabled={loading} className="px-4 py-2 border rounded-lg disabled:opacity-60">
            Edit
          </button>
        )}
        {actions.length > 0 ? (
          actions.map((a) => (
            <button
              key={a.type}
              type="button"
              disabled={loading}
              // We send { action: "..." } so the backend knows which button was clicked.
              onClick={() => onSubmit({ action: a.type })}
              className="px-4 py-2 bg-primary text-white rounded-lg disabled:opacity-60"
            >
              {a.label}
            </button>
          ))
        ) : (
          <button
            type="button"
            disabled={loading}
            // Default action if no buttons were provided.
            onClick={() => onSubmit({ action: "confirm" })}
            className="px-4 py-2 bg-primary text-white rounded-lg disabled:opacity-60"
          >
            Confirm & Proceed
          </button>
        )}
      </div>
    </div>
  );
};

const MessageStep: React.FC<{
  step: Extract<GuidedStepResponse, { type: "message" }>;
}> = ({ step }) => {
  return (
    <div className="w-full rounded-2xl p-6 border border-gray-200 bg-white">
      <p className="text-gray-900">{step.message}</p>
    </div>
  );
};
