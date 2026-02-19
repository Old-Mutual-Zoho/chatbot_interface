import { sendChatMessage } from '../services/api';
import React, { useState, useEffect } from "react";
import type { GuidedStepResponse } from '../services/api';
import { GuidedStepRenderer } from '../components/form-components/GuidedStepRenderer';

interface QuoteFormScreenProps {
  selectedProduct?: string | null;
  userId?: string | null;
  sessionId?: string | null;
  onFormSubmitted?: () => void;
  embedded?: boolean;
}
const QuoteFormScreen: React.FC<QuoteFormScreenProps> = ({ selectedProduct, userId, sessionId, onFormSubmitted, embedded = false }) => {
  // Returns description for a given form step title
  // --- Backend-driven Personal Accident guided flow state ---
  const [paSessionId, setPaSessionId] = useState<string | null>(sessionId ?? null);
  const [paStepPayload, setPaStepPayload] = useState<GuidedStepResponse | null>(null);
  const [paLoading, setPaLoading] = useState(false);
  const [paComplete, setPaComplete] = useState(false);
  const [paFieldErrors, setPaFieldErrors] = useState<Record<string, string>>({});

  // ...existing code...
  // (Removed unused SereniCare and Travel Sure Plus effects)

  // Start backend-driven PA flow (prefer draft if present)
  // State for Personal Accident form data
  const [formData, setFormData] = useState<Record<string, unknown>>({});

  useEffect(() => {
    if (!selectedProduct || selectedProduct !== 'Personal Accident') return;
    if (!userId) return;
    const sid = paSessionId ?? sessionId;
    if (!sid) return;
    setPaLoading(true);
    // ...draft logic here if needed...
    // For now, just start the flow
    setPaLoading(false);
  }, [selectedProduct, userId, paSessionId, sessionId]);


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

  // Backend-driven Personal Accident rendering
  if (selectedProduct === 'Personal Accident') {
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
              values={formData as Record<string, string>}
              errors={paFieldErrors}
              onClearError={(name) => {
                setPaFieldErrors((prev) => {
                  if (!prev[name]) return prev;
                  const copy = { ...prev };
                  delete copy[name];
                  return copy;
                });
              }}
              onChange={() => {}}
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
              onReturnToChat={() => setPaComplete(true)}
            />
          )}
        </div>
      </div>
    );
  }

  // (Removed unused Motor rendering and static product fallback)
  return null;
};

export default QuoteFormScreen;
