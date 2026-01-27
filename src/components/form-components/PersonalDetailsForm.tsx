import React, { useState } from "react";

interface PersonalDetailsFormProps {
  // onNext?: () => void; // For future step navigation
}

const OldMutualGreen = "#00A651";

const PersonalDetailsForm: React.FC<PersonalDetailsFormProps> = () => {
  // Form state
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    middleName: "",
    dob: "",
  });
  // Show optional fields toggle
  const [showOptional, setShowOptional] = useState(false);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Reveal optional fields when user interacts with the form
  const handleRevealOptional = () => setShowOptional(true);

  return (
    <div className="max-w-md mx-auto mt-2 rounded-2xl p-8 flex flex-col items-center" style={{ minWidth: 340, background: '#E6F9ED', boxShadow: '0 12px 48px 0 rgba(0,166,81,0.28)', border: '2px solid #8FE3B0' }}>
      <div className="w-full mb-4">
        <h2 className="text-xl font-bold text-center" style={{ color: OldMutualGreen }}>
          Personal Details
        </h2>
        <div className="w-12 mx-auto mt-2 mb-2 border-b-2 border-green-200 rounded-full" />
      </div>
      <form className="w-full flex flex-col gap-5">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            required
            value={form.firstName}
            onChange={handleChange}
            onFocus={handleRevealOptional}
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A651] bg-green-50 focus:bg-white transition"
            placeholder="Enter your first name"
          />
        </div>
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
            Last Name <span className="text-red-500">*</span>
          </label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            required
            value={form.lastName}
            onChange={handleChange}
            onFocus={handleRevealOptional}
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A651] bg-green-50 focus:bg-white transition"
            placeholder="Enter your last name"
          />
        </div>
        {showOptional && (
          <>
            <div>
              <label htmlFor="middleName" className="block text-sm font-medium text-gray-700 mb-1">
                Middle Name <span className="text-gray-400">(optional)</span>
              </label>
              <input
                id="middleName"
                name="middleName"
                type="text"
                value={form.middleName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A651] bg-green-50 focus:bg-white transition"
                placeholder="Enter your middle name"
              />
            </div>
            <div>
              <label htmlFor="dob" className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth
              </label>
              <input
                id="dob"
                name="dob"
                type="date"
                value={form.dob}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A651] bg-green-50 focus:bg-white transition"
              />
            </div>
          </>
        )}
        <button
          type="button"
          className="mt-6 w-full py-2 px-4 bg-gradient-to-r from-[#00A651] to-green-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-[#00A651] transition text-base shadow-md flex items-center justify-center gap-2"
          style={{ letterSpacing: 0.5 }}
        >
          Next
        </button>
      </form>
      <div className="w-full mt-3 text-xs text-gray-500 text-center">
        Fields marked with <span className="text-red-500">*</span> are compulsory.
      </div>
    </div>
  );
};

export default PersonalDetailsForm;
