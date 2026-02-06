//quote generation form steps.
export const personalAccidentFormSteps = [
  {
    title: "Personal Accident Quote",
    description: "Please provide the details below to generate your quote.",
    fields: [
      {
        name: "firstName",
        label: "First name",
        type: "text",
        required: true,
        placeholder: "Enter your first name",
      },
      {
        name: "lastName",
        label: "Surname",
        type: "text",
        required: true,
        placeholder: "Enter your surname",
      },
      {
        name: "middleName",
        label: "Middle name",
        type: "text",
        required: false,
        placeholder: "Enter your middle name",
        optionalLabel: "optional",
      },
    ],
  },
  {
    title: "Personal Accident Quote",
    fields: [
      {
        name: "mobile",
        label: "Phone number",
        type: "tel",
        required: true,
        placeholder: "+256 7XXXXXXXX",
      },
      {
        name: "email",
        label: "Email address",
        type: "email",
        required: true,
        placeholder: "name@example.com",
      },
    ],
  },
  {
    title: "Personal Accident Quote",
    fields: [
      {
        name: "dob",
        label: "Date of birth",
        type: "date",
        required: true,
      },
      {
        name: "policyStartDate",
        label: "Policy start date",
        type: "date",
        required: true,
      },
    ],
  },
  {
    title: "Personal Accident Quote",
    fields: [
      {
        name: "coverLimitAmountUgx",
        label: "Cover Limit Amount(UGX)",
        type: "radio",
        required: true,
        options: [
          { label: "5,000,000", value: "5000000" },
          { label: "10,000,000", value: "10000000" },
          { label: "20,000,000", value: "20000000" },
        ],
      },
    ],
  },
];

/*
export const personalAccidentPurchaseFormSteps = [
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
    title: "Address Details",
    fields: [
      { name: "residence", label: "Place of Residence", type: "text", required: true, placeholder: "Enter your place of residence" },
      { name: "nin", label: "NIN Number", type: "text", required: true, placeholder: "Enter your NIN number" },
    ],
  },
  {
    title: "Next Of Kin Details",
    fields: [
      { name: "kinFirstName", label: "First Name", type: "text", required: true, placeholder: "Enter first name" },
      { name: "kinMiddleName", label: "Middle Name", type: "text", required: false, placeholder: "Enter middle name (optional)", optionalLabel: "Optional" },
      { name: "kinSurname", label: "Surname", type: "text", required: true, placeholder: "Enter surname" },
      {
        name: "kinRelationship",
        label: "Relationship",
        type: "select",
        required: true,
        options: [
          { label: "Spouse", value: "spouse" },
          { label: "Parent", value: "parent" },
          { label: "Child", value: "child" },
          { label: "Sibling", value: "sibling" },
          { label: "Other", value: "other" },
        ],
        placeholder: "Select relationship",
      },
      { name: "kinPhone", label: "Phone Number", type: "tel", required: true, placeholder: "Enter phone number" },
      { name: "kinAddress", label: "Address", type: "text", required: false, placeholder: "Enter address (optional)", optionalLabel: "Optional" },
    ],
  },
  {
    title: "Declarations",
    description: "Try to answer these questions as best as you can",
    fields: [
      {
        name: "heldAccidentPolicy",
        label: "Have you previously held a Personal Accident Policy?",
        type: "radio",
        required: true,
        options: [
          { label: "Yes", value: "yes" },
          { label: "No", value: "no" },
        ],
      },
      {
        name: "insurerName",
        label: "If Yes, provide name of insurer",
        type: "text",
        required: false,
        placeholder: "Insurer Name",
        showIf: { field: "heldAccidentPolicy", value: "yes" },
      },
      {
        name: "freeFromDisability",
        label: "Are you free from physical disability or mental illness to the best of your knowledge?",
        type: "radio",
        required: true,
        options: [
          { label: "Yes", value: "yes" },
          { label: "No", value: "no" },
        ],
      },
      {
        name: "disabilityDetails",
        label: "If No, give details",
        type: "textarea",
        required: false,
        placeholder: "Give Details",
        showIf: { field: "freeFromDisability", value: "no" },
      },
      {
        name: "injuriesLast2Years",
        label: "Have you sustained any injuries from accidents in the last 2 years",
        type: "radio",
        required: true,
        options: [
          { label: "Yes", value: "yes" },
          { label: "No", value: "no" },
        ],
      },
      {
        name: "injuryDetails",
        label: "If Yes, give details",
        type: "textarea",
        required: false,
        placeholder: "Give Details",
        showIf: { field: "injuriesLast2Years", value: "yes" },
      },
    ],
  },
  {
    title: "Risk Activities",
    fields: [
      {
        name: "riskActivities",
        label: "Are you engaged in any of the following activities?",
        type: "radio",
        options: [
          { label: "Manufacture of fireworks or explosives", value: "fireworks" },
          { label: "Airline crew & ship/boat crew", value: "airline_crew" },
          { label: "Professional sports, Sinking of air, water or gas wells", value: "sports" },
          { label: "Racing, Rallies & speed testing", value: "racing" },
          { label: "Naval Military, Police or Air force", value: "military" },
          { label: "Construction and maintenance of dams", value: "dams" },
          { label: "Mining", value: "mining" },
          { label: "Diving", value: "diving" },
        ],
        required: false,
      },
    ],
  },
];
*/
