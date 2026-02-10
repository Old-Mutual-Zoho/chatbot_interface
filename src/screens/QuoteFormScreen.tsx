import React, { useState } from "react";
import { startGuidedQuote } from '../services/api';
import CardForm from '../components/form-components/CardForm';
import { getProductFormSteps } from '../utils/getProductFormSteps';
import { serenicareFormSteps, serenicareMainFormSteps } from '../components/chatbot/data/specificProductForms/serenicareForm';



interface QuoteFormScreenProps {
  selectedProduct?: string | null;
  userId?: string | null;
  onFormSubmitted?: () => void;
  embedded?: boolean;
}

const QuoteFormScreen: React.FC<QuoteFormScreenProps> = ({ selectedProduct, userId, onFormSubmitted, embedded = false }) => {
  const getDescriptionForTitle = (title: string | undefined) => {
    const normalized = (title ?? "").trim().toLowerCase();
    if (normalized === "get a quote") {
      return "Provide a few details so we can tailor your quote.";
    }
    return undefined;
  };

  // All hooks must be called unconditionally and in the same order
  const [phase, setPhase] = useState<'main' | 'product'>('main');
  const [mainStep, setMainStep] = useState(0);
  const [mainFormData, setMainFormData] = useState<Record<string, string>>({});
  const [productStep, setProductStep] = useState(0);
  const [productFormData, setProductFormData] = useState<Record<string, string>>({});
  const [step, setStep] = useState<number>(0);
  const [formData, setFormData] = useState<Record<string, string>>({});

  // Handler for main form (personal/contact)
  const handleMainChange = (name: string, value: string) => {
    setMainFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleMainNext = () => {
    if (mainStep < serenicareMainFormSteps.length - 1) {
      setMainStep(mainStep + 1);
    } else {
      setPhase('product');
    }
  };
  const handleMainBack = () => {
    if (mainStep > 0) setMainStep(mainStep - 1);
  };

  // Handler for product-specific form (Serenicare)
  const handleProductChange = (name: string, value: string) => {
    setProductFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleProductNext = async () => {
    // If next step is Cover Personalization, initialize mainMembers as [] if not set
    if (productStep + 1 < serenicareFormSteps.length && serenicareFormSteps[productStep + 1].fields.some(f => f.type === 'repeatable-group')) {
      setProductFormData(prev => {
        if (!prev.mainMembers) {
          return { ...prev, mainMembers: JSON.stringify([]) };
        }
        return prev;
      });
    }
    if (productStep < serenicareFormSteps.length - 1) {
      setProductStep(productStep + 1);
    } else {
      try {
        const user_id = userId || '';
        const product_id = 'Serenicare';
        const initial_data = {
          product_id: String(product_id),
          ...mainFormData,
          ...productFormData,
        };
        await startGuidedQuote({ user_id, flow_name: 'serenicare', initial_data });
        if (onFormSubmitted) {
          onFormSubmitted();
        }
      } catch (error) {
        console.error('Form submission error:', error);
        if (onFormSubmitted) {
          onFormSubmitted();
        }
      }
    }
  };
  const handleProductBack = () => {
    if (productStep > 0) setProductStep(productStep - 1);
  };

  // Handler for other products
  const handleChange = (name: string, value: string) => {
    setFormData((prev: Record<string, string>) => ({ ...prev, [name]: value }));
  };
  const handleNext = async () => {
    const allSteps = selectedProduct ? getProductFormSteps(selectedProduct) : [];
    if (step < allSteps.length - 1) {
      setStep(step + 1);
    } else {
      if (["Travel Sure Plus", "Personal Accident"].includes(selectedProduct || "")) {
        try {
          const user_id = userId || '';
          const product_id = selectedProduct ? String(selectedProduct) : '';
          const initial_data = {
            product_id,
            ...formData,
          };
          let flow_name = '';
          if (selectedProduct === 'Travel Sure Plus') flow_name = 'travel_sure_plus';
          else if (selectedProduct === 'Personal Accident') flow_name = 'personal_accident';
          await startGuidedQuote({ user_id, flow_name, initial_data });
          if (onFormSubmitted) {
            onFormSubmitted();
          }
        } catch (error) {
          console.error('Form submission error:', error);
          if (onFormSubmitted) {
            onFormSubmitted();
          }
        }
      }
      // ...
    }
  };
  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  if (selectedProduct === 'Serenicare') {
    const serenicareMainSteps = serenicareMainFormSteps;
    const currentTitle = phase === 'main' ? serenicareMainSteps[mainStep]?.title : serenicareFormSteps[productStep]?.title;
    const description = getDescriptionForTitle(currentTitle);
    return (
      <div className={embedded ? "w-full" : "flex flex-col h-full bg-white"}>
        <div className={embedded ? "px-3 sm:px-4 py-3" : "p-4 mt-6"}>
          {phase === 'main' && (
            <CardForm
              title={serenicareMainSteps[mainStep].title}
              description={description}
              fields={serenicareMainSteps[mainStep].fields}
              values={mainFormData}
              onChange={handleMainChange}
              onNext={handleMainNext}
              onBack={handleMainBack}
              showBack={mainStep > 0}
              showNext={true}
            />
          )}
          {phase === 'product' && (
            <>
               <CardForm
                title={serenicareFormSteps[productStep].title}
                description={description}
                fields={serenicareFormSteps[productStep].fields}
                values={productFormData}
                onChange={handleProductChange}
                onNext={handleProductNext}
                onBack={handleProductBack}
                showBack={productStep > 0}
                showNext={true}
                nextButtonLabel={productStep === serenicareFormSteps.length - 1 ? "Submit" : "Next"}
              />
            </>
          )}
        </div>
      </div>
    );
  }

  // For other products, keep the original combined flow
  const allSteps = selectedProduct ? getProductFormSteps(selectedProduct) : [];
  const isLastStep = step === allSteps.length - 1;
  const groupSize = selectedProduct === "Personal Accident" ? 1 : undefined;
  const autoAdvance = selectedProduct === "Personal Accident";

  if (!selectedProduct || allSteps.length === 0) {
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

  const description = getDescriptionForTitle(allSteps[step]?.title);

  return (
    <div className={embedded ? "w-full" : "flex flex-col h-full bg-white"}>
      <div className={embedded ? "px-3 sm:px-4 py-3" : "p-4 mt-12"}>
        <CardForm
          title={allSteps[step].title}
          description={description}
          fields={allSteps[step].fields}
          values={{ ...formData, selectedProduct: selectedProduct || "" }}
          onChange={handleChange}
          onNext={handleNext}
          onBack={handleBack}
          showBack={step > 0}
          showNext={true}
          nextButtonLabel={isLastStep ? "Submit" : "Next"}
          groupSize={groupSize}
          autoAdvance={autoAdvance}
        />
      </div>
    </div>
  );
};

export default QuoteFormScreen;
