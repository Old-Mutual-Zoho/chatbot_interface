import React from "react";

export interface CardFieldConfig {
  name: string;
  label?: string;
  type: string;
  required?: boolean;
  placeholder?: string;
  optionalLabel?: string;
  // For radio/select/checkbox-group fields
  options?: { label: string; value: string }[];
  // For conditional fields
  showIf?: { field: string; value: string | boolean };
  // For repeatable-group fields
  fields?: CardFieldConfig[];
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
  React.useEffect(() => {
    setFieldGroup(0);
  }, [fields, title]);

  // Repeatable group state for active member index per group
  const [repeatableGroupState, setRepeatableGroupState] = React.useState<{ [key: string]: number }>({});
  React.useEffect(() => {
    setRepeatableGroupState({});
  }, [fields, title]);
  const handleSetActiveIdx = (fieldName: string, idx: number) => {
    setRepeatableGroupState(prev => ({ ...prev, [fieldName]: idx }));
  };

  // Only show fields that are not hidden by showIf
  const allVisibleFields = fields.filter(field => {
    if (!field.showIf) return true;
    const depValue = values[field.showIf.field];
    return depValue === field.showIf.value;
  });
  const visibleFields = allVisibleFields.slice(fieldGroup * groupSize, (fieldGroup + 1) * groupSize);

  // Only enable Next if all required fields in all groups are filled
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
        {title === "Cover Personalization" && (
          <p className="text-center text-gray-600 text-sm mt-1">Assign different cover options to members in this cover</p>
        )}
      </div>
      <form className="w-full flex flex-col gap-5">
        {visibleFields.map((field) => {
          // Conditional rendering for fields with showIf
          if (field.showIf) {
            const depValue = values[field.showIf.field];
            if (depValue !== field.showIf.value) {
              return null;
            }
          }
          // Validation logic
          let error = "";
          const value = values[field.name] || "";
          if (field.required && !value.trim()) {
            error = `${field.label} is required.`;
          } else if (field.type === "email" && value) {
            if (!/^\S+@\S+\.\S+$/.test(value)) {
              error = "Please enter a valid email address.";
            }
          } else if (field.name === "mobile" && value) {
            if (!/^\+256\s\d{9}$/.test(value)) {
              error = "Phone number must be in format +256 7XXXXXXXX.";
            }
          } else if (field.name === "nin" && value) {
            if (!/^(CM|CF)\d{11}$/.test(value)) {
              error = "NIN must be 13 characters, start with 'CM' or 'CF', and the rest must be digits.";
            }
          }

          // Repeatable group (e.g. Main Members)
          if (field.type === "repeatable-group" && Array.isArray(field.fields)) {
            // Value is a JSON stringified array of member objects
            let groupValue: Record<string, unknown>[] = [];
            try {
              groupValue = value ? JSON.parse(value) : [];
            } catch {
              groupValue = [];
            }
            const activeIdx = repeatableGroupState[field.name] ?? 0;

            const handleAdd = () => {
              const updated = [...groupValue, {}];
              onChange(field.name, JSON.stringify(updated));
              handleSetActiveIdx(field.name, updated.length - 1);
            };
            const handleRemove = (idx: number) => {
              const updated = groupValue.filter((_, i) => i !== idx);
              onChange(field.name, JSON.stringify(updated));
              handleSetActiveIdx(field.name, Math.max(0, idx - 1));
            };
            const handleFieldChange = (idx: number, subName: string, subValue: string) => {
              const updated = groupValue.map((item, i) => i === idx ? { ...item, [subName]: subValue } : item);
              onChange(field.name, JSON.stringify(updated));
            };

            return (
              <div key={field.name} className="mb-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                {groupValue.length === 0 && (
                  <button type="button" onClick={handleAdd} className="mb-2 px-3 py-1 bg-primary text-white rounded">Add Member</button>
                )}
                {groupValue.length > 0 && (
                  <div className="mb-3 p-3 bg-white rounded border border-green-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-primary">Member {activeIdx + 1}</span>
                      <button type="button" onClick={() => handleRemove(activeIdx)} className="text-red-500 text-xs">Remove</button>
                    </div>
                    {/* Render subfields for this member */}
                    {field.fields.map((subField: CardFieldConfig, idx) => {
                      const subValue = (groupValue[activeIdx] && typeof groupValue[activeIdx] === 'object') ? (groupValue[activeIdx] as Record<string, unknown>)[subField.name] ?? "" : "";
                      // Render spouse/children checkboxes in a row if both present
                      if (
                        subField.type === "checkbox" &&
                        Array.isArray(field.fields) &&
                        idx < field.fields.length - 1 &&
                        field.fields[idx + 1]?.type === "checkbox"
                      ) {
                        const nextField = field.fields[idx + 1];
                        const nextValue = (groupValue[activeIdx] && typeof groupValue[activeIdx] === 'object') ? (groupValue[activeIdx] as Record<string, unknown>)[nextField.name] ?? "" : "";
                        return (
                          <div key={subField.name + "_row"} className="flex flex-row gap-4 mb-1">
                            <label className="flex items-center text-xs text-gray-700 mb-0.5">
                              <input
                                type="checkbox"
                                checked={!!subValue}
                                onChange={e => handleFieldChange(activeIdx, subField.name, e.target.checked ? "true" : "")}
                                className="mr-1"
                              />
                              {subField.label}
                            </label>
                            <label className="flex items-center text-xs text-gray-700 mb-0.5">
                              <input
                                type="checkbox"
                                checked={!!nextValue}
                                onChange={e => handleFieldChange(activeIdx, nextField.name, e.target.checked ? "true" : "")}
                                className="mr-1"
                              />
                              {nextField.label}
                            </label>
                          </div>
                        );
                      }
                      // Skip rendering the next field if already rendered in row
                      if (
                        subField.type === "checkbox" &&
                        Array.isArray(field.fields) &&
                        idx > 0 &&
                        field.fields[idx - 1]?.type === "checkbox"
                      ) {
                        return null;
                      }
                      // Render unnamed field with only placeholder (no label)
                      if (!subField.label && subField.placeholder) {
                        return (
                          <div key={subField.name} className="mb-1">
                            <input
                              type={subField.type}
                              value={subValue as string}
                              onChange={e => handleFieldChange(activeIdx, subField.name, e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                              placeholder={subField.placeholder}
                            />
                          </div>
                        );
                      }
                      // Default rendering for other fields
                      return (
                        <div key={subField.name} className="mb-1">
                          <label className="block text-xs text-gray-700 mb-0.5">{subField.label}</label>
                          <input
                            type={subField.type}
                            value={subValue as string}
                            onChange={e => handleFieldChange(activeIdx, subField.name, e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                            placeholder={subField.placeholder}
                          />
                        </div>
                      );
                    })}
                    {/* Navigation buttons */}
                    <div className="flex justify-between mt-3">
                      <button type="button" disabled={activeIdx === 0} onClick={() => handleSetActiveIdx(field.name, activeIdx - 1)} className={`px-3 py-1 rounded ${activeIdx === 0 ? 'bg-gray-200 text-gray-400' : 'bg-primary text-white'}`}>Back</button>
                      <button type="button" disabled={activeIdx === groupValue.length - 1} onClick={() => handleSetActiveIdx(field.name, activeIdx + 1)} className={`px-3 py-1 rounded ${activeIdx === groupValue.length - 1 ? 'bg-gray-200 text-gray-400' : 'bg-primary text-white'}`}>Next</button>
                    </div>
                  </div>
                )}
                {groupValue.length > 0 && (
                  <button type="button" onClick={handleAdd} className="mt-2 px-3 py-1 bg-primary text-white rounded">Add Member</button>
                )}
              </div>
            );
          }

          // Render radio fields
          if (field.type === "radio" && Array.isArray(field.options)) {
            return (
              <div key={field.name} className="mb-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                  {field.optionalLabel && <span className="text-gray-400"> ({field.optionalLabel})</span>}
                </label>
                <div className="flex flex-col gap-2 max-h-48 overflow-y-auto p-2 bg-white rounded border border-green-200">
                  {field.options.map((opt) => (
                    <label key={opt.value} className="flex items-center gap-2 cursor-pointer hover:bg-green-50 rounded px-1 py-1 transition">
                      <input
                        type="radio"
                        name={field.name}
                        value={opt.value}
                        checked={value === opt.value}
                        onChange={() => onChange(field.name, opt.value)}
                        className="accent-green-600"
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
                {error && <div className="text-red-500 text-xs mt-1">{error}</div>}
              </div>
            );
          }

          // Render checkbox-group fields
          if (field.type === "checkbox-group" && Array.isArray(field.options)) {
            // Value is a comma-separated string of selected options
            const selected = value ? value.split(",") : [];
            return (
              <div key={field.name} className="mb-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                  {field.optionalLabel && <span className="text-gray-400"> ({field.optionalLabel})</span>}
                </label>
                <div className="flex flex-col gap-2 max-h-48 overflow-y-auto p-2 bg-white rounded border border-green-200">
                  {field.options.map((opt) => (
                    <label key={opt.value} className="flex items-center gap-2 cursor-pointer hover:bg-green-50 rounded px-1 py-1 transition">
                      <input
                        type="checkbox"
                        name={field.name}
                        value={opt.value}
                        checked={selected.includes(opt.value)}
                        onChange={() => {
                          let updated: string[];
                          if (selected.includes(opt.value)) {
                            updated = selected.filter((v) => v !== opt.value);
                          } else {
                            updated = [...selected, opt.value];
                          }
                          onChange(field.name, updated.join(","));
                        }}
                        className="accent-green-600"
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
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
          (fieldGroup < Math.ceil(allVisibleFields.length / groupSize) - 1 && visibleFields.length > 0)
            ? (
              <button
                type="button"
                onClick={() => setFieldGroup(fieldGroup + 1)}
                disabled={!allCurrentGroupFilled}
                className={`mt-0 w-full py-2 px-4 bg-gradient-to-r from-[#00A651] to-green-600 text-white font-semibold rounded-xl transition text-base shadow-md flex items-center justify-center gap-2${!allCurrentGroupFilled ? ' opacity-50 cursor-not-allowed' : ''} ${nextActive ? 'scale-105 ring-2 ring-green-400' : ''} hover:from-green-700 hover:to-green-500 hover:scale-105 hover:ring-2 hover:ring-green-400`}
                style={{ letterSpacing: 0.5 }}
              >
                Next
              </button>
            )
            : (
              <button
                type="button"
                onClick={onNext}
                onMouseDown={handleNextMouseDown}
                onMouseUp={handleNextMouseUp}
                onMouseLeave={handleNextMouseLeave}
                disabled={!allCurrentGroupFilled}
                className={`mt-0 w-full py-2 px-4 bg-gradient-to-r from-[#00A651] to-green-600 text-white font-semibold rounded-xl transition text-base shadow-md flex items-center justify-center gap-2${!allCurrentGroupFilled ? ' opacity-50 cursor-not-allowed' : ''} ${nextActive ? 'scale-105 ring-2 ring-green-400' : ''} hover:from-green-700 hover:to-green-500 hover:scale-105 hover:ring-2 hover:ring-green-400`}
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
