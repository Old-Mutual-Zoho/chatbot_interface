import React, { useMemo, useRef, useState } from "react";
import { startGuidedQuote } from '../services/api';
import CardForm from '../components/form-components/CardForm';
import { getProductFormSteps } from '../utils/getProductFormSteps';

interface QuoteFormScreenProps {
  selectedProduct?: string | null;
  userId?: string | null;
  onFormSubmitted?: () => void;
  embedded?: boolean;
}


const QuoteFormScreen: React.FC<QuoteFormScreenProps> = ({ selectedProduct, userId, onFormSubmitted, embedded = false }) => {
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

  // Compute steps for selected product
  const steps = useMemo(() => {
    if (!selectedProduct) return [];
    return getProductFormSteps(selectedProduct);
  }, [selectedProduct]);

  // Handle field value change
  const handleChange = (name: string, value: string) => {
    setFormData((prev: Record<string, string>) => ({ ...prev, [name]: value }));
  };

  // Handle next/submit action
  const handleNext = async () => {
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


  // Show prompt if no product is selected
  if (!selectedProduct || steps.length === 0) {
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
