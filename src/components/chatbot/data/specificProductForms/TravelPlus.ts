// Travel Sure Plus full form steps (includes personal, contact, address + product-specific)

export const travelPlusFormSteps = [
  {
    title: "Personal Details",
    fields: [
      { name: "firstName", label: "First Name", type: "text", required: true, placeholder: "Enter your first name" },
      { name: "lastName", label: "Last Name", type: "text", required: true, placeholder: "Enter your last name" },
      { name: "middleName", label: "Middle Name", type: "text", required: false, placeholder: "Enter your middle name", optionalLabel: "optional" },
      { name: "dob", label: "Date of Birth", type: "date", required: false },
      { name: "professionalOccupation", label: "Professional Occupation", type: "text", required: true, placeholder: "Enter your occupation" },
      {
        name: "nationalityType",
        label: "Nationality Type",
        type: "radio",
        required: true,
        options: [
          { label: "Ugandan", value: "ugandan" },
          { label: "Non Ugandan", value: "non_ugandan" },
        ],
      },
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
    title: "Cover Selection Details",
    fields: [     
      {
        name: "coverLevel",
        label: "Level of Cover",
        type: "radio",
        required: true,
        options: [
          { label: "Worldwide Essential", value: "worldwide_essential" },
          { label: "Worldwide Elite", value: "worldwide_elite" },
          { label: "Schengen Essential", value: "schengen_essential" },
          { label: "Schengen Elite", value: "schengen_elite" },
          { label: "Student Cover", value: "student_cover" },
          { label: "Africa & Asia", value: "africa_asia" },
          { label: "Inbound Karibu", value: "inbound_karibu" }
        ]
      },      
     
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
        name: "whoAreYouCovering",
        label: "Who are you covering?",
        type: "radio",
        required: true,
        options: [
          { label: "Myself", value: "myself" },
          { label: "Someone else", value: "someone_else" },
          { label: "Myself and someone else", value: "myself_and_someone_else" },
          { label: "Group", value: "group" }
        ]
      },
      {
        name: "numberOfTravelers",
        label: "Number of Travelers",
        type: "number",
        required: true,
        placeholder: "Enter number of travelers"
      }
    ]
  }
];
