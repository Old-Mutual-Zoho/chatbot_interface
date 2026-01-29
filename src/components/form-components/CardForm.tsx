import React from "react";

export interface CardFieldConfig {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  placeholder?: string;
  optionalLabel?: string;
}

export interface CardFormProps {
  title: string;
  fields: CardFieldConfig[];
  values: Record<string, string>;
  onChange: (name: string, value: string) => void;
  onNext?: () => void;
  onBack?: () => void;
  showBack?: boolean;
  showNext?: boolean;
}

const CardForm: React.FC<CardFormProps> = ({
  title,
  fields,
  values,
  onChange,
  onNext,
  onBack,
  showBack = false,
  showNext = true,
}) => {

  // Unified progressive reveal logic for all forms
  const [fieldGroup, setFieldGroup] = React.useState(0);
  const groupSize = 2;
  const totalGroups = Math.ceil(fields.length / groupSize);
  React.useEffect(() => {
    setFieldGroup(0);
  }, [fields, title]);

  const visibleFields = fields.slice(fieldGroup * groupSize, (fieldGroup + 1) * groupSize);

  // Only enable Next if all required fields in all groups are filled
  const allFieldsRequiredFilled = fields.every(f => {
    if (!f.required) return true;
    return values[f.name] && values[f.name].trim() !== "";
  });
  // Only enable group advance if current group is filled
  const allCurrentGroupFilled = visibleFields.every(f => {
    if (!f.required) return true;
    return values[f.name] && values[f.name].trim() !== "";
  });

  // State for button active (clicked) effect
  const [nextActive, setNextActive] = React.useState(false);
  const handleNextMouseDown = () => setNextActive(true);
  const handleNextMouseUp = () => setNextActive(false);
  const handleNextMouseLeave = () => setNextActive(false);

  return (
    <div className="max-w-md mx-auto mt-2 rounded-2xl p-8 flex flex-col items-center" style={{ minWidth: 340, background: '#E6F9ED', boxShadow: '0 12px 48px 0 rgba(0,166,81,0.28)', border: '2px solid #8FE3B0' }}>
      <div className="w-full mb-4">
        <h2 className="text-xl font-bold text-center" style={{ color: '#00A651' }}>
          {title}
        </h2>
        <div className="w-12 mx-auto mt-2 mb-2 border-b-2 border-green-200 rounded-full" />
      </div>
      <form className="w-full flex flex-col gap-5">
        {visibleFields.map((field) => {
          // Validation logic
          let error = "";
          const value = values[field.name] || "";
          if (field.required && !value.trim()) {
            error = `${field.label} is required.`;
          } else if (field.type === "email" && value) {
            // Simple email regex
            if (!/^\S+@\S+\.\S+$/.test(value)) {
              error = "Please enter a valid email address.";
            }
          } else if (field.name === "mobile" && value) {
            if (!/^\+256\s\d{9}$/.test(value)) {
              error = "Phone number must be in format +256 7XXXXXXXX.";
            }
          } else if (field.name === "nin" && value) {
            // Uganda NIN: 13 chars, starts with CM or CF, rest digits
            if (!/^(CM|CF)\d{11}$/.test(value)) {
              error = "NIN must be 13 characters, start with 'CM' or 'CF', and the rest must be digits.";
            }
          }
          // Show error if present
          // Special handling for phone number field
          if (field.name === "mobile") {
            const prefix = "+256 ";
            // Remove prefix if user tries to delete it
            let value = values[field.name] || "";
            if (!value.startsWith(prefix)) {
              value = prefix + value.replace(/^\+?256\s?/, "");
            }
            // Only allow numbers after the prefix, max 9 digits
            const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
              let input = e.target.value;
              if (!input.startsWith(prefix)) {
                input = prefix + input.replace(/^\+?256\s?/, "");
              }
              const digits = input.slice(prefix.length).replace(/\D/g, "").slice(0, 9);
              onChange(field.name, prefix + digits);
            };
            return (
              <div key={field.name}>
                <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-1">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                  {field.optionalLabel && <span className="text-gray-400"> ({field.optionalLabel})</span>}
                </label>
                <input
                  id={field.name}
                  name={field.name}
                  type="tel"
                  required={field.required}
                  value={value}
                  onChange={handleMobileChange}
                  className={`w-full px-4 py-2 border ${error ? 'border-red-400' : 'border-gray-300'} rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A651] bg-green-50 focus:bg-white transition`}
                  placeholder={"+256 7XXXXXXXX"}
                  maxLength={prefix.length + 9}
                  pattern="\+256\s\d{9}"
                  inputMode="numeric"
                />
                {error && <div className="text-red-500 text-xs mt-1">{error}</div>}
              </div>
            );
          }
          // Default field rendering
          return (
            <div key={field.name}>
              <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-1">
                {field.label} {field.required && <span className="text-red-500">*</span>}
                {field.optionalLabel && <span className="text-gray-400"> ({field.optionalLabel})</span>}
              </label>
              <input
                id={field.name}
                name={field.name}
                type={field.type}
                required={field.required}
                value={value}
                onChange={e => onChange(field.name, e.target.value)}
                className={`w-full px-4 py-2 border ${error ? 'border-red-400' : 'border-gray-300'} rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A651] bg-green-50 focus:bg-white transition`}
                placeholder={field.placeholder}
              />
              {error && <div className="text-red-500 text-xs mt-1">{error}</div>}
            </div>
          );
        })}
      </form>
      <div className="flex justify-between mt-4 w-full gap-3">
        {showBack && (
          <button type="button" onClick={onBack} className="px-4 py-2 bg-gray-300 rounded">Back</button>
        )}
        {showNext && (
          fieldGroup < totalGroups - 1 ? (
            <button
              type="button"
              onClick={() => setFieldGroup(fieldGroup + 1)}
              disabled={!allCurrentGroupFilled}
              className={`mt-0 w-full py-2 px-4 bg-gradient-to-r from-[#00A651] to-green-600 text-white font-semibold rounded-xl transition text-base shadow-md flex items-center justify-center gap-2${!allCurrentGroupFilled ? ' opacity-50 cursor-not-allowed' : ''} ${nextActive ? 'scale-105 ring-2 ring-green-400' : ''} hover:from-green-700 hover:to-green-500 hover:scale-105 hover:ring-2 hover:ring-green-400`}
              style={{ letterSpacing: 0.5 }}
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={onNext}
              onMouseDown={handleNextMouseDown}
              onMouseUp={handleNextMouseUp}
              onMouseLeave={handleNextMouseLeave}
              disabled={!allFieldsRequiredFilled}
              className={`mt-0 w-full py-2 px-4 bg-gradient-to-r from-[#00A651] to-green-600 text-white font-semibold rounded-xl transition text-base shadow-md flex items-center justify-center gap-2${!allFieldsRequiredFilled ? ' opacity-50 cursor-not-allowed' : ''} ${nextActive ? 'scale-105 ring-2 ring-green-400' : ''} hover:from-green-700 hover:to-green-500 hover:scale-105 hover:ring-2 hover:ring-green-400`}
              style={{ letterSpacing: 0.5 }}
            >
              Next
            </button>
          )
        )}
      </div>
      <div className="w-full mt-3 text-xs text-gray-500 text-center">
        Fields marked with <span className="text-red-500">*</span> are compulsory.
      </div>
    </div>
  );
}

export default CardForm;
