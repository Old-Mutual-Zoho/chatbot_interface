// Types describing guided flow responses from the backend API.
// These are intentionally flexible so they can cover Personal Accident,
// Travel Insurance, Serenicare and Motor Private flows.

export type GuidedFieldType =
  | "text"
  | "email"
  | "tel"
  | "number"
  | "date"
  | "radio"
  | "select";

export interface GuidedFieldOption {
  id?: string;
  label: string;
  value?: string;
}

export interface GuidedFormField {
  name: string;
  label: string;
  type: GuidedFieldType;
  required?: boolean;
  placeholder?: string;
  options?: (string | GuidedFieldOption)[];
  min?: number;
}

export interface GuidedFormResponse {
  type: "form";
  message: string;
  fields: GuidedFormField[];
  optional?: boolean;
}

export interface GuidedCheckboxResponse {
  type: "checkbox";
  message: string;
  options: GuidedFieldOption[];
  allow_other?: boolean;
  other_field?: { name: string; label: string };
}

export interface GuidedYesNoDetailsResponse {
  type: "yes_no_details";
  message: string;
  question_id: string;
  options: GuidedFieldOption[];
  details_field: { name: string; label: string; show_when: string };
}

export interface GuidedRadioResponse {
  type: "radio";
  message: string;
  question_id: string;
  options: GuidedFieldOption[];
  required?: boolean;
}

export interface GuidedConsentResponse {
  type: "consent";
  message: string;
  consents: {
    id: string;
    label: string;
    required: boolean;
    link?: string;
  }[];
}

export interface GuidedFileUploadResponse {
  type: "file_upload";
  message: string;
  accept: string;
  field_name: string;
  max_size_mb?: number;
  help?: string;
}

export interface GuidedPremiumSummaryResponse {
  type: "premium_summary";
  message: string;
  // Different flows attach slightly different fields here; keep this loose.
  [key: string]: unknown;
}

export interface GuidedProceedToPaymentResponse {
  type: "proceed_to_payment";
  message: string;
  quote_id: string;
  [key: string]: unknown;
}

export type GuidedResponsePayload =
  | GuidedFormResponse
  | GuidedCheckboxResponse
  | GuidedYesNoDetailsResponse
  | GuidedRadioResponse
  | GuidedConsentResponse
  | GuidedFileUploadResponse
  | GuidedPremiumSummaryResponse
  | GuidedProceedToPaymentResponse;

export interface GuidedChatBackendResponse {
  mode: "guided" | "conversational";
  flow?: string;
  step?: number;
  response?: GuidedResponsePayload | string;
  complete?: boolean;
  data?: unknown;
}

