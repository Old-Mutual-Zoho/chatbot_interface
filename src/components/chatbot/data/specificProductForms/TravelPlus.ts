// Product-specific form steps for Travel Sure Plus

export const travelPlusFormSteps = [
 
  {  
    title: "Identification / Travel Document Details",
    fields: [
      {
        name: "passportNumber",
        label: "Passport Number",
        type: "text",
        required: true,
        placeholder: "Enter your passport number"
      },
      {
        name: "passportIssuingCountry",
        label: "Passport Issuing Country",
        type: "text",
        required: true,
        placeholder: "Enter issuing country"
      },
      {
        name: "passportIssueDate",
        label: "Passport Issue Date",
        type: "date",
        required: true
      },
      {
        name: "passportExpiryDate",
        label: "Passport Expiry Date",
        type: "date",
        required: true
      }
    ]
  },
  {
    title: "Trip Details",
    fields: [
      {
        name: "destinationCountries",
        label: "Destination Country/Countries",
        type: "text",
        required: true,
        placeholder: "Enter destination country/countries"
      },
      {
        name: "purposeOfTravel",
        label: "Purpose of Travel",
        type: "select",
        required: true,
        options: [
          { label: "Leisure", value: "leisure" },
          { label: "Business", value: "business" },
          { label: "Study", value: "study" },
          { label: "Other", value: "other" }
        ],
        placeholder: "Select purpose"
      },
      {
        name: "departureDate",
        label: "Departure Date",
        type: "date",
        required: true
      },
      {
        name: "returnDate",
        label: "Return Date",
        type: "date",
        required: true
      },
      {
        name: "durationOfTravel",
        label: "Duration of Travel (days)",
        type: "number",
        required: true,
        placeholder: "Enter duration in days"
      },
      {
        name: "numberOfTravelers",
        label: "Number of Travelers",
        type: "number",
        required: true,
        placeholder: "Enter number of travelers"
      },
      {
        name: "typeOfTrip",
        label: "Type of Trip",
        type: "radio",
        required: true,
        options: [
          { label: "Single Trip", value: "single" },
          { label: "Multiple Trips", value: "multiple" }
        ]
      }
    ]
  },
  {
    title: "Cover Selection Details",
    fields: [
      {
        name: "insurancePlanType",
        label: "Type of Travel Insurance Plan",
        type: "select",
        required: true,
        options: [
          { label: "Individual", value: "individual" },
          { label: "Family", value: "family" },
          { label: "Group", value: "group" }
        ],
        placeholder: "Select plan type"
      },
      {
        name: "coverLevel",
        label: "Level of Cover",
        type: "radio",
        required: true,
        options: [
          { label: "Basic", value: "basic" },
          { label: "Standard", value: "standard" },
          { label: "Comprehensive", value: "comprehensive" }
        ]
      },
      {
        name: "optionalAddOns",
        label: "Optional Add-ons",
        type: "checkbox-group",
        required: false,
        options: [
          { label: "Luggage", value: "luggage" },
          { label: "Adventure Sports", value: "adventure_sports" },
          { label: "COVID Cover", value: "covid" }
        ]
      },
      {
        name: "sumInsured",
        label: "Sum Insured / Coverage Limits",
        type: "number",
        required: true,
        placeholder: "Enter sum insured or coverage limit"
      }
    ]
  },
  {
    title: "Medical & Health Information",
    fields: [
      {
        name: "preExistingConditions",
        label: "Pre-existing Medical Conditions",
        type: "radio",
        required: true,
        options: [
          { label: "Yes", value: "yes" },
          { label: "No", value: "no" }
        ]
      },
      {
        name: "preExistingConditionDetails",
        label: "If Yes, provide details",
        type: "textarea",
        required: false,
        showIf: { field: "preExistingConditions", value: "yes" },
        placeholder: "Describe your condition(s)"
      },
      {
        name: "currentMedications",
        label: "Current Medications (if applicable)",
        type: "textarea",
        required: false,
        placeholder: "List any current medications"
      },
      {
        name: "specialMedicalNeeds",
        label: "Special Medical Needs (if any)",
        type: "textarea",
        required: false,
        placeholder: "Describe any special needs"
      }
    ]
  },
  {
    title: "Beneficiary / Emergency Details",
    fields: [
      {
        name: "emergencyContactName",
        label: "Emergency Contact Name",
        type: "text",
        required: true,
        placeholder: "Enter emergency contact name"
      },
      {
        name: "emergencyContactRelationship",
        label: "Relationship to Traveler",
        type: "text",
        required: true,
        placeholder: "Enter relationship"
      },
      {
        name: "emergencyContactPhone",
        label: "Emergency Contact Phone Number",
        type: "tel",
        required: true,
        placeholder: "Enter emergency contact phone number"
      }
    ]
  }
];
