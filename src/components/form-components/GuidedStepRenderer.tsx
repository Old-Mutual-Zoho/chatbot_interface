import React, { useEffect, useMemo, useState, useRef } from "react";

import ConfirmationCard from "../chatbot/messages/ConfirmationCard";
import { PaymentLoadingScreen } from "../chatbot/messages/PaymentLoadingScreen";

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
}

export const GuidedStepRenderer: React.FC<GuidedStepRendererProps> = ({
  step,
  values,
  onSubmit,
  onBack,
  loading = false,
}) => {
  // Confirmation summary state
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationData, setConfirmationData] = useState<Record<string, unknown> | null>(null);
  // Loading state for Get Quote
  const [showLoading, setShowLoading] = useState(false);
  const [quoteButtonDisabled, setQuoteButtonDisabled] = useState(false);
  const loadingStartedAtRef = useRef<number | null>(null);
  // Ref to scroll to bottom after loading
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // Allow showing confirmation even if step is null, since we might be confirming after the last step.  
  if (!step && !(showConfirmation && confirmationData)) return null;
   // Modular handler: show loader, then return to chat
  const handleSubmitFromReview = () => {
    if (!confirmationData) return;

    // Re-normalize the current step's fields (e.g., number inputs) in case the user
    // edited values on the confirmation card (which are strings).
    const payloadToSend: Record<string, unknown> = { ...confirmationData };
    if (step && step.type === "form" && "fields" in step && Array.isArray(step.fields)) {
      for (const f of step.fields ?? []) {
        const raw = payloadToSend[f.name] ?? values[f.name] ?? "";
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
    }

    loadingStartedAtRef.current = Date.now();
    setQuoteButtonDisabled(true);
    setShowLoading(true);
    onSubmit(payloadToSend);
  };

  useEffect(() => {
    // When the parent finishes submitting, hide the loader after a short minimum delay.
    if (!showLoading) return;
    if (loading) return;

    const minMs = 1400;
    const startedAt = loadingStartedAtRef.current ?? Date.now();
    const elapsed = Date.now() - startedAt;
    const remaining = Math.max(0, minMs - elapsed);

    const timer = window.setTimeout(() => {
      setShowLoading(false);
      setShowConfirmation(false);
      setQuoteButtonDisabled(false);

      // Scroll so the next step (e.g., premium summary) is in view.
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
      }, 50);
    }, remaining);

    return () => window.clearTimeout(timer);
  }, [loading, showLoading]);

  if (showLoading) {
    return <PaymentLoadingScreen />;
  }

  if (showConfirmation && confirmationData) {
    return (
      <>
        <ConfirmationCard
          data={confirmationData}
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
  switch (step.type) {
    case "form":
      // Card payment forms removed. Implement other form handling here if needed.
      return null;
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
      return <PremiumSummaryStep step={step as Extract<GuidedStepResponse, { type: "premium_summary" }> } onSubmit={onSubmit} loading={loading} />;
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
      // Payment is handled elsewhere; show a simple message.
      return <MessageStep step={{ type: "message", message: step.message ?? "Proceeding to payment." }} />;
    default:
      return null;
  }
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
