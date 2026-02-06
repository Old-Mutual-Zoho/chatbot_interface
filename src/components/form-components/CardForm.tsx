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
  nextButtonLabel?: string;
  groupSize?: number;
  autoAdvance?: boolean;
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
  nextButtonLabel = "Next",
  groupSize: groupSizeProp = 2,
  autoAdvance = false,
}) => {
  // Unified progressive reveal logic for all forms
  const [fieldGroup, setFieldGroup] = React.useState(0);
  const groupSize = Math.max(1, groupSizeProp);
  React.useEffect(() => {
    setFieldGroup(0);
  }, [fields, title, groupSize]);

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
  const totalGroups = Math.ceil(allVisibleFields.length / groupSize);
  const hasMultipleGroups = totalGroups > 1;
  const isFirstGroup = fieldGroup <= 0;
  const isLastGroup = fieldGroup >= totalGroups - 1;
  const canGoPrevGroup = !autoAdvance && hasMultipleGroups && !isFirstGroup;
  const canGoNextGroup = hasMultipleGroups && !isLastGroup;
  const visibleFields = autoAdvance
    ? allVisibleFields.slice(0, Math.min(allVisibleFields.length, (fieldGroup + 1) * groupSize))
    : allVisibleFields.slice(fieldGroup * groupSize, (fieldGroup + 1) * groupSize);

  const currentGroupFields = allVisibleFields.slice(fieldGroup * groupSize, (fieldGroup + 1) * groupSize);

  const validateField = (field: CardFieldConfig, nextValue?: string) => {
    const rawValue = nextValue ?? values[field.name] ?? "";
    const value = String(rawValue);

    if (field.required && !value.trim()) {
      return { valid: false, error: `${field.label} is required.` };
    }

    if (field.type === "email" && value) {
      if (!/^\S+@\S+\.\S+$/.test(value)) {
        return { valid: false, error: "Please enter a valid email address." };
      }
    }

    if (field.name === "mobile" && value) {
      if (!/^\+256\s\d{9}$/.test(value)) {
        return { valid: false, error: "Phone number must be in format +256 7XXXXXXXX." };
      }
    }

    if (field.name === "nin" && value) {
      if (!/^(CM|CF)\d{11}$/.test(value)) {
        return {
          valid: false,
          error: "NIN must be 13 characters, start with 'CM' or 'CF', and the rest must be digits.",
        };
      }
    }

    if (field.type === "date" && value) {
      const t = Date.parse(value);
      if (Number.isNaN(t)) {
        return { valid: false, error: "Please enter a valid date." };
      }
    }

    return { valid: true, error: "" };
  };

  const allCurrentGroupFilled = currentGroupFields.every(f => validateField(f).valid);
  const allStepFieldsValid = allVisibleFields.every(f => validateField(f).valid);

  const handleConfirmField = (field: CardFieldConfig, nextValue?: string) => {
    if (!autoAdvance) return;
    if (!canGoNextGroup) return;

    const idx = allVisibleFields.findIndex(f => f.name === field.name);
    if (idx < 0) return;

    const groupIndex = Math.floor(idx / groupSize);
    if (groupIndex !== fieldGroup) return;

    const groupEndIdx = Math.min(allVisibleFields.length - 1, (fieldGroup + 1) * groupSize - 1);
    if (idx !== groupEndIdx) return;

    const { valid } = validateField(field, nextValue);
    if (!valid) return;

    setFieldGroup(prev => Math.min(prev + 1, totalGroups - 1));
  };

  React.useEffect(() => {
    if (!autoAdvance) return;
    const nextIndex = fieldGroup * groupSize;
    const nextField = allVisibleFields[nextIndex];
    const first = nextField ?? visibleFields[0];
    if (!first) return;
    const t = window.setTimeout(() => {
      const el = document.getElementById(first.name) as HTMLInputElement | null;
      el?.focus?.();
    }, 0);
    return () => window.clearTimeout(t);
  }, [autoAdvance, allVisibleFields, fieldGroup, groupSize, visibleFields]);

  // State for button active (clicked) effect
  const [nextActive, setNextActive] = React.useState(false);
  const handleNextMouseDown = () => setNextActive(true);
  const handleNextMouseUp = () => setNextActive(false);
  const handleNextMouseLeave = () => setNextActive(false);

  const showBackButton = showBack || (!autoAdvance && hasMultipleGroups);
  const backDisabled = !canGoPrevGroup && !showBack;
  const handleBackClick = () => {
    if (canGoPrevGroup) {
      setFieldGroup(fieldGroup - 1);
      return;
    }
    onBack?.();
  };

  const nextLabel = autoAdvance ? nextButtonLabel : (isLastGroup ? nextButtonLabel : "Next");
  const handleNextClick = () => {
    if (!autoAdvance && canGoNextGroup) {
      setFieldGroup(fieldGroup + 1);
      return;
    }
    onNext?.();
  };

  return (
    <div className="max-w-md mx-auto mt-2 rounded-2xl p-8 flex flex-col items-center overflow-y-auto" style={{ minWidth: 340, maxHeight: 520, background: '#E6F9ED', boxShadow: '0 12px 48px 0 rgba(0,166,81,0.28)', border: '2px solid #8FE3B0' }}>
      <div className="w-full mb-4">
        <h2 className="text-xl font-bold text-center" style={{ color: '#00A651' }}>
          {title}
        </h2>
        <div className="w-12 mx-auto mt-2 mb-2 border-b-2 border-green-200 rounded-full" />           
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
          const value = values[field.name] || "";
          const { error } = validateField(field);

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
              <div key={field.name} className="mb-4">
                <label className="block text-base font-medium text-gray-700 mb-3">{field.label}</label>
                {groupValue.length === 0 && (
                  <button type="button" onClick={handleAdd} className="mb-2 px-3 py-1 bg-primary text-white rounded">Add Member</button>
                )}
                {groupValue.length > 0 && (
                  <div className="mb-2 px-4 py-3 bg-white rounded-xl border border-green-200 shadow-sm flex flex-row items-start gap-6 max-w-2xl mx-auto">
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-semibold text-lg text-primary">Member {activeIdx + 1}</span>
                        <button type="button" onClick={() => handleRemove(activeIdx)} className="text-red-500 text-sm">Remove</button>
                      </div>
                      {/* Render subfields for this member */}
                      <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                        {field.fields.map((subField: CardFieldConfig, idx) => {
                      const subValue = (groupValue[activeIdx] && typeof groupValue[activeIdx] === 'object') ? (groupValue[activeIdx] as Record<string, unknown>)[subField.name] ?? "" : "";
                      
                      if (subField.showIf) {
                        const depValue = (groupValue[activeIdx] && typeof groupValue[activeIdx] === 'object') ? (groupValue[activeIdx] as Record<string, unknown>)[subField.showIf.field] ?? "" : "";
                        if (depValue !== subField.showIf.value) {
                          return null;
                        }
                      }
                      
                      const calculateAge = (dob: string) => {
                        if (!dob) return 0;
                        const birthDate = new Date(dob);
                        const today = new Date();
                        let age = today.getFullYear() - birthDate.getFullYear();
                        const monthDiff = today.getMonth() - birthDate.getMonth();
                        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                          age--;
                        }
                        return age;
                      };
                      
                      const handleDateChange = (idx: number, dateName: string, ageName: string, dateValue: string, minAge?: number) => {
                        const age = calculateAge(dateValue);
                        handleFieldChange(idx, dateName, dateValue);
                        handleFieldChange(idx, ageName, age.toString());
                        
                        if (minAge && age > 0 && age < minAge) {
                          setTimeout(() => {
                            alert(`Minimum age requirement is ${minAge} years. Current age: ${age} years.`);
                          }, 100);
                        }
                      };
                      
                          if (
                            subField.type === "checkbox" &&
                            Array.isArray(field.fields) &&
                            idx < field.fields.length - 1 &&
                            field.fields[idx + 1]?.type === "checkbox"
                          ) {
                            const nextField = field.fields[idx + 1];
                            const nextValue = (groupValue[activeIdx] && typeof groupValue[activeIdx] === 'object') ? (groupValue[activeIdx] as Record<string, unknown>)[nextField.name] ?? "" : "";
                            return (
                              <div key={subField.name + "_row"} className="col-span-2 flex flex-row gap-8 mb-2">
                                <label className="flex items-center text-base text-gray-700 mb-0.5">
                                  <input
                                    type="checkbox"
                                    checked={!!subValue}
                                    onChange={e => handleFieldChange(activeIdx, subField.name, e.target.checked ? "true" : "")}
                                    className="mr-2"
                                  />
                                  {subField.label}
                                </label>
                                <label className="flex items-center text-base text-gray-700 mb-0.5">
                                  <input
                                    type="checkbox"
                                    checked={!!nextValue}
                                    onChange={e => handleFieldChange(activeIdx, nextField.name, e.target.checked ? "true" : "")}
                                    className="mr-2"
                                  />
                                  {nextField.label}
                                </label>
                              </div>
                            );
                          }
                      if (
                        subField.type === "checkbox" &&
                        Array.isArray(field.fields) &&
                        idx > 0 &&
                        field.fields[idx - 1]?.type === "checkbox"
                      ) {
                        return null;
                      }
                      
                      const isSpouseIncluded = (groupValue[activeIdx] && typeof groupValue[activeIdx] === 'object') ? (groupValue[activeIdx] as Record<string, unknown>)["includeSpouse"] === "true" : false;
                      
                      if (subField.name === "dob" && subField.type === "date") {
                        const maxDate = isSpouseIncluded ? (() => {
                          const d = new Date();
                          d.setFullYear(d.getFullYear() - 19);
                          return d.toISOString().split('T')[0];
                        })() : undefined;
                        
                        return (
                          <div key={subField.name} className="col-span-2 mb-2">
                            <label className="block text-base text-gray-700 mb-2">
                              {subField.label} 
                              {isSpouseIncluded && <span className="text-sm text-gray-500"> (Min. age 19 for spouse)</span>}
                              {subField.required && <span className="text-red-500"> *</span>}
                            </label>
                            <input
                              type="date"
                              value={subValue as string}
                              max={maxDate}
                              onChange={e => handleDateChange(activeIdx, "dob", "age", e.target.value, isSpouseIncluded ? 19 : undefined)}
                              className="w-full px-3 py-3 border border-gray-300 rounded text-base"
                              placeholder={subField.placeholder}
                            />
                          </div>
                        );
                      }
                      
                      if (subField.name === "age" && subField.type === "number") {
                        const dobValue = (groupValue[activeIdx] && typeof groupValue[activeIdx] === 'object') ? (groupValue[activeIdx] as Record<string, unknown>)["dob"] ?? "" : "";
                        if (dobValue && !subValue) {
                          const calculatedAge = calculateAge(dobValue as string);
                          if (calculatedAge > 0) {
                            setTimeout(() => {
                              handleFieldChange(activeIdx, "age", calculatedAge.toString());
                            }, 0);
                          }
                        }
                        
                        return (
                          <div key={subField.name} className="col-span-2 mb-2">
                            <label className="block text-base text-gray-700 mb-2">{subField.label || "Age"}</label>
                            <input
                              type="text"
                              value={subValue as string}
                              readOnly
                              className="w-full px-3 py-3 border border-gray-300 rounded text-base bg-gray-100"
                              placeholder={subField.placeholder}
                            />
                          </div>
                        );
                      }
                      
                          if (!subField.label && subField.placeholder) {
                            return (
                              <div key={subField.name} className="col-span-2 mb-2">
                                <input
                                  type={subField.type}
                                  value={subValue as string}
                                  onChange={e => handleFieldChange(activeIdx, subField.name, e.target.value)}
                                  className="w-full px-3 py-3 border border-gray-300 rounded text-base"
                                  placeholder={subField.placeholder}
                                />
                              </div>
                            );
                          }
                          return (
                            <div key={subField.name} className="col-span-2 mb-2">
                              <label className="block text-base text-gray-700 mb-2">{subField.label}</label>
                              <input
                                type={subField.type}
                                value={subValue as string}
                                onChange={e => handleFieldChange(activeIdx, subField.name, e.target.value)}
                                className="w-full px-3 py-3 border border-gray-300 rounded text-base"
                                placeholder={subField.placeholder}
                              />
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex justify-between mt-2">
                        <button type="button" disabled={activeIdx === 0} onClick={() => handleSetActiveIdx(field.name, activeIdx - 1)} className={`px-3 py-1 rounded ${activeIdx === 0 ? 'bg-gray-200 text-gray-400' : 'bg-primary text-white'}`}>Back</button>
                        <button type="button" disabled={activeIdx === groupValue.length - 1} onClick={() => handleSetActiveIdx(field.name, activeIdx + 1)} className={`px-3 py-1 rounded ${activeIdx === groupValue.length - 1 ? 'bg-gray-200 text-gray-400' : 'bg-primary text-white'}`}>Next</button>
                      </div>
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
                        onChange={() => {
                          onChange(field.name, opt.value);
                          handleConfirmField(field, opt.value);
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
                onBlur={() => handleConfirmField(field)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    (e.currentTarget as HTMLInputElement).blur();
                  }
                }}
                className={`w-full px-4 py-2 border ${error ? 'border-red-400' : 'border-gray-300'} rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A651] bg-green-50 focus:bg-white transition`}
                placeholder={field.placeholder}
              />
              {error && <div className="text-red-500 text-xs mt-1">{error}</div>}
            </div>
          );
        })}
      </form>
      <div className="flex justify-between mt-4 w-full gap-3">
        {showBackButton && (
          <button
            type="button"
            onClick={handleBackClick}
            disabled={backDisabled}
            className={`px-4 py-2 rounded ${backDisabled ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-300'}`}
          >
            Back
          </button>
        )}
        {showNext && (
          <button
            type="button"
            onClick={handleNextClick}
            onMouseDown={handleNextMouseDown}
            onMouseUp={handleNextMouseUp}
            onMouseLeave={handleNextMouseLeave}
            disabled={autoAdvance ? !allStepFieldsValid : !allCurrentGroupFilled}
            className={`mt-0 ${showBackButton ? 'flex-1' : 'w-full'} py-2 px-4 bg-gradient-to-r from-[#00A651] to-green-600 text-white font-semibold rounded-xl transition text-base shadow-md flex items-center justify-center gap-2${(autoAdvance ? !allStepFieldsValid : !allCurrentGroupFilled) ? ' opacity-50 cursor-not-allowed' : ''} ${nextActive ? 'scale-105 ring-2 ring-green-400' : ''} hover:from-green-700 hover:to-green-500 hover:scale-105 hover:ring-2 hover:ring-green-400`}
            style={{ letterSpacing: 0.5 }}
          >
            {nextLabel}
          </button>
        )}
      </div>
      <div className="w-full mt-3 text-xs text-gray-500 text-center">
        Fields marked with <span className="text-red-500">*</span> are compulsory.
      </div>
    </div>
  );
}

export default CardForm;
