import React, { useState } from "react";
import CardForm, { type CardFieldConfig as CardField } from "../form-components/CardForm";
import type {
  GuidedResponsePayload,
  GuidedFormResponse,
  GuidedCheckboxResponse,
  GuidedYesNoDetailsResponse,
  GuidedRadioResponse,
  GuidedFileUploadResponse,
} from "../../services/guidedTypes";

interface Props {
  response: GuidedResponsePayload;
  values: Record<string, string>;
  onChange: (name: string, value: string) => void;
  onSubmit: (nextValues?: Record<string, string>) => void;
}

// Helper to normalise backend options into CardForm options
function mapOptions(options: (string | { id?: string; label: string; value?: string })[] | undefined) {
  if (!options) return [];
  return options.map((opt) =>
    typeof opt === "string"
      ? { label: opt, value: opt }
      : { label: opt.label, value: opt.id || opt.value || opt.label },
  );
}

// File upload component with its own state
const FileUploadComponent: React.FC<{
  response: GuidedFileUploadResponse;
  values: Record<string, string>;
  onChange: (name: string, value: string) => void;
  onSubmit: (nextValues?: Record<string, string>) => void;
}> = ({ response, values, onChange, onSubmit }) => {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) {
      setFile(null);
      setFileName("");
      onChange(response.field_name, "");
      return;
    }

    // Validate file type
    const acceptTypes = response.accept.split(",").map((t) => t.trim());
    const fileType = selectedFile.type;
    const isValidType =
      acceptTypes.some((acceptType) => {
        if (acceptType.includes("*")) return true;
        if (acceptType === fileType) return true;
        if (acceptType.startsWith(".")) {
          const ext = acceptType.substring(1);
          return selectedFile.name.toLowerCase().endsWith(`.${ext.toLowerCase()}`);
        }
        return false;
      }) || acceptTypes.length === 0;

    if (!isValidType) {
      setError(`File type not allowed. Accepted: ${response.accept}`);
      return;
    }

    // Validate file size
    const maxSizeBytes = (response.max_size_mb || 5) * 1024 * 1024;
    if (selectedFile.size > maxSizeBytes) {
      setError(`File too large. Maximum size: ${response.max_size_mb || 5} MB`);
      return;
    }

    setError("");
    setFile(selectedFile);
    setFileName(selectedFile.name);

    // Convert file to base64 for now (backend expects a file_ref string)
    // In production, you'd upload to a storage service and get a URL/ID
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      // Store as data URL or extract base64 part
      const fileRef = base64; // or extract base64: base64.split(',')[1]
      onChange(response.field_name, fileRef);
    };
    reader.onerror = () => {
      setError("Failed to read file. Please try again.");
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleSubmit = () => {
    if (!file && !values[response.field_name]) {
      setError("Please select a file to upload.");
      return;
    }
    if (error) {
      return;
    }
    onSubmit(values);
  };

  return (
    <div className="mt-3 p-5 bg-white rounded-2xl shadow border border-green-100 text-sm text-gray-800">
      <div className="flex flex-col gap-3">
        <div className="text-base font-semibold text-gray-900">{response.message}</div>
        {response.help && <div className="text-xs text-gray-600">{response.help}</div>}

        <div className="flex flex-col gap-2">
          <label
            htmlFor={`file-upload-${response.field_name}`}
            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-green-300 rounded-xl cursor-pointer bg-green-50 hover:bg-green-100 transition"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg
                className="w-10 h-10 mb-2 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className="mb-2 text-sm text-gray-600">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500">
                {response.accept} (Max {response.max_size_mb || 5} MB)
              </p>
            </div>
            <input
              id={`file-upload-${response.field_name}`}
              type="file"
              className="hidden"
              accept={response.accept}
              onChange={handleFileChange}
              disabled={uploading}
            />
          </label>

          {fileName && (
            <div className="px-3 py-2 bg-green-50 rounded-lg border border-green-200 flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-sm text-gray-700 truncate">{fileName}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setFileName("");
                  onChange(response.field_name, "");
                  setError("");
                }}
                className="text-red-500 hover:text-red-700 text-sm ml-2"
              >
                Remove
              </button>
            </div>
          )}

          {error && <div className="text-xs text-red-600">{error}</div>}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!file && !values[response.field_name] || !!error || uploading}
            className={
              "mt-2 px-4 py-2 rounded-full text-sm font-medium cursor-pointer transition " +
              (!file && !values[response.field_name] || !!error || uploading
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-primary text-white hover:bg-primary/90")
            }
          >
            {uploading ? "Uploading..." : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
};

export const GuidedFormRenderer: React.FC<Props> = ({ response, values, onChange, onSubmit }) => {
  if (response.type === "form") {
    const r = response as GuidedFormResponse;
    const fields: CardField[] = r.fields.map((f) => ({
      name: f.name,
      label: f.label,
      type: f.type,
      required: f.required,
      placeholder: f.placeholder,
      options: mapOptions(f.options),
    }));

    return (
      <CardForm
        title={r.message}
        fields={fields}
        values={values}
        onChange={onChange}
        onNext={() => onSubmit(values)}
        showBack={false}
        showNext
      />
    );
  }

  if (response.type === "checkbox") {
    const r = response as GuidedCheckboxResponse;
    const fieldName = "selected_options";
    const fields: CardField[] = [
      {
        name: fieldName,
        label: r.message,
        type: "checkbox-group",
        options: r.options.map((opt) => ({
          label: opt.label,
          value: opt.id || opt.label,
        })),
      },
    ];

    return (
      <CardForm
        title={r.message}
        fields={fields}
        values={values}
        onChange={onChange}
        onNext={() => onSubmit(values)}
        showBack={false}
        showNext
      />
    );
  }

  if (response.type === "options") {
    // Generic "options" handler: render as a simple list of buttons and send
    // the chosen id/value back as `_raw`, which all option-based steps in the
    // backend understand.
    const opts = (response as any).options || [];
    return (
      <div className="mt-3 p-4 bg-white rounded-xl shadow border border-green-100 text-sm text-gray-800">
        <div className="font-semibold mb-2">{(response as any).message}</div>
        <div className="flex flex-col gap-2">
          {opts.map((opt: any) => {
            const id = typeof opt === "string" ? opt : opt.id || opt.value || opt.label;
            const label = typeof opt === "string" ? opt : opt.label || id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onSubmit({ _raw: String(id) })}
                className="px-4 py-2 rounded-full border border-primary text-primary text-sm hover:bg-primary hover:text-white transition cursor-pointer"
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (response.type === "yes_no_details") {
    const r = response as GuidedYesNoDetailsResponse;
    // Map known question_ids to the backend field names they expect
    let radioName = r.question_id;
    if (r.question_id === "previous_pa_policy") {
      radioName = "had_previous_pa_policy";
    } else if (r.question_id === "physical_disability") {
      radioName = "free_from_disability";
    }
    const fields: CardField[] = [
      {
        name: radioName,
        label: r.message,
        type: "radio",
        required: true,
        options: r.options.map((opt) => ({
          label: opt.label,
          value: opt.id || opt.label,
        })),
      },
      {
        name: r.details_field.name,
        label: r.details_field.label,
        type: "text",
        required: false,
        placeholder: "",
        showIf: { field: radioName, value: r.details_field.show_when },
      },
    ];

    return (
      <CardForm
        title={r.message}
        fields={fields}
        values={values}
        onChange={onChange}
        onNext={() => onSubmit(values)}
        showBack={false}
        showNext
      />
    );
  }

  if (response.type === "radio") {
    const r = response as GuidedRadioResponse;
    // For now, use question_id as the field name; individual flows can map it server-side.
    const fields: CardField[] = [
      {
        name: r.question_id,
        label: r.message,
        type: "radio",
        required: r.required,
        options: r.options.map((opt) => ({
          label: opt.label,
          value: opt.id || opt.label,
        })),
      },
    ];

    return (
      <CardForm
        title={r.message}
        fields={fields}
        values={values}
        onChange={onChange}
        onNext={() => onSubmit(values)}
        showBack={false}
        showNext
      />
    );
  }

  if (response.type === "file_upload") {
    return (
      <FileUploadComponent
        response={response as GuidedFileUploadResponse}
        values={values}
        onChange={onChange}
        onSubmit={onSubmit}
      />
    );
  }

  if (response.type === "premium_summary") {
    const r: any = response;
    const actions: { type?: string; id?: string; label?: string }[] = Array.isArray(r.actions) ? r.actions : [];

    return (
      <div className="mt-3 p-5 bg-white rounded-2xl shadow border border-green-100 text-sm text-gray-800">
        <div className="flex flex-col gap-2 mb-3">
          <div className="text-xs font-semibold text-green-700 uppercase tracking-wide">
            {r.product_name || "Quote Summary"}
          </div>
          <div className="text-base font-semibold text-gray-900">{r.message}</div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
          {"sum_assured" in r && (
            <div className="bg-green-50 rounded-xl px-3 py-2">
              <div className="text-xs text-gray-500">Sum Assured</div>
              <div className="text-sm font-semibold text-gray-900">
                {typeof r.sum_assured === "number" ? r.sum_assured.toLocaleString() : String(r.sum_assured)}
              </div>
            </div>
          )}
          {"monthly_premium" in r && (
            <div className="bg-green-50 rounded-xl px-3 py-2">
              <div className="text-xs text-gray-500">Monthly Premium</div>
              <div className="text-sm font-semibold text-gray-900">
                {typeof r.monthly_premium === "number" ? r.monthly_premium.toLocaleString() : String(r.monthly_premium)}
              </div>
            </div>
          )}
          {"annual_premium" in r && (
            <div className="bg-green-50 rounded-xl px-3 py-2 col-span-2">
              <div className="text-xs text-gray-500">Annual Premium</div>
              <div className="text-sm font-semibold text-gray-900">
                {typeof r.annual_premium === "number" ? r.annual_premium.toLocaleString() : String(r.annual_premium)}
              </div>
            </div>
          )}
        </div>

        {r.breakdown && typeof r.breakdown === "object" && (
          <div className="mb-4">
            <div className="text-xs font-semibold text-gray-500 mb-1">Breakdown</div>
            <ul className="list-disc list-inside text-xs text-gray-600 space-y-0.5">
              {Object.entries(r.breakdown as Record<string, unknown>).map(([k, v]) => (
                <li key={k}>
                  <span className="font-medium capitalize">{k.replace(/_/g, " ")}:</span>{" "}
                  <span>
                    {typeof v === "number" ? v.toLocaleString() : String(v)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {actions.length > 0 && (
          <div className="mt-3 flex flex-col sm:flex-row gap-2">
            {actions.map((a) => {
              const key = a.type || a.id || a.label || "action";
              const label = a.label || a.type || "Continue";
              const isPrimary =
                (a.type || a.id) === "proceed_to_pay" ||
                /proceed|buy|continue/i.test(label || "");
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => onSubmit({ action: (a.type || a.id || "").toString() })}
                  className={
                    "flex-1 px-4 py-2 rounded-full text-sm font-medium cursor-pointer transition " +
                    (isPrimary
                      ? "bg-primary text-white hover:bg-primary/90"
                      : "border border-primary text-primary hover:bg-primary/10")
                  }
                >
                  {label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Default: just render the message text (if any)
  return (
    <div className="mt-3 p-3 bg-white rounded-xl shadow border border-gray-100 text-sm text-gray-800">
      {"message" in response ? (response as any).message : JSON.stringify(response)}
    </div>
  );
};

export default GuidedFormRenderer;

