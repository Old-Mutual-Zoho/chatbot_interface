import { sendChatMessage, startGuidedQuote } from '../services/api';
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
    } catch (e: any) {
      // Optionally handle field errors from backend here
      // setPaFieldErrors(e?.fieldErrors || {});
    } finally {
      setPaLoading(false);
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
