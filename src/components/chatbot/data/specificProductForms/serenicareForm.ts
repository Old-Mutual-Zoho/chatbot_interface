// Serenicare quote form steps.

export const serenicareFormSteps = [
  {
    title: "Personal Details",
    fields: [
      { name: "firstName", label: "First Name", type: "text", required: true, placeholder: "Enter your first name", minLength: 2, maxLength: 50 },
      { name: "lastName", label: "Last Name", type: "text", required: true, placeholder: "Enter your last name", minLength: 2, maxLength: 50 },
      { name: "middleName", label: "Middle Name", type: "text", required: false, placeholder: "Enter your middle name", optionalLabel: "optional", maxLength: 50 },
           
    ],
  },
  {
    title: "Contact Details",
    fields: [
      { name: "mobile", label: "Phone Number", type: "tel", required: true, placeholder: "Enter your mobile number" },
      { name: "email", label: "Email Address", type: "email", required: true, placeholder: "Enter your email address", maxLength: 100 },
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
            label: "Spouse?",
            type: "checkbox",
            required: false,
          },
          {
            name: "includeChildren",
            label: "Children?",
            type: "checkbox",
            required: false,
          },
          
          {
            name: "D.O.B",
            label: "D.O.B",
            type: "date",
            required: true,
            placeholder: "Enter date of birth",
          },
          {
            name: "age",
            label: "Age",
            type: "number",
            required: true,
            placeholder: "Enter age",
          }
        ],
      },
    ],
  },
];

