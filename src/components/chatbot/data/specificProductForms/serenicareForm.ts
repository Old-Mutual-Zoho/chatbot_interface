// Serenicare product-specific form steps

export const serenicareFormSteps = [
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
          { label: "Premium", value: "premium" }
        ]
      }
    ]
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
          { label: "COVID-19 Cover", value: "covid" }
        ]
      }
    ]
  },
  {
    title: "Health Conditions",
    fields: [
      {
        name: "seriousConditions",
        label: "Do you or any family members you wish to include in this plan have any of the following: Sickle Cells, Cancer(s), Leukaemia, or liver-related conditions?",
        type: "radio",
        required: true,
        options: [
          { label: "Yes", value: "yes" },
          { label: "No", value: "no" }
        ]
      }
    ]
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
            required: false
          },
          {
            name: "includeChildren",
            label: "Include Children?",
            type: "checkbox",
            required: false
          },
          { name: "dob", label: "Date of Birth", type: "date", required: true, placeholder: "Select date of birth" },
          { name: "age", type: "number", required: true, placeholder: "Enter age" },
          
        ]
      }
    ]
  }
];
