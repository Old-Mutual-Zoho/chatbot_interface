
import React, { useState } from "react";
import CardForm from '../components/form-components/CardForm';
import { formSteps } from '../components/chatbot/data/formSteps';

const QuoteFormScreen: React.FC = () => {
  const [step, setStep] = useState<number>(0);
  const [formData, setFormData] = useState<Record<string, string>>({});

  const handleChange = (name: string, value: string) => {
    setFormData((prev: Record<string, string>) => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    if (step < formSteps.length - 1) {
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
    <div className="flex flex-col items-center justify-center h-full p-6 bg-white">
      <h2 className="text-2xl font-bold mb-4 text-primary">Get My Quote</h2>
      <CardForm
        title={formSteps[step].title}
        fields={formSteps[step].fields}
        values={formData}
        onChange={handleChange}
        onNext={handleNext}
        onBack={handleBack}
        showBack={step > 0}
        showNext={true}
      />
    </div>
  );
};

export default QuoteFormScreen;
