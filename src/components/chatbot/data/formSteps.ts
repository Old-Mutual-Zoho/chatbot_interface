// Field configuration for multi-step form (personal, contact, address, etc.)
// Add or modify steps and fields as needed

export interface CardFieldConfig {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  placeholder?: string;
  optionalLabel?: string;
}

export interface CardStepConfig {
  title: string;
  fields: CardFieldConfig[];
}

export const formSteps: CardStepConfig[] = [
  {
    title: "Personal Details",
    fields: [
      { name: "firstName", label: "First Name", type: "text", required: true, placeholder: "Enter your first name" },
      { name: "lastName", label: "Last Name", type: "text", required: true, placeholder: "Enter your last name" },
      { name: "middleName", label: "Middle Name", type: "text", required: false, placeholder: "Enter your middle name", optionalLabel: "optional" },
      { name: "dob", label: "Date of Birth", type: "date", required: false },
    ],
  },
  {
    title: "Contact Details",
    fields: [
      { name: "mobile", label: "Phone Number", type: "tel", required: true, placeholder: "Enter your mobile number" },
      { name: "email", label: "Email Address", type: "email", required: true, placeholder: "Enter your email address" },
      { name: "preferredContact", label: "Preferred Contact Method", type: "text", required: false, placeholder: "e.g. WhatsApp, Email, Phone Call", optionalLabel: "optional" },
    ],
  },
  {
    title: "Address Details",
    fields: [
      { name: "residence", label: "Place of Residence", type: "text", required: true, placeholder: "Enter your place of residence" },
    ],
  },
  // Add more steps for product-specific forms as needed
];
