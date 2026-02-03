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
