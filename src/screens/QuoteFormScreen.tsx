import React from "react";
import PersonalDetailsForm from '../components/form-components/PersonalDetailsForm';

const QuoteFormScreen: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6 bg-white">
      <h2 className="text-2xl font-bold mb-4 text-primary">Get My Quote</h2>
      <PersonalDetailsForm />
    </div>
  );
};

export default QuoteFormScreen;
