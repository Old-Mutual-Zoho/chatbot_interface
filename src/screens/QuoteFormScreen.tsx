

import React, { useState } from "react";
import CardForm from '../components/form-components/CardForm';
import { formSteps } from '../components/chatbot/data/formSteps';
import { getProductFormSteps } from '../utils/getProductFormSteps';


interface QuoteFormScreenProps {
  selectedProduct?: string | null;
}

const QuoteFormScreen: React.FC<QuoteFormScreenProps> = ({ selectedProduct }) => {
  const [step, setStep] = useState<number>(0);
  const [formData, setFormData] = useState<Record<string, string>>({});

  // Combine generic and product-specific steps
  const productSteps = selectedProduct ? getProductFormSteps(selectedProduct) : [];
  const allSteps = [...formSteps, ...productSteps];

  const handleChange = (name: string, value: string) => {
    setFormData((prev: Record<string, string>) => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    if (step < allSteps.length - 1) {
      setStep(step + 1);
    } else {
      // Submit or go to next section
      // ...
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

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
