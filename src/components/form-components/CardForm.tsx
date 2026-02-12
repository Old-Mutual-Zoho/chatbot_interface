import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export interface CardFieldConfig {
  name: string;
  label?: string;
  type: string;
  required?: boolean;
  placeholder?: string;
  optionalLabel?: string;
  readOnly?: boolean;
  // Optional validation helpers (keeps forms declarative)
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  patternMessage?: string;
  integer?: boolean;
  min?: number;
  max?: number;
  // ISO date (YYYY-MM-DD) or relative like "today", "today+30", "today-1"
  minDate?: string;
  maxDate?: string;
  // Cross-field date constraints (compares this field's date against another field's date value)
  minDateField?: string;
  maxDateField?: string;
  minDateFieldMessage?: string;
  maxDateFieldMessage?: string;
  // Age validation for date fields (typically DOB). Age is calculated against today's date.
  minAgeYears?: number;
  maxAgeYears?: number;
  // For radio/select/checkbox-group fields
  options?: { label: string; value: string }[];
  // For conditional fields
  showIf?: { field: string; value: string | boolean | Array<string | boolean> };
  // If true, hide this field once it's valid and the next field is revealed.
  hideWhenValid?: boolean;
  // For repeatable-group fields
  fields?: CardFieldConfig[];
}

export interface CardFormProps {
  title: string;
  description?: string;
  fields: CardFieldConfig[];
  values: Record<string, string>;
  onChange: (name: string, value: string) => void;
  onNext?: () => void;
  onBack?: () => void;
  showBack?: boolean;
  showNext?: boolean;
  nextButtonLabel?: string;
  nextDisabled?: boolean;
  groupSize?: number;
  autoAdvance?: boolean;
}



const CardForm: React.FC<CardFormProps> = ({
  title,
  description,
  fields,
  values,
  onChange,
  onNext,
  onBack,
  showBack = false,
  showNext = true,
  nextButtonLabel = "Next",
  nextDisabled = false,
  groupSize: groupSizeProp = 2,
  autoAdvance = false,
}) => {
  const stepKey = React.useMemo(() => {
    const fieldKey = fields.map((f) => `${f.name}:${f.type}`).join("|");
    return `${String(title ?? "").trim()}::${fieldKey}`;
  }, [fields, title]);

  // Unified progressive reveal logic for all forms
  const [fieldGroup, setFieldGroup] = React.useState(0);
  const groupSize = Math.max(1, groupSizeProp);
  React.useEffect(() => {
    // Reset progressive reveal when the step changes.
    // (If we don't, moving from a multi-group step to a single-field step can slice an empty group.)
    setFieldGroup(0);
  }, [stepKey]);

  // Repeatable group state for active member index per group
  const [repeatableGroupState, setRepeatableGroupState] = React.useState<{ [key: string]: number }>({});
  React.useEffect(() => {
    setRepeatableGroupState({});
  }, [fields, title]);
  const handleSetActiveIdx = (fieldName: string, idx: number) => {
    setRepeatableGroupState(prev => ({ ...prev, [fieldName]: idx }));
  };

  // Combobox (searchable dropdown) state
  const [openComboboxId, setOpenComboboxId] = React.useState<string | null>(null);
  const [comboboxQuery, setComboboxQuery] = React.useState<string>("");
  const [comboboxActiveIndex, setComboboxActiveIndex] = React.useState<number>(-1);
  const comboboxMenuRef = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(() => {
    if (!openComboboxId) return;
    const onMouseDown = (e: MouseEvent) => {
      const target = e.target as Element | null;
      if (!target) return;
      const root = target.closest(`[data-combobox-root="${openComboboxId}"]`);
      if (!root) setOpenComboboxId(null);
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [openComboboxId]);

  const showIfMatches = React.useCallback((showIf: CardFieldConfig["showIf"]) => {
    if (!showIf) return true;
    const depValue = values[showIf.field];
    const expected = showIf.value;
    if (Array.isArray(expected)) {
      return expected.includes(depValue as any);
    }
    return depValue === expected;
  }, [values]);

  // Only show fields that are not hidden by showIf
  const allVisibleFields = fields.filter(field => {
    return showIfMatches(field.showIf);
  });

  React.useEffect(() => {
    // Safety: keep fieldGroup in range as visible fields change (e.g. showIf).
    const maxGroup = Math.max(0, Math.ceil(allVisibleFields.length / groupSize) - 1);
    setFieldGroup((prev) => Math.min(prev, maxGroup));
  }, [allVisibleFields.length, groupSize]);

  const openComboboxField = React.useMemo(() => {
    if (!openComboboxId) return undefined;
    const field = allVisibleFields.find((f) => f.name === openComboboxId);
    if (!field) return undefined;
    if (field.type !== "combobox") return undefined;
    if (!Array.isArray(field.options)) return undefined;
    return field;
  }, [allVisibleFields, openComboboxId]);

  const openComboboxFilteredOptions = React.useMemo(() => {
    if (!openComboboxField) return [] as { label: string; value: string }[];
    const q = comboboxQuery.trim().toLowerCase();
    if (!q) return openComboboxField.options ?? [];
    return (openComboboxField.options ?? []).filter((opt) => opt.label.toLowerCase().includes(q));
  }, [comboboxQuery, openComboboxField]);

  React.useEffect(() => {
    if (!openComboboxId) return;
    if (openComboboxFilteredOptions.length === 0) {
      setComboboxActiveIndex(-1);
      return;
    }
    setComboboxActiveIndex((idx) => {
      if (idx < 0) return 0;
      if (idx >= openComboboxFilteredOptions.length) return openComboboxFilteredOptions.length - 1;
      return idx;
    });
  }, [openComboboxId, openComboboxFilteredOptions.length]);

  React.useEffect(() => {
    if (!openComboboxId) return;
    if (comboboxActiveIndex < 0) return;
    const root = comboboxMenuRef.current;
    if (!root) return;
    const el = root.querySelector('[data-combobox-active="true"]') as HTMLElement | null;
    el?.scrollIntoView?.({ block: "nearest" });
  }, [openComboboxId, comboboxActiveIndex]);

  const totalGroups = Math.ceil(allVisibleFields.length / groupSize);
  const hasMultipleGroups = totalGroups > 1;
  const isFirstGroup = fieldGroup <= 0;
  const isLastGroup = fieldGroup >= totalGroups - 1;
  const canGoPrevGroup = !autoAdvance && hasMultipleGroups && !isFirstGroup;
  const canGoNextGroup = hasMultipleGroups && !isLastGroup;
  const currentGroupStart = fieldGroup * groupSize;
  const currentGroupEnd = (fieldGroup + 1) * groupSize;
  const currentGroupFields = allVisibleFields.slice(currentGroupStart, currentGroupEnd);

  const resolveRelativeDate = (spec?: string) => {
    if (!spec) return undefined;
    const s = spec.trim().toLowerCase();
    if (!s) return undefined;
    if (s === "today") {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      return d;
    }
    const m = s.match(/^today([+-]\d+)?$/);
    if (m) {
      const offsetDays = m[1] ? Number(m[1]) : 0;
      if (!Number.isFinite(offsetDays)) return undefined;
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() + offsetDays);
      return d;
    }
    const t = Date.parse(spec);
    if (Number.isNaN(t)) return undefined;
    const d = new Date(t);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const validateField = (
    field: CardFieldConfig,
    nextValue?: string
  ): { valid: boolean; error: string } => {
    const rawValue = nextValue ?? values[field.name] ?? "";
    const value = String(rawValue);
    const trimmed = value.trim();

    if (field.type === "repeatable-group") {
      let groupValue: Array<Record<string, unknown>> = [];
      try {
        const parsed = trimmed ? JSON.parse(trimmed) : [];
        groupValue = Array.isArray(parsed) ? parsed : [];
      } catch {
        groupValue = [];
      }

      if (field.required && groupValue.length === 0) {
        return { valid: false, error: `${field.label} is required.` };
      }

      if (!Array.isArray(field.fields) || field.fields.length === 0) {
        return { valid: true, error: "" };
      }

      for (let i = 0; i < groupValue.length; i++) {
        const member = groupValue[i] ?? {};
        for (const subField of field.fields) {
          const subRaw = (member as Record<string, unknown>)[subField.name];
          const subValue = subRaw == null ? "" : String(subRaw);
          const res: { valid: boolean; error: string } = validateField(subField, subValue);
          if (!res.valid) {
            return { valid: false, error: `Travellor ${i + 1}: ${res.error}` };
          }
        }
      }

      return { valid: true, error: "" };
    }

    if (field.required && !trimmed) {
      return { valid: false, error: `${field.label} is required.` };
    }

    if (trimmed) {
      if (typeof field.minLength === "number" && trimmed.length < field.minLength) {
        return { valid: false, error: `${field.label} must be at least ${field.minLength} characters.` };
      }
      if (typeof field.maxLength === "number" && trimmed.length > field.maxLength) {
        return { valid: false, error: `${field.label} must be at most ${field.maxLength} characters.` };
      }
      if (field.pattern) {
        try {
          const re = new RegExp(field.pattern);
          if (!re.test(trimmed)) {
            return { valid: false, error: field.patternMessage || `Please enter a valid ${field.label}.` };
          }
        } catch {
          // Invalid regex pattern: fail open so we don't block the form.
        }
      }
    }

    if (field.type === "email" && trimmed) {
      const normalizedEmail = trimmed.toLowerCase();
      if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
        return { valid: false, error: "Please enter a valid email address." };
      }
    }

    if (field.name === "mobile" && trimmed) {
      // Accept Uganda formats (allows spaces/dashes for UX):
      // +2567XXXXXXXX, +256 7XXXXXXXX, +256 712-345-678, 07XXXXXXXX
      const normalized = trimmed.replace(/[\s-]/g, "");
      if (!/^(\+2567\d{8}|07\d{8})$/.test(normalized)) {
        return { valid: false, error: "Wrong Phone number format" };
      }
    }

    if (field.name === "nin" && trimmed) {
      if (!/^(CM|CF)\d{11}$/.test(trimmed)) {
        return {
          valid: false,
          error: "NIN must be 13 characters, start with 'CM' or 'CF', and the rest must be digits.",
        };
      }
    }

    if (field.type === "date" && trimmed) {
      const t = Date.parse(trimmed);
      if (Number.isNaN(t)) {
        return { valid: false, error: "Please enter a valid date." };
      }

      const d = new Date(t);
      d.setHours(0, 0, 0, 0);
      const minD = resolveRelativeDate(field.minDate);
      const maxD = resolveRelativeDate(field.maxDate);

      if (minD && d < minD) {
        return { valid: false, error: `${field.label} cannot be before ${minD.toISOString().slice(0, 10)}.` };
      }
      if (maxD && d > maxD) {
        return { valid: false, error: `${field.label} cannot be after ${maxD.toISOString().slice(0, 10)}.` };
      }

      if (field.minDateField) {
        const otherRaw = values[field.minDateField];
        if (otherRaw) {
          const otherT = Date.parse(otherRaw);
          if (!Number.isNaN(otherT)) {
            const otherD = new Date(otherT);
            otherD.setHours(0, 0, 0, 0);
            if (d < otherD) {
              return {
                valid: false,
                error: field.minDateFieldMessage || `${field.label} cannot be before ${field.minDateField}.`,
              };
            }
          }
        }
      }

      if (field.maxDateField) {
        const otherRaw = values[field.maxDateField];
        if (otherRaw) {
          const otherT = Date.parse(otherRaw);
          if (!Number.isNaN(otherT)) {
            const otherD = new Date(otherT);
            otherD.setHours(0, 0, 0, 0);
            if (d > otherD) {
              return {
                valid: false,
                error: field.maxDateFieldMessage || `${field.label} cannot be after ${field.maxDateField}.`,
              };
            }
          }
        }
      }

      const ref = new Date();
      ref.setHours(0, 0, 0, 0);

      if (typeof field.minAgeYears === "number" && Number.isFinite(field.minAgeYears)) {
        const minAgeCutoff = new Date(ref);
        minAgeCutoff.setFullYear(minAgeCutoff.getFullYear() - field.minAgeYears);
        minAgeCutoff.setHours(0, 0, 0, 0);
        if (d > minAgeCutoff) {
          return { valid: false, error: `You must be at least ${field.minAgeYears} years old.` };
        }
      }

      if (typeof field.maxAgeYears === "number" && Number.isFinite(field.maxAgeYears)) {
        const maxAgeCutoff = new Date(ref);
        maxAgeCutoff.setFullYear(maxAgeCutoff.getFullYear() - field.maxAgeYears);
        maxAgeCutoff.setHours(0, 0, 0, 0);
        if (d < maxAgeCutoff) {
          return { valid: false, error: `Age cannot be more than ${field.maxAgeYears} years.` };
        }
      }
    }

    if (field.type === "number" && trimmed) {
      const normalizedNumber = trimmed.replace(/[,\s]/g, "");
      const n = Number(normalizedNumber);
      if (Number.isNaN(n)) {
        return { valid: false, error: `${field.label} must be a number.` };
      }
      if (field.integer && !Number.isInteger(n)) {
        return { valid: false, error: `${field.label} must be a whole number.` };
      }
      if (typeof field.min === "number" && n < field.min) {
        return { valid: false, error: `${field.label} must be at least ${field.min}.` };
      }
      if (typeof field.max === "number" && n > field.max) {
        return { valid: false, error: `${field.label} must be at most ${field.max}.` };
      }
    }

    return { valid: true, error: "" };
  };

  // Progressive reveal within each group: show 1 field at a time.
  // The next field appears only after the previous one validates.
  const getRevealCountForGroup = (groupFields: CardFieldConfig[]) => {
    if (groupFields.length <= 1) return groupFields.length;

    for (let i = 0; i < groupFields.length; i++) {
      const { valid } = validateField(groupFields[i]);
      if (!valid) {
        return i + 1;
      }
    }
    return groupFields.length;
  };

  const revealCount = getRevealCountForGroup(currentGroupFields);
  const revealedCurrentGroupFields = currentGroupFields.slice(0, Math.max(1, revealCount));

  const displayedCurrentGroupFields = revealedCurrentGroupFields.filter((field, idx) => {
    if (!field.hideWhenValid) return true;
    // Never hide the last currently revealed field.
    if (idx >= revealedCurrentGroupFields.length - 1) return true;
    return !validateField(field).valid;
  });

  const visibleFields = autoAdvance
    ? [
        ...allVisibleFields.slice(0, currentGroupStart),
        ...displayedCurrentGroupFields,
      ]
    : displayedCurrentGroupFields;

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
    const first = nextField;
    if (!first) return;
    const t = window.setTimeout(() => {
      const el = document.getElementById(first.name) as HTMLInputElement | null;
      el?.focus?.();
    }, 0);
    return () => window.clearTimeout(t);
  }, [autoAdvance, allVisibleFields, fieldGroup, groupSize]);

  // State for button active (clicked) effect
  const [nextActive, setNextActive] = React.useState(false);
  const [showErrors, setShowErrors] = React.useState(false);
  const [touchedFields, setTouchedFields] = React.useState<Record<string, boolean>>({});

  const markTouched = (name: string) => {
    setTouchedFields((prev) => (prev[name] ? prev : { ...prev, [name]: true }));
  };

  const limitUgandaMobileDigits = (raw: string) => {
    const s = String(raw ?? "");
    const startsWithPlus = s.trimStart().startsWith("+");

    const digitsAll = s.replace(/\D/g, "");
    const normalizedStart = s.trimStart();
    const maxDigits = startsWithPlus || digitsAll.startsWith("256")
      ? 12 // 256 + 9 digits (7XXXXXXXX)
      : 10; // 07XXXXXXXX

    const limitedDigits = digitsAll.slice(0, maxDigits);
    let di = 0;
    let plusUsed = false;

    const rebuilt = Array.from(s).map((ch, idx) => {
      if (ch === "+") {
        if (idx === 0 && !plusUsed) {
          plusUsed = true;
          return "+";
        }
        return "";
      }
      if (/\d/.test(ch)) {
        if (di >= limitedDigits.length) return "";
        const out = limitedDigits[di];
        di += 1;
        return out;
      }
      // Keep separators/spaces as the user typed.
      return ch;
    }).join("");

    // If user started with + but we lost it (e.g. pasted digits then typed +), keep + at start.
    if (startsWithPlus && !rebuilt.startsWith("+")) {
      return "+" + rebuilt;
    }

    // If input is all digits (no formatting), just return truncated digits.
    if (normalizedStart && /^\d+$/.test(normalizedStart)) {
      return limitedDigits;
    }

    return rebuilt;
  };

  const getEffectiveMaxLength = (field: CardFieldConfig) => {
    if (typeof field.maxLength === "number") return field.maxLength;
    if (field.type === "number" && typeof field.max === "number" && Number.isFinite(field.max)) {
      const absMax = Math.abs(Math.trunc(field.max));
      const digits = String(absMax).length;
      return digits > 0 ? digits : undefined;
    }
    return undefined;
  };

  const applyMaxLength = (field: CardFieldConfig, raw: string) => {
    const maxLen = getEffectiveMaxLength(field);
    if (!maxLen) return raw;
    return String(raw ?? "").slice(0, maxLen);
  };

  const limitDigitsPreserveFormatting = (raw: string, maxDigits: number) => {
    const s = String(raw ?? "");
    const digitsAll = s.replace(/\D/g, "");
    const limitedDigits = digitsAll.slice(0, Math.max(0, maxDigits));
    let di = 0;
    return Array.from(s).map((ch) => {
      if (/\d/.test(ch)) {
        if (di >= limitedDigits.length) return "";
        const out = limitedDigits[di];
        di += 1;
        return out;
      }
      return ch;
    }).join("");
  };

  const applyInputCaps = (field: CardFieldConfig, raw: string) => {
    if (field.name === "mobile") {
      return limitUgandaMobileDigits(raw);
    }

    if (field.type === "number") {
      const maxDigits = getEffectiveMaxLength(field);
      if (!maxDigits) return raw;
      return limitDigitsPreserveFormatting(raw, maxDigits);
    }

    return applyMaxLength(field, raw);
  };
  const handleNextMouseDown = () => setNextActive(true);
  const handleNextMouseUp = () => setNextActive(false);
  const handleNextMouseLeave = () => setNextActive(false);

  const [transitionDir, setTransitionDir] = React.useState<"next" | "back" | null>(null);
  const [transitionKey, setTransitionKey] = React.useState(0);

  const showBackButton = showBack || (!autoAdvance && hasMultipleGroups);
  const backDisabled = !canGoPrevGroup && !showBack;
  const handleBackClick = () => {
    setTransitionDir("back");
    setTransitionKey((k) => k + 1);
    setShowErrors(false);
    setTouchedFields({});
    if (canGoPrevGroup) {
      setFieldGroup(fieldGroup - 1);
      return;
    }
    onBack?.();
  };

  const nextLabel = autoAdvance ? nextButtonLabel : (isLastGroup ? nextButtonLabel : "Next");
  const handleNextClick = () => {
    setShowErrors(true);
    setTransitionDir("next");
    setTransitionKey((k) => k + 1);
    if (!autoAdvance && canGoNextGroup) {
      setFieldGroup(fieldGroup + 1);
      setShowErrors(false);
      setTouchedFields({});
      return;
    }
    onNext?.();
  };

  const transitionClass = transitionDir === "next" ? "om-slide-in-right" : transitionDir === "back" ? "om-slide-in-left" : "";

  return (
    <div
      className="w-full mt-2 rounded-2xl p-8 flex flex-col items-center overflow-visible bg-white border border-gray-200"
      style={{ maxHeight: 520 }}
    >
      <div key={transitionKey} className={transitionClass}>
      <div className="w-full mb-4">
        <h2 className="text-xl font-bold text-center" style={{ color: '#00A651' }}>
          {title}
        </h2>
        <div className="w-12 mx-auto mt-2 mb-2 border-b-2 border-green-200 rounded-full" />
        {description && (
          <p className="mt-2 text-center text-sm text-gray-600 leading-snug">
            {description}
          </p>
        )}
      </div>
      <form className="w-full flex flex-col gap-5">
        <div
          className={`w-full flex flex-col gap-5 pr-1 ${openComboboxId ? "overflow-visible" : "overflow-y-auto om-show-scrollbar"}`}
          style={{ maxHeight: 320 }}
        >
          {visibleFields.map((field) => {
          // Conditional rendering for fields with showIf
          if (field.showIf) {
            if (!showIfMatches(field.showIf)) return null;
          }
          // Validation logic
          const value = values[field.name] || "";
          const { error } = validateField(field);
          const shouldShowError = (showErrors || touchedFields[field.name]) && !!error;
          const effectiveMaxLen = getEffectiveMaxLength(field);

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
              <div key={field.name} className="w-full">
                <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-1">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                  {field.optionalLabel && <span className="text-gray-400"> ({field.optionalLabel})</span>}
                </label>
                {groupValue.length === 0 && (
                  <button type="button" onClick={handleAdd} className="mb-2 px-3 py-1 bg-primary text-white rounded cursor-pointer">Add Travellor</button>
                )}
                {groupValue.length > 0 && (
                  <div className="mb-2 px-4 py-3 bg-white rounded-xl border border-green-200 shadow-sm flex flex-row items-start gap-6 max-w-2xl mx-auto">
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-semibold text-lg text-primary">Travellor {activeIdx + 1}</span>
                        <button type="button" onClick={() => handleRemove(activeIdx)} className="text-red-500 text-sm cursor-pointer">Remove</button>
                      </div>
                      {field.fields.map((subField) => {
                        const subValue = (groupValue[activeIdx] && typeof groupValue[activeIdx] === 'object') ? (groupValue[activeIdx] as Record<string, unknown>)[subField.name] ?? "" : "";
                        const subMaxLen = getEffectiveMaxLength(subField);
                        // Render subfields (customize as needed)
                        return (
                          <div key={subField.name} className="col-span-2 mb-2">
                            {subField.label && <label className="block text-base text-gray-700 mb-2">{subField.label}</label>}
                            <input
                              type={subField.type}
                              value={subValue as string}
                              maxLength={subMaxLen}
                              onChange={e => handleFieldChange(activeIdx, subField.name, applyInputCaps(subField, e.target.value))}
                              className="w-full px-3 py-3 border border-gray-300 rounded text-base"
                              placeholder={subField.placeholder}
                            />
                          </div>
                        );
                      })}
                      <div className="flex justify-between mt-2">
                        <button type="button" disabled={activeIdx === 0} onClick={() => handleSetActiveIdx(field.name, activeIdx - 1)} className={`px-3 py-1 rounded ${activeIdx === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-primary text-white cursor-pointer'}`}>Back</button>
                        <button type="button" disabled={activeIdx === groupValue.length - 1} onClick={() => handleSetActiveIdx(field.name, activeIdx + 1)} className={`px-3 py-1 rounded ${activeIdx === groupValue.length - 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-primary text-white cursor-pointer'}`}>Next</button>
                      </div>
                    </div>
                  </div>
                )}
                {groupValue.length > 0 && (
                  <button type="button" onClick={handleAdd} className="mt-2 px-3 py-1 bg-primary text-white rounded cursor-pointer">Add Travellor</button>
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
                          markTouched(field.name);
                          onChange(field.name, opt.value);
                          handleConfirmField(field, opt.value);
                        }}
                        className="accent-green-600"
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
                {shouldShowError && <div className="text-red-500 text-xs mt-1">{error}</div>}
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
                          markTouched(field.name);
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
                {shouldShowError && <div className="text-red-500 text-xs mt-1">{error}</div>}
              </div>
            );
          }

          // Render combobox fields (searchable select)
          if (field.type === "combobox" && Array.isArray(field.options)) {
            const selectedOption = field.options.find((opt) => opt.value === value);
            const isOpen = openComboboxId === field.name;
            const displayValue = isOpen ? comboboxQuery : (selectedOption?.label ?? "");
            const filteredOptions = isOpen ? openComboboxFilteredOptions : field.options;

            return (
              <div
                key={field.name}
                className="mb-2 relative"
                data-combobox-root={field.name}
              >
                <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-1">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                  {field.optionalLabel && <span className="text-gray-400"> ({field.optionalLabel})</span>}
                </label>

                <input
                  id={field.name}
                  name={field.name}
                  type="text"
                  value={displayValue}
                  placeholder={field.placeholder || "Search..."}
                  autoComplete="off"
                  onFocus={() => {
                    setOpenComboboxId(field.name);
                    setComboboxQuery("");
                    setComboboxActiveIndex(0);
                  }}
                  onChange={(e) => {
                    markTouched(field.name);
                    if (!isOpen) setOpenComboboxId(field.name);
                    setComboboxQuery(e.target.value);
                    setComboboxActiveIndex(0);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      setOpenComboboxId(null);
                      return;
                    }
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      if (!isOpen) setOpenComboboxId(field.name);
                      setComboboxActiveIndex((idx) => {
                        if (filteredOptions.length === 0) return -1;
                        const next = idx < 0 ? 0 : Math.min(filteredOptions.length - 1, idx + 1);
                        return next;
                      });
                      return;
                    }
                    if (e.key === "ArrowUp") {
                      e.preventDefault();
                      if (!isOpen) setOpenComboboxId(field.name);
                      setComboboxActiveIndex((idx) => {
                        if (filteredOptions.length === 0) return -1;
                        const next = idx < 0 ? 0 : Math.max(0, idx - 1);
                        return next;
                      });
                      return;
                    }
                    if (e.key === "Home") {
                      e.preventDefault();
                      if (filteredOptions.length > 0) setComboboxActiveIndex(0);
                      return;
                    }
                    if (e.key === "End") {
                      e.preventDefault();
                      if (filteredOptions.length > 0) setComboboxActiveIndex(filteredOptions.length - 1);
                      return;
                    }
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const chosen =
                        comboboxActiveIndex >= 0 && comboboxActiveIndex < filteredOptions.length
                          ? filteredOptions[comboboxActiveIndex]
                          : filteredOptions[0];
                      if (!chosen) return;
                      onChange(field.name, chosen.value);
                      markTouched(field.name);
                      handleConfirmField(field, chosen.value);
                      setOpenComboboxId(null);
                      setComboboxQuery("");
                      setComboboxActiveIndex(-1);
                    }
                  }}
                  onBlur={() => markTouched(field.name)}
                  className={`w-full px-4 py-2 border ${shouldShowError ? 'border-red-500' : 'border-gray-300'} rounded-xl bg-green-50 focus:bg-white transition focus:outline-none`}
                />

                {isOpen && (
                  <div
                    ref={comboboxMenuRef}
                    className="absolute z-50 mt-1 w-full bg-white rounded-xl border border-green-200 shadow-lg max-h-72 overflow-y-auto overscroll-contain"
                    onWheel={(e) => e.stopPropagation()}
                  >
                    {filteredOptions.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-gray-500">No matches</div>
                    ) : (
                      filteredOptions.map((opt, idx) => (
                        <button
                          key={opt.value}
                          type="button"
                          onMouseDown={(evt) => evt.preventDefault()}
                          onMouseEnter={() => setComboboxActiveIndex(idx)}
                          onClick={() => {
                            onChange(field.name, opt.value);
                            markTouched(field.name);
                            handleConfirmField(field, opt.value);
                            setOpenComboboxId(null);
                            setComboboxQuery("");
                            setComboboxActiveIndex(-1);
                          }}
                          data-combobox-active={idx === comboboxActiveIndex ? "true" : "false"}
                          className={`w-full text-left px-4 py-2 text-sm transition ${idx === comboboxActiveIndex ? 'bg-green-100' : 'bg-white'} hover:bg-green-50 ${value === opt.value ? 'font-semibold' : ''}`}
                        >
                          {opt.label}
                        </button>
                      ))
                    )}
                  </div>
                )}

                {shouldShowError && <div className="text-red-500 text-xs mt-1">{error}</div>}
              </div>
            );
          }

          // Render select fields
          if (field.type === "select" && Array.isArray(field.options)) {
            const placeholderText = field.placeholder || "Select an option";
            return (
              <div key={field.name}>
                <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-1">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                  {field.optionalLabel && <span className="text-gray-400"> ({field.optionalLabel})</span>}
                </label>
                <select
                  id={field.name}
                  name={field.name}
                  required={field.required}
                  value={value}
                  onChange={(e) => {
                    markTouched(field.name);
                    onChange(field.name, e.target.value);
                    handleConfirmField(field, e.target.value);
                  }}
                  onBlur={() => {
                    markTouched(field.name);
                    handleConfirmField(field);
                  }}
                  className={`w-full px-4 py-2 border ${shouldShowError ? 'border-red-500' : 'border-gray-300'} rounded-xl bg-white transition focus:outline-none focus:ring-2 focus:ring-primary`}
                >
                  <option value="" disabled>
                    {placeholderText}
                  </option>
                  {field.options && field.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {shouldShowError && <div className="text-red-500 text-xs mt-1">{error}</div>}
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
              {field.type === "date" ? (
                <DatePicker
                  id={field.name}
                  name={field.name}
                  selected={value ? new Date(value) : null}
                  onChange={(date: Date | null) => {
                    const isoDate = date ? date.toISOString().split('T')[0] : "";
                    onChange(field.name, isoDate);
                    markTouched(field.name);
                    handleConfirmField(field, isoDate);
                  }}
                  onBlur={() => {
                    markTouched(field.name);
                    handleConfirmField(field);
                  }}
                  dateFormat="yyyy-MM-dd"
                  placeholderText={field.placeholder || "mm/dd/yyyy"}
                  readOnly={field.readOnly}
                  className={`w-full px-4 py-2 border ${shouldShowError ? 'border-red-500' : 'border-gray-300'} rounded-xl bg-white transition focus:outline-none focus:ring-2 focus:ring-primary`}
                  calendarClassName="om-datepicker-popup"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                  popperPlacement="bottom"
                />
              ) : (
                <input
                  id={field.name}
                  name={field.name}
                  type={field.type}
                  required={field.required}
                  value={value}
                  readOnly={field.readOnly}
                  maxLength={effectiveMaxLen}
                  onChange={e => {
                    markTouched(field.name);
                    const nextRaw = e.target.value;
                    onChange(field.name, applyInputCaps(field, nextRaw));
                  }}
                  onBlur={() => {
                    markTouched(field.name);
                    if (field.type === "email") {
                      const normalized = String(values[field.name] ?? "").trim().toLowerCase();
                      if (normalized !== (values[field.name] ?? "")) {
                        onChange(field.name, normalized);
                        handleConfirmField(field, normalized);
                        return;
                      }
                    }
                    handleConfirmField(field);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      (e.currentTarget as HTMLInputElement).blur();
                    }
                  }}
                  className={`w-full px-4 py-2 border ${shouldShowError ? 'border-red-500' : 'border-gray-300'} rounded-xl bg-white transition focus:outline-none focus:ring-2 focus:ring-primary`}
                  placeholder={field.placeholder}
                />
              )}
              {shouldShowError && <div className="text-red-500 text-xs mt-1">{error}</div>}
            </div>
          );
          })}
        </div>
      </form>
      <div className="flex justify-between mt-4 w-full gap-3">
        {showBackButton && (
          <button
            type="button"
            onClick={handleBackClick}
            disabled={backDisabled}
            className={`w-[45%] px-4 py-2 rounded ${backDisabled ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-300 cursor-pointer'}`}
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
            disabled={(autoAdvance ? !allStepFieldsValid : !allCurrentGroupFilled) || nextDisabled}
            className={`w-[45%] mt-0 py-2 px-4 bg-linear-to-r from-primary to-green-600 text-white font-semibold rounded-xl transition text-base shadow-md flex items-center justify-center gap-2${((autoAdvance ? !allStepFieldsValid : !allCurrentGroupFilled) || nextDisabled) ? ' opacity-50 cursor-not-allowed' : ' cursor-pointer'} ${nextActive ? 'scale-105 ring-2 ring-green-400' : ''} hover:from-green-700 hover:to-green-500 hover:scale-105 hover:ring-2 hover:ring-green-400`}
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
    </div>
  );
}

export default CardForm;
