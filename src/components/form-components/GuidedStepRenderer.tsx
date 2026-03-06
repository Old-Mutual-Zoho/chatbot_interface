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
    if (!confirmOnPremiumSummaryActions) {
      onSubmit(payload);
      return;
    }
    setConfirmationData(buildConfirmationSummary(values, payload));
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
		// Backend-driven form step: render fields using the existing CardForm.
		// This is what powers the guided quote experience (PA / Motor / Travel / Serenicare etc).
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
						// CardForm supports these optional keys; keep them if backend provides them.
						defaultValue: f.defaultValue,
					}) as CardFieldConfig)
				}
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
              // Show a full summary of all values captured so far (across steps).
              // Keep the current-step payload inside the confirmation as well.
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
      // A yes/no (or choice) question that may show an extra textbox.
      return <YesNoDetailsStep step={step as Extract<GuidedStepResponse, { type: "yes_no_details" }> } onSubmit={onSubmit} loading={loading} />;
    case "checkbox":
      // A list of checkboxes (multi-select).
      return <CheckboxStep step={step as Extract<GuidedStepResponse, { type: "checkbox" }> } onSubmit={onSubmit} loading={loading} />;
    case "radio":
      // A single-choice question.
      return <RadioStep step={step as Extract<GuidedStepResponse, { type: "radio" }> } onSubmit={onSubmit} loading={loading} />;
    case "options":
      // A list of selectable options (typically plan selection).
      return <OptionsStep step={step as Extract<GuidedStepResponse, { type: "options" }> } onSubmit={onSubmit} loading={loading} />;
    case "file_upload":
      // A file picker. For now we only send the filename (no real upload yet).
      return <FileUploadStep step={step as Extract<GuidedStepResponse, { type: "file_upload" }> } onSubmit={onSubmit} loading={loading} />;
    case "final_confirmation":
      // The last step: confirm / proceed.
      return <FinalConfirmationStep step={step as Extract<GuidedStepResponse, { type: "final_confirmation" }> } onSubmit={onSubmit} onBack={onBack} loading={loading} />;
    case "message":
      // Just show a message.
      return <MessageStep step={step as Extract<GuidedStepResponse, { type: "message" }> } />;
    case "proceed_to_payment":
      return (
        <ProceedToPaymentStep
          step={step as Extract<GuidedStepResponse, { type: "proceed_to_payment" }>}
          loading={loading}
          onSubmit={onSubmit}
        />
      );
    default:
      return null;
  }
};

const ProceedToPaymentStep: React.FC<{
  step: Extract<GuidedStepResponse, { type: "proceed_to_payment" }>;
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

const YesNoDetailsStep: React.FC<{
  step: Extract<GuidedStepResponse, { type: "yes_no_details" }>;
  onSubmit: (payload: Record<string, unknown>) => void;
  loading: boolean;
}> = ({ step, onSubmit, loading }) => {
  const [choice, setChoice] = useState<string>("");
  const [details, setDetails] = useState<string>("");

  const showDetails = useMemo(() => {
    // Some questions need an extra textbox when a certain option is chosen.
    if (!step.details_field) return false;
    return choice === step.details_field.show_when;
  }, [choice, step.details_field]);

  return (
    <div className="w-full rounded-2xl p-6 border border-gray-200 bg-white">
      <p className="font-medium text-gray-900 mb-3">{step.message}</p>
      <div className="flex flex-wrap gap-2 mb-3">
        {(step.options ?? []).map((o) => (
          <button
            key={o.id}
            type="button"
            disabled={loading}
            onClick={() => setChoice(o.id)}
            className={`px-4 py-2 rounded-lg border ${choice === o.id ? "bg-primary text-white border-primary" : "border-gray-300"} disabled:opacity-60`}
          >
            {o.label}
          </button>
        ))}
      </div>

      {showDetails && step.details_field && (
        <input
          type="text"
          placeholder={step.details_field.label}
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg"
        />
      )}

      <button
        type="button"
        disabled={loading || !choice}
        onClick={() => {
          // We send the selected option back using the question_id as the key.
          const payload: Record<string, unknown> = { [step.question_id]: choice };
          if (showDetails && step.details_field) {
            // Also send the extra text if it is visible.
            payload[step.details_field.name] = details;
          }
          onSubmit(payload);
        }}
        className="mt-4 px-4 py-2 bg-primary text-white rounded-lg disabled:opacity-60"
      >
        Next
      </button>
    </div>
  );
};

const CheckboxStep: React.FC<{
  step: Extract<GuidedStepResponse, { type: "checkbox" }>;
  onSubmit: (payload: Record<string, unknown>) => void;
  loading: boolean;
}> = ({ step, onSubmit, loading }) => {
  const [selected, setSelected] = useState<string[]>([]);
  const [other, setOther] = useState<string>("");

  const toggle = (id: string) => {
    // Add/remove this option from the selected list.
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  return (
    <div className="w-full rounded-2xl p-6 border border-gray-200 bg-white">
      <p className="font-medium text-gray-900 mb-3">{step.message}</p>
      <div className="flex flex-col gap-2">
        {(step.options ?? []).map((o) => (
          <label key={o.id} className="flex items-center gap-2">
            <input type="checkbox" checked={selected.includes(o.id)} onChange={() => toggle(o.id)} />
            <span>{o.label}</span>
          </label>
        ))}
      </div>

      {step.other_field && (
        <input
          type="text"
          placeholder={step.other_field.label}
          value={other}
          onChange={(e) => setOther(e.target.value)}
          className="mt-3 w-full px-3 py-2 border rounded-lg"
        />
      )}

      <button
        type="button"
        disabled={loading}
        onClick={() => {
          // The backend tells us which key name it wants for the selected list.
          // If it’s missing, we use a safe default name.
          const selectedFieldName = step.field_name && step.field_name.trim() ? step.field_name : "risky_activities";
          const payload: Record<string, unknown> = { [selectedFieldName]: selected };
          if (step.other_field) {
            // Optional “Other (please specify)” text input.
            payload[step.other_field.name] = other;
          } else if (other.trim()) {
            // Old fallback key if the backend did not provide `other_field`.
            payload["risky_activity_other"] = other;
          }
          onSubmit(payload);
        }}
        className="mt-4 px-4 py-2 bg-primary text-white rounded-lg disabled:opacity-60"
      >
        Next
      </button>
    </div>
  );
};

const RadioStep: React.FC<{
  step: Extract<GuidedStepResponse, { type: "radio" }>;
  onSubmit: (payload: Record<string, unknown>) => void;
  loading: boolean;
}> = ({ step, onSubmit, loading }) => {
  const [choice, setChoice] = useState<string>("");

  return (
    <div className="w-full rounded-2xl p-6 border border-gray-200 bg-white">
      <p className="font-medium text-gray-900 mb-3">{step.message}</p>
      <div className="flex flex-wrap gap-2 mb-3">
        {(step.options ?? []).map((o) => (
          <button
            key={o.id}
            type="button"
            disabled={loading}
            onClick={() => setChoice(o.id)}
            className={`px-4 py-2 rounded-lg border ${choice === o.id ? "bg-primary text-white border-primary" : "border-gray-300"} disabled:opacity-60`}
          >
            {o.label}
          </button>
        ))}
      </div>

      <button
        type="button"
        disabled={loading || !choice}
        onClick={() => {
          const key = step.question_id && step.question_id.trim() ? step.question_id : "_raw";
          onSubmit({ [key]: choice });
        }}
        className="mt-4 px-4 py-2 bg-primary text-white rounded-lg disabled:opacity-60"
      >
        Next
      </button>
    </div>
  );
};

const OptionsStep: React.FC<{
  step: Extract<GuidedStepResponse, { type: "options" }>;
  onSubmit: (payload: Record<string, unknown>) => void;
  loading: boolean;
}> = ({ step, onSubmit, loading }) => {
  const [selectedId, setSelectedId] = useState<string>("");

  return (
    <div className="w-full rounded-2xl p-6 border border-gray-200 bg-white">
      <p className="font-medium text-gray-900 mb-4">{step.message ?? "Select an option"}</p>
      <div className="flex flex-col gap-3">
        {(step.options ?? []).map((o) => (
          <button
            key={o.id}
            type="button"
            disabled={loading}
            onClick={() => setSelectedId(o.id)}
            className={`w-full text-left px-4 py-3 rounded-xl border ${selectedId === o.id ? "border-primary bg-primary/5" : "border-gray-200 hover:border-primary/40 hover:bg-primary/5"} disabled:opacity-60`}
          >
            <div className="font-semibold text-gray-900">{o.label}</div>
            {o.description ? <div className="text-sm text-gray-600 mt-1">{o.description}</div> : null}
          </button>
        ))}
      </div>

      <button
        type="button"
        disabled={loading || !selectedId}
        onClick={() => onSubmit({ _raw: selectedId })}
        className="mt-4 px-4 py-2 bg-primary text-white rounded-lg disabled:opacity-60"
      >
        Next
      </button>
    </div>
  );
};

const FileUploadStep: React.FC<{
  step: Extract<GuidedStepResponse, { type: "file_upload" }>;
  onSubmit: (payload: Record<string, unknown>) => void;
  loading: boolean;
}> = ({ step, onSubmit, loading }) => {
  const [fileRef, setFileRef] = useState<string>("");

  return (
    <div className="w-full rounded-2xl p-6 border border-gray-200 bg-white">
      <p className="font-medium text-gray-900 mb-3">{step.message}</p>
      <input
        type="file"
        accept={step.accept ?? "application/pdf"}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          // For now we only keep the filename.
          // (A real upload can be added later when the backend provides an endpoint.)
          setFileRef(f.name);
        }}
      />
      <button
        type="button"
        disabled={loading || !fileRef}
        // Send back something like { document: "myfile.pdf" }.
        onClick={() => onSubmit({ [step.field_name]: fileRef })}
        className="mt-4 px-4 py-2 bg-primary text-white rounded-lg disabled:opacity-60"
      >
        Next
      </button>
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
