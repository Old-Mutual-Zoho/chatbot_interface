// Serenicare quote form steps.

export const serenicareFormSteps = [
  {
    title: "Personal Details",
    fields: [
      { name: "firstName", label: "First Name", type: "text", required: true, placeholder: "Enter your first name" },
      { name: "lastName", label: "Last Name", type: "text", required: true, placeholder: "Enter your last name" },
      { name: "middleName", label: "Middle Name", type: "text", required: false, placeholder: "Enter your middle name", optionalLabel: "optional" },
      { name: "dob", label: "Date of Birth", type: "date", required: false },
      { name: "professionalOccupation", label: "Professional Occupation", type: "text", required: true, placeholder: "Enter your occupation" },
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
    title: "Select Plan",
    fields: [
      {
        name: "planType",
        label: "Choose a Plan",
        type: "radio",
        required: true,
        options: [
          { label: "Essential", value: "essential" },
          { label: "Classic", value: "classic" },
          { label: "Comprehensive", value: "comprehensive" },
          { label: "Premium", value: "premium" },
        ],
      },
    ],
  },
  {
    title: "Optional Benefits",
    fields: [
      {
        name: "optionalBenefits",
        label: "Select Optional Benefits",
        type: "checkbox-group",
        required: false,
        options: [
          { label: "Outpatient", value: "outpatient" },
          { label: "Maternity Cover", value: "maternity" },
          { label: "Dental Cover", value: "dental" },
          { label: "Optical Cover", value: "optical" },
          { label: "COVID-19 Cover", value: "covid" },
        ],
      },
    ],
  },
  {
    title: "Health Conditions",
    fields: [
      {
        name: "seriousConditions",
        label:
          "Do you or any family members you wish to include in this plan have any of the following: Sickle Cells, Cancer(s), Leukaemia, or liver-related conditions?",
        type: "radio",
        required: true,
        options: [
          { label: "Yes", value: "yes" },
          { label: "No", value: "no" },
        ],
      },
    ],
  },
  {
    title: "Cover Personalization",
    fields: [
      {
        name: "mainMembers",
        label: "Main Members to cover",
        type: "repeatable-group",
        fields: [
          {
            name: "includeSpouse",
            label: "Include Spouse?",
            type: "checkbox",
            required: false,
          },
          {
            name: "includeChildren",
            label: "Include Children?",
            type: "checkbox",
            required: false,
          },
          { name: "dob", label: "Date of Birth", type: "date", required: true, placeholder: "Select date of birth" },
          { name: "age", label: "Age", type: "number", required: true, placeholder: "Age will be calculated" },
        ],
      },
    ],
  },
];

