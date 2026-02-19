
import React, { useState, useCallback } from "react";

export interface CardFieldConfig {
  name: string;
  label?: string;
  type: string;
  required?: boolean;
  placeholder?: string;
  options?: { label: string; value: string }[];
}

export interface ConfirmationCardProps {
  data: Record<string, unknown>;
  labels: Record<string, string>;
  fieldTypes?: Record<string, CardFieldConfig>;
  confirmDisabled?: boolean;
  loading?: boolean;
  onEdit?: (values: Record<string, string>) => void;
  onGetQuote?: () => void;
}

const ConfirmationCard: React.FC<ConfirmationCardProps> = ({ data, labels, fieldTypes = {}, confirmDisabled, loading = false, onEdit, onGetQuote }) => {
  const [editMode, setEditMode] = useState(false);
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [originalValues, setOriginalValues] = useState<Record<string, string>>({});
  const [buttonText, setButtonText] = useState<'edit' | 'cancel' | 'save'>('edit');

  // Prepare display data
  const displayData = editMode ? editValues : Object.fromEntries(Object.entries(data).map(([k, v]) => [k, v == null ? '' : String(v)]));

  // Enter edit mode
  const handleEdit = useCallback(() => {
    const strData = Object.fromEntries(Object.entries(data).map(([k, v]) => [k, v == null ? '' : String(v)]));
    setEditValues(strData);
    setOriginalValues(strData);
    setEditMode(true);
    setButtonText('cancel');
  }, [data]);

  // Cancel edit
  const handleCancel = useCallback(() => {
    setEditValues({ ...originalValues });
    setEditMode(false);
    setButtonText('edit');
  }, [originalValues]);

  // Save changes
  const handleSave = useCallback(() => {
    if (onEdit) onEdit(editValues);
    setEditMode(false);
    setButtonText('edit');
  }, [editValues, onEdit]);

  // Handle input change
  const handleFieldChange = (key: string, value: string) => {
    const next = { ...editValues, [key]: value };
    setEditValues(next);
    // If any value changed, show Save
    const changed = Object.keys(next).some(k => next[k] !== originalValues[k]);
    setButtonText(changed ? 'save' : 'cancel');
  };

  // Render field for edit mode
  const renderField = (key: string, value: string) => {
    const config = fieldTypes[key] || { type: 'text' };
    if (config.type === 'select' && config.options) {
      return (
        <select
          className="w-full px-2 py-1 border border-gray-300 rounded focus:border-green-400"
          value={value}
          onChange={e => handleFieldChange(key, e.target.value)}
          disabled={confirmDisabled || loading}
        >
          <option value="">Select...</option>
          {config.options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      );
    }
    if (config.type === 'checkbox') {
      return (
        <input
          type="checkbox"
          checked={value === 'true'}
          onChange={e => handleFieldChange(key, e.target.checked ? 'true' : 'false')}
          disabled={confirmDisabled || loading}
        />
      );
    }
    if (config.type === 'radio' && config.options) {
      return (
        <div className="flex gap-2">
          {config.options.map(opt => (
            <label key={opt.value} className="flex items-center gap-1">
              <input
                type="radio"
                name={key}
                value={opt.value}
                checked={value === opt.value}
                onChange={e => handleFieldChange(key, e.target.value)}
                disabled={confirmDisabled || loading}
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      );
    }
    // Default to text
    return (
      <input
        type="text"
        className="w-full px-2 py-1 border border-gray-300 rounded focus:border-green-400"
        value={value}
        onChange={e => handleFieldChange(key, e.target.value)}
        disabled={confirmDisabled || loading}
      />
    );
  };

  // Visual indication for edit mode
  const editBorder = editMode ? 'border-2 border-green-300 bg-green-50' : 'border-2 border-green-400';

  // Button label and handler
  let editButtonLabel = 'Edit Details';
  let editButtonHandler = handleEdit;
  if (editMode) {
    if (buttonText === 'save') {
      editButtonLabel = 'Save';
      editButtonHandler = handleSave;
    } else {
      editButtonLabel = 'Cancel';
      editButtonHandler = handleCancel;
    }
  }

  return (
    <div className={`bg-white ${editBorder} rounded-2xl shadow-lg p-6 max-w-md mx-auto my-4 animate-fade-in`}>
      <h3 className="text-lg font-bold text-green-700 mb-4">Please Confirm Your Details</h3>
      <div className="divide-y divide-gray-200 mb-4">
        {Object.entries(displayData).map(([key, value]) => (
          <div key={key} className="py-2 flex justify-between items-center">
            <span className="font-medium text-gray-700">{labels[key] || key}</span>
            {editMode ? (
              <span className="text-gray-900 text-right break-all w-2/3">{renderField(key, value as string)}</span>
            ) : (
              <span className="text-gray-900 text-right break-all">{String(value)}</span>
            )}
          </div>
        ))}
      </div>
      <div className="flex gap-3 mt-4">
        <button
          className="flex-1 py-2 px-4 bg-primary text-white rounded-lg font-semibold hover:bg-green-700 transition cursor-pointer disabled:bg-green-200 disabled:cursor-not-allowed"
          type="button"
          disabled={confirmDisabled || loading || editMode}
          onClick={onGetQuote}
        >
          Submit
        </button>
        <button
          className={`flex-1 py-2 px-4 ${editMode ? (buttonText === 'save' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700') : 'bg-gray-200 text-gray-700'} rounded-lg font-semibold hover:bg-green-700 transition cursor-pointer`}
          type="button"
          onClick={editButtonHandler}
          disabled={confirmDisabled || loading}
        >
          {editButtonLabel}
        </button>
      </div>
    </div>
  );
};

export default ConfirmationCard;
