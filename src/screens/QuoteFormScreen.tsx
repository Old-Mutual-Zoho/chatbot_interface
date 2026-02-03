

import React, { useState } from "react";
import { startGuidedQuote } from '../services/api';
import CardForm from '../components/form-components/CardForm';
import { formSteps } from '../components/chatbot/data/formSteps';
import { getProductFormSteps } from '../utils/getProductFormSteps';
import { serenicareFormSteps } from '../components/chatbot/data/specificProductForms/serenicareForm';



interface QuoteFormScreenProps {
  selectedProduct?: string | null;
  userId?: string | null;
}

const QuoteFormScreen: React.FC<QuoteFormScreenProps> = ({ selectedProduct, userId }) => {
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
    if (mainStep < 2 - 1) {
      setMainStep(mainStep + 1);
    } else {
      if (selectedProduct === 'Serenicare') {
        setPhase('product');
      } else {
        setPhase('product');
      }
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
      // Submit Serenicare form data to backend
      try {
        const user_id = userId || '';
        const product_id = 'Serenicare';
        const initial_data = {
          product_id: String(product_id),
          ...mainFormData,
          ...productFormData,
        };
        await startGuidedQuote({ user_id, initial_data });
        // Optionally show a success message or move to a summary screen
        alert('Quote submitted successfully!');
      } catch (error) {
        alert('Failed to submit quote.');
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
    const productSteps = selectedProduct ? getProductFormSteps(selectedProduct) : [];
    const allSteps = [...formSteps, ...productSteps];
    if (step < allSteps.length - 1) {
      setStep(step + 1);
    } else {
      // Submit form data for supported products
      if (["Travel Sure Plus", "Personal Accident"].includes(selectedProduct || "")) {
        try {
          const user_id = userId || '';
          const product_id = selectedProduct ? String(selectedProduct) : '';
          const initial_data = {
            product_id,
            ...formData,
          };
          await startGuidedQuote({ user_id, initial_data });
          alert('Quote submitted successfully!');
        } catch (error) {
          alert('Failed to submit quote.');
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
    // Only show the first two steps (Personal Details and Contact Details) for Serenicare in the main phase
    const serenicareMainSteps = formSteps.slice(0, 2);
    return (
      <div className="flex flex-col h-full bg-white">
        <div className="p-4 mt-12">
          <h2 className="text-2xl font-bold mb-1 text-primary text-center">Get My Quote</h2>
          <p className="text-center text-gray-600 mb-3 text-sm">
            To get your personalized quote, please provide the information below. This helps us tailor your quote just for you.
          </p>
          {phase === 'main' && (
            <CardForm
              title={serenicareMainSteps[mainStep].title}
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
            <CardForm
              title={serenicareFormSteps[productStep].title}
              fields={serenicareFormSteps[productStep].fields}
              values={productFormData}
              onChange={handleProductChange}
              onNext={handleProductNext}
              onBack={handleProductBack}
              showBack={productStep > 0}
              showNext={true}
            />
          )}
        </div>
      </div>
    );
  }

  // For other products, keep the original combined flow
  const productSteps = selectedProduct ? getProductFormSteps(selectedProduct) : [];
  const allSteps = [...formSteps, ...productSteps];
  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 mt-12">
        <h2 className="text-2xl font-bold mb-1 text-primary text-center">Get My Quote</h2>
        <p className="text-center text-gray-600 mb-3 text-sm">
          To get your personalized quote, please provide the information below. This helps us tailor your quote just for you.
        </p>
        <CardForm
          title={allSteps[step].title}
          fields={allSteps[step].fields}
          values={formData}
          onChange={handleChange}
          onNext={handleNext}
          onBack={handleBack}
          showBack={step > 0}
          showNext={true}
        />
      </div>
    </div>
  );
};

export default QuoteFormScreen;
